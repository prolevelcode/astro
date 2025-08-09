import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, paymentVerificationSchema } from "@shared/schema";
import Razorpay from "razorpay";
import crypto from "crypto";
import axios from "axios";
import { prokeralaAPI } from "./prokerala-api";

// Initialize Razorpay with credentials from CSV
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_live_ZTZl8KJQSoEtd0",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "ahagFzjYFqr2nlpkrXBLQhlS",
});

// Prokerala API credentials
const PROKERALA_CLIENT_ID = process.env.PROKERALA_CLIENT_ID || "553d987e-16d1-4805-9541-51fa833ad3a3";
const PROKERALA_CLIENT_SECRET = process.env.PROKERALA_CLIENT_SECRET || "6d6cptckAuk4Bj5RbkxXATc8VFnsqwvb4ypoxAo5";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create Razorpay order
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      
      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: orderData.amount * 100, // Convert to paise
        currency: "INR",
        receipt: `order_${Date.now()}`,
      });

      // Create order in storage
      const order = await storage.createOrder({
        ...orderData,
        razorpayOrderId: razorpayOrder.id,
        status: "pending",
      });

      res.json({
        success: true,
        order,
        razorpayOrder,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || "rzp_live_ZTZl8KJQSoEtd0",
      });
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(400).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Order creation failed" 
      });
    }
  });

  // Verify payment and generate Kundali
  app.post("/api/verify-payment", async (req, res) => {
    try {
      const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = 
        paymentVerificationSchema.parse(req.body);

      // Verify payment signature
      const body = razorpayOrderId + "|" + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "ahagFzjYFqr2nlpkrXBLQhlS")
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({ 
          success: false, 
          message: "Payment verification failed" 
        });
      }

      // Update order with payment details
      const order = await storage.updateOrder(orderId, {
        razorpayPaymentId,
        razorpaySignature,
        status: "paid",
      });

      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: "Order not found" 
        });
      }

      // Generate astrology report using Prokerala API
      try {
        const apiData = await callProkeralaAPI(order.productType, order.birthDetails, order.name);
        
        // Update order with API data
        const completedOrder = await storage.updateOrder(orderId, {
          kundaliData: apiData,
          status: "completed",
          completedAt: new Date(),
        });

        res.json({
          success: true,
          order: completedOrder,
          kundaliData: apiData,
        });
      } catch (kundaliError) {
        console.error("Kundali generation error:", kundaliError);
        
        // Update order status to indicate Kundali generation failed
        await storage.updateOrder(orderId, {
          status: "failed",
        });

        res.status(500).json({
          success: false,
          message: "Payment successful but Kundali generation failed. Please contact support.",
        });
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(400).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Payment verification failed" 
      });
    }
  });

  // Get order details
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: "Order not found" 
        });
      }
      res.json({ success: true, order });
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch order" 
      });
    }
  });

  // Generate PDF report
  app.get("/api/orders/:id/pdf", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order || order.status !== "completed") {
        return res.status(404).json({ 
          success: false, 
          message: "Completed order not found" 
        });
      }

      // Generate PDF (simplified implementation)
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="kundali-report-${order.id}.pdf"`);
      
      // For now, return a simple response indicating PDF would be generated
      res.json({
        success: true,
        message: "PDF generation would happen here",
        downloadUrl: `/api/orders/${order.id}/pdf`,
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ 
        success: false, 
        message: "PDF generation failed" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function callProkeralaAPI(productType: string, birthDetails: any, name: string) {
  try {
    const apiData = {
      success: true,
      name,
      birthDetails,
      generatedAt: new Date().toISOString(),
      productType,
    };

    switch (productType) {
      case "birth-chart-generator":
        const birthChart = await prokeralaAPI.getBirthChart(birthDetails);
        return { ...apiData, data: birthChart, type: "birth-chart" };

      case "kundli-matching":
        const matching = await prokeralaAPI.getKundliMatching(birthDetails, birthDetails);
        return { ...apiData, data: matching, type: "kundli-matching" };

      case "daily-horoscope":
        const horoscope = await prokeralaAPI.getDailyHoroscope(birthDetails);
        return { ...apiData, data: horoscope, type: "daily-horoscope" };

      case "numerology-report":
        const numerology = await prokeralaAPI.getNumerology({ ...birthDetails, name });
        return { ...apiData, data: numerology, type: "numerology" };

      case "mangal-dosha-check":
        const mangalDosha = await prokeralaAPI.getMangalDosha(birthDetails);
        return { ...apiData, data: mangalDosha, type: "mangal-dosha" };

      case "sade-sati-analysis":
        const sadeSati = await prokeralaAPI.getSadeSati(birthDetails);
        return { ...apiData, data: sadeSati, type: "sade-sati" };

      case "panchang-calculator":
        const panchang = await prokeralaAPI.getPanchang(birthDetails.dob, birthDetails.place);
        return { ...apiData, data: panchang, type: "panchang" };

      case "kaal-sarpa-dosha":
        const kaalSarpa = await prokeralaAPI.getKaalSarpaDosha(birthDetails);
        return { ...apiData, data: kaalSarpa, type: "kaal-sarpa" };

      case "muhurat-finder":
        const muhurat = await prokeralaAPI.getMuhurat(
          birthDetails.startDate || birthDetails.dob,
          birthDetails.endDate || birthDetails.dob,
          birthDetails.place,
          birthDetails.eventType || "general"
        );
        return { ...apiData, data: muhurat, type: "muhurat" };

      default:
        // Fallback to birth chart for unknown types
        const defaultChart = await prokeralaAPI.getBirthChart(birthDetails);
        return { ...apiData, data: defaultChart, type: "birth-chart" };
    }
  } catch (error) {
    console.error(`Prokerala API error for ${productType}:`, error);
    throw new Error("Astrology service unavailable");
  }
}



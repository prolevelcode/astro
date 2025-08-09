import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function KundaliForm({ productType, productTitle }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      console.log("📨 Sending form data:", data);

      // TEMP TEST MODE: bypass Razorpay for debugging
      toast({
        title: "Form Submitted (Test Mode)",
        description: JSON.stringify(data, null, 2),
      });
      setIsLoading(false);
      return;

      // ----- ORIGINAL PAYMENT FLOW -----
      // const orderRes = await fetch("/api/orders", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ productType }),
      // });
      // const order = await orderRes.json();

      // if (!order.id) throw new Error("Order creation failed");

      // TODO: Load Razorpay checkout here
    } catch (error) {
      console.error("🚨 Payment/Form error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : JSON.stringify(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={form.handleSubmit(onSubmit)}
      style={{ pointerEvents: "auto" }}
      className="space-y-4 p-4 border rounded-lg bg-white"
    >
      <Input
        {...form.register("name")}
        placeholder="Enter your name"
        disabled={false} // force enable
      />
      <Input
        {...form.register("birthdate")}
        placeholder="Birth date"
        disabled={false} // force enable
      />
      <Input
        {...form.register("birthplace")}
        placeholder="Birth place"
        disabled={false} // force enable
      />

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple to-pink text-white font-bold py-4 px-8 rounded-lg hover:from-purple/80 hover:to-pink/80 transition-all transform hover:scale-105 animate-pulse-glow"
        >
          {isLoading ? "Processing..." : `Pay ₹50 & Get Your ${productTitle}`}
        </button>
      </motion.div>
    </motion.form>
  );
}

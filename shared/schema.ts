import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  name: text("name").notNull(),
  productType: text("product_type").notNull(),
  birthDetails: json("birth_details").$type<{
    dob: string;
    time?: string;
    place: string;
    gender: string;
    timeUnknown?: boolean;
    latitude?: number;
    longitude?: number;
    // Partner details for couple matching
    partnerName?: string;
    partnerDob?: string;
    partnerTime?: string;
    partnerPlace?: string;
    partnerGender?: string;
    partnerTimeUnknown?: boolean;
    // Date range for muhurat services
    startDate?: string;
    endDate?: string;
    eventType?: string;
  }>().notNull(),
  paymentId: text("payment_id"),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  razorpaySignature: text("razorpay_signature"),
  status: text("status").notNull().default("pending"), // pending, paid, completed, failed
  amount: integer("amount").notNull(),
  kundaliData: json("kundali_data"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  completedAt: true,
}).extend({
  dob: z.string().min(1, "Date of birth is required"),
  time: z.string().optional(),
  place: z.string().min(1, "Place of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  timeUnknown: z.boolean().optional(),
  // For couple matching
  partnerName: z.string().optional(),
  partnerDob: z.string().optional(),
  partnerTime: z.string().optional(),
  partnerPlace: z.string().optional(),
  partnerGender: z.enum(["male", "female", "other"]).optional(),
  partnerTimeUnknown: z.boolean().optional(),
  // For date range services
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  eventType: z.string().optional(),
  // For coordinates
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const paymentVerificationSchema = z.object({
  orderId: z.string(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type PaymentVerification = z.infer<typeof paymentVerificationSchema>;

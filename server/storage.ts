import { type User, type InsertUser, type Order, type InsertOrder } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined>;
  getOrdersByEmail(email: string): Promise<Order[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private orders: Map<string, Order>;

  constructor() {
    this.users = new Map();
    this.orders = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      id,
      email: insertOrder.email,
      name: insertOrder.name,
      productType: insertOrder.productType,
      birthDetails: {
        dob: insertOrder.dob,
        time: insertOrder.time,
        place: insertOrder.place,
        gender: insertOrder.gender,
        timeUnknown: insertOrder.timeUnknown,
        latitude: insertOrder.latitude,
        longitude: insertOrder.longitude,
        // Partner details for couple matching
        partnerName: insertOrder.partnerName,
        partnerDob: insertOrder.partnerDob,
        partnerTime: insertOrder.partnerTime,
        partnerPlace: insertOrder.partnerPlace,
        partnerGender: insertOrder.partnerGender,
        partnerTimeUnknown: insertOrder.partnerTimeUnknown,
        // Date range for muhurat services
        startDate: insertOrder.startDate,
        endDate: insertOrder.endDate,
        eventType: insertOrder.eventType,
      },
      paymentId: insertOrder.paymentId || null,
      razorpayOrderId: insertOrder.razorpayOrderId || null,
      razorpayPaymentId: insertOrder.razorpayPaymentId || null,
      razorpaySignature: insertOrder.razorpaySignature || null,
      status: insertOrder.status || "pending",
      amount: insertOrder.amount,
      kundaliData: insertOrder.kundaliData || null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, ...updates };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async getOrdersByEmail(email: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.email === email,
    );
  }
}

export const storage = new MemStorage();

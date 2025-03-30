import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  address: text("address"),
  city: text("city"),
  zipCode: text("zip_code"),
  phone: text("phone"),
  isFarmer: boolean("is_farmer").default(false),
  farmName: text("farm_name"),
  farmDescription: text("farm_description"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  address: true,
  city: true,
  zipCode: true,
  phone: true,
  isFarmer: true,
  farmName: true,
  farmDescription: true,
});

// Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  description: true,
  icon: true,
});

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  categoryId: integer("category_id").notNull(),
  farmerId: integer("farmer_id").notNull(),
  unit: text("unit").notNull(),
  organic: boolean("organic").default(false),
  stock: integer("stock").default(0),
  featured: boolean("featured").default(false),
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  imageUrl: true,
  categoryId: true,
  farmerId: true,
  unit: true,
  organic: true,
  stock: true,
  featured: true,
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  contactPhone: text("contact_phone"),
  paymentMethod: text("payment_method").notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  totalAmount: true,
  status: true,
  shippingAddress: true,
  contactPhone: true,
  paymentMethod: true,
});

// Order Items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  quantity: true,
  price: true,
});

// Reviews (to be stored in MongoDB)
export const reviewSchema = z.object({
  id: z.string(),
  userId: z.number(),
  productId: z.number(),
  rating: z.number().min(1).max(5),
  comment: z.string(),
  date: z.date(),
  userName: z.string(),
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

export type Review = z.infer<typeof reviewSchema>;

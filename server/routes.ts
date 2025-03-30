import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertOrderSchema, insertOrderItemSchema, reviewSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();
  
  // User routes
  router.post("/users/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      
      // Don't return the password
      const { password, ...userWithoutPassword } = newUser;
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  router.post("/users/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Login failed" });
    }
  });
  
  // Category routes
  router.get("/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      return res.status(200).json(categories);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  router.get("/categories/:id", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.getCategoryById(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      return res.status(200).json(category);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch category" });
    }
  });
  
  // Product routes
  router.get("/products", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const farmerId = req.query.farmerId ? parseInt(req.query.farmerId as string) : undefined;
      const featured = req.query.featured === 'true';
      
      let products;
      
      if (featured) {
        products = await storage.getFeaturedProducts();
      } else if (categoryId) {
        products = await storage.getProductsByCategory(categoryId);
      } else if (farmerId) {
        products = await storage.getProductsByFarmer(farmerId);
      } else {
        products = await storage.getProducts();
      }
      
      return res.status(200).json(products);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  
  router.get("/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      return res.status(200).json(product);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch product" });
    }
  });
  
  // Order routes
  router.post("/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const newOrder = await storage.createOrder(orderData);
      
      return res.status(201).json(newOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Failed to create order" });
    }
  });
  
  router.get("/orders/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const orders = await storage.getOrdersByUser(userId);
      
      return res.status(200).json(orders);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  
  router.get("/orders/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Get order items for this order
      const orderItems = await storage.getOrderItemsByOrder(orderId);
      
      return res.status(200).json({ ...order, items: orderItems });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch order" });
    }
  });
  
  // Order items route
  router.post("/orderItems", async (req, res) => {
    try {
      const orderItemData = insertOrderItemSchema.parse(req.body);
      const newOrderItem = await storage.createOrderItem(orderItemData);
      
      return res.status(201).json(newOrderItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Failed to create order item" });
    }
  });
  
  // Review routes (MongoDB simulation)
  router.post("/reviews", async (req, res) => {
    try {
      const reviewData = reviewSchema.omit({ id: true }).parse({
        ...req.body,
        date: new Date()
      });
      
      const newReview = await storage.createReview(reviewData);
      
      return res.status(201).json(newReview);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Failed to create review" });
    }
  });
  
  router.get("/reviews/product/:productId", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const reviews = await storage.getReviewsByProduct(productId);
      
      return res.status(200).json(reviews);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });
  
  // Add /api prefix to all routes
  app.use("/api", router);
  
  const httpServer = createServer(app);
  
  return httpServer;
}

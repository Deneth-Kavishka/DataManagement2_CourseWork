import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { reviewSchema, insertUserSchema, insertProductSchema, insertVendorSchema, insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { sendVerificationEmail, sendLoginNotification, sendPasswordResetEmail, generateToken, verifyEmailService } from "./emailService";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for the UrbanFood e-commerce platform

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const vendorId = req.query.vendorId ? parseInt(req.query.vendorId as string) : undefined;
      const search = req.query.search as string | undefined;
      
      let products;
      
      if (categoryId) {
        products = await storage.getProductsByCategory(categoryId);
      } else if (vendorId) {
        products = await storage.getProductsByVendor(vendorId);
      } else if (search) {
        products = await storage.searchProducts(search);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Get vendor information
      const vendor = await storage.getVendor(product.vendorId);
      
      // Get reviews for the product
      const reviews = await storage.getReviews(id);
      
      res.json({
        ...product,
        vendor,
        reviews
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Vendors
  app.get("/api/vendors", async (req, res) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.get("/api/vendors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vendor = await storage.getVendor(id);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      // Get products from this vendor
      const products = await storage.getProductsByVendor(id);
      
      res.json({
        ...vendor,
        products
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendor" });
    }
  });
  
  app.get("/api/vendors/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const vendor = await storage.getVendorByUserId(userId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found for this user" });
      }
      
      res.json(vendor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendor by user ID" });
    }
  });

  app.post("/api/vendors", async (req, res) => {
    try {
      const vendorData = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(vendorData);
      
      // Update user to mark as vendor
      if (vendor) {
        await storage.updateUser(vendorData.userId, { isVendor: true });
      }
      
      res.status(201).json(vendor);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid vendor data", errors: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });
  
  app.patch("/api/vendors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vendorData = req.body;
      
      const updatedVendor = await storage.updateVendor(id, vendorData);
      
      if (!updatedVendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      res.json(updatedVendor);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid vendor data", errors: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update vendor" });
    }
  });

  // Email verification and password reset endpoints
  app.get("/api/users/verify/:token", async (req, res) => {
    try {
      const token = req.params.token;
      const user = await storage.getUserByVerificationToken(token);
      
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }
      
      const verifiedUser = await storage.verifyUser(user.id);
      
      if (!verifiedUser) {
        return res.status(500).json({ message: "Failed to verify user" });
      }
      
      // Return success HTML page
      const successHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verified - UrbanFood</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              text-align: center;
            }
            .success-container {
              background-color: #f8f8f8;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              margin-top: 40px;
            }
            h1 {
              color: #4CAF50;
              margin-bottom: 20px;
            }
            .icon {
              font-size: 60px;
              color: #4CAF50;
              margin-bottom: 20px;
            }
            .btn {
              display: inline-block;
              background-color: #4CAF50;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 4px;
              font-weight: bold;
              margin-top: 20px;
              transition: background-color 0.3s;
            }
            .btn:hover {
              background-color: #388E3C;
            }
          </style>
        </head>
        <body>
          <div class="success-container">
            <div class="icon">✓</div>
            <h1>Email Verified Successfully!</h1>
            <p>Thank you for verifying your email address. Your account is now active, and you can access all features of UrbanFood.</p>
            <a href="/" class="btn">Continue to UrbanFood</a>
          </div>
        </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      return res.send(successHtml);
      
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });
  
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // For security reasons, don't reveal if email exists
        return res.status(200).json({ message: "If your email is registered, you will receive password reset instructions" });
      }
      
      // Generate reset token
      const resetToken = generateToken();
      
      // Update user with reset token
      await storage.updateUser(user.id, { resetPasswordToken: resetToken });
      
      // Send password reset email
      await sendPasswordResetEmail(user, resetToken);
      
      res.json({ message: "Password reset email sent" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });
  
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }
      
      const user = await storage.getUserByResetToken(token);
      
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      // Update user with new password and clear reset token
      await storage.updateUser(user.id, { 
        password,
        resetPasswordToken: null
      });
      
      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
  
  // Users & Authentication
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // In a real app, we would hash the password here
      
      // Generate verification token
      const verificationToken = generateToken();
      
      // Create user with verification token
      const user = await storage.createUser({
        ...userData,
        verificationToken
      });
      
      // Send verification email
      const emailSuccess = await sendVerificationEmail(user, verificationToken);
      
      // Remove password from response
      const { password, verificationToken: token, ...userWithoutPassword } = user;
      
      res.status(201).json({
        ...userWithoutPassword,
        emailSent: emailSuccess,
        message: emailSuccess 
          ? "Verification email sent. Please check your inbox to verify your account." 
          : "Account created, but verification email could not be sent. Please contact support."
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: fromZodError(error).message });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check if user is verified
      if (!user.isVerified) {
        // Generate a new verification token
        const verificationToken = generateToken();
        
        // Update user with new verification token
        const updatedUser = await storage.updateUser(user.id, { verificationToken });
        
        if (updatedUser) {
          // Send verification email
          await sendVerificationEmail(updatedUser, verificationToken);
        }
        
        return res.status(403).json({ 
          message: "Email not verified. A new verification email has been sent.",
          verified: false
        });
      }
      
      // Send login notification email
      await sendLoginNotification(user);
      
      // Remove password and sensitive data from response
      const { password: _, verificationToken, resetPasswordToken, ...userWithoutPassword } = user;
      
      res.json({
        ...userWithoutPassword,
        verified: true
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // If user is a vendor, get vendor info
      if (user.isVendor) {
        const vendor = await storage.getVendorByUserId(id);
        return res.json({
          ...userWithoutPassword,
          vendor
        });
      }
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      let orders;
      
      if (userId) {
        orders = await storage.getOrdersByUser(userId);
      } else {
        orders = await storage.getOrders();
      }
      
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Get order items
      const orderItems = await storage.getOrderItems(id);
      
      res.json({
        ...order,
        items: orderItems
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const items = req.body.items;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Order must contain items" });
      }
      
      // Create order
      const order = await storage.createOrder(orderData);
      
      // Create order items
      const orderItems = [];
      
      for (const item of items) {
        const orderItemData = insertOrderItemSchema.parse({
          ...item,
          orderId: order.id
        });
        
        const orderItem = await storage.createOrderItem(orderItemData);
        orderItems.push(orderItem);
      }
      
      res.status(201).json({
        ...order,
        items: orderItems
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(id, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Reviews (MongoDB)
  app.get("/api/reviews", async (req, res) => {
    try {
      const productId = req.query.productId ? parseInt(req.query.productId as string) : undefined;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      let reviews;
      
      if (productId) {
        reviews = await storage.getReviews(productId);
      } else if (userId) {
        reviews = await storage.getReviewsByUser(userId);
      } else {
        return res.status(400).json({ message: "Either productId or userId is required" });
      }
      
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = reviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.patch("/api/reviews/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const reviewData = req.body;
      
      const updatedReview = await storage.updateReview(id, reviewData);
      
      if (!updatedReview) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      res.json(updatedReview);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  app.delete("/api/reviews/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const deleted = await storage.deleteReview(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // Reports API
  app.get("/api/reports/popular-products", async (req, res) => {
    try {
      const allProducts = await storage.getProducts();
      const allOrderItems = [];
      
      const orders = await storage.getOrders();
      for (const order of orders) {
        const items = await storage.getOrderItems(order.id);
        allOrderItems.push(...items);
      }
      
      // Calculate popularity based on order items
      const productCounts: Record<number, number> = {};
      allOrderItems.forEach(item => {
        if (productCounts[item.productId]) {
          productCounts[item.productId] += item.quantity;
        } else {
          productCounts[item.productId] = item.quantity;
        }
      });
      
      // Sort products by popularity
      const popularProducts = allProducts
        .map(product => ({
          ...product,
          orderCount: productCounts[product.id] || 0
        }))
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 10);
      
      res.json(popularProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate popular products report" });
    }
  });

  app.get("/api/reports/sales-by-category", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      const allProducts = await storage.getProducts();
      const allOrderItems = [];
      
      const orders = await storage.getOrders();
      for (const order of orders) {
        const items = await storage.getOrderItems(order.id);
        allOrderItems.push(...items);
      }
      
      // Calculate sales by category
      interface CategorySale {
        id: number;
        name: string;
        totalSales: number;
        itemsSold: number;
      }
      
      const categorySales: Record<number, CategorySale> = {};
      
      categories.forEach(category => {
        categorySales[category.id] = {
          id: category.id,
          name: category.name,
          totalSales: 0,
          itemsSold: 0
        };
      });
      
      allOrderItems.forEach(item => {
        const product = allProducts.find(p => p.id === item.productId);
        if (product) {
          const categoryId = product.categoryId;
          categorySales[categoryId].totalSales += item.price * item.quantity;
          categorySales[categoryId].itemsSold += item.quantity;
        }
      });
      
      const result = Object.values(categorySales).sort((a, b) => b.totalSales - a.totalSales);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate sales by category report" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

import { users, type User, type InsertUser, categories, type Category, type InsertCategory, products, type Product, type InsertProduct, vendors, type Vendor, type InsertVendor, orders, type Order, type InsertOrder, orderItems, type OrderItem, type InsertOrderItem, type Review } from "@shared/schema";
import { db } from "./db";
import { eq, like, and, sql } from "drizzle-orm";
import { IStorage } from "./storage";

/**
 * PostgreSQL Database Storage Implementation
 */
export class DatabaseStorage implements IStorage {
  /**
   * User operations
   */
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.verificationToken, token));
    return user || undefined;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    try {
      // Direct SQL query to handle the column mismatch between schema and DB
      const result = await db.execute(sql`SELECT * FROM users WHERE reset_password_token = ${token}`);
      if (result.rows && result.rows.length > 0) {
        return result.rows[0] as User;
      }
      return undefined;
    } catch (error) {
      console.error("Error in getUserByResetToken:", error);
      return undefined;
    }
  }

  async verifyUser(id: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isVerified: true, verificationToken: null })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    try {
      // If updating resetToken, use direct SQL to handle the column name mismatch
      if ('resetToken' in userUpdate) {
        const updateValues: any = {...userUpdate};
        const resetToken = updateValues.resetToken;
        delete updateValues.resetToken;
        
        // First update the normal fields using Drizzle ORM
        if (Object.keys(updateValues).length > 0) {
          await db.update(users).set(updateValues).where(eq(users.id, id));
        }
        
        // Then update the reset_password_token field using direct SQL
        await db.execute(sql`UPDATE users SET reset_password_token = ${resetToken} WHERE id = ${id}`);
        
        // Get the updated user
        const result = await db.execute(sql`SELECT * FROM users WHERE id = ${id}`);
        
        if (result.rows && result.rows.length > 0) {
          return result.rows[0] as User;
        }
        return undefined;
      } else {
        // Normal update using Drizzle ORM
        const [user] = await db
          .update(users)
          .set(userUpdate)
          .where(eq(users.id, id))
          .returning();
        return user || undefined;
      }
    } catch (error) {
      console.error("Error in updateUser:", error);
      return undefined;
    }
  }

  /**
   * Category operations
   */
  async getCategories(): Promise<Category[]> {
    try {
      // Use SQL directly to avoid column schema mismatch
      const result = await db.execute(sql`SELECT id, name, description, image_url FROM categories`);
      return result.rows as Category[];
    } catch (error) {
      console.error("Error in getCategories:", error);
      return [];
    }
  }

  async getCategory(id: number): Promise<Category | undefined> {
    try {
      // Use SQL directly to avoid column schema mismatch
      const result = await db.execute(sql`SELECT id, name, description, image_url FROM categories WHERE id = ${id}`);
      if (result.rows && result.rows.length > 0) {
        return result.rows[0] as Category;
      }
      return undefined;
    } catch (error) {
      console.error("Error in getCategory:", error);
      return undefined;
    }
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: number, categoryUpdate: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set(categoryUpdate)
      .where(eq(categories.id, id))
      .returning();
    return category || undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    try {
      await db.delete(categories).where(eq(categories.id, id));
      // Check if the category still exists after deletion
      const category = await this.getCategory(id);
      return category === undefined;
    } catch (error) {
      console.error("Error deleting category:", error);
      return false;
    }
  }

  /**
   * Product operations
   */
  async getProducts(): Promise<Product[]> {
    try {
      // Use SQL directly to avoid column schema mismatch
      const result = await db.execute(sql`
        SELECT id, name, description, price, stock, image_url, vendor_id, 
        category_id, created_at, location, is_organic, is_fresh_picked, is_local 
        FROM products
      `);
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        stock: row.stock,
        imageUrl: row.image_url,
        vendorId: row.vendor_id,
        categoryId: row.category_id,
        createdAt: row.created_at,
        location: row.location,
        isOrganic: row.is_organic,
        isFreshPicked: row.is_fresh_picked,
        isLocal: row.is_local
      })) as Product[];
    } catch (error) {
      console.error("Error in getProducts:", error);
      return [];
    }
  }

  async getProduct(id: number): Promise<Product | undefined> {
    try {
      // Use SQL directly to avoid column schema mismatch
      const result = await db.execute(sql`
        SELECT id, name, description, price, stock, image_url, vendor_id, 
        category_id, created_at, location, is_organic, is_fresh_picked, is_local 
        FROM products WHERE id = ${id}
      `);
      
      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          name: row.name,
          description: row.description,
          price: row.price,
          stock: row.stock,
          imageUrl: row.image_url,
          vendorId: row.vendor_id,
          categoryId: row.category_id,
          createdAt: row.created_at,
          location: row.location,
          isOrganic: row.is_organic,
          isFreshPicked: row.is_fresh_picked,
          isLocal: row.is_local
        } as Product;
      }
      return undefined;
    } catch (error) {
      console.error("Error in getProduct:", error);
      return undefined;
    }
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    try {
      // Use SQL directly to avoid column schema mismatch
      const result = await db.execute(sql`
        SELECT id, name, description, price, stock, image_url, vendor_id, 
        category_id, created_at, location, is_organic, is_fresh_picked, is_local 
        FROM products WHERE category_id = ${categoryId}
      `);
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        stock: row.stock,
        imageUrl: row.image_url,
        vendorId: row.vendor_id,
        categoryId: row.category_id,
        createdAt: row.created_at,
        location: row.location,
        isOrganic: row.is_organic,
        isFreshPicked: row.is_fresh_picked,
        isLocal: row.is_local
      })) as Product[];
    } catch (error) {
      console.error("Error in getProductsByCategory:", error);
      return [];
    }
  }

  async getProductsByVendor(vendorId: number): Promise<Product[]> {
    try {
      // Use SQL directly to avoid column schema mismatch
      const result = await db.execute(sql`
        SELECT id, name, description, price, stock, image_url, vendor_id, 
        category_id, created_at, location, is_organic, is_fresh_picked, is_local 
        FROM products WHERE vendor_id = ${vendorId}
      `);
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        stock: row.stock,
        imageUrl: row.image_url,
        vendorId: row.vendor_id,
        categoryId: row.category_id,
        createdAt: row.created_at,
        location: row.location,
        isOrganic: row.is_organic,
        isFreshPicked: row.is_fresh_picked,
        isLocal: row.is_local
      })) as Product[];
    } catch (error) {
      console.error("Error in getProductsByVendor:", error);
      return [];
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const searchPattern = `%${query}%`;
      // Use SQL directly to avoid column schema mismatch
      const result = await db.execute(sql`
        SELECT id, name, description, price, stock, image_url, vendor_id, 
        category_id, created_at, location, is_organic, is_fresh_picked, is_local 
        FROM products 
        WHERE name LIKE ${searchPattern} OR description LIKE ${searchPattern}
      `);
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        stock: row.stock,
        imageUrl: row.image_url,
        vendorId: row.vendor_id,
        categoryId: row.category_id,
        createdAt: row.created_at,
        location: row.location,
        isOrganic: row.is_organic,
        isFreshPicked: row.is_fresh_picked,
        isLocal: row.is_local
      })) as Product[];
    } catch (error) {
      console.error("Error in searchProducts:", error);
      return [];
    }
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, productUpdate: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(productUpdate)
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      await db.delete(products).where(eq(products.id, id));
      // Check if the product still exists after deletion
      const product = await this.getProduct(id);
      return product === undefined;
    } catch (error) {
      console.error("Error deleting product:", error);
      return false;
    }
  }

  /**
   * Vendor operations
   */
  async getVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors);
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor || undefined;
  }

  async getVendorByUserId(userId: number): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.userId, userId));
    return vendor || undefined;
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const [vendor] = await db.insert(vendors).values(insertVendor).returning();
    return vendor;
  }

  async updateVendor(id: number, vendorUpdate: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const [vendor] = await db
      .update(vendors)
      .set(vendorUpdate)
      .where(eq(vendors.id, id))
      .returning();
    return vendor || undefined;
  }

  /**
   * Order operations
   */
  async getOrders(): Promise<Order[]> {
    try {
      // Use SQL directly to avoid column schema mismatch
      const result = await db.execute(sql`
        SELECT id, user_id, status, total, shipping_address, created_at
        FROM orders
      `);
      
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        status: row.status,
        total: row.total,
        shippingAddress: row.shipping_address,
        createdAt: row.created_at
      })) as Order[];
    } catch (error) {
      console.error("Error in getOrders:", error);
      return [];
    }
  }

  async getOrder(id: number): Promise<Order | undefined> {
    try {
      // Use SQL directly to avoid column schema mismatch
      const result = await db.execute(sql`
        SELECT id, user_id, status, total, shipping_address, created_at
        FROM orders WHERE id = ${id}
      `);
      
      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          userId: row.user_id,
          status: row.status,
          total: row.total,
          shippingAddress: row.shipping_address,
          createdAt: row.created_at
        } as Order;
      }
      return undefined;
    } catch (error) {
      console.error("Error in getOrder:", error);
      return undefined;
    }
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    try {
      // Use SQL directly to avoid column schema mismatch
      const result = await db.execute(sql`
        SELECT id, user_id, status, total, shipping_address, created_at
        FROM orders WHERE user_id = ${userId}
      `);
      
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        status: row.status,
        total: row.total,
        shippingAddress: row.shipping_address,
        createdAt: row.created_at
      })) as Order[];
    } catch (error) {
      console.error("Error in getOrdersByUser:", error);
      return [];
    }
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    try {
      // Use SQL directly to handle column mismatches
      const result = await db.execute(sql`
        INSERT INTO orders (
          user_id, status, total, shipping_address, shipping_city, 
          shipping_state, shipping_postal_code, shipping_country, 
          shipping_method, shipping_fee, payment_method, payment_status
        ) VALUES (
          ${insertOrder.userId}, ${insertOrder.status || 'pending'}, 
          ${insertOrder.total}, ${insertOrder.shippingAddress}, 
          ${insertOrder.shippingCity}, ${insertOrder.shippingState}, 
          ${insertOrder.shippingPostalCode}, ${insertOrder.shippingCountry || 'Sri Lanka'}, 
          ${insertOrder.shippingMethod}, ${insertOrder.shippingFee}, 
          ${insertOrder.paymentMethod}, ${insertOrder.paymentStatus || 'pending'}
        )
        RETURNING id, user_id, status, total, shipping_address, created_at
      `);
      
      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          userId: row.user_id,
          status: row.status,
          total: row.total,
          shippingAddress: row.shipping_address,
          createdAt: row.created_at
        } as Order;
      }
      throw new Error("Failed to create order");
    } catch (error) {
      console.error("Error in createOrder:", error);
      throw error;
    }
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    try {
      // Use SQL directly to handle column mismatches
      const result = await db.execute(sql`
        UPDATE orders SET status = ${status}
        WHERE id = ${id}
        RETURNING id, user_id, status, total, shipping_address, created_at
      `);
      
      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          userId: row.user_id,
          status: row.status,
          total: row.total,
          shippingAddress: row.shipping_address,
          createdAt: row.created_at
        } as Order;
      }
      return undefined;
    } catch (error) {
      console.error("Error in updateOrderStatus:", error);
      return undefined;
    }
  }

  /**
   * Order Items operations
   */
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    try {
      // Use SQL directly to avoid column schema mismatch
      const result = await db.execute(sql`
        SELECT id, order_id, product_id, quantity, price, created_at
        FROM order_items WHERE order_id = ${orderId}
      `);
      
      return result.rows.map(row => ({
        id: row.id,
        orderId: row.order_id,
        productId: row.product_id,
        quantity: row.quantity,
        price: row.price,
        createdAt: row.created_at
      })) as OrderItem[];
    } catch (error) {
      console.error("Error in getOrderItems:", error);
      return [];
    }
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    try {
      // Handle any field name conversion (e.g., priceAtTime to price) if needed
      let price = insertOrderItem.price;
      if ('priceAtTime' in insertOrderItem && !price) {
        // @ts-ignore - Handle conversion from old field name to new if needed
        price = insertOrderItem.priceAtTime;
      }
      
      // Use SQL directly to handle column mismatches
      const result = await db.execute(sql`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (${insertOrderItem.orderId}, ${insertOrderItem.productId}, 
                ${insertOrderItem.quantity}, ${price})
        RETURNING id, order_id, product_id, quantity, price, created_at
      `);
      
      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          orderId: row.order_id,
          productId: row.product_id,
          quantity: row.quantity,
          price: row.price,
          createdAt: row.created_at
        } as OrderItem;
      }
      throw new Error("Failed to create order item");
    } catch (error) {
      console.error("Error in createOrderItem:", error);
      throw error;
    }
  }

  /**
   * Reviews operations
   * Note: In a real implementation, these should be moved to MongoDB.
   * For simplicity, we're delegating to an in-memory map as a placeholder.
   */
  private reviews: Map<string, Review> = new Map();
  private reviewCurrentId: number = 1;

  async getReviews(productId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.productId === productId
    );
  }

  async getReviewsByUser(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.userId === userId
    );
  }

  async createReview(review: Review): Promise<Review> {
    const id = String(this.reviewCurrentId++);
    const createdAt = new Date();
    const updatedAt = createdAt;
    const newReview: Review = { 
      ...review, 
      _id: id, 
      createdAt, 
      updatedAt 
    };
    this.reviews.set(id, newReview);
    return newReview;
  }

  async updateReview(id: string, reviewUpdate: Partial<Review>): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;
    
    const updatedReview: Review = { 
      ...review, 
      ...reviewUpdate, 
      updatedAt: new Date() 
    };
    this.reviews.set(id, updatedReview);
    return updatedReview;
  }

  async deleteReview(id: string): Promise<boolean> {
    return this.reviews.delete(id);
  }
}
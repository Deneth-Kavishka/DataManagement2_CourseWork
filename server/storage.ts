import {
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  type Review
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProductsByFarmer(farmerId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  
  // Order items operations
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItemsByOrder(orderId: number): Promise<OrderItem[]>;
  
  // For MongoDB-related operations (to be implemented later)
  createReview(review: Omit<Review, "id">): Promise<Review>;
  getReviewsByProduct(productId: number): Promise<Review[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private reviews: Map<string, Review>;
  
  private currentUserId: number;
  private currentCategoryId: number;
  private currentProductId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;
  private currentReviewId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.reviews = new Map();
    
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentProductId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentReviewId = 1;
    
    this.initializeData();
  }

  // Initialize with sample data
  private initializeData() {
    // Add sample categories
    const categories = [
      { name: "Fruits", description: "Fresh seasonal fruits", icon: "fa-apple-alt" },
      { name: "Vegetables", description: "Organic vegetables", icon: "fa-carrot" },
      { name: "Dairy", description: "Fresh dairy products", icon: "fa-cheese" },
      { name: "Bakery", description: "Artisanal baked goods", icon: "fa-bread-slice" },
      { name: "Eggs", description: "Farm-fresh eggs", icon: "fa-egg" },
      { name: "Herbs", description: "Fresh culinary herbs", icon: "fa-mortar-pestle" }
    ];
    
    categories.forEach(category => {
      this.createCategory(category);
    });
    
    // Add sample users (farmers)
    const farmers = [
      {
        username: "sarahjohnson",
        password: "password123",
        email: "sarah@urbanberriesfarm.com",
        fullName: "Sarah Johnson",
        isFarmer: true,
        farmName: "Urban Berries Farm",
        farmDescription: "Growing organic berries in the heart of the city for over 7 years.",
        address: "123 Farm St",
        city: "San Francisco",
        zipCode: "94103",
        phone: "415-555-0101"
      },
      {
        username: "miguelrodriguez",
        password: "password123",
        email: "miguel@cityrooftop.com",
        fullName: "Miguel Rodriguez",
        isFarmer: true,
        farmName: "City Rooftop Vegetables",
        farmDescription: "Pioneering urban farming on repurposed rooftops.",
        address: "456 Roof Ave",
        city: "San Francisco",
        zipCode: "94102",
        phone: "415-555-0102"
      },
      {
        username: "emmachen",
        password: "password123",
        email: "emma@citybakery.com",
        fullName: "Emma Chen",
        isFarmer: true,
        farmName: "City Bakery Co-op",
        farmDescription: "Our collective of urban bakers uses traditional methods.",
        address: "789 Bakery Blvd",
        city: "San Francisco",
        zipCode: "94104",
        phone: "415-555-0103"
      }
    ];
    
    const farmerIds: number[] = [];
    farmers.forEach(farmer => {
      const newFarmer = this.createUser(farmer);
      farmerIds.push(newFarmer.id);
    });
    
    // Add sample products
    const sampleProducts = [
      {
        name: "Organic Strawberries",
        description: "Fresh picked, pesticide-free berries",
        price: "4.99",
        imageUrl: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7",
        categoryId: 1,
        farmerId: farmerIds[0],
        unit: "pack",
        organic: true,
        stock: 25,
        featured: true
      },
      {
        name: "Sourdough Bread",
        description: "Traditional 24-hour fermented loaf",
        price: "6.50",
        imageUrl: "https://images.unsplash.com/photo-1573246123716-6b1782bfc499",
        categoryId: 4,
        farmerId: farmerIds[2],
        unit: "loaf",
        organic: false,
        stock: 15,
        featured: true
      },
      {
        name: "Farm Fresh Eggs",
        description: "Pasture-raised, multicolored eggs",
        price: "5.25",
        imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150",
        categoryId: 5,
        farmerId: farmerIds[1],
        unit: "dozen",
        organic: true,
        stock: 30,
        featured: true
      },
      {
        name: "Goat Cheese",
        description: "Creamy chèvre with herbs",
        price: "7.99",
        imageUrl: "https://images.unsplash.com/photo-1601197764250-eb5910c0f903",
        categoryId: 3,
        farmerId: farmerIds[1],
        unit: "8oz",
        organic: false,
        stock: 20,
        featured: true
      }
    ];
    
    sampleProducts.forEach(product => {
      this.createProduct(product);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // Product operations
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.featured
    );
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === categoryId
    );
  }
  
  async getProductsByFarmer(farmerId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.farmerId === farmerId
    );
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const newOrder: Order = { ...order, id, orderDate: new Date() };
    this.orders.set(id, newOrder);
    return newOrder;
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  // Order items operations
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const newOrderItem: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }
  
  async getOrderItemsByOrder(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (orderItem) => orderItem.orderId === orderId
    );
  }
  
  // Review operations (MongoDB simulation)
  async createReview(review: Omit<Review, "id">): Promise<Review> {
    const id = `review-${this.currentReviewId++}`;
    const newReview: Review = { ...review, id };
    this.reviews.set(id, newReview);
    return newReview;
  }
  
  async getReviewsByProduct(productId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.productId === productId
    );
  }
}

import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Database storage implementation
export class DatabaseStorage implements IStorage {
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

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }
  
  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.featured, true));
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.categoryId, categoryId));
  }
  
  async getProductsByFarmer(farmerId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.farmerId, farmerId));
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
  
  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values({
      ...order,
      orderDate: new Date()
    }).returning();
    return newOrder;
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.orderDate));
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }
  
  // Order items operations
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db.insert(orderItems).values(orderItem).returning();
    return newOrderItem;
  }
  
  async getOrderItemsByOrder(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }
  
  // MongoDB operations for reviews
  private mongoClient: any = null;
  private reviewCollection: any = null;
  
  private async getMongoCollection() {
    if (!this.reviewCollection) {
      const { MongoClient } = await import('mongodb');
      // This should be replaced by an actual MongoDB connection string
      // For now, we'll fall back to our mock implementation
      try {
        this.mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
        await this.mongoClient.connect();
        const db = this.mongoClient.db('urbanfood');
        this.reviewCollection = db.collection('reviews');
      } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
      }
    }
    return this.reviewCollection;
  }
  
  async createReview(review: Omit<Review, "id">): Promise<Review> {
    try {
      const collection = await this.getMongoCollection();
      if (collection) {
        const result = await collection.insertOne({
          ...review,
          _id: new (await import('mongodb')).ObjectId(),
        });
        return {
          ...review,
          id: result.insertedId.toString(),
        };
      } else {
        // Fall back to in-memory storage for reviews if MongoDB is not available
        const id = `review-${Date.now()}`;
        const newReview: Review = { ...review, id };
        return newReview;
      }
    } catch (error) {
      console.error('Error creating review in MongoDB:', error);
      // Fall back to returning a stubbed review
      const id = `review-${Date.now()}`;
      const newReview: Review = { ...review, id };
      return newReview;
    }
  }
  
  async getReviewsByProduct(productId: number): Promise<Review[]> {
    try {
      const collection = await this.getMongoCollection();
      if (collection) {
        const reviews = await collection.find({ productId }).toArray();
        return reviews.map((review: any) => ({
          ...review,
          id: review._id.toString(),
        }));
      } else {
        // Return empty array if MongoDB connection failed
        return [];
      }
    } catch (error) {
      console.error('Error getting reviews from MongoDB:', error);
      return [];
    }
  }
}

// Use Database storage implementation
export const storage = new DatabaseStorage();

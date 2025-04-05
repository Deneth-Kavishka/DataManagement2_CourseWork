import { users, type User, type InsertUser, categories, type Category, type InsertCategory, products, type Product, type InsertProduct, vendors, type Vendor, type InsertVendor, orders, type Order, type InsertOrder, orderItems, type OrderItem, type InsertOrderItem, type Review } from "@shared/schema";
import { mongoStorage } from './MongoStorage';
import { oracleStorage } from './OracleStorage';
import { DatabaseStorage } from './DatabaseStorage';

// Interface for all storage operations
export interface IStorage {
  // Optional initialization method (for database implementations)
  initialize?(): Promise<boolean>;
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  verifyUser(id: number): Promise<User | undefined>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProductsByVendor(vendorId: number): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Vendor operations
  getVendors(): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  getVendorByUserId(userId: number): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  
  // Order operations
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order Items operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Review operations (MongoDB)
  getReviews(productId: number): Promise<Review[]>;
  getReviewsByUser(userId: number): Promise<Review[]>;
  createReview(review: Review): Promise<Review>;
  updateReview(id: string, review: Partial<Review>): Promise<Review | undefined>;
  deleteReview(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private vendors: Map<number, Vendor>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private reviews: Map<string, Review>;
  private userCurrentId: number;
  private categoryCurrentId: number;
  private productCurrentId: number;
  private vendorCurrentId: number;
  private orderCurrentId: number;
  private orderItemCurrentId: number;
  private reviewCurrentId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.vendors = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.reviews = new Map();
    this.userCurrentId = 1;
    this.categoryCurrentId = 1;
    this.productCurrentId = 1;
    this.vendorCurrentId = 1;
    this.orderCurrentId = 1;
    this.orderItemCurrentId = 1;
    this.reviewCurrentId = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }

  private initSampleData() {
    // Add sample categories
    const categories = [
      { name: "Vegetables", description: "Locally sourced fresh vegetables from Sri Lankan farms", imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37" },
      { name: "Fruits", description: "Tropical and seasonal fruits from around Sri Lanka", imageUrl: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b" },
      { name: "Dairy Products", description: "Fresh dairy products from local producers in Sri Lanka", imageUrl: "https://images.unsplash.com/photo-1628088062854-d1870b4553da" },
      { name: "Baked Goods", description: "Authentic Sri Lankan baked goods and sweets", imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff" },
      { name: "Handmade Crafts", description: "Traditional and modern Sri Lankan handmade items", imageUrl: "https://images.unsplash.com/photo-1464195244916-405fa0a82545" },
      { name: "Seasonal Items", description: "Festive and seasonal products from across Sri Lanka", imageUrl: "https://images.unsplash.com/photo-1476525913996-bba9ab3912d9" }
    ];
  
    categories.forEach(category => this.createCategory(category));
  
    // Add sample users
    const users = [
      { username: "kavindu_fernando", email: "kavindu@example.com", password: "password123", firstName: "Kavindu", lastName: "Fernando", isVendor: true },
      { username: "nethmi_perera", email: "nethmi@example.com", password: "password123", firstName: "Nethmi", lastName: "Perera", isVendor: true },
      { username: "sajith_bandara", email: "sajith@example.com", password: "password123", firstName: "Sajith", lastName: "Bandara", isVendor: true },
      { username: "ishara_senanayake", email: "ishara@example.com", password: "password123", firstName: "Ishara", lastName: "Senanayake", isVendor: false }
    ];
  
    users.forEach(user => this.createUser(user));
  
    // Add sample vendors
    const vendors = [
      {
        userId: 1,
        businessName: "Nuwara Fresh Farms",
        description: "Organic vegetables grown in the cool climate of Nuwara Eliya with sustainable farming practices.",
        location: "Nuwara Eliya",
        tags: ["Organic", "Vegetables", "Cool Climate"],
        logoUrl: "https://images.unsplash.com/photo-1595923533867-9a5b4a5142d8",
        bannerUrl: "https://images.unsplash.com/photo-1595923533867-9a5b4a5142d8",
        rating: 4.9
      },
      {
        userId: 2,
        businessName: "Tropical Harvest Galle",
        description: "Offering fresh fruits and traditional baked items directly from Galle's village markets.",
        location: "Galle",
        tags: ["Fruits", "Local", "Traditional"],
        logoUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9",
        bannerUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9",
        rating: 4.8
      },
      {
        userId: 3,
        businessName: "Colombo Urban Greens",
        description: "Urban farming collective in Colombo delivering pesticide-free vegetables to your doorstep.",
        location: "Colombo",
        tags: ["Urban", "Organic", "Direct Delivery"],
        logoUrl: "https://images.unsplash.com/photo-1579113800032-c38bd7635818",
        bannerUrl: "https://images.unsplash.com/photo-1579113800032-c38bd7635818",
        rating: 4.5
      }
    ];
  
    vendors.forEach(vendor => this.createVendor(vendor));
  
    // Add sample products (LKR prices are approximate based on April 2025 market)
    const products = [
      {
        name: "Organic Cabbage (250g)",
        description: "Locally grown organic kale from Nuwara Eliya",
        price: 170,
        stock: 50,
        imageUrl: "https://cdn.pixabay.com/photo/2018/10/03/21/57/cabbage-3722498_1280.jpg",
        vendorId: 1,
        categoryId: 1,
        location: "Nuwara Eliya",
        isOrganic: true,
        isFreshPicked: false,
        isLocal: true
      },
      {
        name: "Thambili (King Coconut)",
        description: "Fresh king coconuts from the Southern coast",
        price: 150,
        stock: 100,
        imageUrl: "https://media.istockphoto.com/id/1267715389/photo/bunch-of-king-coconuts-in-a-palm.jpg?s=612x612&w=0&k=20&c=WE-j4lfsI_QI_vPr_DobgHmcz5BMamDwQKXnjT8vYFk=",
        vendorId: 2,
        categoryId: 2,
        location: "Galle",
        isOrganic: true,
        isFreshPicked: true,
        isLocal: true
      },
      {
        name: "Bell Pepper Mix (500g)",
        description: "Green, red, and yellow peppers harvested this week",
        price: 500,
        stock: 30,
        imageUrl: "https://media.istockphoto.com/id/480931380/photo/bell-pepper.jpg?s=612x612&w=0&k=20&c=gzxuvBrlcGd9shtDT2rMyPoCQj9VzLv1SksaRSuNDCk=",
        vendorId: 3,
        categoryId: 1,
        location: "Colombo",
        isOrganic: false,
        isFreshPicked: true,
        isLocal: true
      },
      {
        name: "Gotukola Bundle",
        description: "Fresh gotukola bundles grown organically",
        price: 80,
        stock: 60,
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHf-3X3FPqL-BLWgl41HUpSZ7kInYOhsx8DQ&s",
        vendorId: 1,
        categoryId: 1,
        location: "Nuwara Eliya",
        isOrganic: true,
        isFreshPicked: true,
        isLocal: true
      },
      {
        name: "Red Onions (1kg)",
        description: "Crunchy orange carrots, freshly picked",
        price: 200,
        stock: 70,
        imageUrl: "https://images.unsplash.com/photo-1508747703725-719777637510",
        vendorId: 2,
        categoryId: 1,
        location: "Matale",
        isOrganic: false,
        isFreshPicked: true,
        isLocal: true
      },
      {
        name: "Carrot (1kg)",
        description: "Locally grown red onions with strong aroma",
        price: 420,
        stock: 40,
        imageUrl: "https://images.unsplash.com/photo-1522184216316-3c25379f9760",
        vendorId: 3,
        categoryId: 1,
        location: "Dambulla",
        isOrganic: false,
        isFreshPicked: false,
        isLocal: true
      },
      {
        name: "Ambul Banana (1kg)",
        description: "Sweet-sour traditional banana variety",
        price: 280,
        stock: 55,
        imageUrl: "https://media.istockphoto.com/id/1494763483/photo/banana-concept.jpg?s=612x612&w=0&k=20&c=ZeVP-L6ClmyT-i0N-QAbDK7q37uHhrzg7KOzMkaOtg4=",
        vendorId: 1,
        categoryId: 2,
        location: "Kurunegala",
        isOrganic: true,
        isFreshPicked: true,
        isLocal: true
      },
      {
        name: "Mixed Tropical Fruits Box",
        description: "A mix of mango, pineapple, and banana (approx. 1.5kg)",
        price: 950,
        stock: 20,
        imageUrl: "https://media.istockphoto.com/id/1434558707/photo/delicious-rainbow-fruits.jpg?s=612x612&w=0&k=20&c=-qLINv7XkNuKMSAGihJgisCvVrM-Eb0jg6T1Pi7T2_A=",
        vendorId: 2,
        categoryId: 2,
        location: "Galle",
        isOrganic: false,
        isFreshPicked: true,
        isLocal: true
      }
    ];
  
    products.forEach(product => this.createProduct(product));

    
    // Add sample reviews
    const reviews = [
      { userId: 4, productId: 1, rating: 5, comment: "Excellent quality and freshness!" },
      { userId: 1, productId: 2, rating: 4, comment: "Very good tomatoes, would buy again." },
      { userId: 2, productId: 3, rating: 5, comment: "The peppers were perfect for my recipe." },
      { userId: 3, productId: 1, rating: 4, comment: "Great kale, very fresh." }
    ];
    
    reviews.forEach(review => this.createReview(review));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const createdAt = new Date();
    // Make sure all properties are properly set with default values where needed
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      phoneNumber: insertUser.phoneNumber ?? null,
      address: insertUser.address ?? null,
      city: insertUser.city ?? null,
      state: insertUser.state ?? null,
      zipCode: insertUser.zipCode ?? null,
      isVendor: insertUser.isVendor ?? false,
      isVerified: false,
      verificationToken: null,
      resetPasswordToken: null
    };
    this.users.set(id, user);
    return user;
  }
  
  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.verificationToken === token
    );
  }
  
  async getUserByResetToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.resetPasswordToken === token
    );
  }
  
  async verifyUser(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { 
      ...user, 
      isVerified: true, 
      verificationToken: null 
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...userUpdate };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryCurrentId++;
    const category: Category = { 
      ...insertCategory, 
      id,
      description: insertCategory.description ?? null,
      imageUrl: insertCategory.imageUrl ?? null
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, categoryUpdate: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory: Category = { ...category, ...categoryUpdate };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === categoryId
    );
  }

  async getProductsByVendor(vendorId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.vendorId === vendorId
    );
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowercasedQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      (product) => 
        product.name.toLowerCase().includes(lowercasedQuery) ||
        (product.description && product.description.toLowerCase().includes(lowercasedQuery))
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productCurrentId++;
    const createdAt = new Date();
    const product: Product = { 
      ...insertProduct, 
      id, 
      createdAt,
      description: insertProduct.description ?? null,
      imageUrl: insertProduct.imageUrl ?? null,
      stock: insertProduct.stock ?? 0,
      location: insertProduct.location ?? null,
      isOrganic: insertProduct.isOrganic ?? null,
      isFreshPicked: insertProduct.isFreshPicked ?? null,
      isLocal: insertProduct.isLocal ?? null
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, productUpdate: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct: Product = { ...product, ...productUpdate };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Vendor operations
  async getVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values());
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async getVendorByUserId(userId: number): Promise<Vendor | undefined> {
    return Array.from(this.vendors.values()).find(
      (vendor) => vendor.userId === userId
    );
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const id = this.vendorCurrentId++;
    const createdAt = new Date();
    const vendor: Vendor = { 
      ...insertVendor, 
      id, 
      createdAt, 
      description: insertVendor.description ?? null,
      logoUrl: insertVendor.logoUrl ?? null,
      bannerUrl: insertVendor.bannerUrl ?? null,
      tags: insertVendor.tags ?? null,
      rating: null
    };
    this.vendors.set(id, vendor);
    return vendor;
  }

  async updateVendor(id: number, vendorUpdate: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;
    
    const updatedVendor: Vendor = { ...vendor, ...vendorUpdate };
    this.vendors.set(id, updatedVendor);
    return updatedVendor;
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderCurrentId++;
    const createdAt = new Date();
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt,
      status: insertOrder.status ?? "pending"
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder: Order = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order Items operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (orderItem) => orderItem.orderId === orderId
    );
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemCurrentId++;
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  // Review operations (MongoDB)
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

  async createReview(review: Omit<Review, '_id' | 'createdAt'> | Review): Promise<Review> {
    const id = `${this.reviewCurrentId++}`;
    const createdAt = new Date();
    const newReview: Review = { ...review, _id: id, createdAt };
    this.reviews.set(id, newReview);
    return newReview;
  }

  async updateReview(id: string, reviewUpdate: Partial<Review>): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;
    
    const updatedReview: Review = { ...review, ...reviewUpdate };
    this.reviews.set(id, updatedReview);
    return updatedReview;
  }

  async deleteReview(id: string): Promise<boolean> {
    return this.reviews.delete(id);
  }
}

// Import the PostgreSQL storage implementation
import { DatabaseStorage } from './DatabaseStorage';

// Check if database is configured
const useDatabase = process.env.DATABASE_URL ? true : false;

// Create and export the appropriate storage instance
// Database type configuration - default to mem for in-memory storage
const dbType = process.env.DB_TYPE || 'mem';

// Create appropriate storage implementation based on configuration
let storageImplementation: IStorage;

switch (dbType.toLowerCase()) {
  case 'oracle':
    console.log('Using Oracle database storage');
    storageImplementation = oracleStorage;
    break;
    
  case 'oracle_mongo':
    console.log('Using Oracle + MongoDB database storage');
    storageImplementation = mongoStorage;
    break;
    
  case 'mongo':
    console.log('Using MongoDB database storage');
    // Use MongoDB for everything (in a real app, would need MongoDB implementation for all operations)
    storageImplementation = mongoStorage;
    break;
    
  case 'postgres':
    console.log('Using PostgreSQL database storage');
    storageImplementation = useDatabase ? new DatabaseStorage() : new MemStorage();
    break;
    
  case 'mem':
  default:
    console.log('Using in-memory storage');
    storageImplementation = new MemStorage();
}

// Note: We DON'T initialize storage here as it's better to do that in server/index.ts
// where we have proper error handling and logging

export const storage = storageImplementation;

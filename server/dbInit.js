import pg from 'pg';
const { Pool } = pg;

// Create a connection pool using the DATABASE_URL environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create a sql object for executing SQL queries
const sql = {
  query: (text, params) => pool.query(text, params),
};

// Create database tables
async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Create users table
    await sql.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(100),
        lastName VARCHAR(100),
        role VARCHAR(50) NOT NULL DEFAULT 'customer',
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create categories table
    await sql.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        image VARCHAR(255)
      )
    `);
    
    // Create vendors table
    await sql.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id SERIAL PRIMARY KEY,
        userId INTEGER NOT NULL REFERENCES users(id),
        businessName VARCHAR(255) NOT NULL,
        description TEXT,
        logo VARCHAR(255),
        bannerImage VARCHAR(255),
        address TEXT,
        phone VARCHAR(50),
        email VARCHAR(255),
        website VARCHAR(255),
        rating NUMERIC(3,2) DEFAULT 0,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(userId)
      )
    `);
    
    // Create products table
    await sql.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(10,2) NOT NULL,
        discountPrice NUMERIC(10,2),
        categoryId INTEGER REFERENCES categories(id),
        vendorId INTEGER REFERENCES vendors(id),
        inventory INTEGER NOT NULL DEFAULT 0,
        images TEXT[],
        unit VARCHAR(50) NOT NULL DEFAULT 'item',
        isOrganic BOOLEAN DEFAULT FALSE,
        isFeatured BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create orders table
    await sql.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        userId INTEGER REFERENCES users(id),
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        total NUMERIC(10,2) NOT NULL,
        shippingAddress TEXT,
        paymentMethod VARCHAR(50),
        paymentStatus VARCHAR(50) DEFAULT 'pending',
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create order_items table
    await sql.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        orderId INTEGER NOT NULL REFERENCES orders(id),
        productId INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price NUMERIC(10,2) NOT NULL
      )
    `);
    
    console.log('Database initialized successfully');
    
    // Check if there's any data in the categories table
    const categoriesResult = await sql.query('SELECT COUNT(*) FROM categories');
    if (parseInt(categoriesResult.rows[0].count) === 0) {
      console.log('Adding sample data...');
      await addSampleData();
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Add sample data to the database
async function addSampleData() {
  try {
    // Add sample categories
    const categories = [
      { name: 'Vegetables', description: 'Fresh vegetables from local farms', imageUrl: 'vegetables.jpg' },
      { name: 'Fruits', description: 'Seasonal fruits grown locally', imageUrl: 'fruits.jpg' },
      { name: 'Dairy', description: 'Milk, cheese, and other dairy products', imageUrl: 'dairy.jpg' },
      { name: 'Baked Goods', description: 'Fresh bread and pastries', imageUrl: 'baked.jpg' },
      { name: 'Crafts', description: 'Handmade crafts from local artisans', imageUrl: 'crafts.jpg' },
      { name: 'Seasonal', description: 'Seasonal produce and goods', imageUrl: 'seasonal.jpg' }
    ];
    
    for (const category of categories) {
      await sql.query(
        'INSERT INTO categories (name, description, image_url) VALUES ($1, $2, $3)',
        [category.name, category.description, category.imageUrl]
      );
    }
    
    // Add sample users
    const users = [
      { username: 'farmer1', email: 'farmer1@example.com', password: 'password123', firstName: 'John', lastName: 'Doe', isVendor: true },
      { username: 'farmer2', email: 'farmer2@example.com', password: 'password123', firstName: 'Jane', lastName: 'Smith', isVendor: true },
      { username: 'customer1', email: 'customer1@example.com', password: 'password123', firstName: 'Bob', lastName: 'Johnson', isVendor: false }
    ];
    
    for (const user of users) {
      const result = await sql.query(
        'INSERT INTO users (username, email, password, first_name, last_name, is_vendor) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [user.username, user.email, user.password, user.firstName, user.lastName, user.isVendor]
      );
      
      if (user.isVendor) {
        const userId = result.rows[0].id;
        await sql.query(
          'INSERT INTO vendors (user_id, business_name, description, location, logo_url) VALUES ($1, $2, $3, $4, $5)',
          [userId, `${user.firstName}'s Farm`, `Local organic farm run by ${user.firstName} ${user.lastName}`, '123 Farm Road, Cityville', 'default-logo.png']
        );
      }
    }
    
    // Get vendor IDs
    const vendorsResult = await sql.query('SELECT id, business_name FROM vendors');
    const vendors = vendorsResult.rows;
    
    // Get category IDs
    const categoriesResult = await sql.query('SELECT id, name FROM categories');
    const categoryMap = categoriesResult.rows.reduce((map, cat) => {
      map[cat.name] = cat.id;
      return map;
    }, {});
    
    // Add sample products
    const products = [
      { name: 'Organic Kale', description: 'Fresh organic kale from our farm', price: 3.99, categoryId: categoryMap['Vegetables'], vendorId: vendors[0].id, stock: 100, isOrganic: true, isFreshPicked: true, isLocal: true, imageUrl: 'kale.jpg', location: 'North Farm' },
      { name: 'Heirloom Tomatoes', description: 'Delicious heirloom tomatoes', price: 4.99, categoryId: categoryMap['Vegetables'], vendorId: vendors[0].id, stock: 75, isOrganic: true, isFreshPicked: true, isLocal: true, imageUrl: 'tomatoes.jpg', location: 'South Field' },
      { name: 'Fresh Strawberries', description: 'Sweet locally grown strawberries', price: 5.99, categoryId: categoryMap['Fruits'], vendorId: vendors[1].id, stock: 50, isOrganic: true, isFreshPicked: true, isLocal: true, imageUrl: 'strawberries.jpg', location: 'Berry Patch' },
      { name: 'Artisan Bread', description: 'Freshly baked artisan bread', price: 6.99, categoryId: categoryMap['Baked Goods'], vendorId: vendors[1].id, stock: 30, isOrganic: false, isFreshPicked: false, isLocal: true, imageUrl: 'bread.jpg', location: 'Home Bakery' }
    ];
    
    for (const product of products) {
      await sql.query(
        'INSERT INTO products (name, description, price, category_id, vendor_id, stock, is_organic, is_fresh_picked, is_local, image_url, location) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [product.name, product.description, product.price, product.categoryId, product.vendorId, product.stock, product.isOrganic, product.isFreshPicked, product.isLocal, product.imageUrl, product.location]
      );
    }
    
    console.log('Sample data added successfully');
  } catch (error) {
    console.error('Error adding sample data:', error);
    throw error;
  }
}

// Export the initializeDatabase function
export { initializeDatabase };
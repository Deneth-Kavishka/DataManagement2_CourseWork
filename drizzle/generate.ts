import { writeFileSync } from 'fs';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from '../shared/schema';
import pkg from 'pg';
const { Pool } = pkg;

// Create a connection pool using the DATABASE_URL environment variable
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// Generate SQL migration file
async function generateMigration() {
  console.log('Generating migration...');

  try {
    // This is simplistic - normally we'd use the Drizzle Kit for this
    // but we're simulating it here
    
    const createUsersTable = sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      is_verified BOOLEAN NOT NULL DEFAULT false,
      verification_token TEXT,
      reset_token TEXT,
      reset_token_expires TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`;
    
    const createCategoriesTable = sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      image_url TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`;
    
    const createProductsTable = sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price DOUBLE PRECISION NOT NULL,
      inventory INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      vendor_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      is_organic BOOLEAN DEFAULT false,
      is_local BOOLEAN DEFAULT true,
      is_fresh_picked BOOLEAN DEFAULT false,
      weight_kg DOUBLE PRECISION,
      dimensions TEXT,
      nutritional_info TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`;
    
    const createVendorsTable = sql`
    CREATE TABLE IF NOT EXISTS vendors (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE,
      business_name TEXT NOT NULL,
      description TEXT,
      logo_url TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      postal_code TEXT,
      country TEXT NOT NULL DEFAULT 'Sri Lanka',
      phone TEXT,
      website TEXT,
      business_email TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`;
    
    const createOrdersTable = sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      total DOUBLE PRECISION NOT NULL,
      shipping_address TEXT NOT NULL,
      shipping_city TEXT NOT NULL,
      shipping_state TEXT NOT NULL,
      shipping_postal_code TEXT NOT NULL,
      shipping_country TEXT NOT NULL DEFAULT 'Sri Lanka',
      shipping_method TEXT NOT NULL,
      shipping_fee DOUBLE PRECISION NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`;
    
    const createOrderItemsTable = sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price_at_time DOUBLE PRECISION NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );`;

    // Create migration file
    const timestamp = new Date().getTime();
    const migrationContent = `
-- Migration timestamp: ${timestamp}

-- Create Tables
${createUsersTable.sql};
${createCategoriesTable.sql};
${createProductsTable.sql};
${createVendorsTable.sql};
${createOrdersTable.sql};
${createOrderItemsTable.sql};

-- Add Foreign Keys
ALTER TABLE products ADD CONSTRAINT fk_vendor_id FOREIGN KEY (vendor_id) REFERENCES vendors (id) ON DELETE CASCADE;
ALTER TABLE products ADD CONSTRAINT fk_category_id FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE;
ALTER TABLE vendors ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;
ALTER TABLE orders ADD CONSTRAINT fk_order_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;
ALTER TABLE order_items ADD CONSTRAINT fk_order_id FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE;
ALTER TABLE order_items ADD CONSTRAINT fk_product_id FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE;
`;

    // Write migration file
    writeFileSync(`drizzle/migrations/${timestamp}_initial_schema.sql`, migrationContent);
    console.log(`Migration file created: ${timestamp}_initial_schema.sql`);
    
    // Close pool when done
    await pool.end();
  } catch (error) {
    console.error('Failed to generate migration:', error);
    process.exit(1);
  }
}

// Generate migration
generateMigration();
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { log } from './vite';

// Load environment variables
dotenv.config();

/**
 * Runs all migrations to update the database schema
 */
export async function runMigrations() {
  log('Starting database migrations...');
  
  const dbType = process.env.DB_TYPE || 'postgres';
  
  log(`Detected database type: ${dbType}`);
  
  try {
    if (dbType === 'oracle' || dbType === 'oracle_mongo') {
      // Run Oracle migrations
      log('Running Oracle migrations...');
      await runOracleMigrations();
    }
    
    if (dbType === 'mongo' || dbType === 'oracle_mongo') {
      // Setup MongoDB for reviews
      log('Setting up MongoDB...');
      await setupMongoDB();
    }
    
    if (dbType === 'postgres') {
      log('PostgreSQL migrations are handled by Drizzle ORM...');
      // Drizzle Kit handles PostgreSQL migrations separately
    }
    
    log('Database migrations completed successfully');
    return true;
  } catch (error) {
    log(`Error running migrations: ${error}`);
    console.error('Database migration error:', error);
    return false;
  }
}

/**
 * Runs Oracle migrations by executing SQL scripts from the oracle_migrations directory
 */
async function runOracleMigrations() {
  // Check if the oracle module is available
  try {
    const { oracleDb } = await import('./oracleDb');
    
    // Check for Oracle connection
    if (!process.env.ORACLE_CONNECTION_STRING) {
      throw new Error('ORACLE_CONNECTION_STRING environment variable is not set');
    }
    
    // Initialize Oracle DB
    await oracleDb.initialize();
    
    // Get all SQL migration files
    const migrationsDir = path.join(process.cwd(), 'oracle_migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      throw new Error(`Oracle migrations directory not found: ${migrationsDir}`);
    }
    
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Execute files in alphabetical order (01_, 02_, etc.)
    
    if (files.length === 0) {
      log('No Oracle migration files found');
      return;
    }
    
    log(`Found ${files.length} Oracle migration files`);
    
    // Execute each migration file
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      log(`Executing Oracle migration: ${file}`);
      
      try {
        // Read SQL file content
        const sqlContent = fs.readFileSync(filePath, 'utf8');
        
        // Split the SQL file by the '/' delimiter which separates PL/SQL blocks
        const sqlStatements = sqlContent.split('/').filter(stmt => stmt.trim());
        
        for (let i = 0; i < sqlStatements.length; i++) {
          const statement = sqlStatements[i].trim();
          if (statement) {
            try {
              // Execute each SQL statement
              await oracleDb.execute(statement);
            } catch (stmtError) {
              log(`Error executing statement ${i + 1} in ${file}: ${stmtError.message}`);
              // Continue to the next statement even if this one fails
            }
          }
        }
        
        log(`Successfully executed Oracle migration: ${file}`);
      } catch (fileError) {
        log(`Error processing migration file ${file}: ${fileError.message}`);
        throw fileError;
      }
    }
    
    // Create Oracle stored procedures
    log('Creating Oracle stored procedures...');
    await oracleDb.createProcedures();
    
    // Close Oracle connection
    await oracleDb.close();
    
    log('Oracle migrations completed successfully');
  } catch (error) {
    log(`Failed to run Oracle migrations: ${error.message}`);
    throw error;
  }
}

/**
 * Sets up MongoDB collections and indexes
 */
async function setupMongoDB() {
  // Check if the mongodb module is available
  try {
    const { mongoDb } = await import('./mongoDb');
    
    // Check for MongoDB connection
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    // Initialize MongoDB connection
    await mongoDb.initialize();
    
    // Set up collections and indexes
    const db = mongoDb.getDb();
    
    // Create reviews collection if it doesn't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (!collectionNames.includes('reviews')) {
      log('Creating reviews collection in MongoDB...');
      await db.createCollection('reviews');
    }
    
    // Create indexes
    log('Creating indexes for reviews collection...');
    await db.collection('reviews').createIndex({ productId: 1 });
    await db.collection('reviews').createIndex({ userId: 1 });
    
    // Close MongoDB connection
    await mongoDb.close();
    
    log('MongoDB setup completed successfully');
  } catch (error) {
    log(`Failed to set up MongoDB: ${error.message}`);
    throw error;
  }
}

// Run migrations function for direct execution with ES modules
// This is compatible with both ESM and Windows environments
const isMainModule = process.argv[1] === import.meta.url.substring(7);

if (isMainModule) {
  runMigrations()
    .then(() => {
      log('Migrations completed');
      process.exit(0);
    })
    .catch(error => {
      log(`Migration failed: ${error.message}`);
      process.exit(1);
    });
}
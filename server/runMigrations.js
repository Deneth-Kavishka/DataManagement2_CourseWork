const fs = require('fs');
const path = require('path');
const oracledb = require('oracledb');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Oracle Database Configuration
const oracleConfig = {
  user: process.env.ORACLE_USER || 'urbanfood',
  password: process.env.ORACLE_PASSWORD || 'password',
  connectString: process.env.ORACLE_CONNECTION_STRING || 'localhost:1521/XE'
};

// MongoDB Configuration
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/urbanfood';

async function runOracleMigrations() {
  let connection;
  
  try {
    console.log('Connecting to Oracle Database...');
    connection = await oracledb.getConnection(oracleConfig);
    console.log('Connected to Oracle Database');
    
    // Set autoCommit to true
    oracledb.autoCommit = true;
    
    // Get all migration files
    const migrationDir = path.join(__dirname, '..', 'oracle_migrations');
    const migrationFiles = fs.readdirSync(migrationDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure proper order
    
    console.log(`Found ${migrationFiles.length} migration files`);
    
    // Execute each migration file
    for (const file of migrationFiles) {
      console.log(`Executing migration: ${file}`);
      const filePath = path.join(migrationDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Split the file by delimiter to handle multiple statements
      const statements = sql.split(';');
      
      for (const statement of statements) {
        // Skip empty statements
        if (statement.trim() === '') continue;
        
        // Execute the statement
        try {
          await connection.execute(statement);
        } catch (err) {
          console.error(`Error executing statement: ${err.message}`);
          // Continue with next statement
        }
      }
      
      console.log(`Migration ${file} completed`);
    }
    
    console.log('All Oracle migrations completed successfully');
    return true;
  } catch (err) {
    console.error('Error running Oracle migrations:', err);
    return false;
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('Oracle connection closed');
      } catch (err) {
        console.error('Error closing Oracle connection:', err);
      }
    }
  }
}

async function setupMongoDB() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(mongoUri);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Create collections
    console.log('Creating MongoDB collections...');
    await db.createCollection('reviews');
    
    // Create indexes
    console.log('Creating MongoDB indexes...');
    await db.collection('reviews').createIndex({ productId: 1 });
    await db.collection('reviews').createIndex({ userId: 1 });
    
    console.log('MongoDB setup completed successfully');
    return true;
  } catch (err) {
    console.error('Error setting up MongoDB:', err);
    return false;
  } finally {
    if (client) {
      try {
        await client.close();
        console.log('MongoDB connection closed');
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
      }
    }
  }
}

async function runMigrations() {
  const dbType = process.env.DB_TYPE || 'postgres';
  
  if (dbType === 'oracle' || dbType === 'oracle_mongo') {
    // Run Oracle migrations
    const oracleMigrated = await runOracleMigrations();
    
    if (!oracleMigrated) {
      console.error('Oracle migrations failed');
      process.exit(1);
    }
  }
  
  if (dbType === 'oracle_mongo') {
    // Set up MongoDB
    const mongoSetup = await setupMongoDB();
    
    if (!mongoSetup) {
      console.error('MongoDB setup failed');
      process.exit(1);
    }
  }
  
  console.log('All migrations completed successfully');
}

// Run migrations
runMigrations().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
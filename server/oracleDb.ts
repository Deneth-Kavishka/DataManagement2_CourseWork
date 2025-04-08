import oracledb from 'oracledb';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Oracle Database Configuration
const dbConfig = {
  user: process.env.ORACLE_USER || 'urbanfood',
  password: process.env.ORACLE_PASSWORD || 'password',
  connectString: process.env.ORACLE_CONNECTION_STRING || 'localhost:1521/XE'
};

/**
 * Initialize Oracle Database connection
 */
async function initialize() {
  try {
    // Set Oracle client directory if provided
    const oracleClientDir = process.env.ORACLE_CLIENT_DIR;
    if (oracleClientDir) {
      oracledb.initOracleClient({ libDir: oracleClientDir });
    }

    // Create a connection pool
    await oracledb.createPool({
      ...dbConfig,
      poolIncrement: 1,
      poolMax: 5,
      poolMin: 0
    });

    console.log('Oracle connection pool created');
    return true;
  } catch (err) {
    console.error('Oracle initialization error:', err);
    return false;
  }
}

/**
 * Get a connection from the pool
 */
async function getConnection() {
  try {
    const connection = await oracledb.getConnection();
    return connection;
  } catch (err) {
    console.error('Error getting connection from pool:', err);
    throw err;
  }
}

/**
 * Execute SQL statement with bind variables and options
 */
async function execute(sql: string, binds: any = {}, options: any = {}) {
  let connection;
  try {
    // Set default options
    const defaultOptions = {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true
    };
    
    const opts = { ...defaultOptions, ...options };
    
    // Get connection
    connection = await getConnection();
    
    // Execute SQL
    const result = await connection.execute(sql, binds, opts);
    return result;
  } catch (err) {
    console.error('Error executing SQL:', err);
    throw err;
  } finally {
    if (connection) {
      try {
        // Release connection back to the pool
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

/**
 * Close all connections in the pool
 */
async function close() {
  try {
    await oracledb.getPool().close(0);
    console.log('Oracle connection pool closed');
    return true;
  } catch (err) {
    console.error('Error closing Oracle pool:', err);
    return false;
  }
}

/**
 * Create Oracle PL/SQL procedures from migration files
 */
async function createProcedures() {
  try {
    // In ES modules, we use import.meta.url instead of __dirname
    const currentFilePath = fileURLToPath(import.meta.url); // decode %20 to space
    const currentDir = path.dirname(currentFilePath);
    const procedureFile = path.join(currentDir, '..', 'oracle_migrations', '02_create_procedures.sql');
    console.log("Looking for procedure file at:", procedureFile);
    
    if (!fs.existsSync(procedureFile)) {
      console.error('Procedure migration file not found');
      return false;
    }
    
    // Read and execute procedure file
    const sql = fs.readFileSync(procedureFile, 'utf8');
    
    // Split the file by delimiter to handle multiple procedure definitions
    const procedures = sql.split('/');
    
    // Execute each procedure definition
    for (const procedure of procedures) {
      // Skip empty definitions
      if (procedure.trim() === '') continue;
      
      try {
        // Add delimiter back to procedure definition
        const procedureSql = procedure + '/';
        
        // Execute the procedure definition
        await execute(procedureSql);
      } catch (err) {
        console.error(`Error creating procedure: ${err.message}`);
        // Continue with next procedure
      }
    }
    
    console.log('All procedures created successfully');
    return true;
  } catch (err) {
    console.error('Error creating procedures:', err);
    return false;
  }
}

// Export Oracle DB functions
export const oracleDb = {
  initialize,
  getConnection,
  execute,
  close,
  createProcedures
};
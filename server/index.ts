import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from "dotenv";
import { verifyEmailService } from "./emailService";
import { runMigrations } from "./dbMigrations";
import { storage } from "./storage";

// Load environment variables from .env file if present
dotenv.config();

// Import database initialization functions if DATABASE_URL is present
const useDatabase = process.env.DATABASE_URL ? true : false;
let dbInit: { initializeDatabase: () => Promise<void> } | null = null;
// Will dynamically import the dbInit module if a database is configured

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize specialized database storage if configured
  const useOracle = process.env.ORACLE_CONNECTION_STRING ? true : false;
  const useMongo = process.env.MONGODB_URI ? true : false;
  
  if (useOracle || useMongo) {
    // Initialize storage with database connection
    log(`Initializing ${useOracle && useMongo ? 'Oracle+MongoDB' : useOracle ? 'Oracle' : 'MongoDB'} storage...`);
    try {
      // Check if storage has initialize method
      if (storage.initialize) {
        await storage.initialize();
        log('Database storage initialized successfully');
      }
    } catch (error) {
      log(`Error initializing database storage: ${error}`);
      console.error('Error initializing database storage:', error);
    }
    
    // Run database migrations
    try {
      await runMigrations();
    } catch (migrationError) {
      log(`Error running migrations: ${migrationError}`);
      console.error('Error running migrations:', migrationError);
    }
  }
  // Initialize PostgreSQL database if it's configured
  else if (useDatabase) {
    try {
      log('Initializing PostgreSQL database...');
      // Dynamically import the dbInit module
      const dbInitModule = await import('./dbInit.js');
      await dbInitModule.initializeDatabase();
      log('PostgreSQL database initialized successfully');
      
      // Run database migrations
      try {
        await runMigrations();
      } catch (migrationError) {
        log(`Error running migrations: ${migrationError}`);
        console.error('Error running migrations:', migrationError);
      }
    } catch (error) {
      log(`Error initializing database: ${error}`);
      console.error('Error initializing database:', error);
    }
  }
  
  // Verify email service configuration
  try {
    if (process.env.EMAIL_SERVICE && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      log('Verifying email service...');
      const emailServiceWorking = await verifyEmailService();
      if (emailServiceWorking) {
        log('Email service configured successfully');
      } else {
        log('Email service configuration failed. Email features may not work correctly.');
      }
    } else {
      log('Email service not configured. Email features will not work.');
    }
  } catch (error) {
    log(`Error verifying email service: ${error}`);
    console.error('Error verifying email service:', error);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();

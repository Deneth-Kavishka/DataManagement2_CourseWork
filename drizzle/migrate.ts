import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from '../server/db';

// Run migrations
async function migrateDatabase() {
  console.log('Starting database migration...');
  
  try {
    // Migrate using Drizzle's migrate function for PostgreSQL
    await migrate(db, { migrationsFolder: 'drizzle/migrations' });
    console.log('Migration completed successfully');
    
    // Close pool connection
    await pool.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

// Run migration when file is executed directly
migrateDatabase().then(() => {
  console.log('Migration process complete');
  process.exit(0);
}).catch((err) => {
  console.error('Unhandled error in migration:', err);
  process.exit(1);
});
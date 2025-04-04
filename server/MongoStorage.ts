import { OracleStorage } from './OracleStorage';
import { mongoDb } from './mongoDb';
import { IStorage } from './storage';
import { Review } from '@shared/schema';

/**
 * MongoDB Review Storage Implementation
 * This class extends the OracleStorage class but overrides review operations to use MongoDB
 * instead of Oracle for storing and retrieving review data.
 */
export class MongoStorage extends OracleStorage implements IStorage {
  
  /**
   * Initialize MongoDB connection and OracleDB connection
   */
  async initialize(): Promise<boolean> {
    try {
      // Initialize Oracle Database
      const oracleInitialized = await super.initialize();
      
      if (!oracleInitialized) {
        console.error('Failed to initialize Oracle Database');
        return false;
      }
      
      // Initialize MongoDB
      const mongoInitialized = await mongoDb.initialize();
      
      if (!mongoInitialized) {
        console.error('Failed to initialize MongoDB');
        return false;
      }
      
      console.log('Oracle Database and MongoDB initialized successfully');
      return true;
    } catch (err) {
      console.error('Error initializing Mongo Storage:', err);
      return false;
    }
  }
  
  /***********************
   * Review Operations (MongoDB)
   * Override the review operations from OracleStorage
   ***********************/
  
  async getReviews(productId: number): Promise<Review[]> {
    try {
      return await mongoDb.getReviews(productId);
    } catch (err) {
      console.error('Error getting reviews from MongoDB:', err);
      return [];
    }
  }
  
  async getReviewsByUser(userId: number): Promise<Review[]> {
    try {
      return await mongoDb.getReviewsByUser(userId);
    } catch (err) {
      console.error('Error getting reviews by user from MongoDB:', err);
      return [];
    }
  }
  
  async createReview(review: Omit<Review, '_id' | 'createdAt' | 'updatedAt'>): Promise<Review> {
    try {
      return await mongoDb.createReview(review);
    } catch (err) {
      console.error('Error creating review in MongoDB:', err);
      throw err;
    }
  }
  
  async updateReview(id: string, reviewUpdate: Partial<Review>): Promise<Review | undefined> {
    try {
      return await mongoDb.updateReview(id, reviewUpdate);
    } catch (err) {
      console.error('Error updating review in MongoDB:', err);
      return undefined;
    }
  }
  
  async deleteReview(id: string): Promise<boolean> {
    try {
      return await mongoDb.deleteReview(id);
    } catch (err) {
      console.error('Error deleting review from MongoDB:', err);
      return false;
    }
  }
}

// Export the MongoDB Storage implementation
export const mongoStorage = new MongoStorage();
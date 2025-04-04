import { MongoClient, Collection, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import { Review } from '@shared/schema';

// Load environment variables
dotenv.config();

// MongoDB Configuration
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/urbanfood';
const dbName = process.env.MONGODB_DB_NAME || 'urbanfood';

// MongoDB client and collections
let client: MongoClient;
let reviewsCollection: Collection;

/**
 * Initialize MongoDB connection
 */
async function initialize(): Promise<boolean> {
  try {
    // Create MongoDB client
    client = new MongoClient(uri);
    
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get database and collections
    const db = client.db(dbName);
    reviewsCollection = db.collection('reviews');
    
    // Create indexes
    await reviewsCollection.createIndex({ productId: 1 });
    await reviewsCollection.createIndex({ userId: 1 });
    
    console.log('MongoDB initialized successfully');
    return true;
  } catch (err) {
    console.error('MongoDB initialization error:', err);
    return false;
  }
}

/**
 * Close MongoDB connection
 */
async function close(): Promise<boolean> {
  try {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
    return true;
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    return false;
  }
}

/**
 * Get reviews for a product
 */
async function getReviews(productId: number): Promise<Review[]> {
  try {
    // Find reviews for product
    const reviews = await reviewsCollection.find({ productId }).toArray();
    
    // Map MongoDB documents to Review objects
    return reviews.map(doc => ({
      _id: doc._id.toString(),
      productId: doc.productId,
      userId: doc.userId,
      rating: doc.rating,
      title: doc.title || '',
      comment: doc.comment,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date()
    }));
  } catch (err) {
    console.error('Error getting reviews:', err);
    return [];
  }
}

/**
 * Get reviews by user
 */
async function getReviewsByUser(userId: number): Promise<Review[]> {
  try {
    // Find reviews by user
    const reviews = await reviewsCollection.find({ userId }).toArray();
    
    // Map MongoDB documents to Review objects
    return reviews.map(doc => ({
      _id: doc._id.toString(),
      productId: doc.productId,
      userId: doc.userId,
      rating: doc.rating,
      title: doc.title || '',
      comment: doc.comment,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date()
    }));
  } catch (err) {
    console.error('Error getting reviews by user:', err);
    return [];
  }
}

/**
 * Create a new review
 */
async function createReview(review: Omit<Review, '_id'>): Promise<Review> {
  try {
    // Set review creation date
    const now = new Date();
    const reviewDoc = {
      ...review,
      createdAt: now,
      updatedAt: now
    };
    
    // Insert review
    const result = await reviewsCollection.insertOne(reviewDoc);
    
    // Return created review
    return {
      ...review,
      _id: result.insertedId.toString(),
      createdAt: now,
      updatedAt: now
    };
  } catch (err) {
    console.error('Error creating review:', err);
    throw err;
  }
}

/**
 * Update an existing review
 */
async function updateReview(id: string, reviewUpdate: Partial<Review>): Promise<Review | undefined> {
  try {
    // Set review update date
    const now = new Date();
    const updateDoc = {
      ...reviewUpdate,
      updatedAt: now
    };
    
    // Update review
    const result = await reviewsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );
    
    // If review not found
    if (!result) {
      return undefined;
    }
    
    // Return updated review
    return {
      _id: result._id.toString(),
      productId: result.productId,
      userId: result.userId,
      rating: result.rating,
      title: result.title || '',
      comment: result.comment,
      createdAt: result.createdAt,
      updatedAt: now
    };
  } catch (err) {
    console.error('Error updating review:', err);
    return undefined;
  }
}

/**
 * Delete a review
 */
async function deleteReview(id: string): Promise<boolean> {
  try {
    // Delete review
    const result = await reviewsCollection.deleteOne({ _id: new ObjectId(id) });
    
    // Return true if deleted, false otherwise
    return result.deletedCount === 1;
  } catch (err) {
    console.error('Error deleting review:', err);
    return false;
  }
}

/**
 * Get a review by ID
 */
async function getReviewById(id: string): Promise<Review | undefined> {
  try {
    // Find review by ID
    const review = await reviewsCollection.findOne({ _id: new ObjectId(id) });
    
    // If review not found
    if (!review) {
      return undefined;
    }
    
    // Return review
    return {
      _id: review._id.toString(),
      productId: review.productId,
      userId: review.userId,
      rating: review.rating,
      title: review.title || '',
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt
    };
  } catch (err) {
    console.error('Error getting review by ID:', err);
    return undefined;
  }
}

// Export MongoDB functions
export const mongoDb = {
  initialize,
  close,
  getReviews,
  getReviewsByUser,
  createReview,
  updateReview,
  deleteReview,
  getReviewById
};
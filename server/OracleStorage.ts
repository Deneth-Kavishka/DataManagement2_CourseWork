import { oracleDb } from './oracleDb';
import { 
  User, InsertUser, 
  Category, InsertCategory, 
  Product, InsertProduct, 
  Vendor, InsertVendor, 
  Order, InsertOrder, 
  OrderItem, InsertOrderItem, 
  Review
} from '@shared/schema';
import { IStorage } from './storage';

/**
 * Oracle Database Storage Implementation
 * This implementation uses Oracle PL/SQL procedures for database operations
 */
export class OracleStorage implements IStorage {
  /**
   * Initialize the Oracle storage
   * Creates tables and procedures if they don't exist
   */
  async initialize(): Promise<boolean> {
    try {
      // Initialize Oracle Database connection
      const initialized = await oracleDb.initialize();
      if (!initialized) {
        console.error('Failed to initialize Oracle Database');
        return false;
      }
      
      // Setup database tables and procedures
      await this.setupDatabase();
      
      return true;
    } catch (err) {
      console.error('Error initializing Oracle Storage:', err);
      return false;
    }
  }

  /**
   * Setup database tables and procedures
   */
  private async setupDatabase(): Promise<void> {
    try {
      // Create Oracle PL/SQL procedures from migration files
      await oracleDb.createProcedures();
    } catch (err) {
      console.error('Error setting up Oracle database:', err);
      throw err;
    }
  }

  /***********************
   * User Operations
   ***********************/

  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await oracleDb.execute(
        `
        DECLARE
          p_cursor SYS_REFCURSOR;
        BEGIN
          get_user_by_id(:id, p_cursor);
          DBMS_SQL.RETURN_RESULT(p_cursor);
        END;
        `,
        { id }
      );
      
      if (!result.resultSet || result.resultSet.length === 0) {
        return undefined;
      }
      
      return this.mapUserFromOracle(result.resultSet[0]);
    } catch (err) {
      console.error('Error getting user by ID:', err);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await oracleDb.execute(
        `
        DECLARE
          -- Declare a SYS_REFCURSOR to hold the result set from the stored procedure
          -- SYS_REFCURSOR is a weakly typed cursor (does not require a fixed return type)
          -- It acts like a pointer to a result set that can be passed between procedures/functions
  
          p_cursor SYS_REFCURSOR;
  
          -- Variables to hold each row’s values when fetched from the cursor
          v_id users.id%TYPE;
          v_username users.username%TYPE;
  
        BEGIN
          -- Call the stored procedure that fills the cursor with data
          get_user_by_username(:username, p_cursor);
  
          -- Advanced loop: Fetch each row from the cursor one at a time
          LOOP
            -- FETCH reads the next row from the cursor into local variables
            FETCH p_cursor INTO v_id, v_username;
  
            -- Exit the loop if there are no more rows to fetch
            EXIT WHEN p_cursor%NOTFOUND;
  
            -- Optional: Output or process data here
            -- Example: DBMS_OUTPUT.PUT_LINE('Fetched User: ID=' || v_id || ', Username=' || v_username);
          END LOOP;
  
          -- Close the original cursor to release resources
          CLOSE p_cursor;
  
          -- Reopen cursor to return full result set to Node.js
          OPEN p_cursor FOR
            SELECT * FROM users WHERE username = :username;
  
          -- Return the result set to the Node.js layer
          DBMS_SQL.RETURN_RESULT(p_cursor);
  
        EXCEPTION
          WHEN OTHERS THEN
            -- Handle any unexpected errors
            DBMS_OUTPUT.PUT_LINE('Error in PL/SQL block: ' || SQLERRM);
            -- Optionally re-raise if we want the calling system to know
            RAISE;
        END;
        `,
        { username },
        { outFormat: oracleDb.OUT_FORMAT_OBJECT, resultSet: true }
      );
      
      
      
      if (!result.resultSet || result.resultSet.length === 0) {
        return undefined;
      }
      
      return this.mapUserFromOracle(result.resultSet[0]);
    } catch (err) {
      console.error('Error getting user by username:', err);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await oracleDb.execute(
        `
        DECLARE
          -- Declare a user-defined strongly-typed REF CURSOR
          p_cursor user_pkg.user_cursor;
  
          -- Variables to hold each field from the 'users' table row
          v_user users%ROWTYPE;
  
        BEGIN
          -- Call stored procedure that returns a REF CURSOR
          get_user_by_email(:email, p_cursor);
  
          -- Advanced loop: Fetch rows from the cursor one by one
          LOOP
            FETCH p_cursor INTO v_user;
            EXIT WHEN p_cursor%NOTFOUND;
  
            -- Optional: You can process data here before returning (e.g., filter, transform)
            -- Example: DBMS_OUTPUT.PUT_LINE('Email: ' || v_user.email);
          END LOOP;
  
          -- Close the original cursor (good practice after processing)
          CLOSE p_cursor;
  
          -- Re-open a new SYS_REFCURSOR to send data back to Node.js
          OPEN p_cursor FOR
            SELECT * FROM users WHERE email = :email;
  
          -- Return the new cursor to the Node.js layer
          DBMS_SQL.RETURN_RESULT(p_cursor);

               EXCEPTION
          WHEN OTHERS THEN
            -- Handle any unexpected errors
            DBMS_OUTPUT.PUT_LINE('Error in PL/SQL block: ' || SQLERRM);
            -- Optionally re-raise if we want the calling system to know
            RAISE;
        END;
  
        END;
        `,
        { email },
        { outFormat: oracleDb.OUT_FORMAT_OBJECT, resultSet: true }
      );
  
      const resultSet = result.resultSet;
      if (!resultSet) return undefined;
  
      const row = await resultSet.getRow(); // Expecting only one user
      await resultSet.close();
  
      return row ? this.mapUserFromOracle(row) : undefined;
  
    } catch (err) {
      console.error('Error getting user by email:', err);
      return undefined;
    }
  }
  
  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    try {
      const result = await oracleDb.execute(
        `
        SELECT * FROM users WHERE verification_token = :token
        `,
        { token }
      );
      
      if (!result.rows || result.rows.length === 0) {
        return undefined;
      }
      
      return this.mapUserFromOracle(result.rows[0]);
    } catch (err) {
      console.error('Error getting user by verification token:', err);
      return undefined;
    }
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    try {
      const result = await oracleDb.execute(
        `
        SELECT * FROM users 
        WHERE reset_token = :token 
        AND reset_token_expires > CURRENT_TIMESTAMP
        `,
        { token }
      );
      
      if (!result.rows || result.rows.length === 0) {
        return undefined;
      }
      
      return this.mapUserFromOracle(result.rows[0]);
    } catch (err) {
      console.error('Error getting user by reset token:', err);
      return undefined;
    }
  }

  async verifyUser(id: number): Promise<User | undefined> {
    try {
      const result = await oracleDb.execute(
        `
        BEGIN
          verify_user(:id);
        END;
        `,
        { id }
      );
      
      // Get the updated user
      return await this.getUser(id);
    } catch (err) {
      console.error('Error verifying user:', err);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await oracleDb.execute(
        `
        DECLARE
          p_user_id NUMBER;
        BEGIN
          create_user(
            p_username => :username,
            p_email => :email,
            p_password_hash => :passwordHash,
            p_first_name => :firstName,
            p_last_name => :lastName,
            p_phone_number => :lastName,
            p_role => :role,
            p_user_id => p_user_id
          );
          :user_id := p_user_id;
        END;
        `,
        {
          username: insertUser.username,
          email: insertUser.email,
          passwordHash: insertUser.password,
          firstName: insertUser.firstName,
          lastName: insertUser.lastName,
          phoneNumber: insertUser.phoneNumber,
          role: insertUser.role || 'customer',
          user_id: { dir: oracleDb.BIND_OUT, type: oracleDb.NUMBER }
        }
      );
      
      const userId = result.outBinds.user_id;
      return await this.getUser(userId) as User;
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }

  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    try {
      await oracleDb.execute(
        `
        BEGIN
          update_user(
            p_id => :id,
            p_email => :email,
            p_first_name => :firstName,
            p_last_name => :lastName,
            p_is_verified => :isVerified,
            p_verification_token => :verificationToken,
            p_reset_token => :resetToken,
            p_reset_token_expires => :resetTokenExpires
          );
        END;
        `,
        {
          id,
          email: userUpdate.email,
          firstName: userUpdate.firstName,
          lastName: userUpdate.lastName,
          isVerified: userUpdate.isVerified !== undefined ? (userUpdate.isVerified ? 1 : 0) : null,
          verificationToken: userUpdate.verificationToken,
          resetToken: userUpdate.resetToken,
          resetTokenExpires: userUpdate.resetTokenExpires
        }
      );
      
      // Get the updated user
      return await this.getUser(id);
    } catch (err) {
      console.error('Error updating user:', err);
      return undefined;
    }
  }

  /***********************
   * Category Operations
   ***********************/

  async getCategories(): Promise<Category[]> {
    try {
      const result = await oracleDb.execute(
        `
        DECLARE
          p_cursor SYS_REFCURSOR;
        BEGIN
          get_all_categories(p_cursor);
          DBMS_SQL.RETURN_RESULT(p_cursor);
        END;
        `
      );
      
      if (!result.resultSet || result.resultSet.length === 0) {
        return [];
      }
      
      return result.resultSet.map(row => this.mapCategoryFromOracle(row));
    } catch (err) {
      console.error('Error getting categories:', err);
      return [];
    }
  }

  async getCategory(id: number): Promise<Category | undefined> {
    try {
      const result = await oracleDb.execute(
        `
        DECLARE
          p_cursor SYS_REFCURSOR;
        BEGIN
          get_category_by_id(:id, p_cursor);
          DBMS_SQL.RETURN_RESULT(p_cursor);
        END;
        `,
        { id }
      );
      
      if (!result.resultSet || result.resultSet.length === 0) {
        return undefined;
      }
      
      return this.mapCategoryFromOracle(result.resultSet[0]);
    } catch (err) {
      console.error('Error getting category by ID:', err);
      return undefined;
    }
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    try {
      const result = await oracleDb.execute(
        `
        DECLARE
          p_category_id NUMBER;
        BEGIN
          create_category(
            p_name => :name,
            p_description => :description,
            p_image_url => :imageUrl,
            p_category_id => p_category_id
          );
          :category_id := p_category_id;

               EXCEPTION
          WHEN OTHERS THEN
            -- Handle any unexpected errors
            DBMS_OUTPUT.PUT_LINE('Error in PL/SQL block: ' || SQLERRM);
            -- Optionally re-raise if we want the calling system to know
            RAISE;
        END;

        END;
        `,
        {
          name: insertCategory.name,
          description: insertCategory.description,
          imageUrl: insertCategory.imageUrl,
          category_id: { dir: oracleDb.BIND_OUT, type: oracleDb.NUMBER }
        }
      );
      
      const categoryId = result.outBinds.category_id;
      return await this.getCategory(categoryId) as Category;
    } catch (err) {
      console.error('Error creating category:', err);
      throw err;
    }
  }

  async updateCategory(id: number, categoryUpdate: Partial<InsertCategory>): Promise<Category | undefined> {
    try {
      await oracleDb.execute(
        `
        BEGIN
          update_category(
            p_id => :id,
            p_name => :name,
            p_description => :description,
            p_image_url => :imageUrl
          );
               EXCEPTION
          WHEN OTHERS THEN
            -- Handle any unexpected errors
            DBMS_OUTPUT.PUT_LINE('Error in PL/SQL block: ' || SQLERRM);
            -- Optionally re-raise if we want the calling system to know
            RAISE;
        END;
        END;
        `,
        {
          id,
          name: categoryUpdate.name,
          description: categoryUpdate.description,
          imageUrl: categoryUpdate.imageUrl
        }
      );
      
      // Get the updated category
      return await this.getCategory(id);
    } catch (err) {
      console.error('Error updating category:', err);
      return undefined;
    }
  }

  async deleteCategory(id: number): Promise<boolean> {
    try {
      await oracleDb.execute(
        `
        BEGIN
          delete_category(:id);
        END;
        `,
        { id }
      );
      
      return true;
    } catch (err) {
      console.error('Error deleting category:', err);
      return false;
    }
  }

  /***********************
   * Product Operations
   ***********************/

  async getProducts(): Promise<Product[]> {
    try {
      const result = await oracleDb.execute(
        `
        DECLARE
          p_cursor SYS_REFCURSOR;
        BEGIN
          get_all_products(p_cursor);
          DBMS_SQL.RETURN_RESULT(p_cursor);
        END;
        `
      );
      
      if (!result.resultSet || result.resultSet.length === 0) {
        return [];
      }
      
      return result.resultSet.map(row => this.mapProductFromOracle(row));
    } catch (err) {
      console.error('Error getting products:', err);
      return [];
    }
  }

  async getProduct(id: number): Promise<Product | undefined> {
    try {
      const result = await oracleDb.execute(
        `
        DECLARE
          p_cursor SYS_REFCURSOR;
        BEGIN
          get_product_by_id(:id, p_cursor);
          DBMS_SQL.RETURN_RESULT(p_cursor);
        END;
        `,
        { id }
      );
      
      if (!result.resultSet || result.resultSet.length === 0) {
        return undefined;
      }
      
      return this.mapProductFromOracle(result.resultSet[0]);
    } catch (err) {
      console.error('Error getting product by ID:', err);
      return undefined;
    }
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    try {
      const result = await oracleDb.execute(
        `
        DECLARE
          p_cursor SYS_REFCURSOR;
        BEGIN
          get_products_by_category(:categoryId, p_cursor);
          DBMS_SQL.RETURN_RESULT(p_cursor);
        END;
        `,
        { categoryId }
      );
      
      if (!result.resultSet || result.resultSet.length === 0) {
        return [];
      }
      
      return result.resultSet.map(row => this.mapProductFromOracle(row));
    } catch (err) {
      console.error('Error getting products by category:', err);
      return [];
    }
  }

  async getProductsByVendor(vendorId: number): Promise<Product[]> {
    try {
      const result = await oracleDb.execute(
        `
        DECLARE
          p_cursor SYS_REFCURSOR;
        BEGIN
          get_products_by_vendor(:vendorId, p_cursor);
          DBMS_SQL.RETURN_RESULT(p_cursor);
        END;
        `,
        { vendorId }
      );
      
      if (!result.resultSet || result.resultSet.length === 0) {
        return [];
      }
      
      return result.resultSet.map(row => this.mapProductFromOracle(row));
    } catch (err) {
      console.error('Error getting products by vendor:', err);
      return [];
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const result = await oracleDb.execute(
        `
        DECLARE
          p_cursor SYS_REFCURSOR;
        BEGIN
          search_products(:query, p_cursor);
          DBMS_SQL.RETURN_RESULT(p_cursor);
        END;
        `,
        { query }
      );
      
      if (!result.resultSet || result.resultSet.length === 0) {
        return [];
      }
      
      return result.resultSet.map(row => this.mapProductFromOracle(row));
    } catch (err) {
      console.error('Error searching products:', err);
      return [];
    }
  }
  

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    try {
      const result = await oracleDb.execute(
        `
        DECLARE
          p_product_id NUMBER;
        BEGIN
          create_product(
            p_name => :name,
            p_description => :description,
            p_price => :price,
            p_inventory => :inventory,
            p_image_url => :imageUrl,
            p_category_id => :categoryId,
            p_vendor_id => :vendorId,
            p_is_organic => :isOrganic,
            p_is_local => :isLocal,
            p_is_fresh_picked => :isFreshPicked,
            p_weight_kg => :weightKg,
            p_dimensions => :dimensions,
            p_nutritional_info => :nutritionalInfo,
            p_product_id => p_product_id
          );
          :product_id := p_product_id;
        END;
        `,
        {
          name: insertProduct.name,
          description: insertProduct.description,
          price: insertProduct.price,
          inventory: insertProduct.inventory,
          imageUrl: insertProduct.imageUrl,
          categoryId: insertProduct.categoryId,
          vendorId: insertProduct.vendorId,
          isOrganic: insertProduct.isOrganic ? 1 : 0,
          isLocal: insertProduct.isLocal ? 1 : 0,
          isFreshPicked: insertProduct.isFreshPicked ? 1 : 0,
          weightKg: insertProduct.weightKg,
          dimensions: insertProduct.dimensions,
          nutritionalInfo: insertProduct.nutritionalInfo,
          product_id: { dir: oracleDb.BIND_OUT, type: oracleDb.NUMBER }
        }
      );
      
      const productId = result.outBinds.product_id;
      return await this.getProduct(productId) as Product;
    } catch (err) {
      console.error('Error creating product:', err);
      throw err;
    }
  }

  async updateProduct(id: number, productUpdate: Partial<InsertProduct>): Promise<Product | undefined> {
    try {
      await oracleDb.execute(
        `
        BEGIN
          update_product(
            p_id => :id,
            p_name => :name,
            p_description => :description,
            p_price => :price,
            p_inventory => :inventory,
            p_image_url => :imageUrl,
            p_category_id => :categoryId,
            p_is_organic => :isOrganic,
            p_is_local => :isLocal,
            p_is_fresh_picked => :isFreshPicked,
            p_weight_kg => :weightKg,
            p_dimensions => :dimensions,
            p_nutritional_info => :nutritionalInfo
          );
        END;
        `,
        {
          id,
          name: productUpdate.name,
          description: productUpdate.description,
          price: productUpdate.price,
          inventory: productUpdate.inventory,
          imageUrl: productUpdate.imageUrl,
          categoryId: productUpdate.categoryId,
          isOrganic: productUpdate.isOrganic !== undefined ? (productUpdate.isOrganic ? 1 : 0) : null,
          isLocal: productUpdate.isLocal !== undefined ? (productUpdate.isLocal ? 1 : 0) : null,
          isFreshPicked: productUpdate.isFreshPicked !== undefined ? (productUpdate.isFreshPicked ? 1 : 0) : null,
          weightKg: productUpdate.weightKg,
          dimensions: productUpdate.dimensions,
          nutritionalInfo: productUpdate.nutritionalInfo
        }
      );
      
      // Get the updated product
      return await this.getProduct(id);
    } catch (err) {
      console.error('Error updating product:', err);
      return undefined;
    }
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      await oracleDb.execute(
        `
        BEGIN
          delete_product(:id);
        END;
        `,
        { id }
      );
      
      return true;
    } catch (err) {
      console.error('Error deleting product:', err);
      return false;
    }
  }
  

  /***********************
   * Vendor Operations
   ***********************/

  async getVendors(): Promise<Vendor[]> {
    try {
      const result = await oracleDb.execute(
        `
        DECLARE
          p_cursor SYS_REFCURSOR;
        BEGIN
          get_all_vendors(p_cursor);
          DBMS_SQL.RETURN_RESULT(p_cursor);
        END;
        `
      );
      
      if (!result.resultSet || result.resultSet.length === 0) {
        return [];
      }
      
      return result.resultSet.map(row => this.mapVendorFromOracle(row));
    } catch (err) {
      console.error('Error getting vendors:', err);
      return [];
    }
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    try {
      const result = await oracleDb.execute(
        `
        DECLARE
          p_cursor SYS_REFCURSOR;
        BEGIN
          get_vendor_by_id(:id, p_cursor);
          DBMS_SQL.RETURN_RESULT(p_cursor);
        END;
        `,
        { id }
      );
      
      if (!result.resultSet || result.resultSet.length === 0) {
        return undefined;
      }
      
      return this.mapVendorFromOracle(result.resultSet[0]);
    } catch (err) {
      console.error('Error getting vendor by ID:', err);
      return undefined;
    }
  }

  async getVendorByUserId(userId: number): Promise<Vendor | undefined> {
    try {
      const result = await oracleDb.execute(
        `
        DECLARE
          p_cursor SYS_REFCURSOR;
        BEGIN
          get_vendor_by_user_id(:userId, p_cursor);
          DBMS_SQL.RETURN_RESULT(p_cursor);
        END;
        `,
        { userId }
      );
      
      if (!result.resultSet || result.resultSet.length === 0) {
        return undefined;
      }
      
      return this.mapVendorFromOracle(result.resultSet[0]);
    } catch (err) {
      console.error('Error getting vendor by user ID:', err);
      return undefined;
    }
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    try {
      const result = await oracleDb.execute(
        `
        DECLARE
          p_vendor_id NUMBER;
        BEGIN
          create_vendor(
            p_user_id => :userId,
            p_business_name => :businessName,
            p_description => :description,
            p_logo_url => :logoUrl,
            p_address => :address,
            p_city => :city,
            p_state => :state,
            p_postal_code => :postalCode,
            p_country => :country,
            p_phone => :phone,
            p_website => :website,
            p_business_email => :businessEmail,
            p_vendor_id => p_vendor_id
          );
          :vendor_id := p_vendor_id;
        END;
        `,
        {
          userId: insertVendor.userId,
          businessName: insertVendor.businessName,
          description: insertVendor.description,
          logoUrl: insertVendor.logoUrl,
          address: insertVendor.address,
          city: insertVendor.city,
          state: insertVendor.state,
          postalCode: insertVendor.postalCode,
          country: insertVendor.country || 'Sri Lanka',
          phone: insertVendor.phone,
          website: insertVendor.website,
          businessEmail: insertVendor.businessEmail,
          vendor_id: { dir: oracleDb.BIND_OUT, type: oracleDb.NUMBER }
        }
      );
      
      const vendorId = result.outBinds.vendor_id;
      return await this.getVendor(vendorId) as Vendor;
    } catch (err) {
      console.error('Error creating vendor:', err);
      throw err;
    }
  }
  

  async updateVendor(id: number, vendorUpdate: Partial<InsertVendor>): Promise<Vendor | undefined> {
    try {
      await oracleDb.execute(
        `
        BEGIN
          update_vendor(
            p_id => :id,
            p_business_name => :businessName,
            p_description => :description,
            p_logo_url => :logoUrl,
            p_address => :address,
            p_city => :city,
            p_state => :state,
            p_postal_code => :postalCode,
            p_country => :country,
            p_phone => :phone,
            p_website => :website,
            p_business_email => :businessEmail
          );
        END;
        `,
        {
          id,
          businessName: vendorUpdate.businessName,
          description: vendorUpdate.description,
          logoUrl: vendorUpdate.logoUrl,
          address: vendorUpdate.address,
          city: vendorUpdate.city,
          state: vendorUpdate.state,
          postalCode: vendorUpdate.postalCode,
          country: vendorUpdate.country,
          phone: vendorUpdate.phone,
          website: vendorUpdate.website,
          businessEmail: vendorUpdate.businessEmail
        }
      );
      
      // Get the updated vendor
      return await this.getVendor(id);
    } catch (err) {
      console.error('Error updating vendor:', err);
      return undefined;
    }
  }

  /***********************
   * Order Operations
   ***********************/

  async getOrders(): Promise<Order[]> {
    try {
      const result = await oracleDb.execute(
        `
        DECLARE
          p_cursor SYS_REFCURSOR;
        BEGIN
          get_all_orders(p_cursor);
          DBMS_SQL.RETURN_RESULT(p_cursor);
        END;
        `
      );
      
      if (!result.resultSet || result.resultSet.length === 0) {
        return [];
      }
      
      return result.resultSet.map(row => this.mapOrderFromOracle(row));
    } catch (err) {
      console.error('Error getting orders:', err);
      return [];
    }
  }

  async getOrder(id: number): Promise<Order | undefined> {
    try {
      const result = await oracleDb.execute(
        `
        DECLARE
          p_cursor SYS_REFCURSOR;
        BEGIN
          get_order_by_id(:id, p_cursor);
          DBMS_SQL.RETURN_RESULT(p_cursor);
        END;
        `,
        { id }
      );
      
      if (!result.resultSet || result.resultSet.length === 0) {
        return undefined;
      }
      
      return this.mapOrderFromOracle(result.resultSet[0]);
    } catch (err) {
      console.error('Error getting order by ID:', err);
      return undefined;
    }
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    try {
      const result = await oracleDb.execute(
        `
        DECLARE
          p_cursor SYS_REFCURSOR;
        BEGIN
          get_orders_by_user(:userId, p_cursor);
          DBMS_SQL.RETURN_RESULT(p_cursor);
        END;
        `,
        { userId }
      );
      
      if (!result.resultSet || result.resultSet.length === 0) {
        return [];
      }
      
      return result.resultSet.map(row => this.mapOrderFromOracle(row));
    } catch (err) {
      console.error('Error getting orders by user:', err);
      return [];
    }
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    try {
      const result = await oracleDb.execute(
        `
        DECLARE
          p_order_id NUMBER;
        BEGIN
          create_order(
            p_user_id => :userId,
            p_status => :status,
            p_total => :total,
            p_shipping_address => :shippingAddress,
            p_shipping_city => :shippingCity,
            p_shipping_state => :shippingState,
            p_shipping_postal_code => :shippingPostalCode,
            p_shipping_country => :shippingCountry,
            p_shipping_method => :shippingMethod,
            p_shipping_fee => :shippingFee,
            p_payment_method => :paymentMethod,
            p_payment_status => :paymentStatus,
            p_order_id => p_order_id
          );
          :order_id := p_order_id;
        END;
        `,
        {
          userId: insertOrder.userId,
          status: insertOrder.status || 'pending',
          total: insertOrder.total,
          shippingAddress: insertOrder.shippingAddress,
          shippingCity: insertOrder.shippingCity,
          shippingState: insertOrder.shippingState,
          shippingPostalCode: insertOrder.shippingPostalCode,
          shippingCountry: insertOrder.shippingCountry || 'Sri Lanka',
          shippingMethod: insertOrder.shippingMethod,
          shippingFee: insertOrder.shippingFee,
          paymentMethod: insertOrder.paymentMethod,
          paymentStatus: insertOrder.paymentStatus || 'pending',
          order_id: { dir: oracleDb.BIND_OUT, type: oracleDb.NUMBER }
        }
      );
      
      const orderId = result.outBinds.order_id;
      return await this.getOrder(orderId) as Order;
    } catch (err) {
      console.error('Error creating order:', err);
      throw err;
    }
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    try {
      await oracleDb.execute(
        `
        BEGIN
          update_order_status(:id, :status);
        END;
        `,
        { id, status }
      );
      
      // Get the updated order
      return await this.getOrder(id);
    } catch (err) {
      console.error('Error updating order status:', err);
      return undefined;
    }
  }

  /***********************
   * Order Items Operations
   ***********************/

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    try {
      const result = await oracleDb.execute(
        `
        DECLARE
          p_cursor SYS_REFCURSOR;
        BEGIN
          get_order_items(:orderId, p_cursor);
          DBMS_SQL.RETURN_RESULT(p_cursor);
        END;
        `,
        { orderId }
      );
      
      if (!result.resultSet || result.resultSet.length === 0) {
        return [];
      }
      
      return result.resultSet.map(row => this.mapOrderItemFromOracle(row));
    } catch (err) {
      console.error('Error getting order items:', err);
      return [];
    }
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    try {
      const result = await oracleDb.execute(
        `
        DECLARE
          p_order_item_id NUMBER;
        BEGIN
          create_order_item(
            p_order_id => :orderId,
            p_product_id => :productId,
            p_quantity => :quantity,
            p_price_at_time => :priceAtTime,
            p_order_item_id => p_order_item_id
          );
          :order_item_id := p_order_item_id;
        END;
        `,
        {
          orderId: insertOrderItem.orderId,
          productId: insertOrderItem.productId,
          quantity: insertOrderItem.quantity,
          priceAtTime: insertOrderItem.priceAtTime,
          order_item_id: { dir: oracleDb.BIND_OUT, type: oracleDb.NUMBER }
        }
      );
      
      // Get order items for this order
      const orderItems = await this.getOrderItems(insertOrderItem.orderId);
      
      // Find the created order item
      const itemId = result.outBinds.order_item_id;
      return orderItems.find(item => item.id === itemId) as OrderItem;
    } catch (err) {
      console.error('Error creating order item:', err);
      throw err;
    }
  }

  /***********************
   * Review Operations
   * Note: Reviews should be moved to MongoDB
   ***********************/

  async getReviews(productId: number): Promise<Review[]> {
    try {
      const result = await oracleDb.execute(
        `
        SELECT r.*, u.username
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.product_id = :productId
        ORDER BY r.created_at DESC
        `,
        { productId }
      );
      
      if (!result.rows || result.rows.length === 0) {
        return [];
      }
      
      return result.rows.map(row => this.mapReviewFromOracle(row));
    } catch (err) {
      console.error('Error getting reviews:', err);
      return [];
    }
  }

  async getReviewsByUser(userId: number): Promise<Review[]> {
    try {
      const result = await oracleDb.execute(
        `
        SELECT r.*, p.name as product_name
        FROM reviews r
        JOIN products p ON r.product_id = p.id
        WHERE r.user_id = :userId
        ORDER BY r.created_at DESC
        `,
        { userId }
      );
      
      if (!result.rows || result.rows.length === 0) {
        return [];
      }
      
      return result.rows.map(row => this.mapReviewFromOracle(row));
    } catch (err) {
      console.error('Error getting reviews by user:', err);
      return [];
    }
  }

  async createReview(review: Review): Promise<Review> {
    try {
      const result = await oracleDb.execute(
        `
        INSERT INTO reviews (
          id, product_id, user_id, rating, title, comment, created_at, updated_at
        ) VALUES (
          :id, :productId, :userId, :rating, :title, :comment, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING id INTO :reviewId
        `,
        {
          id: review._id,
          productId: review.productId,
          userId: review.userId,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          reviewId: { dir: oracleDb.BIND_OUT, type: oracleDb.STRING }
        }
      );
      
      // Get reviews for this product
      const reviews = await this.getReviews(review.productId);
      
      // Find the created review
      const reviewId = result.outBinds.reviewId;
      return reviews.find(r => r._id === reviewId) as Review;
    } catch (err) {
      console.error('Error creating review:', err);
      throw err;
    }
  }

  async updateReview(id: string, reviewUpdate: Partial<Review>): Promise<Review | undefined> {
    try {
      await oracleDb.execute(
        `
        UPDATE reviews
        SET
          rating = NVL(:rating, rating),
          title = NVL(:title, title),
          comment = NVL(:comment, comment),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = :id
        `,
        {
          id,
          rating: reviewUpdate.rating,
          title: reviewUpdate.title,
          comment: reviewUpdate.comment
        }
      );
      
      
      // Get the review from Oracle (by querying the product's reviews)
      const reviewResult = await oracleDb.execute(
        `
        SELECT product_id FROM reviews WHERE id = :id
        `,
        { id }
      );
      
      if (!reviewResult.rows || reviewResult.rows.length === 0) {
        return undefined;
      }
      
      const productId = reviewResult.rows[0].PRODUCT_ID;
      const reviews = await this.getReviews(productId);
      
      // Find the updated review
      return reviews.find(r => r._id === id);
    } catch (err) {
      console.error('Error updating review:', err);
      return undefined;
    }
  }

  async deleteReview(id: string): Promise<boolean> {
    try {
      const result = await oracleDb.execute(
        `
        DELETE FROM reviews WHERE id = :id
        `,
        { id }
      );
      
      return result.rowsAffected === 1;
    } catch (err) {
      console.error('Error deleting review:', err);
      return false;
    }
  }

  

  async getProductDetails(): Promise<ProductDetail[]> {
    try {
      const result = await oracleDb.execute(
        `
        SELECT * FROM PRODUCT_DETAILS
        ORDER BY ID
        `
      );
      
      if (!result.resultSet || result.resultSet.length === 0) {
        return [];
      }
      
      return result.resultSet.map(row => this.mapProductDetailFromOracle(row));
    } catch (err) {
      console.error('Error getting product details:', err);
      return [];
    }
  }
  
  async getProductDetailById(id: number): Promise<ProductDetail | undefined> {
    try {
      const result = await oracleDb.execute(
        `
        SELECT * FROM PRODUCT_DETAILS
        WHERE ID = :id
        `,
        { id }
      );
      
      if (!result.resultSet || result.resultSet.length === 0) {
        return undefined;
      }
      
      return this.mapProductDetailFromOracle(result.resultSet[0]);
    } catch (err) {
      console.error('Error getting product detail by ID:', err);
      return undefined;
    }
  }
  
  async getOrderDetails(): Promise<OrderDetail[]> {
    try {
      const result = await oracleDb.execute(
        `
        SELECT * FROM ORDER_DETAILS
        ORDER BY ID DESC
        `
      );
      
      if (!result.resultSet || result.resultSet.length === 0) {
        return [];
      }
      
      return result.resultSet.map(row => this.mapOrderDetailFromOracle(row));
    } catch (err) {
      console.error('Error getting order details:', err);
      return [];
    }
  }
  
  async getOrderDetailsByUser(userId: number): Promise<OrderDetail[]> {
    try {
      const result = await oracleDb.execute(
        `
        SELECT * FROM ORDER_DETAILS
        WHERE USER_ID = :userId
        ORDER BY ID DESC
        `,
        { userId }
      );
      
      if (!result.resultSet || result.resultSet.length === 0) {
        return [];
      }
      
      return result.resultSet.map(row => this.mapOrderDetailFromOracle(row));
    } catch (err) {
      console.error('Error getting order details by user ID:', err);
      return [];
    }
  }
  
  async getOrderDetailById(id: number): Promise<OrderDetail | undefined> {
    try {
      const result = await oracleDb.execute(
        `
        SELECT * FROM ORDER_DETAILS
        WHERE ID = :id
        `,
        { id }
      );
      
      if (!result.resultSet || result.resultSet.length === 0) {
        return undefined;
      }
      
      return this.mapOrderDetailFromOracle(result.resultSet[0]);
    } catch (err) {
      console.error('Error getting order detail by ID:', err);
      return undefined;
    }
  }
  
  async getVendorDetails(): Promise<VendorDetail[]> {
    try {
      const result = await oracleDb.execute(
        `
        SELECT * FROM VENDOR_DETAILS
        ORDER BY ID
        `
      );
      
      if (!result.resultSet || result.resultSet.length === 0) {
        return [];
      }
      
      return result.resultSet.map(row => this.mapVendorDetailFromOracle(row));
    } catch (err) {
      console.error('Error getting vendor details:', err);
      return [];
    }
  }
  
  async getVendorDetailById(id: number): Promise<VendorDetail | undefined> {
    try {
      const result = await oracleDb.execute(
        `
        SELECT * FROM VENDOR_DETAILS
        WHERE ID = :id
        `,
        { id }
      );
      
      if (!result.resultSet || result.resultSet.length === 0) {
        return undefined;
      }
      
      return this.mapVendorDetailFromOracle(result.resultSet[0]);
    } catch (err) {
      console.error('Error getting vendor detail by ID:', err);
      return undefined;
    }
  }

  /***********************
   * Helper methods to map Oracle rows to TypeScript types
   ***********************/

  private mapUserFromOracle(row: any): User {
    return {
      id: row.ID,
      username: row.USERNAME,
      password: row.PASSWORD_HASH,
      email: row.EMAIL,
      firstName: row.FIRST_NAME,
      lastName: row.LAST_NAME,
      role: row.ROLE,
      isVerified: row.IS_VERIFIED === 1,
      verificationToken: row.VERIFICATION_TOKEN,
      resetToken: row.RESET_TOKEN,
      resetTokenExpires: row.RESET_TOKEN_EXPIRES ? new Date(row.RESET_TOKEN_EXPIRES) : null,
      createdAt: new Date(row.CREATED_AT),
      updatedAt: new Date(row.UPDATED_AT)
    };
  }

  private mapCategoryFromOracle(row: any): Category {
    return {
      id: row.ID,
      name: row.NAME,
      description: row.DESCRIPTION,
      imageUrl: row.IMAGE_URL,
      createdAt: new Date(row.CREATED_AT),
      updatedAt: new Date(row.UPDATED_AT)
    };
  }

  private mapProductFromOracle(row: any): Product {
    return {
      id: row.ID,
      name: row.NAME,
      description: row.DESCRIPTION,
      price: row.PRICE,
      inventory: row.INVENTORY,
      imageUrl: row.IMAGE_URL,
      vendorId: row.VENDOR_ID,
      categoryId: row.CATEGORY_ID,
      isOrganic: row.IS_ORGANIC === 1,
      isLocal: row.IS_LOCAL === 1,
      isFreshPicked: row.IS_FRESH_PICKED === 1,
      weightKg: row.WEIGHT_KG,
      dimensions: row.DIMENSIONS,
      nutritionalInfo: row.NUTRITIONAL_INFO,
      createdAt: new Date(row.CREATED_AT),
      updatedAt: new Date(row.UPDATED_AT)
    };
  }

  private mapVendorFromOracle(row: any): Vendor {
    return {
      id: row.ID,
      userId: row.USER_ID,
      businessName: row.BUSINESS_NAME,
      description: row.DESCRIPTION,
      logoUrl: row.LOGO_URL,
      address: row.ADDRESS,
      city: row.CITY,
      state: row.STATE,
      postalCode: row.POSTAL_CODE,
      country: row.COUNTRY,
      phone: row.PHONE,
      website: row.WEBSITE,
      businessEmail: row.BUSINESS_EMAIL,
      createdAt: new Date(row.CREATED_AT),
      updatedAt: new Date(row.UPDATED_AT)
    };
  }

  private mapOrderFromOracle(row: any): Order {
    return {
      id: row.ID,
      userId: row.USER_ID,
      status: row.STATUS,
      total: row.TOTAL,
      shippingAddress: row.SHIPPING_ADDRESS,
      shippingCity: row.SHIPPING_CITY,
      shippingState: row.SHIPPING_STATE,
      shippingPostalCode: row.SHIPPING_POSTAL_CODE,
      shippingCountry: row.SHIPPING_COUNTRY,
      shippingMethod: row.SHIPPING_METHOD,
      shippingFee: row.SHIPPING_FEE,
      paymentMethod: row.PAYMENT_METHOD,
      paymentStatus: row.PAYMENT_STATUS,
      createdAt: new Date(row.CREATED_AT),
      updatedAt: new Date(row.UPDATED_AT)
    };
  }

  private mapOrderItemFromOracle(row: any): OrderItem {
    return {
      id: row.ID,
      orderId: row.ORDER_ID,
      productId: row.PRODUCT_ID,
      quantity: row.QUANTITY,
      priceAtTime: row.PRICE_AT_TIME,
      createdAt: new Date(row.CREATED_AT),
      productName: row.PRODUCT_NAME, // Additional field from join
      imageUrl: row.IMAGE_URL // Additional field from join
    };
  }

  private mapReviewFromOracle(row: any): Review {
    return {
      _id: row.ID,
      productId: row.PRODUCT_ID,
      userId: row.USER_ID,
      rating: row.RATING,
      title: row.TITLE,
      comment: row.COMMENT,
      createdAt: new Date(row.CREATED_AT),
      updatedAt: new Date(row.UPDATED_AT),
      username: row.USERNAME // Additional field from join
    };
  }

  /**
 * Map Oracle result to ProductDetail
 */
private mapProductDetailFromOracle(row: any): ProductDetail {
  return {
    ID: row.ID,
    NAME: row.NAME,
    DESCRIPTION: row.DESCRIPTION,
    PRICE: row.PRICE,
    INVENTORY: row.INVENTORY,
    IMAGE_URL: row.IMAGE_URL,
    IS_ORGANIC: row.IS_ORGANIC === 1,
    IS_LOCAL: row.IS_LOCAL === 1,
    IS_FRESH_PICKED: row.IS_FRESH_PICKED === 1,
    WEIGHT_KG: row.WEIGHT_KG,
    DIMENSIONS: row.DIMENSIONS,
    NUTRITIONAL_INFO: row.NUTRITIONAL_INFO,
    CREATED_AT: new Date(row.CREATED_AT),
    UPDATED_AT: new Date(row.UPDATED_AT),
    CATEGORY_ID: row.CATEGORY_ID,
    CATEGORY_NAME: row.CATEGORY_NAME,
    VENDOR_ID: row.VENDOR_ID,
    VENDOR_NAME: row.VENDOR_NAME,
    VENDOR_LOGO: row.VENDOR_LOGO
  };
}

/**
 * Map Oracle result to OrderDetail
 */
private mapOrderDetailFromOracle(row: any): OrderDetail {
  return {
    ID: row.ID,
    USER_ID: row.USER_ID,
    STATUS: row.STATUS,
    TOTAL: row.TOTAL,
    SHIPPING_ADDRESS: row.SHIPPING_ADDRESS,
    SHIPPING_CITY: row.SHIPPING_CITY,
    SHIPPING_STATE: row.SHIPPING_STATE,
    SHIPPING_POSTAL_CODE: row.SHIPPING_POSTAL_CODE,
    SHIPPING_COUNTRY: row.SHIPPING_COUNTRY,
    SHIPPING_METHOD: row.SHIPPING_METHOD,
    SHIPPING_FEE: row.SHIPPING_FEE,
    PAYMENT_METHOD: row.PAYMENT_METHOD,
    PAYMENT_STATUS: row.PAYMENT_STATUS,
    CREATED_AT: new Date(row.CREATED_AT),
    UPDATED_AT: new Date(row.UPDATED_AT),
    USERNAME: row.USERNAME,
    EMAIL: row.EMAIL,
    FIRST_NAME: row.FIRST_NAME,
    LAST_NAME: row.LAST_NAME
  };
}

/**
 * Map Oracle result to VendorDetail
 */
private mapVendorDetailFromOracle(row: any): VendorDetail {
  return {
    ID: row.ID,
    BUSINESS_NAME: row.BUSINESS_NAME,
    DESCRIPTION: row.DESCRIPTION,
    LOGO_URL: row.LOGO_URL,
    ADDRESS: row.ADDRESS,
    CITY: row.CITY,
    STATE: row.STATE,
    POSTAL_CODE: row.POSTAL_CODE,
    COUNTRY: row.COUNTRY,
    PHONE: row.PHONE,
    WEBSITE: row.WEBSITE,
    BUSINESS_EMAIL: row.BUSINESS_EMAIL,
    CREATED_AT: new Date(row.CREATED_AT),
    UPDATED_AT: new Date(row.UPDATED_AT),
    USER_ID: row.USER_ID,
    USERNAME: row.USERNAME,
    EMAIL: row.EMAIL,
    FIRST_NAME: row.FIRST_NAME,
    LAST_NAME: row.LAST_NAME
  };
}
}

// Export the Oracle Storage implementation
export const oracleStorage = new OracleStorage();
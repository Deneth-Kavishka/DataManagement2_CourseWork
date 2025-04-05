const { sql } = require('./db');

class PgStorage {
  // User operations
  async getUser(id) {
    try {
      const result = await sql.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async getUserByUsername(username) {
    try {
      const result = await sql.query('SELECT * FROM users WHERE username = $1', [username]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const result = await sql.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async createUser(user) {
    try {
      const result = await sql.query(
        'INSERT INTO users (username, email, password, firstName, lastName, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [user.username, user.email, user.password, user.firstName, user.lastName, user.role || 'customer']
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id, user) {
    try {
      // Build the SET part of the query dynamically based on the user object
      const fields = [];
      const values = [];
      let valueIndex = 1;

      for (const [key, value] of Object.entries(user)) {
        if (value !== undefined && key !== 'id') {
          fields.push(`${key} = $${valueIndex}`);
          values.push(value);
          valueIndex++;
        }
      }

      if (fields.length === 0) {
        return await this.getUser(id);
      }

      values.push(id);
      const result = await sql.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $${valueIndex} RETURNING *`,
        values
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Category operations
  async getCategories() {
    try {
      const result = await sql.query('SELECT * FROM categories ORDER BY name');
      return result.rows;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  async getCategory(id) {
    try {
      const result = await sql.query('SELECT * FROM categories WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting category:', error);
      throw error;
    }
  }

  async createCategory(category) {
    try {
      const result = await sql.query(
        'INSERT INTO categories (name, description, image) VALUES ($1, $2, $3) RETURNING *',
        [category.name, category.description, category.image]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(id, category) {
    try {
      const fields = [];
      const values = [];
      let valueIndex = 1;

      for (const [key, value] of Object.entries(category)) {
        if (value !== undefined && key !== 'id') {
          fields.push(`${key} = $${valueIndex}`);
          values.push(value);
          valueIndex++;
        }
      }

      if (fields.length === 0) {
        return await this.getCategory(id);
      }

      values.push(id);
      const result = await sql.query(
        `UPDATE categories SET ${fields.join(', ')} WHERE id = $${valueIndex} RETURNING *`,
        values
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(id) {
    try {
      // Check if category has products
      const productsResult = await sql.query('SELECT COUNT(*) FROM products WHERE categoryId = $1', [id]);
      if (parseInt(productsResult.rows[0].count) > 0) {
        return false; // Cannot delete category with products
      }
      
      const result = await sql.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // Product operations
  async getProducts() {
    try {
      const result = await sql.query(`
        SELECT p.*, c.name as categoryName, v.businessName as vendorName
        FROM products p
        LEFT JOIN categories c ON p.categoryId = c.id
        LEFT JOIN vendors v ON p.vendorId = v.id
        ORDER BY p.createdAt DESC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  }

  async getProduct(id) {
    try {
      const result = await sql.query(`
        SELECT p.*, c.name as categoryName, v.businessName as vendorName
        FROM products p
        LEFT JOIN categories c ON p.categoryId = c.id
        LEFT JOIN vendors v ON p.vendorId = v.id
        WHERE p.id = $1
      `, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  }

  async getProductsByCategory(categoryId) {
    try {
      const result = await sql.query(`
        SELECT p.*, c.name as categoryName, v.businessName as vendorName
        FROM products p
        LEFT JOIN categories c ON p.categoryId = c.id
        LEFT JOIN vendors v ON p.vendorId = v.id
        WHERE p.categoryId = $1
        ORDER BY p.createdAt DESC
      `, [categoryId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting products by category:', error);
      throw error;
    }
  }

  async getProductsByVendor(vendorId) {
    try {
      const result = await sql.query(`
        SELECT p.*, c.name as categoryName, v.businessName as vendorName
        FROM products p
        LEFT JOIN categories c ON p.categoryId = c.id
        LEFT JOIN vendors v ON p.vendorId = v.id
        WHERE p.vendorId = $1
        ORDER BY p.createdAt DESC
      `, [vendorId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting products by vendor:', error);
      throw error;
    }
  }

  async searchProducts(query) {
    try {
      const searchTerm = `%${query}%`;
      const result = await sql.query(`
        SELECT p.*, c.name as categoryName, v.businessName as vendorName
        FROM products p
        LEFT JOIN categories c ON p.categoryId = c.id
        LEFT JOIN vendors v ON p.vendorId = v.id
        WHERE 
          p.name ILIKE $1 OR
          p.description ILIKE $1 OR
          c.name ILIKE $1 OR
          v.businessName ILIKE $1
        ORDER BY p.createdAt DESC
      `, [searchTerm]);
      return result.rows;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  async createProduct(product) {
    try {
      const result = await sql.query(
        `INSERT INTO products 
          (name, description, price, discountPrice, categoryId, vendorId, inventory, images, unit, isOrganic, isFeatured)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
         RETURNING *`,
        [
          product.name,
          product.description,
          product.price,
          product.discountPrice || null,
          product.categoryId,
          product.vendorId,
          product.inventory || 0,
          product.images || [],
          product.unit || 'item',
          product.isOrganic || false,
          product.isFeatured || false
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id, product) {
    try {
      const fields = [];
      const values = [];
      let valueIndex = 1;

      for (const [key, value] of Object.entries(product)) {
        if (value !== undefined && key !== 'id') {
          fields.push(`${key} = $${valueIndex}`);
          values.push(value);
          valueIndex++;
        }
      }

      if (fields.length === 0) {
        return await this.getProduct(id);
      }

      values.push(id);
      const result = await sql.query(
        `UPDATE products SET ${fields.join(', ')} WHERE id = $${valueIndex} RETURNING *`,
        values
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      // Check if product is in any orders
      const orderItemsResult = await sql.query('SELECT COUNT(*) FROM order_items WHERE productId = $1', [id]);
      if (parseInt(orderItemsResult.rows[0].count) > 0) {
        return false; // Cannot delete product in orders
      }
      
      const result = await sql.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Vendor operations
  async getVendors() {
    try {
      const result = await sql.query(`
        SELECT v.*, u.firstName, u.lastName, u.email as userEmail
        FROM vendors v
        JOIN users u ON v.userId = u.id
        ORDER BY v.businessName
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting vendors:', error);
      throw error;
    }
  }

  async getVendor(id) {
    try {
      const result = await sql.query(`
        SELECT v.*, u.firstName, u.lastName, u.email as userEmail
        FROM vendors v
        JOIN users u ON v.userId = u.id
        WHERE v.id = $1
      `, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting vendor:', error);
      throw error;
    }
  }

  async getVendorByUserId(userId) {
    try {
      const result = await sql.query(`
        SELECT v.*, u.firstName, u.lastName, u.email as userEmail
        FROM vendors v
        JOIN users u ON v.userId = u.id
        WHERE v.userId = $1
      `, [userId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting vendor by user ID:', error);
      throw error;
    }
  }

  async createVendor(vendor) {
    try {
      const result = await sql.query(
        `INSERT INTO vendors 
          (userId, businessName, description, logo, bannerImage, address, phone, email, website)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING *`,
        [
          vendor.userId,
          vendor.businessName,
          vendor.description,
          vendor.logo || null,
          vendor.bannerImage || null,
          vendor.address || null,
          vendor.phone || null,
          vendor.email || null,
          vendor.website || null
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating vendor:', error);
      throw error;
    }
  }

  async updateVendor(id, vendor) {
    try {
      const fields = [];
      const values = [];
      let valueIndex = 1;

      for (const [key, value] of Object.entries(vendor)) {
        if (value !== undefined && key !== 'id') {
          fields.push(`${key} = $${valueIndex}`);
          values.push(value);
          valueIndex++;
        }
      }

      if (fields.length === 0) {
        return await this.getVendor(id);
      }

      values.push(id);
      const result = await sql.query(
        `UPDATE vendors SET ${fields.join(', ')} WHERE id = $${valueIndex} RETURNING *`,
        values
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  }

  // Order operations
  async getOrders() {
    try {
      const result = await sql.query(`
        SELECT o.*, u.username
        FROM orders o
        LEFT JOIN users u ON o.userId = u.id
        ORDER BY o.createdAt DESC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  }

  async getOrder(id) {
    try {
      const result = await sql.query(`
        SELECT o.*, u.username
        FROM orders o
        LEFT JOIN users u ON o.userId = u.id
        WHERE o.id = $1
      `, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  }

  async getOrdersByUser(userId) {
    try {
      const result = await sql.query(`
        SELECT o.*
        FROM orders o
        WHERE o.userId = $1
        ORDER BY o.createdAt DESC
      `, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting orders by user:', error);
      throw error;
    }
  }

  async createOrder(order) {
    try {
      const result = await sql.query(
        `INSERT INTO orders 
          (userId, status, total, shippingAddress, paymentMethod, paymentStatus)
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [
          order.userId,
          order.status || 'pending',
          order.total,
          order.shippingAddress || null,
          order.paymentMethod || null,
          order.paymentStatus || 'pending'
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async updateOrderStatus(id, status) {
    try {
      const result = await sql.query(
        'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Order Items operations
  async getOrderItems(orderId) {
    try {
      const result = await sql.query(`
        SELECT oi.*, p.name as productName, p.unit
        FROM order_items oi
        JOIN products p ON oi.productId = p.id
        WHERE oi.orderId = $1
      `, [orderId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting order items:', error);
      throw error;
    }
  }

  async createOrderItem(orderItem) {
    try {
      const result = await sql.query(
        `INSERT INTO order_items 
          (orderId, productId, quantity, price)
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [
          orderItem.orderId,
          orderItem.productId,
          orderItem.quantity,
          orderItem.price
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating order item:', error);
      throw error;
    }
  }

  // Report operations
  async getPopularProducts(limit = 5) {
    try {
      const result = await sql.query(`
        SELECT p.*, c.name as categoryName, v.businessName as vendorName,
               SUM(oi.quantity) as totalSold
        FROM products p
        JOIN order_items oi ON p.id = oi.productId
        LEFT JOIN categories c ON p.categoryId = c.id
        LEFT JOIN vendors v ON p.vendorId = v.id
        GROUP BY p.id, c.name, v.businessName
        ORDER BY totalSold DESC
        LIMIT $1
      `, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting popular products:', error);
      throw error;
    }
  }

  async getCategorySales() {
    try {
      const result = await sql.query(`
        SELECT c.id, c.name, 
               SUM(oi.quantity * oi.price) as totalSales,
               SUM(oi.quantity) as itemsSold
        FROM categories c
        JOIN products p ON c.id = p.categoryId
        JOIN order_items oi ON p.id = oi.productId
        GROUP BY c.id, c.name
        ORDER BY totalSales DESC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting category sales:', error);
      throw error;
    }
  }

  // Review operations - For now, keep this in memory until we set up MongoDB
  // We'll implement a placeholder that returns empty arrays for now
  async getReviews(productId) {
    console.log('Getting reviews for product ID:', productId);
    return [];
  }

  async getReviewsByUser(userId) {
    console.log('Getting reviews for user ID:', userId);
    return [];
  }

  async createReview(review) {
    console.log('Creating review:', review);
    return { ...review, _id: 'temporary-id' };
  }

  async updateReview(id, review) {
    console.log('Updating review:', id, review);
    return { ...review, _id: id };
  }

  async deleteReview(id) {
    console.log('Deleting review:', id);
    return true;
  }
}

module.exports = { PgStorage };

-- Migration timestamp: 1743616563252

-- Create Tables
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;

-- Add Foreign Keys
ALTER TABLE products ADD CONSTRAINT fk_vendor_id FOREIGN KEY (vendor_id) REFERENCES vendors (id) ON DELETE CASCADE;
ALTER TABLE products ADD CONSTRAINT fk_category_id FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE;
ALTER TABLE vendors ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;
ALTER TABLE orders ADD CONSTRAINT fk_order_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;
ALTER TABLE order_items ADD CONSTRAINT fk_order_id FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE;
ALTER TABLE order_items ADD CONSTRAINT fk_product_id FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE;

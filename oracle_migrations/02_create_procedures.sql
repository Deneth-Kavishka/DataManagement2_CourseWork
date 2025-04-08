-- Oracle Migration: Create Stored Procedures for UrbanFood E-commerce Platform

-- Drop existing procedures if they exist
BEGIN
  FOR p IN (SELECT object_name FROM user_objects WHERE object_type = 'PROCEDURE' AND object_name IN (
    'CREATE_USER', 
    'UPDATE_USER',
    'VERIFY_USER',
    'CREATE_CATEGORY',
    'UPDATE_CATEGORY',
    'DELETE_CATEGORY',
    'CREATE_PRODUCT',
    'UPDATE_PRODUCT',
    'DELETE_PRODUCT',
    'CREATE_VENDOR',
    'UPDATE_VENDOR',
    'CREATE_ORDER',
    'UPDATE_ORDER_STATUS',
    'CREATE_ORDER_ITEM',
    'CREATE_REVIEW',
    'UPDATE_REVIEW',
    'DELETE_REVIEW'
  )) LOOP
    EXECUTE IMMEDIATE 'DROP PROCEDURE ' || p.object_name;
  END LOOP;
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignore errors if procedures don't exist
END;


-- User Operations

-- Create User Procedure
CREATE OR REPLACE PROCEDURE CREATE_USER(
  p_username IN VARCHAR2,
  p_password IN VARCHAR2,
  p_email IN VARCHAR2,
  p_first_name IN VARCHAR2,
  p_last_name IN VARCHAR2,
  p_role IN VARCHAR2 DEFAULT 'customer',
  p_is_verified IN NUMBER DEFAULT 0,
  p_verification_token IN VARCHAR2 DEFAULT NULL,
  p_reset_token IN VARCHAR2 DEFAULT NULL,
  p_reset_token_expires IN TIMESTAMP DEFAULT NULL,
  p_user_id OUT NUMBER
) AS
BEGIN
  INSERT INTO USERS (
    USERNAME, PASSWORD, EMAIL, FIRST_NAME, LAST_NAME, 
    ROLE, IS_VERIFIED, VERIFICATION_TOKEN, RESET_TOKEN, RESET_TOKEN_EXPIRES
  ) VALUES (
    p_username, p_password, p_email, p_first_name, p_last_name, 
    p_role, p_is_verified, p_verification_token, p_reset_token, p_reset_token_expires
  ) RETURNING ID INTO p_user_id;

  COMMIT; -- Optional
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE;
END;


-- Update User Procedure
CREATE OR REPLACE PROCEDURE UPDATE_USER(
  p_id IN NUMBER,
  p_username IN VARCHAR2 DEFAULT NULL,
  p_password IN VARCHAR2 DEFAULT NULL,
  p_email IN VARCHAR2 DEFAULT NULL,
  p_first_name IN VARCHAR2 DEFAULT NULL,
  p_last_name IN VARCHAR2 DEFAULT NULL,
  p_role IN VARCHAR2 DEFAULT NULL,
  p_is_verified IN NUMBER DEFAULT NULL,
  p_verification_token IN VARCHAR2 DEFAULT NULL,
  p_reset_token IN VARCHAR2 DEFAULT NULL,
  p_reset_token_expires IN TIMESTAMP DEFAULT NULL,
  p_success OUT NUMBER
) AS
  user_exists NUMBER;
BEGIN
  -- Check if user exists
  SELECT COUNT(*) INTO user_exists FROM USERS WHERE ID = p_id;
  
  IF user_exists = 0 THEN
    p_success := 0;
    RETURN;
  END IF;
  
  -- Update user with non-null fields
  UPDATE USERS SET
    USERNAME = CASE WHEN p_username IS NOT NULL THEN p_username ELSE USERNAME END,
    PASSWORD = CASE WHEN p_password IS NOT NULL THEN p_password ELSE PASSWORD END,
    EMAIL = CASE WHEN p_email IS NOT NULL THEN p_email ELSE EMAIL END,
    FIRST_NAME = CASE WHEN p_first_name IS NOT NULL THEN p_first_name ELSE FIRST_NAME END,
    LAST_NAME = CASE WHEN p_last_name IS NOT NULL THEN p_last_name ELSE LAST_NAME END,
    ROLE = CASE WHEN p_role IS NOT NULL THEN p_role ELSE ROLE END,
    IS_VERIFIED = CASE WHEN p_is_verified IS NOT NULL THEN p_is_verified ELSE IS_VERIFIED END,
    VERIFICATION_TOKEN = p_verification_token,
    RESET_TOKEN = p_reset_token,
    RESET_TOKEN_EXPIRES = p_reset_token_expires
  WHERE ID = p_id;
  
  p_success := SQL%ROWCOUNT;
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    p_success := 0;
    RAISE;
END;


-- Verify User Procedure
CREATE OR REPLACE PROCEDURE VERIFY_USER(
  p_id IN NUMBER,
  p_success OUT NUMBER
) AS
  user_exists NUMBER;
BEGIN
  -- Check if user exists
  SELECT COUNT(*) INTO user_exists FROM USERS WHERE ID = p_id;
  
  IF user_exists = 0 THEN
    p_success := 0;
    RETURN;
  END IF;
  
  -- Update user verification status
  UPDATE USERS SET
    IS_VERIFIED = 1,
    VERIFICATION_TOKEN = NULL
  WHERE ID = p_id;
  
  p_success := SQL%ROWCOUNT;
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    p_success := 0;
    RAISE;
END;


-- Category Operations

-- Create Category Procedure
CREATE OR REPLACE PROCEDURE CREATE_CATEGORY(
  p_name IN VARCHAR2,
  p_description IN VARCHAR2 DEFAULT NULL,
  p_image_url IN VARCHAR2 DEFAULT NULL,
  p_category_id OUT NUMBER
) AS
BEGIN
  INSERT INTO CATEGORIES (NAME, DESCRIPTION, IMAGE_URL)
  VALUES (p_name, p_description, p_image_url)
  RETURNING ID INTO p_category_id;
  
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE;
END;


-- Update Category Procedure
CREATE OR REPLACE PROCEDURE UPDATE_CATEGORY(
  p_id IN NUMBER,
  p_name IN VARCHAR2 DEFAULT NULL,
  p_description IN VARCHAR2 DEFAULT NULL,
  p_image_url IN VARCHAR2 DEFAULT NULL,
  p_success OUT NUMBER
) AS
  category_exists NUMBER;
BEGIN
  -- Check if category exists
  SELECT COUNT(*) INTO category_exists FROM CATEGORIES WHERE ID = p_id;
  
  IF category_exists = 0 THEN
    p_success := 0;
    RETURN;
  END IF;
  
  -- Update category with non-null fields
  UPDATE CATEGORIES SET
    NAME = CASE WHEN p_name IS NOT NULL THEN p_name ELSE NAME END,
    DESCRIPTION = CASE WHEN p_description IS NOT NULL THEN p_description ELSE DESCRIPTION END,
    IMAGE_URL = CASE WHEN p_image_url IS NOT NULL THEN p_image_url ELSE IMAGE_URL END
  WHERE ID = p_id;
  
  p_success := SQL%ROWCOUNT;
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    p_success := 0;
    RAISE;
END;


-- Delete Category Procedure
CREATE OR REPLACE PROCEDURE DELETE_CATEGORY(
  p_id IN NUMBER,
  p_success OUT NUMBER
) AS
  products_exist NUMBER;
BEGIN
  -- Check if there are products in this category
  SELECT COUNT(*) INTO products_exist FROM PRODUCTS WHERE CATEGORY_ID = p_id;
  
  IF products_exist > 0 THEN
    p_success := 0; -- Cannot delete category with products
    RETURN;
  END IF;
  
  -- Delete the category
  DELETE FROM CATEGORIES WHERE ID = p_id;
  
  p_success := SQL%ROWCOUNT;
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    p_success := 0;
    RAISE;
END;


-- Product Operations

-- Create Product Procedure
CREATE OR REPLACE PROCEDURE CREATE_PRODUCT(
  p_name IN VARCHAR2,
  p_description IN VARCHAR2 DEFAULT NULL,
  p_price IN NUMBER,
  p_inventory IN NUMBER DEFAULT 0,
  p_image_url IN VARCHAR2 DEFAULT NULL,
  p_vendor_id IN NUMBER,
  p_category_id IN NUMBER,
  p_is_organic IN NUMBER DEFAULT 0,
  p_is_local IN NUMBER DEFAULT 1,
  p_is_fresh_picked IN NUMBER DEFAULT 0,
  p_weight_kg IN NUMBER DEFAULT NULL,
  p_dimensions IN VARCHAR2 DEFAULT NULL,
  p_nutritional_info IN VARCHAR2 DEFAULT NULL,
  p_product_id OUT NUMBER
) AS
BEGIN
  INSERT INTO PRODUCTS (
    NAME, DESCRIPTION, PRICE, INVENTORY, IMAGE_URL, 
    VENDOR_ID, CATEGORY_ID, IS_ORGANIC, IS_LOCAL, IS_FRESH_PICKED,
    WEIGHT_KG, DIMENSIONS, NUTRITIONAL_INFO
  ) VALUES (
    p_name, p_description, p_price, p_inventory, p_image_url,
    p_vendor_id, p_category_id, p_is_organic, p_is_local, p_is_fresh_picked,
    p_weight_kg, p_dimensions, p_nutritional_info
  ) RETURNING ID INTO p_product_id;
  
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE;
END;


-- Update Product Procedure
CREATE OR REPLACE PROCEDURE UPDATE_PRODUCT(
  p_id IN NUMBER,
  p_name IN VARCHAR2 DEFAULT NULL,
  p_description IN VARCHAR2 DEFAULT NULL,
  p_price IN NUMBER DEFAULT NULL,
  p_inventory IN NUMBER DEFAULT NULL,
  p_image_url IN VARCHAR2 DEFAULT NULL,
  p_vendor_id IN NUMBER DEFAULT NULL,
  p_category_id IN NUMBER DEFAULT NULL,
  p_is_organic IN NUMBER DEFAULT NULL,
  p_is_local IN NUMBER DEFAULT NULL,
  p_is_fresh_picked IN NUMBER DEFAULT NULL,
  p_weight_kg IN NUMBER DEFAULT NULL,
  p_dimensions IN VARCHAR2 DEFAULT NULL,
  p_nutritional_info IN VARCHAR2 DEFAULT NULL,
  p_success OUT NUMBER
) AS
  product_exists NUMBER;
BEGIN
  -- Check if product exists
  SELECT COUNT(*) INTO product_exists FROM PRODUCTS WHERE ID = p_id;
  
  IF product_exists = 0 THEN
    p_success := 0;
    RETURN;
  END IF;
  
  -- Update product with non-null fields
  UPDATE PRODUCTS SET
    NAME = CASE WHEN p_name IS NOT NULL THEN p_name ELSE NAME END,
    DESCRIPTION = CASE WHEN p_description IS NOT NULL THEN p_description ELSE DESCRIPTION END,
    PRICE = CASE WHEN p_price IS NOT NULL THEN p_price ELSE PRICE END,
    INVENTORY = CASE WHEN p_inventory IS NOT NULL THEN p_inventory ELSE INVENTORY END,
    IMAGE_URL = CASE WHEN p_image_url IS NOT NULL THEN p_image_url ELSE IMAGE_URL END,
    VENDOR_ID = CASE WHEN p_vendor_id IS NOT NULL THEN p_vendor_id ELSE VENDOR_ID END,
    CATEGORY_ID = CASE WHEN p_category_id IS NOT NULL THEN p_category_id ELSE CATEGORY_ID END,
    IS_ORGANIC = CASE WHEN p_is_organic IS NOT NULL THEN p_is_organic ELSE IS_ORGANIC END,
    IS_LOCAL = CASE WHEN p_is_local IS NOT NULL THEN p_is_local ELSE IS_LOCAL END,
    IS_FRESH_PICKED = CASE WHEN p_is_fresh_picked IS NOT NULL THEN p_is_fresh_picked ELSE IS_FRESH_PICKED END,
    WEIGHT_KG = CASE WHEN p_weight_kg IS NOT NULL THEN p_weight_kg ELSE WEIGHT_KG END,
    DIMENSIONS = CASE WHEN p_dimensions IS NOT NULL THEN p_dimensions ELSE DIMENSIONS END,
    NUTRITIONAL_INFO = CASE WHEN p_nutritional_info IS NOT NULL THEN p_nutritional_info ELSE NUTRITIONAL_INFO END
  WHERE ID = p_id;
  
  p_success := SQL%ROWCOUNT;
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    p_success := 0;
    RAISE;
END;


-- Delete Product Procedure
CREATE OR REPLACE PROCEDURE DELETE_PRODUCT(
  p_id IN NUMBER,
  p_success OUT NUMBER
) AS
  order_items_exist NUMBER;
BEGIN
  -- Check if there are order items for this product
  SELECT COUNT(*) INTO order_items_exist FROM ORDER_ITEMS WHERE PRODUCT_ID = p_id;
  
  IF order_items_exist > 0 THEN
    p_success := 0; -- Cannot delete product with order items
    RETURN;
  END IF;
  
  -- Delete the product
  DELETE FROM PRODUCTS WHERE ID = p_id;
  
  p_success := SQL%ROWCOUNT;
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    p_success := 0;
    RAISE;
END;


-- Vendor Operations

-- Create Vendor Procedure
CREATE OR REPLACE PROCEDURE CREATE_VENDOR(
  p_user_id IN NUMBER,
  p_business_name IN VARCHAR2,
  p_description IN VARCHAR2 DEFAULT NULL,
  p_logo_url IN VARCHAR2 DEFAULT NULL,
  p_address IN VARCHAR2 DEFAULT NULL,
  p_city IN VARCHAR2 DEFAULT NULL,
  p_state IN VARCHAR2 DEFAULT NULL,
  p_postal_code IN VARCHAR2 DEFAULT NULL,
  p_country IN VARCHAR2 DEFAULT 'Sri Lanka',
  p_phone IN VARCHAR2 DEFAULT NULL,
  p_website IN VARCHAR2 DEFAULT NULL,
  p_business_email IN VARCHAR2 DEFAULT NULL,
  p_vendor_id OUT NUMBER
) AS
BEGIN
  INSERT INTO VENDORS (
    USER_ID, BUSINESS_NAME, DESCRIPTION, LOGO_URL, 
    ADDRESS, CITY, STATE, POSTAL_CODE, COUNTRY,
    PHONE, WEBSITE, BUSINESS_EMAIL
  ) VALUES (
    p_user_id, p_business_name, p_description, p_logo_url,
    p_address, p_city, p_state, p_postal_code, p_country,
    p_phone, p_website, p_business_email
  ) RETURNING ID INTO p_vendor_id;
  
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE;
END;


-- Update Vendor Procedure
CREATE OR REPLACE PROCEDURE UPDATE_VENDOR(
  p_id IN NUMBER,
  p_business_name IN VARCHAR2 DEFAULT NULL,
  p_description IN VARCHAR2 DEFAULT NULL,
  p_logo_url IN VARCHAR2 DEFAULT NULL,
  p_address IN VARCHAR2 DEFAULT NULL,
  p_city IN VARCHAR2 DEFAULT NULL,
  p_state IN VARCHAR2 DEFAULT NULL,
  p_postal_code IN VARCHAR2 DEFAULT NULL,
  p_country IN VARCHAR2 DEFAULT NULL,
  p_phone IN VARCHAR2 DEFAULT NULL,
  p_website IN VARCHAR2 DEFAULT NULL,
  p_business_email IN VARCHAR2 DEFAULT NULL,
  p_success OUT NUMBER
) AS
  vendor_exists NUMBER;
BEGIN
  -- Check if vendor exists
  SELECT COUNT(*) INTO vendor_exists FROM VENDORS WHERE ID = p_id;
  
  IF vendor_exists = 0 THEN
    p_success := 0;
    RETURN;
  END IF;
  
  -- Update vendor with non-null fields
  UPDATE VENDORS SET
    BUSINESS_NAME = CASE WHEN p_business_name IS NOT NULL THEN p_business_name ELSE BUSINESS_NAME END,
    DESCRIPTION = CASE WHEN p_description IS NOT NULL THEN p_description ELSE DESCRIPTION END,
    LOGO_URL = CASE WHEN p_logo_url IS NOT NULL THEN p_logo_url ELSE LOGO_URL END,
    ADDRESS = CASE WHEN p_address IS NOT NULL THEN p_address ELSE ADDRESS END,
    CITY = CASE WHEN p_city IS NOT NULL THEN p_city ELSE CITY END,
    STATE = CASE WHEN p_state IS NOT NULL THEN p_state ELSE STATE END,
    POSTAL_CODE = CASE WHEN p_postal_code IS NOT NULL THEN p_postal_code ELSE POSTAL_CODE END,
    COUNTRY = CASE WHEN p_country IS NOT NULL THEN p_country ELSE COUNTRY END,
    PHONE = CASE WHEN p_phone IS NOT NULL THEN p_phone ELSE PHONE END,
    WEBSITE = CASE WHEN p_website IS NOT NULL THEN p_website ELSE WEBSITE END,
    BUSINESS_EMAIL = CASE WHEN p_business_email IS NOT NULL THEN p_business_email ELSE BUSINESS_EMAIL END
  WHERE ID = p_id;
  
  p_success := SQL%ROWCOUNT;
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    p_success := 0;
    RAISE;
END;


-- Order Operations

-- Create Order Procedure
CREATE OR REPLACE PROCEDURE CREATE_ORDER(
  p_user_id IN NUMBER,
  p_status IN VARCHAR2 DEFAULT 'pending',
  p_total IN NUMBER,
  p_shipping_address IN VARCHAR2,
  p_shipping_city IN VARCHAR2,
  p_shipping_state IN VARCHAR2,
  p_shipping_postal_code IN VARCHAR2,
  p_shipping_country IN VARCHAR2 DEFAULT 'Sri Lanka',
  p_shipping_method IN VARCHAR2,
  p_shipping_fee IN NUMBER,
  p_payment_method IN VARCHAR2,
  p_payment_status IN VARCHAR2 DEFAULT 'pending',
  p_order_id OUT NUMBER
) AS
BEGIN
  INSERT INTO ORDERS (
    USER_ID, STATUS, TOTAL, 
    SHIPPING_ADDRESS, SHIPPING_CITY, SHIPPING_STATE, SHIPPING_POSTAL_CODE, SHIPPING_COUNTRY,
    SHIPPING_METHOD, SHIPPING_FEE, PAYMENT_METHOD, PAYMENT_STATUS
  ) VALUES (
    p_user_id, p_status, p_total,
    p_shipping_address, p_shipping_city, p_shipping_state, p_shipping_postal_code, p_shipping_country,
    p_shipping_method, p_shipping_fee, p_payment_method, p_payment_status
  ) RETURNING ID INTO p_order_id;
  
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE;
END;


-- Update Order Status Procedure
CREATE OR REPLACE PROCEDURE UPDATE_ORDER_STATUS(
  p_id IN NUMBER,
  p_status IN VARCHAR2,
  p_payment_status IN VARCHAR2 DEFAULT NULL,
  p_success OUT NUMBER
) AS
  order_exists NUMBER;
BEGIN
  -- Check if order exists
  SELECT COUNT(*) INTO order_exists FROM ORDERS WHERE ID = p_id;
  
  IF order_exists = 0 THEN
    p_success := 0;
    RETURN;
  END IF;
  
  -- Update order status
  UPDATE ORDERS SET
    STATUS = p_status,
    PAYMENT_STATUS = CASE WHEN p_payment_status IS NOT NULL THEN p_payment_status ELSE PAYMENT_STATUS END
  WHERE ID = p_id;
  
  p_success := SQL%ROWCOUNT;
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    p_success := 0;
    RAISE;
END;


-- Order Item Operations

-- Create Order Item Procedure
CREATE OR REPLACE PROCEDURE CREATE_ORDER_ITEM(
  p_order_id IN NUMBER,
  p_product_id IN NUMBER,
  p_quantity IN NUMBER,
  p_price_at_time IN NUMBER,
  p_order_item_id OUT NUMBER
) AS
BEGIN
  INSERT INTO ORDER_ITEMS (ORDER_ID, PRODUCT_ID, QUANTITY, PRICE_AT_TIME)
  VALUES (p_order_id, p_product_id, p_quantity, p_price_at_time)
  RETURNING ID INTO p_order_item_id;
  
  -- Update product inventory
  UPDATE PRODUCTS
  SET INVENTORY = INVENTORY - p_quantity
  WHERE ID = p_product_id AND INVENTORY >= p_quantity;
  
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE;
END;


-- Create convenience functions to check if records exist

-- Check if User Exists
CREATE OR REPLACE FUNCTION USER_EXISTS(p_id IN NUMBER) RETURN NUMBER AS
  user_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM USERS WHERE ID = p_id;
  RETURN user_count;
END;


-- Check if Product Exists
CREATE OR REPLACE FUNCTION PRODUCT_EXISTS(p_id IN NUMBER) RETURN NUMBER AS
  product_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO product_count FROM PRODUCTS WHERE ID = p_id;
  RETURN product_count;
END;


-- Check if Category Exists
CREATE OR REPLACE FUNCTION CATEGORY_EXISTS(p_id IN NUMBER) RETURN NUMBER AS
  category_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO category_count FROM CATEGORIES WHERE ID = p_id;
  RETURN category_count;
END;


-- Check if Vendor Exists
CREATE OR REPLACE FUNCTION VENDOR_EXISTS(p_id IN NUMBER) RETURN NUMBER AS
  vendor_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO vendor_count FROM VENDORS WHERE ID = p_id;
  RETURN vendor_count;
END;


-- Check if Vendor Exists By User ID
CREATE OR REPLACE FUNCTION VENDOR_EXISTS_BY_USER(p_user_id IN NUMBER) RETURN NUMBER AS
  vendor_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO vendor_count FROM VENDORS WHERE USER_ID = p_user_id;
  RETURN vendor_count;
END;


-- Check if Order Exists
CREATE OR REPLACE FUNCTION ORDER_EXISTS(p_id IN NUMBER) RETURN NUMBER AS
  order_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO order_count FROM ORDERS WHERE ID = p_id;
  RETURN order_count;
END;


-- Some helper procedures that will be used by the application for search capabilities

-- Search Products Procedure
CREATE OR REPLACE PROCEDURE SEARCH_PRODUCTS(
  p_query IN VARCHAR2,
  p_results OUT SYS_REFCURSOR
) AS
BEGIN
  OPEN p_results FOR
    SELECT * 
    FROM PRODUCTS
    WHERE 
      UPPER(NAME) LIKE '%' || UPPER(p_query) || '%'
      OR UPPER(DESCRIPTION) LIKE '%' || UPPER(p_query) || '%';
END;


-- Get Products By Category Procedure
CREATE OR REPLACE PROCEDURE GET_PRODUCTS_BY_CATEGORY(
  p_category_id IN NUMBER,
  p_results OUT SYS_REFCURSOR
) AS
BEGIN
  OPEN p_results FOR
    SELECT * 
    FROM PRODUCTS
    WHERE CATEGORY_ID = p_category_id;
END;


-- Get Products By Vendor Procedure
CREATE OR REPLACE PROCEDURE GET_PRODUCTS_BY_VENDOR(
  p_vendor_id IN NUMBER,
  p_results OUT SYS_REFCURSOR
) AS
BEGIN
  OPEN p_results FOR
    SELECT * 
    FROM PRODUCTS
    WHERE VENDOR_ID = p_vendor_id;
END;


-- Get Orders By User Procedure
CREATE OR REPLACE PROCEDURE GET_ORDERS_BY_USER(
  p_user_id IN NUMBER,
  p_results OUT SYS_REFCURSOR
) AS
BEGIN
  OPEN p_results FOR
    SELECT * 
    FROM ORDERS
    WHERE USER_ID = p_user_id
    ORDER BY CREATED_AT DESC;
END;


-- Get Order Items By Order Procedure
CREATE OR REPLACE PROCEDURE GET_ORDER_ITEMS_BY_ORDER(
  p_order_id IN NUMBER,
  p_results OUT SYS_REFCURSOR
) AS
BEGIN
  OPEN p_results FOR
    SELECT i.*, p.NAME AS PRODUCT_NAME, p.IMAGE_URL
    FROM ORDER_ITEMS i
    JOIN PRODUCTS p ON i.PRODUCT_ID = p.ID
    WHERE i.ORDER_ID = p_order_id;
END;


COMMIT;
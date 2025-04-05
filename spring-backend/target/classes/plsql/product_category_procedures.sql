-- PL/SQL Procedures for Product and Category Management

-- Create or replace the procedure for creating a new category
CREATE OR REPLACE PROCEDURE create_category(
    p_name IN VARCHAR2,
    p_description IN VARCHAR2,
    p_image_url IN VARCHAR2,
    p_category_id OUT NUMBER
)
AS
BEGIN
    INSERT INTO categories (
        id,
        name,
        description,
        image_url,
        is_active,
        created_at
    ) VALUES (
        CATEGORY_SEQ.NEXTVAL,
        p_name,
        p_description,
        p_image_url,
        1, -- is_active = true
        SYSTIMESTAMP
    ) RETURNING id INTO p_category_id;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END create_category;
/

-- Create or replace the procedure for updating an existing category
CREATE OR REPLACE PROCEDURE update_category(
    p_category_id IN NUMBER,
    p_name IN VARCHAR2,
    p_description IN VARCHAR2,
    p_image_url IN VARCHAR2
)
AS
BEGIN
    UPDATE categories
    SET
        name = p_name,
        description = p_description,
        image_url = p_image_url,
        updated_at = SYSTIMESTAMP
    WHERE id = p_category_id;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END update_category;
/

-- Create or replace the procedure for getting a category by ID
CREATE OR REPLACE PROCEDURE get_category_by_id(
    p_category_id IN NUMBER,
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
    SELECT
        c.id,
        c.name,
        c.description,
        c.image_url,
        c.is_active,
        c.created_at,
        c.updated_at,
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
    FROM categories c
    WHERE c.id = p_category_id;
END get_category_by_id;
/

-- Create or replace the procedure for getting all categories
CREATE OR REPLACE PROCEDURE get_all_categories(
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
    SELECT
        c.id,
        c.name,
        c.description,
        c.image_url,
        c.is_active,
        c.created_at,
        c.updated_at,
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
    FROM categories c
    WHERE c.is_active = 1
    ORDER BY c.name;
END get_all_categories;
/

-- Create or replace the procedure for deleting a category
CREATE OR REPLACE PROCEDURE delete_category(
    p_category_id IN NUMBER
)
AS
    v_product_count NUMBER;
BEGIN
    -- Check if there are products in this category
    SELECT COUNT(*)
    INTO v_product_count
    FROM products
    WHERE category_id = p_category_id;
    
    -- If there are products, don't delete, just deactivate
    IF v_product_count > 0 THEN
        UPDATE categories
        SET
            is_active = 0,
            updated_at = SYSTIMESTAMP
        WHERE id = p_category_id;
    ELSE
        -- If no products, delete the category
        DELETE FROM categories
        WHERE id = p_category_id;
    END IF;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END delete_category;
/

-- Create or replace the procedure for creating a new product
CREATE OR REPLACE PROCEDURE create_product(
    p_name IN VARCHAR2,
    p_description IN VARCHAR2,
    p_price IN NUMBER,
    p_sale_price IN NUMBER,
    p_stock_quantity IN NUMBER,
    p_is_available IN NUMBER,
    p_is_featured IN NUMBER,
    p_is_organic IN NUMBER,
    p_sku IN VARCHAR2,
    p_image_url IN VARCHAR2,
    p_unit IN VARCHAR2,
    p_weight_value IN NUMBER,
    p_weight_unit IN VARCHAR2,
    p_harvest_date IN TIMESTAMP,
    p_expiry_date IN TIMESTAMP,
    p_nutritional_info IN VARCHAR2,
    p_discount_percentage IN NUMBER,
    p_category_id IN NUMBER,
    p_vendor_id IN NUMBER,
    p_product_id OUT NUMBER
)
AS
BEGIN
    INSERT INTO products (
        id,
        name,
        description,
        price,
        sale_price,
        stock_quantity,
        is_available,
        is_featured,
        is_organic,
        sku,
        image_url,
        unit,
        weight_value,
        weight_unit,
        harvest_date,
        expiry_date,
        nutritional_info,
        average_rating,
        discount_percentage,
        category_id,
        vendor_id,
        created_at
    ) VALUES (
        PRODUCT_SEQ.NEXTVAL,
        p_name,
        p_description,
        p_price,
        p_sale_price,
        p_stock_quantity,
        p_is_available,
        p_is_featured,
        p_is_organic,
        p_sku,
        p_image_url,
        p_unit,
        p_weight_value,
        p_weight_unit,
        p_harvest_date,
        p_expiry_date,
        p_nutritional_info,
        0, -- average_rating = 0
        p_discount_percentage,
        p_category_id,
        p_vendor_id,
        SYSTIMESTAMP
    ) RETURNING id INTO p_product_id;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END create_product;
/

-- Create or replace the procedure for updating an existing product
CREATE OR REPLACE PROCEDURE update_product(
    p_product_id IN NUMBER,
    p_name IN VARCHAR2,
    p_description IN VARCHAR2,
    p_price IN NUMBER,
    p_sale_price IN NUMBER,
    p_stock_quantity IN NUMBER,
    p_is_available IN NUMBER,
    p_is_featured IN NUMBER,
    p_is_organic IN NUMBER,
    p_sku IN VARCHAR2,
    p_image_url IN VARCHAR2,
    p_unit IN VARCHAR2,
    p_weight_value IN NUMBER,
    p_weight_unit IN VARCHAR2,
    p_harvest_date IN TIMESTAMP,
    p_expiry_date IN TIMESTAMP,
    p_nutritional_info IN VARCHAR2,
    p_discount_percentage IN NUMBER,
    p_category_id IN NUMBER
)
AS
BEGIN
    UPDATE products
    SET
        name = p_name,
        description = p_description,
        price = p_price,
        sale_price = p_sale_price,
        stock_quantity = p_stock_quantity,
        is_available = p_is_available,
        is_featured = p_is_featured,
        is_organic = p_is_organic,
        sku = p_sku,
        image_url = p_image_url,
        unit = p_unit,
        weight_value = p_weight_value,
        weight_unit = p_weight_unit,
        harvest_date = p_harvest_date,
        expiry_date = p_expiry_date,
        nutritional_info = p_nutritional_info,
        discount_percentage = p_discount_percentage,
        category_id = p_category_id,
        updated_at = SYSTIMESTAMP
    WHERE id = p_product_id;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END update_product;
/

-- Create or replace the procedure for getting a product by ID
CREATE OR REPLACE PROCEDURE get_product_by_id(
    p_product_id IN NUMBER,
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
    SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.sale_price,
        p.stock_quantity,
        p.is_available,
        p.is_featured,
        p.is_organic,
        p.sku,
        p.image_url,
        p.unit,
        p.weight_value,
        p.weight_unit,
        p.harvest_date,
        p.expiry_date,
        p.nutritional_info,
        p.average_rating,
        p.discount_percentage,
        p.created_at,
        p.updated_at,
        p.category_id,
        c.name AS category_name,
        p.vendor_id,
        v.business_name AS vendor_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN vendors v ON p.vendor_id = v.id
    WHERE p.id = p_product_id;
END get_product_by_id;
/

-- Create or replace the procedure for getting all products
CREATE OR REPLACE PROCEDURE get_all_products(
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
    SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.sale_price,
        p.stock_quantity,
        p.is_available,
        p.is_featured,
        p.is_organic,
        p.sku,
        p.image_url,
        p.unit,
        p.weight_value,
        p.weight_unit,
        p.harvest_date,
        p.expiry_date,
        p.nutritional_info,
        p.average_rating,
        p.discount_percentage,
        p.created_at,
        p.updated_at,
        p.category_id,
        c.name AS category_name,
        p.vendor_id,
        v.business_name AS vendor_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN vendors v ON p.vendor_id = v.id
    WHERE p.is_available = 1
    ORDER BY p.name;
END get_all_products;
/

-- Create or replace the procedure for getting products by category
CREATE OR REPLACE PROCEDURE get_products_by_category(
    p_category_id IN NUMBER,
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
    SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.sale_price,
        p.stock_quantity,
        p.is_available,
        p.is_featured,
        p.is_organic,
        p.sku,
        p.image_url,
        p.unit,
        p.weight_value,
        p.weight_unit,
        p.harvest_date,
        p.expiry_date,
        p.nutritional_info,
        p.average_rating,
        p.discount_percentage,
        p.created_at,
        p.updated_at,
        p.category_id,
        c.name AS category_name,
        p.vendor_id,
        v.business_name AS vendor_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN vendors v ON p.vendor_id = v.id
    WHERE p.category_id = p_category_id AND p.is_available = 1
    ORDER BY p.name;
END get_products_by_category;
/

-- Create or replace the procedure for getting products by vendor
CREATE OR REPLACE PROCEDURE get_products_by_vendor(
    p_vendor_id IN NUMBER,
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
    SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.sale_price,
        p.stock_quantity,
        p.is_available,
        p.is_featured,
        p.is_organic,
        p.sku,
        p.image_url,
        p.unit,
        p.weight_value,
        p.weight_unit,
        p.harvest_date,
        p.expiry_date,
        p.nutritional_info,
        p.average_rating,
        p.discount_percentage,
        p.created_at,
        p.updated_at,
        p.category_id,
        c.name AS category_name,
        p.vendor_id,
        v.business_name AS vendor_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN vendors v ON p.vendor_id = v.id
    WHERE p.vendor_id = p_vendor_id
    ORDER BY p.name;
END get_products_by_vendor;
/

-- Create or replace the procedure for getting featured products
CREATE OR REPLACE PROCEDURE get_featured_products(
    p_limit IN NUMBER,
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
    SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.sale_price,
        p.stock_quantity,
        p.is_available,
        p.is_featured,
        p.is_organic,
        p.sku,
        p.image_url,
        p.unit,
        p.weight_value,
        p.weight_unit,
        p.harvest_date,
        p.expiry_date,
        p.nutritional_info,
        p.average_rating,
        p.discount_percentage,
        p.created_at,
        p.updated_at,
        p.category_id,
        c.name AS category_name,
        p.vendor_id,
        v.business_name AS vendor_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN vendors v ON p.vendor_id = v.id
    WHERE p.is_featured = 1 AND p.is_available = 1
    ORDER BY p.average_rating DESC, p.created_at DESC
    FETCH FIRST p_limit ROWS ONLY;
END get_featured_products;
/

-- Create or replace the procedure for searching products
CREATE OR REPLACE PROCEDURE search_products(
    p_search_term IN VARCHAR2,
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
    SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.sale_price,
        p.stock_quantity,
        p.is_available,
        p.is_featured,
        p.is_organic,
        p.sku,
        p.image_url,
        p.unit,
        p.weight_value,
        p.weight_unit,
        p.harvest_date,
        p.expiry_date,
        p.nutritional_info,
        p.average_rating,
        p.discount_percentage,
        p.created_at,
        p.updated_at,
        p.category_id,
        c.name AS category_name,
        p.vendor_id,
        v.business_name AS vendor_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN vendors v ON p.vendor_id = v.id
    WHERE (
        UPPER(p.name) LIKE '%' || UPPER(p_search_term) || '%'
        OR UPPER(p.description) LIKE '%' || UPPER(p_search_term) || '%'
        OR UPPER(c.name) LIKE '%' || UPPER(p_search_term) || '%'
        OR UPPER(v.business_name) LIKE '%' || UPPER(p_search_term) || '%'
    )
    AND p.is_available = 1
    ORDER BY 
        CASE 
            WHEN UPPER(p.name) LIKE UPPER(p_search_term) || '%' THEN 1
            WHEN UPPER(p.name) LIKE '%' || UPPER(p_search_term) || '%' THEN 2
            ELSE 3
        END,
        p.average_rating DESC,
        p.name;
END search_products;
/

-- Create or replace the procedure for deleting a product
CREATE OR REPLACE PROCEDURE delete_product(
    p_product_id IN NUMBER
)
AS
    v_order_count NUMBER;
BEGIN
    -- Check if there are order items for this product
    SELECT COUNT(*)
    INTO v_order_count
    FROM order_items
    WHERE product_id = p_product_id;
    
    -- If there are order items, don't delete, just deactivate
    IF v_order_count > 0 THEN
        UPDATE products
        SET
            is_available = 0,
            updated_at = SYSTIMESTAMP
        WHERE id = p_product_id;
    ELSE
        -- If no order items, delete the product
        DELETE FROM products
        WHERE id = p_product_id;
    END IF;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END delete_product;
/

-- Create or replace the procedure for updating a product's average rating
CREATE OR REPLACE PROCEDURE update_product_rating(
    p_product_id IN NUMBER,
    p_vendor_id IN NUMBER
)
AS
    v_avg_rating NUMBER;
    v_vendor_id NUMBER;
BEGIN
    -- Get the vendor id if not provided
    IF p_vendor_id IS NULL THEN
        SELECT vendor_id
        INTO v_vendor_id
        FROM products
        WHERE id = p_product_id;
    ELSE
        v_vendor_id := p_vendor_id;
    END IF;

    -- This would be calculated from MongoDB reviews in the application logic
    -- For this SQL procedure, we'll just use a placeholder
    -- In real application, the average rating would be calculated from reviews
    -- and passed as a parameter
    
    -- For example:
    -- Calculate the average rating from MongoDB reviews and update the product
    -- UPDATE products
    -- SET average_rating = [calculated_average_rating]
    -- WHERE id = p_product_id;
    
    -- Then update the vendor's average rating
    -- CALL update_vendor_rating(v_vendor_id);
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END update_product_rating;
/

-- Create or replace the procedure for getting products that are on sale
CREATE OR REPLACE PROCEDURE get_sale_products(
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
    SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.sale_price,
        p.stock_quantity,
        p.is_available,
        p.is_featured,
        p.is_organic,
        p.sku,
        p.image_url,
        p.unit,
        p.weight_value,
        p.weight_unit,
        p.harvest_date,
        p.expiry_date,
        p.nutritional_info,
        p.average_rating,
        p.discount_percentage,
        p.created_at,
        p.updated_at,
        p.category_id,
        c.name AS category_name,
        p.vendor_id,
        v.business_name AS vendor_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN vendors v ON p.vendor_id = v.id
    WHERE p.sale_price IS NOT NULL
    AND p.is_available = 1
    AND p.sale_price < p.price
    ORDER BY ((p.price - p.sale_price) / p.price) DESC;
END get_sale_products;
/
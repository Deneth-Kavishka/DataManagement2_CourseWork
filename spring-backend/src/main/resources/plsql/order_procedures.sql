-- PL/SQL Procedures for Order Management

-- Create or replace the procedure for creating a new order
CREATE OR REPLACE PROCEDURE create_order(
    p_user_id IN NUMBER,
    p_shipping_address IN VARCHAR2,
    p_city IN VARCHAR2,
    p_state IN VARCHAR2,
    p_zip_code IN VARCHAR2,
    p_country IN VARCHAR2,
    p_shipping_method IN VARCHAR2,
    p_shipping_cost IN NUMBER,
    p_tax_amount IN NUMBER,
    p_discount_amount IN NUMBER,
    p_payment_method IN VARCHAR2,
    p_notes IN VARCHAR2,
    p_order_id OUT NUMBER,
    p_order_number OUT VARCHAR2
)
AS
    v_total_amount NUMBER := 0;
    v_order_date TIMESTAMP := SYSTIMESTAMP;
    v_order_number VARCHAR2(50);
BEGIN
    -- Generate a unique order number
    v_order_number := 'ORD-' || TO_CHAR(v_order_date, 'YYYYMMDD') || '-' || TO_CHAR(ORDER_SEQ.NEXTVAL, 'FM000000');
    
    -- Initially, total amount is just shipping + tax - discount
    -- Later we'll add product totals
    v_total_amount := NVL(p_shipping_cost, 0) + NVL(p_tax_amount, 0) - NVL(p_discount_amount, 0);
    
    INSERT INTO orders (
        id,
        order_number,
        order_date,
        total_amount,
        shipping_address,
        city,
        state,
        zip_code,
        country,
        shipping_method,
        shipping_cost,
        tax_amount,
        discount_amount,
        payment_method,
        payment_status,
        order_status,
        notes,
        user_id,
        created_at
    ) VALUES (
        ORDER_SEQ.CURRVAL,
        v_order_number,
        v_order_date,
        v_total_amount,
        p_shipping_address,
        p_city,
        p_state,
        p_zip_code,
        p_country,
        p_shipping_method,
        p_shipping_cost,
        p_tax_amount,
        p_discount_amount,
        p_payment_method,
        'PENDING', -- payment_status
        'PENDING', -- order_status
        p_notes,
        p_user_id,
        v_order_date
    ) RETURNING id INTO p_order_id;
    
    p_order_number := v_order_number;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END create_order;
/

-- Create or replace the procedure for adding an item to an order
CREATE OR REPLACE PROCEDURE add_order_item(
    p_order_id IN NUMBER,
    p_product_id IN NUMBER,
    p_quantity IN NUMBER,
    p_unit_price IN NUMBER,
    p_discount_amount IN NUMBER,
    p_order_item_id OUT NUMBER
)
AS
    v_subtotal NUMBER;
    v_total_amount NUMBER;
    v_current_total NUMBER;
    v_stock_quantity NUMBER;
BEGIN
    -- Calculate the subtotal
    v_subtotal := p_quantity * p_unit_price;
    IF p_discount_amount IS NOT NULL THEN
        v_subtotal := v_subtotal - p_discount_amount;
    END IF;
    
    -- Check if product has enough stock
    SELECT stock_quantity
    INTO v_stock_quantity
    FROM products
    WHERE id = p_product_id;
    
    IF v_stock_quantity < p_quantity THEN
        RAISE_APPLICATION_ERROR(-20001, 'Not enough stock available.');
    END IF;
    
    -- Insert the order item
    INSERT INTO order_items (
        id,
        order_id,
        product_id,
        quantity,
        unit_price,
        subtotal,
        discount_amount
    ) VALUES (
        ORDER_ITEM_SEQ.NEXTVAL,
        p_order_id,
        p_product_id,
        p_quantity,
        p_unit_price,
        v_subtotal,
        p_discount_amount
    ) RETURNING id INTO p_order_item_id;
    
    -- Update the total amount of the order
    SELECT total_amount
    INTO v_current_total
    FROM orders
    WHERE id = p_order_id;
    
    v_total_amount := v_current_total + v_subtotal;
    
    UPDATE orders
    SET total_amount = v_total_amount
    WHERE id = p_order_id;
    
    -- Update the product stock
    UPDATE products
    SET stock_quantity = stock_quantity - p_quantity
    WHERE id = p_product_id;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END add_order_item;
/

-- Create or replace the procedure for getting an order by ID
CREATE OR REPLACE PROCEDURE get_order_by_id(
    p_order_id IN NUMBER,
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
    SELECT
        o.id,
        o.order_number,
        o.order_date,
        o.total_amount,
        o.shipping_address,
        o.city,
        o.state,
        o.zip_code,
        o.country,
        o.shipping_method,
        o.shipping_cost,
        o.tax_amount,
        o.discount_amount,
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.tracking_number,
        o.estimated_delivery_date,
        o.delivered_date,
        o.notes,
        o.created_at,
        o.updated_at,
        o.user_id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.phone
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.id = p_order_id;
END get_order_by_id;
/

-- Create or replace the procedure for getting orders by user ID
CREATE OR REPLACE PROCEDURE get_orders_by_user(
    p_user_id IN NUMBER,
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
    SELECT
        o.id,
        o.order_number,
        o.order_date,
        o.total_amount,
        o.shipping_address,
        o.city,
        o.state,
        o.zip_code,
        o.country,
        o.shipping_method,
        o.shipping_cost,
        o.tax_amount,
        o.discount_amount,
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.tracking_number,
        o.estimated_delivery_date,
        o.delivered_date,
        o.notes,
        o.created_at,
        o.updated_at
    FROM orders o
    WHERE o.user_id = p_user_id
    ORDER BY o.order_date DESC;
END get_orders_by_user;
/

-- Create or replace the procedure for getting all orders
CREATE OR REPLACE PROCEDURE get_all_orders(
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
    SELECT
        o.id,
        o.order_number,
        o.order_date,
        o.total_amount,
        o.shipping_address,
        o.city,
        o.state,
        o.zip_code,
        o.country,
        o.shipping_method,
        o.shipping_cost,
        o.tax_amount,
        o.discount_amount,
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.tracking_number,
        o.estimated_delivery_date,
        o.delivered_date,
        o.notes,
        o.created_at,
        o.updated_at,
        o.user_id,
        u.username,
        u.email,
        u.first_name,
        u.last_name
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.order_date DESC;
END get_all_orders;
/

-- Create or replace the procedure for getting order items by order ID
CREATE OR REPLACE PROCEDURE get_order_items(
    p_order_id IN NUMBER,
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
    SELECT
        oi.id,
        oi.order_id,
        oi.product_id,
        p.name AS product_name,
        p.image_url AS product_image,
        v.id AS vendor_id,
        v.business_name AS vendor_name,
        oi.quantity,
        oi.unit_price,
        oi.subtotal,
        oi.discount_amount
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN vendors v ON p.vendor_id = v.id
    WHERE oi.order_id = p_order_id
    ORDER BY oi.id;
END get_order_items;
/

-- Create or replace the procedure for updating order status
CREATE OR REPLACE PROCEDURE update_order_status(
    p_order_id IN NUMBER,
    p_order_status IN VARCHAR2,
    p_tracking_number IN VARCHAR2,
    p_estimated_delivery_date IN TIMESTAMP
)
AS
BEGIN
    UPDATE orders
    SET
        order_status = p_order_status,
        tracking_number = p_tracking_number,
        estimated_delivery_date = p_estimated_delivery_date,
        updated_at = SYSTIMESTAMP,
        delivered_date = CASE WHEN p_order_status = 'DELIVERED' THEN SYSTIMESTAMP ELSE delivered_date END
    WHERE id = p_order_id;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END update_order_status;
/

-- Create or replace the procedure for updating payment status
CREATE OR REPLACE PROCEDURE update_payment_status(
    p_order_id IN NUMBER,
    p_payment_status IN VARCHAR2
)
AS
BEGIN
    UPDATE orders
    SET
        payment_status = p_payment_status,
        updated_at = SYSTIMESTAMP
    WHERE id = p_order_id;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END update_payment_status;
/

-- Create or replace the procedure for cancelling an order
CREATE OR REPLACE PROCEDURE cancel_order(
    p_order_id IN NUMBER
)
AS
    v_payment_status VARCHAR2(20);
    v_order_status VARCHAR2(20);
BEGIN
    -- Get the current status of the order
    SELECT payment_status, order_status
    INTO v_payment_status, v_order_status
    FROM orders
    WHERE id = p_order_id;
    
    -- Only allow cancellation if the order is not already shipped or delivered
    IF v_order_status IN ('SHIPPED', 'DELIVERED', 'CANCELLED') THEN
        RAISE_APPLICATION_ERROR(-20002, 'Cannot cancel order in status: ' || v_order_status);
    END IF;
    
    -- Update the order status to CANCELLED
    UPDATE orders
    SET
        order_status = 'CANCELLED',
        updated_at = SYSTIMESTAMP
    WHERE id = p_order_id;
    
    -- Return the products to inventory
    FOR item IN (SELECT product_id, quantity FROM order_items WHERE order_id = p_order_id)
    LOOP
        UPDATE products
        SET stock_quantity = stock_quantity + item.quantity
        WHERE id = item.product_id;
    END LOOP;
    
    -- If payment was completed, mark it for refund
    IF v_payment_status = 'COMPLETED' THEN
        UPDATE orders
        SET payment_status = 'REFUND_PENDING'
        WHERE id = p_order_id;
    END IF;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END cancel_order;
/

-- Create or replace the procedure for getting order statistics
CREATE OR REPLACE PROCEDURE get_order_statistics(
    p_start_date IN TIMESTAMP,
    p_end_date IN TIMESTAMP,
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
    SELECT
        COUNT(*) AS total_orders,
        SUM(total_amount) AS total_sales,
        AVG(total_amount) AS average_order_value,
        SUM(CASE WHEN payment_status = 'COMPLETED' THEN total_amount ELSE 0 END) AS paid_sales,
        SUM(CASE WHEN payment_status != 'COMPLETED' THEN total_amount ELSE 0 END) AS unpaid_sales,
        COUNT(CASE WHEN order_status = 'CANCELLED' THEN 1 ELSE NULL END) AS cancelled_orders,
        COUNT(CASE WHEN order_status = 'DELIVERED' THEN 1 ELSE NULL END) AS delivered_orders,
        COUNT(CASE WHEN order_status = 'PENDING' THEN 1 ELSE NULL END) AS pending_orders,
        COUNT(CASE WHEN order_status = 'PROCESSING' THEN 1 ELSE NULL END) AS processing_orders,
        COUNT(CASE WHEN order_status = 'SHIPPED' THEN 1 ELSE NULL END) AS shipped_orders
    FROM orders
    WHERE order_date BETWEEN p_start_date AND p_end_date;
END get_order_statistics;
/

-- Create or replace the procedure for getting vendor order statistics
CREATE OR REPLACE PROCEDURE get_vendor_order_stats(
    p_vendor_id IN NUMBER,
    p_start_date IN TIMESTAMP,
    p_end_date IN TIMESTAMP,
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
    SELECT
        COUNT(DISTINCT o.id) AS total_orders,
        SUM(oi.subtotal) AS total_sales,
        AVG(oi.subtotal) AS average_item_value,
        SUM(oi.quantity) AS total_items_sold
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE p.vendor_id = p_vendor_id
    AND o.order_date BETWEEN p_start_date AND p_end_date
    AND o.order_status != 'CANCELLED';
END get_vendor_order_stats;
/
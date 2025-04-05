-- PL/SQL Procedures for Vendor Management

-- Create or replace the procedure for creating a new vendor
CREATE OR REPLACE PROCEDURE create_vendor(
    p_user_id IN NUMBER,
    p_business_name IN VARCHAR2,
    p_description IN VARCHAR2,
    p_logo_url IN VARCHAR2,
    p_banner_url IN VARCHAR2,
    p_business_address IN VARCHAR2,
    p_city IN VARCHAR2,
    p_state IN VARCHAR2,
    p_zip_code IN VARCHAR2,
    p_country IN VARCHAR2,
    p_business_phone IN VARCHAR2,
    p_business_email IN VARCHAR2,
    p_website_url IN VARCHAR2,
    p_business_hours IN VARCHAR2,
    p_specialties IN VARCHAR2,
    p_founding_year IN NUMBER,
    p_vendor_id OUT NUMBER
)
AS
BEGIN
    INSERT INTO vendors (
        id,
        user_id,
        business_name,
        description,
        logo_url,
        banner_url,
        business_address,
        city,
        state,
        zip_code,
        country,
        business_phone,
        business_email,
        website_url,
        business_hours,
        specialties,
        founding_year,
        is_verified,
        is_active,
        average_rating,
        created_at
    ) VALUES (
        VENDOR_SEQ.NEXTVAL,
        p_user_id,
        p_business_name,
        p_description,
        p_logo_url,
        p_banner_url,
        p_business_address,
        p_city,
        p_state,
        p_zip_code,
        p_country,
        p_business_phone,
        p_business_email,
        p_website_url,
        p_business_hours,
        p_specialties,
        p_founding_year,
        0, -- is_verified = false
        1, -- is_active = true
        0, -- average_rating = 0
        SYSTIMESTAMP
    ) RETURNING id INTO p_vendor_id;
    
    -- Add the VENDOR role to the user
    BEGIN
        -- Check if role already exists for this user
        DECLARE
            v_exists NUMBER;
        BEGIN
            SELECT COUNT(*)
            INTO v_exists
            FROM user_roles
            WHERE user_id = p_user_id
            AND role = 'VENDOR';
            
            -- Add role only if it doesn't exist
            IF v_exists = 0 THEN
                INSERT INTO user_roles (user_id, role)
                VALUES (p_user_id, 'VENDOR');
            END IF;
        END;
    END;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END create_vendor;
/

-- Create or replace the procedure for updating an existing vendor
CREATE OR REPLACE PROCEDURE update_vendor(
    p_vendor_id IN NUMBER,
    p_business_name IN VARCHAR2,
    p_description IN VARCHAR2,
    p_logo_url IN VARCHAR2,
    p_banner_url IN VARCHAR2,
    p_business_address IN VARCHAR2,
    p_city IN VARCHAR2,
    p_state IN VARCHAR2,
    p_zip_code IN VARCHAR2,
    p_country IN VARCHAR2,
    p_business_phone IN VARCHAR2,
    p_business_email IN VARCHAR2,
    p_website_url IN VARCHAR2,
    p_business_hours IN VARCHAR2,
    p_specialties IN VARCHAR2,
    p_founding_year IN NUMBER
)
AS
BEGIN
    UPDATE vendors
    SET
        business_name = p_business_name,
        description = p_description,
        logo_url = p_logo_url,
        banner_url = p_banner_url,
        business_address = p_business_address,
        city = p_city,
        state = p_state,
        zip_code = p_zip_code,
        country = p_country,
        business_phone = p_business_phone,
        business_email = p_business_email,
        website_url = p_website_url,
        business_hours = p_business_hours,
        specialties = p_specialties,
        founding_year = p_founding_year,
        updated_at = SYSTIMESTAMP
    WHERE id = p_vendor_id;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END update_vendor;
/

-- Create or replace the procedure for getting a vendor by ID
CREATE OR REPLACE PROCEDURE get_vendor_by_id(
    p_vendor_id IN NUMBER,
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
    SELECT
        v.id,
        v.user_id,
        v.business_name,
        v.description,
        v.logo_url,
        v.banner_url,
        v.business_address,
        v.city,
        v.state,
        v.zip_code,
        v.country,
        v.business_phone,
        v.business_email,
        v.website_url,
        v.business_hours,
        v.specialties,
        v.founding_year,
        v.is_verified,
        v.is_active,
        v.average_rating,
        v.created_at,
        v.updated_at,
        u.username,
        u.email,
        u.first_name,
        u.last_name
    FROM vendors v
    JOIN users u ON v.user_id = u.id
    WHERE v.id = p_vendor_id;
END get_vendor_by_id;
/

-- Create or replace the procedure for getting a vendor by user ID
CREATE OR REPLACE PROCEDURE get_vendor_by_user_id(
    p_user_id IN NUMBER,
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
    SELECT
        v.id,
        v.user_id,
        v.business_name,
        v.description,
        v.logo_url,
        v.banner_url,
        v.business_address,
        v.city,
        v.state,
        v.zip_code,
        v.country,
        v.business_phone,
        v.business_email,
        v.website_url,
        v.business_hours,
        v.specialties,
        v.founding_year,
        v.is_verified,
        v.is_active,
        v.average_rating,
        v.created_at,
        v.updated_at
    FROM vendors v
    WHERE v.user_id = p_user_id;
END get_vendor_by_user_id;
/

-- Create or replace the procedure for getting all vendors
CREATE OR REPLACE PROCEDURE get_all_vendors(
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
    SELECT
        v.id,
        v.user_id,
        v.business_name,
        v.description,
        v.logo_url,
        v.banner_url,
        v.business_address,
        v.city,
        v.state,
        v.zip_code,
        v.country,
        v.business_phone,
        v.business_email,
        v.website_url,
        v.business_hours,
        v.specialties,
        v.founding_year,
        v.is_verified,
        v.is_active,
        v.average_rating,
        v.created_at,
        v.updated_at,
        u.username,
        u.first_name,
        u.last_name
    FROM vendors v
    JOIN users u ON v.user_id = u.id
    WHERE v.is_active = 1
    ORDER BY v.business_name;
END get_all_vendors;
/

-- Create or replace the procedure for getting featured vendors
CREATE OR REPLACE PROCEDURE get_featured_vendors(
    p_limit IN NUMBER,
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
    SELECT
        v.id,
        v.user_id,
        v.business_name,
        v.description,
        v.logo_url,
        v.banner_url,
        v.business_address,
        v.city,
        v.state,
        v.zip_code,
        v.country,
        v.business_phone,
        v.business_email,
        v.website_url,
        v.business_hours,
        v.specialties,
        v.founding_year,
        v.is_verified,
        v.is_active,
        v.average_rating,
        v.created_at,
        v.updated_at,
        u.username,
        u.first_name,
        u.last_name
    FROM vendors v
    JOIN users u ON v.user_id = u.id
    WHERE v.is_active = 1 AND v.is_verified = 1
    ORDER BY v.average_rating DESC, v.created_at DESC
    FETCH FIRST p_limit ROWS ONLY;
END get_featured_vendors;
/

-- Create or replace the procedure for verifying a vendor
CREATE OR REPLACE PROCEDURE verify_vendor(
    p_vendor_id IN NUMBER
)
AS
BEGIN
    UPDATE vendors
    SET
        is_verified = 1,
        updated_at = SYSTIMESTAMP
    WHERE id = p_vendor_id;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END verify_vendor;
/

-- Create or replace the procedure for updating a vendor's average rating
CREATE OR REPLACE PROCEDURE update_vendor_rating(
    p_vendor_id IN NUMBER
)
AS
    v_avg_rating NUMBER;
BEGIN
    -- Calculate the average rating of all products from this vendor
    SELECT NVL(AVG(p.average_rating), 0)
    INTO v_avg_rating
    FROM products p
    WHERE p.vendor_id = p_vendor_id
    AND p.average_rating IS NOT NULL;
    
    -- Update the vendor's average rating
    UPDATE vendors
    SET
        average_rating = v_avg_rating,
        updated_at = SYSTIMESTAMP
    WHERE id = p_vendor_id;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END update_vendor_rating;
/
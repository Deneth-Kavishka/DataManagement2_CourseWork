-- PL/SQL Procedures for User Management

-- Create or replace the procedure for creating a new user
CREATE OR REPLACE PROCEDURE create_user(
    p_username IN VARCHAR2,
    p_email IN VARCHAR2,
    p_password IN VARCHAR2,
    p_first_name IN VARCHAR2,
    p_last_name IN VARCHAR2,
    p_phone IN VARCHAR2,
    p_address IN VARCHAR2,
    p_city IN VARCHAR2,
    p_state IN VARCHAR2,
    p_zip_code IN VARCHAR2,
    p_country IN VARCHAR2,
    p_user_id OUT NUMBER
)
AS
BEGIN
    INSERT INTO users (
        id,
        username,
        email,
        password,
        first_name,
        last_name,
        phone,
        address,
        city,
        state,
        zip_code,
        country,
        is_active,
        created_at
    ) VALUES (
        USER_SEQ.NEXTVAL,
        p_username,
        p_email,
        p_password,
        p_first_name,
        p_last_name,
        p_phone,
        p_address,
        p_city,
        p_state,
        p_zip_code,
        p_country,
        1,
        SYSTIMESTAMP
    ) RETURNING id INTO p_user_id;
    
    -- Insert default 'USER' role for the new user
    INSERT INTO user_roles (user_id, role) VALUES (p_user_id, 'USER');
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END create_user;
/

-- Create or replace the procedure for updating an existing user
CREATE OR REPLACE PROCEDURE update_user(
    p_user_id IN NUMBER,
    p_email IN VARCHAR2,
    p_first_name IN VARCHAR2,
    p_last_name IN VARCHAR2,
    p_phone IN VARCHAR2,
    p_address IN VARCHAR2,
    p_city IN VARCHAR2,
    p_state IN VARCHAR2,
    p_zip_code IN VARCHAR2,
    p_country IN VARCHAR2,
    p_profile_image IN VARCHAR2
)
AS
BEGIN
    UPDATE users
    SET
        email = p_email,
        first_name = p_first_name,
        last_name = p_last_name,
        phone = p_phone,
        address = p_address,
        city = p_city,
        state = p_state,
        zip_code = p_zip_code,
        country = p_country,
        profile_image = p_profile_image,
        updated_at = SYSTIMESTAMP
    WHERE id = p_user_id;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END update_user;
/

-- Create or replace the procedure for getting a user by ID
CREATE OR REPLACE PROCEDURE get_user_by_id(
    p_user_id IN NUMBER,
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
    SELECT
        u.id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.address,
        u.city,
        u.state,
        u.zip_code,
        u.country,
        u.profile_image,
        u.is_active,
        u.created_at,
        u.updated_at,
        u.last_login
    FROM users u
    WHERE u.id = p_user_id;
END get_user_by_id;
/

-- Create or replace the procedure for getting a user by username
CREATE OR REPLACE PROCEDURE get_user_by_username(
    p_username IN VARCHAR2,
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
    SELECT
        u.id,
        u.username,
        u.email,
        u.password,
        u.first_name,
        u.last_name,
        u.phone,
        u.address,
        u.city,
        u.state,
        u.zip_code,
        u.country,
        u.profile_image,
        u.is_active,
        u.created_at,
        u.updated_at,
        u.last_login
    FROM users u
    WHERE u.username = p_username;
END get_user_by_username;
/

-- Create or replace the procedure for getting a user's roles
CREATE OR REPLACE PROCEDURE get_user_roles(
    p_user_id IN NUMBER,
    p_result OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_result FOR
    SELECT role
    FROM user_roles
    WHERE user_id = p_user_id;
END get_user_roles;
/

-- Create or replace the procedure for adding a role to a user
CREATE OR REPLACE PROCEDURE add_user_role(
    p_user_id IN NUMBER,
    p_role IN VARCHAR2
)
AS
    v_exists NUMBER;
BEGIN
    -- Check if role already exists for this user
    SELECT COUNT(*)
    INTO v_exists
    FROM user_roles
    WHERE user_id = p_user_id
    AND role = p_role;
    
    -- Add role only if it doesn't exist
    IF v_exists = 0 THEN
        INSERT INTO user_roles (user_id, role)
        VALUES (p_user_id, p_role);
        COMMIT;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END add_user_role;
/

-- Create or replace the procedure for removing a role from a user
CREATE OR REPLACE PROCEDURE remove_user_role(
    p_user_id IN NUMBER,
    p_role IN VARCHAR2
)
AS
BEGIN
    DELETE FROM user_roles
    WHERE user_id = p_user_id
    AND role = p_role;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END remove_user_role;
/

-- Create or replace the procedure for updating a user's password
CREATE OR REPLACE PROCEDURE update_user_password(
    p_user_id IN NUMBER,
    p_password IN VARCHAR2
)
AS
BEGIN
    UPDATE users
    SET
        password = p_password,
        updated_at = SYSTIMESTAMP
    WHERE id = p_user_id;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END update_user_password;
/

-- Create or replace the procedure for updating a user's last login timestamp
CREATE OR REPLACE PROCEDURE update_user_last_login(
    p_user_id IN NUMBER
)
AS
BEGIN
    UPDATE users
    SET last_login = SYSTIMESTAMP
    WHERE id = p_user_id;
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END update_user_last_login;
/
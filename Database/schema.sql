-- ============================================================
-- ERP SYSTEM - DATABASE SCHEMA
-- PostgreSQL
-- ============================================================

-- ============================================================
-- 1. USERS
-- ============================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(150) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'SALES_USER',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT users_role_check
        CHECK (role IN ('ADMIN', 'SALES_USER'))
);


-- ============================================================
-- 2. CUSTOMERS
-- ============================================================

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,

    company_name VARCHAR(150) NOT NULL,

    contact_person VARCHAR(100) NOT NULL,

    mobile VARCHAR(20) NOT NULL,
    CONSTRAINT customers_mobile_check
        CHECK (mobile ~ '[0-9]{10}$'),

    email VARCHAR(150),

    city VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 3. PRODUCTS
-- ============================================================

CREATE TABLE products (
    id SERIAL PRIMARY KEY,

    product_code VARCHAR(50) UNIQUE NOT NULL,

    name VARCHAR(150) NOT NULL,

    category VARCHAR(100) NOT NULL,

    unit VARCHAR(30) NOT NULL,

    base_price NUMERIC(12,2) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT product_base_price_check
        CHECK (base_price >= 0)
);


-- ============================================================
-- 4. INVENTORY
-- ============================================================

CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,

    product_id INTEGER NOT NULL UNIQUE,

    physical_quantity INTEGER NOT NULL DEFAULT 0,

    reserved_quantity INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT inventory_physical_check
        CHECK (physical_quantity >= 0),

    CONSTRAINT inventory_reserved_check
        CHECK (reserved_quantity >= 0),

    CONSTRAINT inventory_reserved_limit
        CHECK (reserved_quantity <= physical_quantity)
);


-- ============================================================
-- 5. ENQUIRIES
-- ============================================================

CREATE TABLE enquiries (
    id SERIAL PRIMARY KEY,

    enquiry_number VARCHAR(50) UNIQUE NOT NULL,

    customer_id INTEGER NOT NULL,

    enquiry_date DATE NOT NULL DEFAULT CURRENT_DATE,

    required_date DATE,

    notes TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'NEW',

    created_by INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_enquiry_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id),

    CONSTRAINT fk_enquiry_user
        FOREIGN KEY (created_by)
        REFERENCES users(id),

    CONSTRAINT enquiry_status_check
        CHECK (
            status IN (
                'NEW',
                'QUOTED',
                'WON',
                'LOST'
            )
        )
);


-- ============================================================
-- 6. ENQUIRY ITEMS
-- ============================================================

CREATE TABLE enquiry_items (
    id SERIAL PRIMARY KEY,

    enquiry_id INTEGER NOT NULL,

    product_id INTEGER NOT NULL,

    quantity INTEGER NOT NULL,

    CONSTRAINT fk_enquiry_item_enquiry
        FOREIGN KEY (enquiry_id)
        REFERENCES enquiries(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_enquiry_item_product
        FOREIGN KEY (product_id)
        REFERENCES products(id),

    CONSTRAINT enquiry_item_quantity_check
        CHECK (quantity > 0),

    CONSTRAINT unique_enquiry_product
        UNIQUE (enquiry_id, product_id)
);


-- ============================================================
-- 7. QUOTATIONS
-- ============================================================

CREATE TABLE quotations (
    id SERIAL PRIMARY KEY,

    quotation_number VARCHAR(50) UNIQUE NOT NULL,

    enquiry_id INTEGER NOT NULL UNIQUE,

    customer_id INTEGER NOT NULL,

    quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,

    valid_until DATE,

    discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,

    gst_percent NUMERIC(5,2) NOT NULL DEFAULT 18,

    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,

    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,

    gst_amount NUMERIC(12,2) NOT NULL DEFAULT 0,

    grand_total NUMERIC(12,2) NOT NULL DEFAULT 0,

    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',

    created_by INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_quotation_enquiry
        FOREIGN KEY (enquiry_id)
        REFERENCES enquiries(id),

    CONSTRAINT fk_quotation_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id),

    CONSTRAINT fk_quotation_user
        FOREIGN KEY (created_by)
        REFERENCES users(id),

    CONSTRAINT quotation_status_check
        CHECK (
            status IN (
                'DRAFT',
                'SENT',
                'ACCEPTED',
                'REJECTED'
            )
        ),

    CONSTRAINT quotation_discount_check
        CHECK (
            discount_percent >= 0
            AND discount_percent <= 100
        ),

    CONSTRAINT quotation_gst_check
        CHECK (gst_percent >= 0),

    CONSTRAINT quotation_subtotal_check
        CHECK (subtotal >= 0),

    CONSTRAINT quotation_total_check
        CHECK (grand_total >= 0)
);


-- ============================================================
-- 8. QUOTATION ITEMS
-- ============================================================

CREATE TABLE quotation_items (
    id SERIAL PRIMARY KEY,

    quotation_id INTEGER NOT NULL,

    product_id INTEGER NOT NULL,

    quantity INTEGER NOT NULL,

    unit_price NUMERIC(12,2) NOT NULL,

    discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,

    gst_percent NUMERIC(5,2) NOT NULL DEFAULT 18,

    line_amount NUMERIC(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT fk_quotation_item_quotation
        FOREIGN KEY (quotation_id)
        REFERENCES quotations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_quotation_item_product
        FOREIGN KEY (product_id)
        REFERENCES products(id),

    CONSTRAINT quotation_item_quantity_check
        CHECK (quantity > 0),

    CONSTRAINT quotation_item_price_check
        CHECK (unit_price >= 0),

    CONSTRAINT quotation_item_discount_check
        CHECK (
            discount_percent >= 0
            AND discount_percent <= 100
        ),

    CONSTRAINT quotation_item_gst_check
        CHECK (gst_percent >= 0),

    CONSTRAINT quotation_item_amount_check
        CHECK (line_amount >= 0),

    CONSTRAINT unique_quotation_product
        UNIQUE (quotation_id, product_id)
);


-- ============================================================
-- 9. SALES ORDERS
-- ============================================================

CREATE TABLE sales_orders (
    id SERIAL PRIMARY KEY,

    order_number VARCHAR(50) UNIQUE NOT NULL,

    customer_id INTEGER NOT NULL,

    quotation_id INTEGER NOT NULL UNIQUE,

    order_date DATE NOT NULL DEFAULT CURRENT_DATE,

    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    created_by INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sales_order_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id),

    CONSTRAINT fk_sales_order_quotation
        FOREIGN KEY (quotation_id)
        REFERENCES quotations(id),

    CONSTRAINT fk_sales_order_user
        FOREIGN KEY (created_by)
        REFERENCES users(id),

    CONSTRAINT sales_order_status_check
        CHECK (
            status IN (
                'PENDING',
                'CONFIRMED',
                'DISPATCHED',
                'CANCELLED'
            )
        ),

    CONSTRAINT sales_order_total_check
        CHECK (total_amount >= 0)
);


-- ============================================================
-- 10. SALES ORDER ITEMS
-- ============================================================

CREATE TABLE sales_order_items (
    id SERIAL PRIMARY KEY,

    sales_order_id INTEGER NOT NULL,

    product_id INTEGER NOT NULL,

    quantity INTEGER NOT NULL,

    unit_price NUMERIC(12,2) NOT NULL,

    CONSTRAINT fk_sales_item_order
        FOREIGN KEY (sales_order_id)
        REFERENCES sales_orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_sales_item_product
        FOREIGN KEY (product_id)
        REFERENCES products(id),

    CONSTRAINT sales_item_quantity_check
        CHECK (quantity > 0),

    CONSTRAINT sales_item_price_check
        CHECK (unit_price >= 0),

    CONSTRAINT unique_sales_order_product
        UNIQUE (sales_order_id, product_id)
);


-- ============================================================
-- 11. DISPATCHES
-- ============================================================

CREATE TABLE dispatches (
    id SERIAL PRIMARY KEY,

    dispatch_number VARCHAR(50) UNIQUE NOT NULL,

    sales_order_id INTEGER NOT NULL UNIQUE,

    dispatch_date DATE NOT NULL DEFAULT CURRENT_DATE,

    vehicle_number VARCHAR(50) NOT NULL,

    driver_name VARCHAR(100) NOT NULL,

    created_by INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_dispatch_sales_order
        FOREIGN KEY (sales_order_id)
        REFERENCES sales_orders(id),

    CONSTRAINT fk_dispatch_user
        FOREIGN KEY (created_by)
        REFERENCES users(id)
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_enquiries_customer
    ON enquiries(customer_id);

CREATE INDEX idx_enquiries_status
    ON enquiries(status);

CREATE INDEX idx_enquiry_items_enquiry
    ON enquiry_items(enquiry_id);

CREATE INDEX idx_quotations_enquiry
    ON quotations(enquiry_id);

CREATE INDEX idx_quotations_status
    ON quotations(status);

CREATE INDEX idx_quotation_items_quotation
    ON quotation_items(quotation_id);

CREATE INDEX idx_sales_orders_customer
    ON sales_orders(customer_id);

CREATE INDEX idx_sales_orders_status
    ON sales_orders(status);

CREATE INDEX idx_sales_order_items_order
    ON sales_order_items(sales_order_id);

CREATE INDEX idx_inventory_product
    ON inventory(product_id);

CREATE INDEX idx_dispatches_order
    ON dispatches(sales_order_id);


-- ============================================================
-- SAMPLE INDUSTRIAL PRODUCT CATALOG AND OPENING STOCK
-- ============================================================

INSERT INTO products (product_code, name, category, unit, base_price)
VALUES
    ('IND-A', 'Industrial Product A', 'Pumps & Valves', 'pcs', 1250.00),
    ('IND-B', 'Industrial Product B', 'Bearings', 'pcs', 840.00),
    ('IND-C', 'Industrial Product C', 'Hydraulics', 'pcs', 2150.00),
    ('IND-D', 'Centrifugal Pump 2HP', 'Pumps & Valves', 'pcs', 18600.00),
    ('IND-E', 'Taper Roller Bearing', 'Bearings', 'pcs', 975.00),
    ('IND-F', 'Hydraulic Hose 1m', 'Hydraulics', 'm', 620.00)
ON CONFLICT (product_code) DO NOTHING;

INSERT INTO inventory (product_id, physical_quantity, reserved_quantity)
SELECT p.id, seed.physical_quantity, seed.reserved_quantity
FROM (
    VALUES
        ('IND-A', 200, 60),
        ('IND-B', 100, 30),
        ('IND-C', 300, 0),
        ('IND-D', 45, 5),
        ('IND-E', 500, 80),
        ('IND-F', 750, 125)
) AS seed(product_code, physical_quantity, reserved_quantity)
JOIN products p ON p.product_code = seed.product_code
ON CONFLICT (product_id) DO NOTHING;
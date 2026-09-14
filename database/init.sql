CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    cost_price DECIMAL(12,2) NOT NULL CHECK (cost_price >= 0),
    selling_price DECIMAL(12,2) NOT NULL CHECK (selling_price >= 0),
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    min_stock_alert INT NOT NULL DEFAULT 5 CHECK (min_stock_alert >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('IN', 'OUT')),
    quantity INT NOT NULL CHECK (quantity > 0),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    profit DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INT REFERENCES sales(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL
);

INSERT INTO categories (name)
VALUES
    ('Électronique'),
    ('Alimentation'),
    ('Vêtements')
ON CONFLICT (name) DO NOTHING;

INSERT INTO products
(name, category_id, cost_price, selling_price, quantity, min_stock_alert)
SELECT 'Téléphone Smartphone',
       id,
       50000,
       75000,
       10,
       3
FROM categories
WHERE name = 'Électronique'
AND NOT EXISTS (
    SELECT 1 FROM products WHERE name = 'Téléphone Smartphone'
);

INSERT INTO products
(name, category_id, cost_price, selling_price, quantity, min_stock_alert)
SELECT 'Sac de Riz 25kg',
       id,
       12000,
       15000,
       2,
       5
FROM categories
WHERE name = 'Alimentation'
AND NOT EXISTS (
    SELECT 1 FROM products WHERE name = 'Sac de Riz 25kg'
);
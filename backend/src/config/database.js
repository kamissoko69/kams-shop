const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "kams_admin",
  host: process.env.DB_HOST || "kams-stock-db",
  database: process.env.DB_NAME || "kams_stock_db",
  password: process.env.DB_PASSWORD || "kams_secure_pass",
  port: Number(process.env.DB_PORT || 5432),
});

pool.on("error", (err) => {
  console.error("PostgreSQL error:", err);
});

module.exports = pool;
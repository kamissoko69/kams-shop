const pool = require("../config/database");

exports.getStats = async (req, res, next) => {
  try {
    const products = await pool.query(`
      SELECT
        COUNT(*)::int AS total_products,
        COUNT(*) FILTER (
          WHERE quantity <= min_stock_alert
        )::int AS low_stock_count,
        COALESCE(SUM(quantity), 0)::int AS total_units,
        COALESCE(SUM(quantity * selling_price), 0)::numeric AS stock_value
      FROM products
    `);

    const sales = await pool.query(`
      SELECT
        COUNT(*)::int AS sales_count,
        COALESCE(SUM(total_amount), 0)::numeric AS revenue,
        COALESCE(SUM(profit), 0)::numeric AS profit
      FROM sales
    `);

    const recentSales = await pool.query(`
      SELECT
        s.id,
        s.total_amount,
        s.profit,
        s.created_at
      FROM sales s
      ORDER BY s.created_at DESC
      LIMIT 5
    `);

    const lowStock = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.quantity,
        p.min_stock_alert,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.quantity <= p.min_stock_alert
      ORDER BY p.quantity ASC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        ...products.rows[0],
        ...sales.rows[0],
        recent_sales: recentSales.rows,
        low_stock_products: lowStock.rows
      }
    });
  } catch (err) {
    next(err);
  }
};
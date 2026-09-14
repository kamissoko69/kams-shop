const pool = require("../config/database");

exports.getProducts = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        p.*,
        c.name AS category_name,
        CASE
          WHEN p.quantity = 0 THEN 'out'
          WHEN p.quantity <= p.min_stock_alert THEN 'low'
          ELSE 'ok'
        END AS stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      category_id,
      cost_price,
      selling_price,
      quantity,
      min_stock_alert
    } = req.body;

    if (!name || cost_price === undefined || selling_price === undefined) {
      return res.status(400).json({
        success: false,
        error: "Nom, prix d'achat et prix de vente sont obligatoires."
      });
    }

    const result = await pool.query(
      `INSERT INTO products
       (name, category_id, cost_price, selling_price, quantity, min_stock_alert)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [
        name.trim(),
        category_id || null,
        Number(cost_price),
        Number(selling_price),
        Number(quantity || 0),
        Number(min_stock_alert || 5)
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};
const pool = require("../config/database");

exports.addStockMovement = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const {
      product_id,
      type,
      quantity,
      reason
    } = req.body;

    const qty = Number(quantity);

    if (!product_id || !["IN", "OUT"].includes(type) || !qty || qty <= 0) {
      return res.status(400).json({
        success: false,
        error: "Données de mouvement invalides."
      });
    }

    await client.query("BEGIN");

    const productResult = await client.query(
      `SELECT id, name, quantity
       FROM products
       WHERE id = $1
       FOR UPDATE`,
      [product_id]
    );

    if (productResult.rows.length === 0) {
      throw new Error("Produit introuvable.");
    }

    const product = productResult.rows[0];

    if (type === "OUT" && product.quantity < qty) {
      throw new Error(
        `Stock insuffisant. Stock actuel : ${product.quantity}.`
      );
    }

    const newQuantity =
      type === "IN"
        ? product.quantity + qty
        : product.quantity - qty;

    await client.query(
      `UPDATE products
       SET quantity = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [newQuantity, product_id]
    );

    const movement = await client.query(
      `INSERT INTO stock_movements
       (product_id, type, quantity, reason)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [
        product_id,
        type,
        qty,
        reason || (type === "IN" ? "Entrée de stock" : "Sortie de stock")
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      data: movement.rows[0]
    });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
};

exports.getMovements = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        sm.*,
        p.name AS product_name
      FROM stock_movements sm
      JOIN products p ON p.id = sm.product_id
      ORDER BY sm.created_at DESC
      LIMIT 100
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
};
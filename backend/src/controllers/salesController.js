const pool = require("../config/database");

exports.createSale = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "La vente doit contenir au moins un produit."
      });
    }

    await client.query("BEGIN");

    let totalAmount = 0;
    let totalProfit = 0;
    const preparedItems = [];

    for (const item of items) {
      const productId = Number(item.product_id);
      const quantity = Number(item.quantity);

      if (!productId || !quantity || quantity <= 0) {
        throw new Error("Article de vente invalide.");
      }

      const result = await client.query(
        `SELECT id, name, cost_price, selling_price, quantity
         FROM products
         WHERE id = $1
         FOR UPDATE`,
        [productId]
      );

      if (result.rows.length === 0) {
        throw new Error(`Produit ${productId} introuvable.`);
      }

      const product = result.rows[0];

      if (product.quantity < quantity) {
        throw new Error(
          `Stock insuffisant pour "${product.name}".`
        );
      }

      const unitPrice = Number(product.selling_price);
      const costPrice = Number(product.cost_price);

      const subtotal = unitPrice * quantity;
      const profit = (unitPrice - costPrice) * quantity;

      totalAmount += subtotal;
      totalProfit += profit;

      preparedItems.push({
        productId,
        quantity,
        unitPrice,
        subtotal
      });
    }

    const saleResult = await client.query(
      `INSERT INTO sales (total_amount, profit)
       VALUES ($1,$2)
       RETURNING *`,
      [totalAmount, totalProfit]
    );

    const saleId = saleResult.rows[0].id;

    for (const item of preparedItems) {
      await client.query(
        `INSERT INTO sale_items
         (sale_id, product_id, quantity, unit_price, subtotal)
         VALUES ($1,$2,$3,$4,$5)`,
        [
          saleId,
          item.productId,
          item.quantity,
          item.unitPrice,
          item.subtotal
        ]
      );

      await client.query(
        `UPDATE products
         SET quantity = quantity - $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [item.quantity, item.productId]
      );

      await client.query(
        `INSERT INTO stock_movements
         (product_id, type, quantity, reason)
         VALUES ($1,'OUT',$2,$3)`,
        [
          item.productId,
          item.quantity,
          `Vente #${saleId}`
        ]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      data: saleResult.rows[0]
    });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
};

exports.getSales = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM sales
      ORDER BY created_at DESC
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
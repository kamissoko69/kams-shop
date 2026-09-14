const pool = require("../config/database");

exports.getCategories = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.name,
        c.created_at,
        COUNT(p.id)::int AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Le nom de la catégorie est obligatoire."
      });
    }

    const result = await pool.query(
      `INSERT INTO categories (name)
       VALUES ($1)
       RETURNING *`,
      [name]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        error: "Cette catégorie existe déjà."
      });
    }

    next(err);
  }
};
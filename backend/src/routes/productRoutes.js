const express = require("express");
const router = express.Router();

const controller = require("../controllers/productController");

router.get("/", controller.getProducts);
router.post("/", controller.createProduct);

module.exports = router;
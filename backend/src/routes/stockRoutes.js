const express = require("express");
const router = express.Router();

const controller = require("../controllers/stockController");

router.get("/movements", controller.getMovements);
router.post("/movement", controller.addStockMovement);

module.exports = router;
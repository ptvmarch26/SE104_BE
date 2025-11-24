const express = require("express");
const router = express.Router();
const exportController = require("../controllers/Export.controller");

router.get("/inventory-excel", exportController.exportInventoryExcel);
router.get("/monthly-revenue", exportController.exportMonthlyRevenue);

module.exports = router;

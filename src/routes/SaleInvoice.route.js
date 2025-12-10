const saleInvoiceController = require("../controllers/SaleInvoice.controller");
const express = require("express");
const {
  verifyToken,
  identifyAdminOrSales,
} = require("../middlewares/AuthMiddleWare");
const router = express.Router();

router.post(
  "/create",
  verifyToken,
  identifyAdminOrSales,
  saleInvoiceController.createSaleInvoice
);

router.get(
  "/:id?",
  verifyToken,
  identifyAdminOrSales,
  saleInvoiceController.getSaleInvoices
);

module.exports = router;

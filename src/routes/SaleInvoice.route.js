const saleInvoiceController = require("../controllers/SaleInvoice.controller");
const express = require("express");
const router = express.Router();

router.post("/create", saleInvoiceController.createSaleInvoice);

router.get("/:id?", saleInvoiceController.getSaleInvoices);

module.exports = router;

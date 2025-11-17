const SupplierController = require("../controllers/Supplier.controller");
const express = require("express");
const router = express.Router();

router.post("/create", SupplierController.createSupplier);

router.get("/:id?", SupplierController.getSuppliers);

router.patch("/:id", SupplierController.updateSupplier);

router.delete("/:id", SupplierController.deleteSupplier);

module.exports = router;

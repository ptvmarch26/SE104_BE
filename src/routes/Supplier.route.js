const SupplierController = require("../controllers/Supplier.controller");
const express = require("express");
const router = express.Router();
const {
  verifyToken,
  identifyAdminOrWarehouse,
} = require("../middlewares/AuthMiddleWare");

router.post(
  "/create",
  verifyToken,
  identifyAdminOrWarehouse,
  SupplierController.createSupplier
);

router.get(
  "/:id?",
  verifyToken,
  identifyAdminOrWarehouse,
  SupplierController.getSuppliers
);

router.patch(
  "/:id",
  verifyToken,
  identifyAdminOrWarehouse,
  SupplierController.updateSupplier
);

router.delete(
  "/:id",
  verifyToken,
  identifyAdminOrWarehouse,
  SupplierController.deleteSupplier
);

module.exports = router;

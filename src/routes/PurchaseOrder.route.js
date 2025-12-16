const PuchaseOrderController = require("../controllers/PurchaseOrder.controller");
const express = require("express");
const {
  verifyToken,
  identifyAdminOrSales,
  identifyAdminOrWarehouse,
} = require("../middlewares/AuthMiddleWare");
const router = express.Router();

router.post(
  "/create",
  verifyToken,
  identifyAdminOrWarehouse,
  PuchaseOrderController.createPurchaseOrder
);

router.get(
  "/:id?",
  verifyToken,
  identifyAdminOrWarehouse,
  PuchaseOrderController.getPurchaseOrders
);

router.patch(
  "/update/:id",
  verifyToken,
  identifyAdminOrWarehouse,
  PuchaseOrderController.updatePurchaseOrder
);

module.exports = router;

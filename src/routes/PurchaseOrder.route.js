const PuchaseOrderController = require("../controllers/PurchaseOrder.controller");
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
  PuchaseOrderController.createPurchaseOrder
);

router.get(
  "/:id?",
  verifyToken,
  identifyAdminOrSales,
  PuchaseOrderController.getPurchaseOrders
);

router.patch(
  "/update/:id",
  verifyToken,
  identifyAdminOrSales,
  PuchaseOrderController.updatePurchaseOrder
);

module.exports = router;

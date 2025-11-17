const PuchaseOrderController = require("../controllers/PurchaseOrder.controller");
const express = require("express");
const router = express.Router();

router.post("/create", PuchaseOrderController.createPurchaseOrder);

router.get("/:id?", PuchaseOrderController.getPurchaseOrders);

router.patch("/update/:id", PuchaseOrderController.updatePurchaseOrder);

module.exports = router;

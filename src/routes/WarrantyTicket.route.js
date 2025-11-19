const express = require("express");
const router = express.Router();
const warrantyController = require("../controllers/WarrantyTicket.controller");
const { identifyAdmin, verifyToken } = require("../middlewares/AuthMiddleWare");

router.post("/ticket", warrantyController.createWarrantyTicket);

router.get(
  "/tickets",
  verifyToken,
  identifyAdmin,
  warrantyController.getWarrantyTickets
);

router.get(
  "/ticket/:id",
  verifyToken,
  identifyAdmin,
  warrantyController.getWarrantyTicketById
);

router.patch(
  "/ticket/:id/status",
  verifyToken,
  identifyAdmin,
  warrantyController.updateWarrantyStatus
);

module.exports = router;

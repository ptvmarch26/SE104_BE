const express = require("express");
const router = express.Router();
const warrantyController = require("../controllers/WarrantyTicket.controller");
const { identifyAdmin } = require("../middlewares/AuthMiddleWare");

router.post("/ticket", warrantyController.createWarrantyTicket);

router.get("/tickets", identifyAdmin, warrantyController.getWarrantyTickets);

router.patch("/ticket/:id/status", identifyAdmin, warrantyController.updateWarrantyStatus);

module.exports = router;

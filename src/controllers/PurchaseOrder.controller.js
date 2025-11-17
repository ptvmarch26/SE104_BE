const purchaseOrderService = require("../services/PurchaseOrder.service");

const createPurchaseOrder = async (req, res) => {
  try {
    const purchaseOrderData = { ...req.body };
    const result = await purchaseOrderService.createPurchaseOrder(
      purchaseOrderData
    );
    result.EC === 0
      ? res.success(result.data, result.EM)
      : res.error(result.EC, result.EM);
  } catch (error) {
    console.error("Error in createPurchaseOrder:", error);
    return res.InternalError();
  }
};

const getPurchaseOrders = async (req, res) => {
  try {
    const purchaseOrderId = req.params.id;
    const result = await purchaseOrderService.getPurchaseOrders(
      purchaseOrderId
    );
    result.EC === 0
      ? res.success(result.data, result.EM)
      : res.error(result.EC, result.EM);
  } catch (error) {
    console.error("Error in getPurchaseOrders:", error);
    return res.InternalError();
  }
};

const updatePurchaseOrder = async (req, res) => {
  try {
    const purchaseOrderId = req.params.id;
    const updateData = { ...req.body };
    const result = await purchaseOrderService.updatePurchaseOrder(
      purchaseOrderId,
      updateData
    );
    result.EC === 0
      ? res.success(result.data, result.EM)
      : res.error(result.EC, result.EM);
  } catch (error) {
    console.error("Error in updatePurchaseOrder:", error);
    return res.InternalError();
  }
};

module.exports = {
  createPurchaseOrder,
  getPurchaseOrders,
  updatePurchaseOrder,
};

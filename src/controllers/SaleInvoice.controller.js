const saleInvoiceService = require("../services/SaleInvoice.service");

const createSaleInvoice = async (req, res) => {
  try {
    const saleInvoiceData = { ...req.body };
    const result = await saleInvoiceService.createSaleInvoice(saleInvoiceData);
    result.EC === 0
      ? res.success(result.data, result.EM)
      : res.error(result.EC, result.EM);
  } catch (error) {
    console.error("Error in createSaleInvoice:", error);
    return res.InternalError();
  }
};

const getSaleInvoices = async (req, res) => {
  try {
    const saleInvoiceId = req.params.id;
    const result = await saleInvoiceService.getSaleInvoices(saleInvoiceId);
    result.EC === 0
      ? res.success(result.data, result.EM)
      : res.error(result.EC, result.EM);
  } catch (error) {
    console.error("Error in getSaleInvoices:", error);
    return res.InternalError();
  }
};

module.exports = {
  createSaleInvoice,
  getSaleInvoices,
};

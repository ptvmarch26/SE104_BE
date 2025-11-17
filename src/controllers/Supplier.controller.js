const supplierService = require("../services/Supllier.service");

const createSupplier = async (req, res) => {
  try {
    const supplierData = { ...req.body };
    const result = await supplierService.createSupplier(supplierData);

    result.EC === 0
      ? res.success(result.data, result.EM)
      : res.error(result.EC, result.EM);
  } catch (error) {
    console.error("Error in createSupplier:", error);
    return res.InternalError();
  }
};

const getSuppliers = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const result = await supplierService.getSuppliers(supplierId);

    result.EC === 0
      ? res.success(result.data, result.EM)
      : res.error(result.EC, result.EM);
  } catch (error) {
    console.error("Error in getSuppliers:", error);
    return res.InternalError();
  }
};

const updateSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const updateData = { ...req.body };
    const result = await supplierService.updateSupplier(supplierId, updateData);

    result.EC === 0
      ? res.success(result.data, result.EM)
      : res.error(result.EC, result.EM);
  } catch (error) {
    console.error("Error in updateSupplier:", error);
    return res.InternalError();
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const result = await supplierService.deleteSupplier(supplierId);

    result.EC === 0
      ? res.success(result.data, result.EM)
      : res.error(result.EC, result.EM);
  } catch (error) {
    console.error("Error in deleteSupplier:", error);
    return res.InternalError();
  }
};

module.exports = {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
};

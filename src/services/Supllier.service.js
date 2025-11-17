const Supplier = require("../models/Supplier.model");

const createSupplier = async (supplierData) => {
  const supplier = await Supplier.create(supplierData);
  return { EC: 0, EM: "Tạo nhà cung cấp thành công", data: supplier };
};

const getSuppliers = async (supplierId) => {
  if (supplierId) {
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) return { EC: 1, EM: "Nhà cung cấp không tồn tại" };

    return { EC: 0, EM: "Lấy nhà cung cấp thành công", data: supplier };
  }

  const suppliers = await Supplier.find().sort({ createdAt: -1 });
  return { EC: 0, EM: "Lấy tất cả nhà cung cấp thành công", data: suppliers };
};

const updateSupplier = async (supplierId, updateData) => {
  const supplier = await Supplier.findByIdAndUpdate(supplierId, updateData, {
    new: true,
  });

  if (!supplier) return { EC: 1, EM: "Nhà cung cấp không tồn tại" };

  return { EC: 0, EM: "Cập nhật nhà cung cấp thành công", data: supplier };
};

const deleteSupplier = async (supplierId) => {
  const supplier = await Supplier.findByIdAndDelete(supplierId);
  if (!supplier) return { EC: 1, EM: "Nhà cung cấp không tồn tại" };

  return { EC: 0, EM: "Xóa nhà cung cấp thành công", data: supplier };
};

module.exports = {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
};

const e = require("express");
const PuchaseOrder = require("../models/PurchaseOrder.model");
const Product = require("../models/Product.model");
const Supplier = require("../models/Supplier.model");

const createPurchaseOrder = async (purchaseOrderData) => {
  const { supplier, items } = purchaseOrderData;

  if (!items || items.length === 0) {
    return { EC: 1, EM: "Danh sách sản phẩm không được để trống" };
  }

  let totalAmount = 0;

  for (let item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      return { EC: 1, EM: `Sản phẩm với ID ${item.product} không tồn tại` };
    }

    // 1. Tìm Color
    const color = product.colors.find((c) => c.color_name === item.color_name);
    if (!color) {
      return {
        EC: 2,
        EM: `Màu ${item.color_name} không tồn tại trong sản phẩm ${product.product_title}`,
      };
    }

    // 2. Tìm Size
    const variant = color.variants.find(
      (v) => v.variant_size === item.variant_size
    );
    if (!variant) {
      return {
        EC: 3,
        EM: `Size ${item.variant_size} không tồn tại trong màu ${item.color_name} của sản phẩm ${product.product_title}`,
      };
    }

    // 3. SL nhập phải ≥ 10
    if (item.quantity < 10) {
      return {
        EC: 4,
        EM: `Số lượng nhập cho sản phẩm ${product.product_title} phải lớn hơn hoặc bằng 10`,
      };
    }

    // if (variant.variant_countInStock + item.quantity >= 50) {
    //   return {
    //     EC: 5,
    //     EM: `Sản phẩm ${product.product_title} - ${item.color_name} - size ${item.variant_size} có tồn kho (sau nhập) >= 50, không được phép nhập`,
    //   };
    // }

    if (!product.product_display) {
      return {
        EC: 6,
        EM: `Sản phẩm ${product.product_title} đã NGỪNG KINH DOANH, không được phép nhập`,
      };
    }

    // 4. Tăng tồn kho
    variant.variant_countInStock += item.quantity;

    // variant.variant_price = item.importPrice * 1.05; // Cập nhật giá nhập mới

    // 5. Tính thành tiền
    item.total = item.quantity * item.import_price;
    totalAmount += item.total;

    await product.save();

    const supplierDoc = await Supplier.findById(supplier);
    if (supplierDoc) {
      const exist = supplierDoc.import_prices.find(
        (p) => p.product.toString() === item.product
      );

      if (exist) exist.import_price = item.import_price;
      else
        supplierDoc.import_prices.push({
          product: item.product,
          import_price: item.import_price,
        });

      await supplierDoc.save();
    }
  }

  const order = await PuchaseOrder.create({
    supplier,
    items,
    total_amount: totalAmount,
  });

  const populatedOrder = await PuchaseOrder.findById(order._id).populate(
    "supplier",
    "name address phone"
  );

  return {
    EC: 0,
    EM: "Tạo phiếu nhập thành công",
    data: populatedOrder,
  };
};

const getPurchaseOrders = async (purchaseOrderId) => {
  if (purchaseOrderId) {
    const order = await PuchaseOrder.findById(purchaseOrderId).populate(
      "supplier",
      "name address phone"
    );

    if (!order) {
      return { EC: 1, EM: "Phiếu nhập không tồn tại" };
    }

    return { EC: 0, EM: "Lấy phiếu nhập thành công", data: order };
  } else {
    const orders = await PuchaseOrder.find().populate(
      "supplier",
      "name address phone"
    );

    return { EC: 0, EM: "Lấy tất cả phiếu nhập thành công", data: orders };
  }
};

const updatePurchaseOrder = async (purchaseOrderId, updateData) => {
  const order = await PuchaseOrder.findById(purchaseOrderId);
  if (!order) return { EC: 1, EM: "Phiếu nhập không tồn tại" };

  // 1) Update nhà cung cấp nếu có
  if (updateData.supplier) {
    order.supplier = updateData.supplier;
  }

  let itemsToUpdate = [];

  if (updateData.item) itemsToUpdate = [updateData.item];
  else if (Array.isArray(updateData.items)) itemsToUpdate = updateData.items;
  else {
    await order.save();
    const populatedOrder = await PuchaseOrder.findById(order._id).populate(
      "supplier",
      "name address phone"
    );

    return { EC: 0, EM: "Cập nhật thành công", data: populatedOrder };
  }

  // Xử lý từng item
  for (const newItem of itemsToUpdate) {
    // 2) Tìm item cũ theo product + color + size
    const oldItem = order.items.find(
      (i) =>
        i.product.toString() === newItem.product &&
        i.color_name === newItem.color_name &&
        i.variant_size === newItem.variant_size
    );

    if (!oldItem) {
      return {
        EC: -1,
        EM: "Không thể cập nhật: Item không tồn tại trong phiếu nhập",
      };
    }

    // 3) Rollback tồn kho cũ
    const product = await Product.findById(oldItem.product);
    if (!product) return { EC: 2, EM: "Sản phẩm không tồn tại trong hệ thống" };

    const color = product.colors.find(
      (c) => c.color_name === oldItem.color_name
    );
    const variant = color.variants.find(
      (v) => v.variant_size === oldItem.variant_size
    );

    // Trừ tồn kho cũ
    variant.variant_countInStock -= oldItem.quantity;

    // 4) Validate số lượng mới
    if (newItem.quantity < 10) {
      return { EC: 6, EM: "Số lượng nhập phải lớn hơn hoặc bằng 10" };
    }

    // 5) Kiểm tra tồn kho sau cập nhật
    // if (variant.variant_countInStock + newItem.quantity >= 50) {
    //   return { EC: 7, EM: "Tồn kho sau cập nhật lớn hơn 50, không được phép cập nhật" };
    // }

    // 6) Cộng tồn kho mới
    variant.variant_countInStock += newItem.quantity;
    await product.save();

    // 7) Cập nhật item
    oldItem.quantity = newItem.quantity;
    oldItem.import_price = newItem.import_price;
    oldItem.total = newItem.quantity * newItem.import_price;

    // 8) Cập nhật lại giá nhập vào supplier
    const supplierDoc = await Supplier.findById(order.supplier);
    if (supplierDoc) {
      const exist = supplierDoc.import_prices.find(
        (p) => p.product.toString() === newItem.product
      );

      if (exist) exist.import_price = newItem.import_price;
      else {
        supplierDoc.import_prices.push({
          product: newItem.product,
          import_price: newItem.import_price,
        });
      }

      await supplierDoc.save();
    }
  }

  // 9) Update tổng tiền
  order.total_amount = order.items.reduce((sum, i) => sum + i.total, 0);

  await order.save();
  const populatedOrder = await PuchaseOrder.findById(order._id).populate(
    "supplier",
    "name address phone"
  );

  return { EC: 0, EM: "Cập nhật thành công", data: populatedOrder };
};

module.exports = {
  createPurchaseOrder,
  getPurchaseOrders,
  updatePurchaseOrder,
};

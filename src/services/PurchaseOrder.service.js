const e = require("express");
const PuchaseOrder = require("../models/PurchaseOrder.model");
const Product = require("../models/Product.model");

const createPurchaseOrder = async (purchaseOrderData) => {
    try {
        const { supplierName, supplierAddress, supplierPhone, items } = purchaseOrderData;

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
            const color = product.colors.find(c => c.color_name === item.color_name);
            if (!color) {
                return { EC: 2, EM: `Màu ${item.color_name} không tồn tại trong sản phẩm ${product.name}` };
            }

            // 2. Tìm Size
            const variant = color.variants.find(v => v.variant_size === item.variant_size);
            if (!variant) {
                return { EC: 3, EM: `Size ${item.variant_size} không tồn tại trong màu ${item.color_name} của sản phẩm ${product.name}` };
            }

            // 3. SL nhập phải ≥ 10
            if (item.quantity < 10) {
                return { EC: 4, EM: `Số lượng nhập cho sản phẩm ${product.name} phải lớn hơn hoặc bằng 10` };
            }

            // 4. Tăng tồn kho
            variant.variant_countInStock += item.quantity;

            // variant.variant_price = item.importPrice * 1.05; // Cập nhật giá nhập mới

            // 5. Tính thành tiền
            item.total = item.quantity * item.importPrice;
            totalAmount += item.total;

            await product.save();
        }

        // Tạo phiếu nhập
        const order = await PuchaseOrder.create({
            supplierName,
            supplierAddress,
            supplierPhone,
            items,
            totalAmount,
        });

        return { EC: 0, EM: "Tạo phiếu nhập thành công", data: order};
    } catch (error) {
        return { EC: -1, EM: error.message };
    }
}

const getPurchaseOrders = async (purchaseOrderId) => {
    try {
        if (purchaseOrderId) {
            const order = await PuchaseOrder.findById(purchaseOrderId);
            if (!order) {
                return { EC: 1, EM: "Phiếu nhập không tồn tại" };
            }   
            return { EC: 0, EM: "Lấy phiếu nhập thành công", data: order };
        }else {
            const orders = await PuchaseOrder.find();
            return { EC: 0, EM: "Lấy tất cả phiếu nhập thành công", data: orders };
        }
    } catch (error) {
        return { EC: -1, EM: error.message };
    }
};

const updatePurchaseOrder = async (purchaseOrderId, updateData) => {
  try {
    const order = await PuchaseOrder.findById(purchaseOrderId);
    if (!order) return { EC: 1, EM: "Phiếu nhập không tồn tại" };

    // 1) Update thông tin NCC nếu có
    ["supplierName", "supplierAddress", "supplierPhone"].forEach(field => {
      if (updateData[field] !== undefined) {
        order[field] = updateData[field];
      }
    });

    let itemsToUpdate = [];

    if (updateData.item) {
      itemsToUpdate = [updateData.item];     // sửa 1 item
    } 
    else if (Array.isArray(updateData.items)) {
      itemsToUpdate = updateData.items;      // sửa nhiều item
    } 
    else {
      await order.save();
      return { EC: 0, EM: "Cập nhật thành công", data: order };
    }

// 2) Xử lý từng item cần update
    for (const newItem of itemsToUpdate) {
      //tìm item cũ
      const oldItem = order.items.find(i =>
        i.product.toString() === newItem.product &&
        i.color_name === newItem.color_name &&
        i.variant_size === newItem.variant_size
      );

      if (!oldItem) {
        return { EC: -1, EM: "Item cần sửa không tồn tại trong phiếu nhập" };
      }

      //rollback tồn kho cũ 
      const productOld = await Product.findById(oldItem.product);
      if (productOld) {
        const colorOld = productOld.colors.find(c => c.color_name === oldItem.color_name);
        const variantOld = colorOld?.variants.find(v => v.variant_size === oldItem.variant_size);
        if (variantOld) {
          variantOld.variant_countInStock -= oldItem.quantity;
          // variantOld.variant_price -= oldItem.importPrice * 0.05; 
          await productOld.save();
        }
      }

      //update tồn kho mới
      const productNew = await Product.findById(newItem.product);
      if (!productNew) return { ok: false, EM: "Sản phẩm không tồn tại" };

      const colorNew = productNew.colors.find(c => c.color_name === newItem.color_name);
      if (!colorNew) return { ok: false, EM: `Màu ${newItem.color_name} không tồn tại` };

      const variantNew = colorNew.variants.find(v => v.variant_size === newItem.variant_size);
      if (!variantNew) return { ok: false, EM: `Size ${newItem.variant_size} không tồn tại` };

      if (newItem.quantity < 10) {
        return { ok: false, EM: "Số lượng phải ≥ 10" };
      }

      variantNew.variant_countInStock += newItem.quantity;
      await productNew.save();

      // update item trong order
      oldItem.quantity = newItem.quantity;
      oldItem.importPrice = newItem.importPrice;
      oldItem.total = newItem.quantity * newItem.importPrice;
    }

    
    order.totalAmount = order.items.reduce((sum, i) => sum + i.total, 0);

    await order.save();

    return { EC: 0, EM: "Cập nhật thành công", data: order };

  } catch (error) {
    return { EC: -1, EM: error.message };
  }
};


module.exports = {
    createPurchaseOrder,
    getPurchaseOrders,
    updatePurchaseOrder
};
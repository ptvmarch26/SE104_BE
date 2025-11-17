const SaleInvoice = require("../models/SaleInvoice.model");
const Product = require("../models/Product.model");

const createSaleInvoice = async (saleInvoiceData) => {
  const { customer_name, customer_phone, customer_paid, items } =
    saleInvoiceData;

  if (!items || items.length === 0) {
    return { EC: 1, EM: "Danh sách sản phẩm không được để trống" };
  }

  let total_amount = 0;
  let newItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) return { EC: -1, EM: "Không tìm thấy sản phẩm" };

    const color = product.colors.find((c) => c.color_name === item.color_name);

    if (!color) return { EC: -1, EM: `Không tìm thấy màu ${item.color_name}` };

    const variant = color.variants.find(
      (v) => v.variant_size === item.variant_size
    );

    if (!variant) return { EC: -1, EM: "Không tìm thấy biến thể sản phẩm" };

    const sale_price = variant.variant_price;
    const total = sale_price * item.quantity;

    total_amount += total;

    if (variant.variant_countInStock < item.quantity) {
      return {
        EC: -1,
        EM: `Sản phẩm ${product.product_title} không đủ số lượng trong kho`,
      };
    }

    variant.variant_countInStock -= item.quantity;
    await product.save();

    newItems.push({
      product: item.product,
      color_name: item.color_name,
      variant_size: item.variant_size,
      quantity: item.quantity,
      sale_price,
      total,
    });
  }

  const invoice = await SaleInvoice.create({
    customer_name,
    customer_phone,
    items: newItems,
    total_amount,
    customer_paid,
    remaining: total_amount - customer_paid,
  });

  return { EC: 0, EM: "Tạo hóa đơn thành công", data: invoice };
};

const getSaleInvoices = async (saleInvoiceId) => {
  if (saleInvoiceId) {
    const invoice = await SaleInvoice.findById(saleInvoiceId).populate({
      path: "items.product",
      model: "Product",
      select: "product_title colors",
    });
    return { EC: 0, EM: "Lấy hóa đơn thành công", data: invoice };
  } else {
    const invoices = await SaleInvoice.find({}).populate({
      path: "items.product",
      model: "Product",
      select: "product_title colors",
    });
    return { EC: 0, EM: "Lấy danh sách hóa đơn thành công", data: invoices };
  }
};

module.exports = {
  createSaleInvoice,
  getSaleInvoices,
};

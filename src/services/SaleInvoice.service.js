const SaleInvoice = require("../models/SaleInvoice.model");
const Product = require("../models/Product.model");

const createSaleInvoice = async (saleInvoiceData) => {
    try {
        const {customerName, customerPhone, customerPaid, items} = saleInvoiceData;

        if (!items || items.length === 0) {
            return { EC: 1, EM: "Danh sách sản phẩm không được để trống" };
        }

        let totalAmount = 0;

        let newItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) return { EC: -1, EM: "Không tìm thấy sản phẩm" };

            const color = product.colors.find(c => c.color_name === item.color_name);
            const variant = color?.variants.find(v => v.variant_size === item.variant_size);
            if (!variant) return { EC: -1, EM: "Không tìm thấy biến thể sản phẩm" };

            const salePrice = variant.variant_price;
            const total = salePrice * item.quantity;

            totalAmount += total;

            // Trừ tồn kho
            if (variant.variant_countInStock < item.quantity)
                return { EC: -1, EM: `Sản phẩm ${product.product_title} không đủ số lượng trong kho` };

            variant.variant_countInStock -= item.quantity;
            await product.save();

            newItems.push({
                ...item,
                salePrice,
                total
            });
        }

        const invoice = await SaleInvoice.create({
            invoiceNumber: "HD-" + Date.now(),
            customerName,
            customerPhone,
            items: newItems,
            totalAmount,
            customerPaid,
            remaining: totalAmount - customerPaid
        });

        return { EC: 0, EM: "Tạo hóa đơn thành công", data: invoice};
    } catch (error) {
        return { EC: -1, EM: error.message };
    }
}   

const getSaleInvoices = async (saleInvoiceId) => {
    try {
        if (saleInvoiceId) {
            const invoice = await SaleInvoice.findById(saleInvoiceId);
            return { EC: 0, EM: "Lấy hóa đơn thành công", data: invoice };
        } else {
            const invoices = await SaleInvoice.find({});
            return { EC: 0, EM: "Lấy danh sách hóa đơn thành công", data: invoices };
        }
    } catch (error) {
        return { EC: -1, EM: error.message };
    }
}

module.exports = {
    createSaleInvoice,
    getSaleInvoices
};
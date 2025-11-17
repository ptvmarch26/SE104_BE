const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  color_name: { type: String, required: true },    // Màu được nhập
  variant_size: { type: String, required: true },  // Size được nhập
  unit: { type: String, default: "cái" },            // Đơn vị tính
  quantity: { type: Number, required: true, min: 10 },  // ≥10 theo quy định
  importPrice: { type: Number, required: true },       // Đơn giá nhập
  total: {type: Number}                                        // Thành tiền
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    supplierName: { type: String, required: true },
    supplierAddress: String,
    supplierPhone: String,
    items: [orderItemSchema],
    totalAmount: Number,
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "PurchaseOrder",
  }
);

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);

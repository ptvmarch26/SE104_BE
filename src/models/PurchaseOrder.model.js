const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  color_name: { type: String, required: true }, // Màu được nhập
  variant_size: { type: String, required: true }, // Size được nhập
  unit: { type: String, default: "cái" }, // Đơn vị tính
  quantity: { type: Number, required: true, min: 10 }, // ≥10 theo quy định
  import_price: { type: Number, required: true }, // Đơn giá nhập
  total: { type: Number }, // Thành tiền
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    items: [orderItemSchema],
    total_amount: Number,
  },
  {
    timestamps: true,
    collection: "PurchaseOrder",
  }
);

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);

const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: String,
    phone: String,

    // Nếu có lưu đơn giá nhập theo nhà cung cấp
    import_prices: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        import_price: Number,
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "Supplier",
  }
);

module.exports = mongoose.model("Supplier", supplierSchema);

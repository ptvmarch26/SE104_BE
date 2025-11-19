const mongoose = require("mongoose");

const snapshotSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    color: { type: String, required: true },
    size: { type: String, required: true },
    month: { type: String, required: true },
    opening_stock: { type: Number, required: true },
  },
  { timestamps: true, collection: "InventorySnapshot" }
);

module.exports = mongoose.model("InventorySnapshot", snapshotSchema);

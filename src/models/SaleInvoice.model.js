const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  color_name: { type: String, required: true },
  variant_size: { type: String, required: true },

  quantity: { type: Number, required: true, min: 1 },

  sale_price: { type: Number, required: true },
  total: { type: Number, required: true },
});

const SaleInvoiceSchema = new mongoose.Schema(
  {
    invoice_number: { type: String, unique: true },
    customer_name: String,
    customer_phone: String,

    items: [saleItemSchema],

    total_amount: Number,
    customer_paid: Number,
    remaining: Number,
  },

  {
    timestamps: true,
    collection: "SaleInvoice",
  }
);

SaleInvoiceSchema.pre("save", async function (next) {
  if (!this.invoice_number) {
    const count = await mongoose.model("SaleInvoice").countDocuments();
    this.invoice_number = "HD" + String(count + 1).padStart(6, "0");
  }
  next();
});

module.exports = mongoose.model("SaleInvoice", SaleInvoiceSchema);

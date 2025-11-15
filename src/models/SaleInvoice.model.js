const mongoose = require("mongoose");

const SaleInvoiceSchema = new mongoose.Schema({
  invoiceNumber: String,
  createdAt: { type: Date, default: Date.now },

  customerName: String,
  customerPhone: String,

  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      color_name: String,
      variant_size: String,
      quantity: Number,
      importPrice: Number,   
      salePrice: Number,     
      total: Number          
    }
  ],

  totalAmount: Number,
  customerPaid: Number,
  remaining: Number

  
},

{
    timestamps: true,
    collection: "SaleInvoice",
  })

module.exports = mongoose.model("SaleInvoice", SaleInvoiceSchema);

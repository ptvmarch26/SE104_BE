const mongoose = require("mongoose");

const warrantyTicketSchema = new mongoose.Schema(
  {
    customer_name: { type: String, required: true },
    customer_phone: { type: String, required: true },

    ticket_type: {
      type: String,
      enum: ["Bảo hành", "Đổi trả"],
      required: true,
    },

    product: {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      color: { type: String, required: true },
      size: { type: String, required: true },
      order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
      },
    },

    condition: { type: String, required: true },
    reason: { type: String, required: true },
    solution: { type: String, required: true },
    conclusion: { type: String },

    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    status: {
      type: String,
      enum: ["Chờ duyệt", "Đã duyệt", "Từ chối", "Hoàn tất"],
      default: "Chờ duyệt",
    },
  },
  {
    timestamps: true,
    collection: "WarrantyTicket",
  }
);

module.exports = mongoose.model("WarrantyTicket", warrantyTicketSchema);

const WarrantyTicket = require("../models/WarrantyTicket.model");
const Order = require("../models/Order.model");

const createTicket = async (body) => {
  const {
    customer_name,
    customer_phone,
    ticket_type,
    product,
    condition,
    reason,
    solution,
    staff,
  } = body;

  // 1. Validate đơn hàng
  const order = await Order.findById(product.order_id);

  if (order.order_status !== "Hoàn thành") {
    return {
      EC: 1,
      EM: "Chỉ có thể tạo phiếu cho đơn đã hoàn thành",
    };
  }
  if (!order) {
    return {
      EC: 1,
      EM: "Không tìm thấy đơn hàng",
      data: null,
    };
  }

  // 2. Validate sản phẩm nằm trong đơn hàng
  const matched = order.products.find(
    (p) =>
      p.product_id.toString() === product.product_id &&
      p.color === product.color &&
      p.variant === product.size
  );

  if (!matched) {
    return {
      EC: 1,
      EM: "Sản phẩm không thuộc đơn hàng này",
      data: null,
    };
  }

  // 3. Quy định QĐ 3.2 – Đổi trả trong 7 ngày
  if (ticket_type === "Đổi trả") {
    const diffDays =
      (new Date() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24);

    if (diffDays > 7) {
      return {
        EC: 1,
        EM: "Đơn hàng đã quá 7 ngày – không thể đổi/trả",
        data: null,
      };
    }
  }

  const existedTicket = await WarrantyTicket.findOne({
    "product.order_id": product.order_id,
    "product.product_id": product.product_id,
    "product.color": product.color,
    "product.size": product.size,
  });

  if (existedTicket) {
    return {
      EC: 1,
      EM: "Sản phẩm này đã có phiếu bảo hành/đổi trả",
      data: null,
    };
  }

  // 4. Tạo phiếu
  const ticket = await WarrantyTicket.create(body);

  return {
    EC: 0,
    EM: "Tạo phiếu bảo hành/đổi trả thành công",
    data: ticket,
  };
};

const getTickets = async (query) => {
  const { status } = query;

  const filter = {};
  if (status) filter.status = status;

  const tickets = await WarrantyTicket.find(filter)
    .populate("product.product_id", "product_title")
    .populate("staff", "name")
    .populate("manager", "name")
    .sort({ createdAt: -1 });

  return {
    EC: 0,
    EM: "Lấy danh sách phiếu thành công",
    data: tickets,
  };
};

const getTicketById = async (id) => {
  const ticket = await WarrantyTicket.findById(id)
    .populate("product.product_id", "product_title colors product_img")
    .populate("staff", "user_name")
    .populate("manager", "user_name");

  if (!ticket) {
    return {
      EC: 1,
      EM: "Không tìm thấy phiếu bảo hành",
      data: null,
    };
  }

  return {
    EC: 0,
    EM: "Lấy thông tin phiếu thành công",
    data: ticket,
  };
};

const updateStatus = async (id, status, manager) => {
  const ticket = await WarrantyTicket.findById(id);

  if (!ticket) {
    return {
      EC: 1,
      EM: "Không tìm thấy phiếu",
      data: null,
    };
  }

  ticket.status = status;
  ticket.manager = manager;
  await ticket.save();

  return {
    EC: 0,
    EM: "Cập nhật trạng thái thành công",
    data: ticket,
  };
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateStatus,
};

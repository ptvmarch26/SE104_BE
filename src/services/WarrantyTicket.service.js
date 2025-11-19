const WarrantyTicket = require("../models/WarrantyTicket.model");
const Order = require("../models/Order.model");

const createTicket = async (body) => {
  try {
    const {
      customer_name,
      customer_phone,
      ticket_type,
      product,     // { product_id, color, size, order_id }
      condition,
      reason,
      solution,
      staff
    } = body;

    // 1. Validate đơn hàng
    const order = await Order.findById(product.order_id);

    if (!order) {
      return {
        EC: 1,
        EM: "Không tìm thấy đơn hàng",
        data: null
      };
    }

    // 2. Validate sản phẩm nằm trong đơn hàng
    const matched = order.products.find(
      p =>
        p.product_id.toString() === product.product_id &&
        p.color === product.color &&
        p.variant === product.size
    );

    if (!matched) {
      return {
        EC: 1,
        EM: "Sản phẩm không thuộc đơn hàng này",
        data: null
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
          data: null
        };
      }
    }

    // 4. Tạo phiếu
    const ticket = await WarrantyTicket.create(body);

    return {
      EC: 0,
      EM: "Tạo phiếu bảo hành/đổi trả thành công",
      data: ticket,
    };

  } catch (err) {
    return {
      EC: 1,
      EM: "Lỗi tạo phiếu bảo hành/đổi trả",
      data: err.message
    };
  }
};

const getTickets = async (query) => {
  try {
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
      data: tickets
    };

  } catch (err) {
    return {
      EC: 1,
      EM: "Lỗi lấy danh sách phiếu",
      data: err.message
    };
  }
};

const updateStatus = async (id, status, manager) => {
  try {
    const ticket = await WarrantyTicket.findById(id);

    if (!ticket) {
      return {
        EC: 1,
        EM: "Không tìm thấy phiếu",
        data: null
      };
    }

    ticket.status = status;
    ticket.manager = manager;
    await ticket.save();

    return {
      EC: 0,
      EM: "Cập nhật trạng thái thành công",
      data: ticket
    };

  } catch (err) {
    return {
      EC: 1,
      EM: "Lỗi cập nhật phiếu",
      data: err.message
    };
  }
};

module.exports = {
  createTicket,
  getTickets,
  updateStatus
};
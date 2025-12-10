const WarrantyTicket = require("../models/WarrantyTicket.model");
const SaleInvoice = require("../models/SaleInvoice.model");

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

  // 1️⃣ Kiểm tra hóa đơn
  const invoice = await SaleInvoice.findById({
    _id: product.invoice_id,
  });

  if (!invoice) {
    return { EC: 1, EM: "Không tìm thấy hóa đơn phù hợp", data: null };
  }

  // 2️⃣ Kiểm tra sản phẩm có nằm trong hóa đơn không?
  const matched = invoice.items.find(
    (i) =>
      i.product.toString() === product.product_id &&
      i.color_name === product.color &&
      i.variant_size === product.size
  );

  if (!matched) {
    return { EC: 1, EM: "Sản phẩm không thuộc hóa đơn này", data: null };
  }

  // 3️⃣ Đổi trả chỉ áp dụng trong 7 ngày từ ngày mua
  if (ticket_type === "Đổi trả") {
    const diffDays =
      (new Date() - new Date(invoice.createdAt)) / (1000 * 60 * 60 * 24);

    if (diffDays > 7) {
      return {
        EC: 1,
        EM: "Quá hạn 7 ngày kể từ ngày mua – không thể đổi/trả",
        data: null,
      };
    }
  }

  // 4️⃣ Kiểm tra đã tồn tại phiếu cho sản phẩm này chưa
  const existed = await WarrantyTicket.findOne({
    "product.invoice_id": product.invoice_id,
    "product.product_id": product.product_id,
    "product.color": product.color,
    "product.size": product.size,
  });

  if (existed) {
    return {
      EC: 1,
      EM: "Sản phẩm này đã có phiếu bảo hành/đổi trả",
      data: null,
    };
  }

  // 5️⃣ Tạo phiếu bảo hành
  const ticket = await WarrantyTicket.create({
    customer_name,
    customer_phone,
    ticket_type,
    product,
    condition,
    reason,
    solution,
    staff,
  });

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

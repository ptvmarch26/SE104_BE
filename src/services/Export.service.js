const ExcelJS = require("exceljs");
const Order = require("../models/Order.model");
const Product = require("../models/Product.model");
const productService = require("./Product.service");
const categoryService = require("./Category.service");

const parseMonth = (month) => {
  if (!month) return null;
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthNum = Number(monthStr);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(monthNum) ||
    monthNum < 1 ||
    monthNum > 12
  ) {
    return null;
  }
  const start = new Date(Date.UTC(year, monthNum - 1, 1));
  const end = new Date(Date.UTC(year, monthNum, 1));
  return { start, end, label: `${year}-${String(monthNum).padStart(2, "0")}` };
};

exports.exportInventoryExcel = async (month, categoryId) => {
  const reportData = await productService.getInventoryReport(month, categoryId);

  if (reportData.EC !== 0) return reportData;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("BaoCaoTonKho");

  sheet.addRow([
    "Sản phẩm",
    "Màu",
    "Size",
    "Tồn đầu",
    "Nhập trong kỳ",
    "Bán ra",
    "Tồn cuối",
    "Đơn vị",
    "Ghi chú",
  ]);

  reportData.data.report.forEach((item) => {
    sheet.addRow([
      item.product_title,
      item.color,
      item.size,
      item.opening_stock,
      item.imported,
      item.sold,
      item.ending_stock,
      item.unit,
      item.note,
    ]);
  });

  return { EC: 0, EM: "Lập báo cáo tồn kho thành công", workbook };
};

exports.exportMonthlyRevenueExcel = async (month, categoryId) => {
  const parsedMonth = parseMonth(month);
  if (!parsedMonth) {
    return { EC: 1, EM: "Tháng không hợp lệ (YYYY-MM)" };
  }

  const { start, end, label } = parsedMonth;
  const completedStatuses = ["Hoàn thành"];

  const match = {
    createdAt: { $gte: start, $lt: end },
    order_status: { $in: completedStatuses },
  };

  let orders = await Order.find(match)
    .select("order_total_final createdAt products")
    .lean();

  if (categoryId) {
    const productIds = await Product.find({
      product_category: categoryId,
    }).distinct("_id");
    const productSet = new Set(productIds.map((id) => id.toString()));
    orders = orders.filter((order) =>
      order.products?.some((p) => productSet.has(String(p.product_id)))
    );
  }

  let totalRevenue = 0;
  const dailyMap = new Map();

  orders.forEach((order) => {
    const dayKey = order.createdAt
      ? order.createdAt.toISOString().slice(0, 10)
      : label;
    const revenue = Number(order.order_total_final) || 0;

    totalRevenue += revenue;

    const agg = dailyMap.get(dayKey) || { revenue: 0, count: 0 };
    agg.revenue += revenue;
    agg.count += 1;
    dailyMap.set(dayKey, agg);
  });

  const details = Array.from(dailyMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([day, data], index) => ({
      stt: index + 1,
      day,
      orders: data.count,
      revenue: data.revenue,
      rate:
        totalRevenue === 0
          ? 0
          : Number(((data.revenue * 100) / totalRevenue).toFixed(2)),
    }));

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("BaoCaoDoanhThuThang");

  sheet.addRow(["Tháng", label]);
  sheet.addRow(["Tổng doanh thu", totalRevenue]);
  if (categoryId) {
    const result = await categoryService.getDetailCategory(categoryId);
    const category = result.data;
    sheet.addRow([
      "Lọc theo danh mục",
      category
        ? `${category.category_type} - ${category.category_gender}`
        : categoryId,
    ]);
  }

  sheet.addRow([]);
  sheet.addRow(["STT", "Ngày", "Số đơn hàng", "Doanh thu", "Tỉ lệ (%)"]);

  details.forEach((row) => {
    sheet.addRow([row.stt, row.day, row.orders, row.revenue, row.rate]);
  });

  return {
    EC: 0,
    EM: "Lập báo cáo doanh thu tháng thành công",
    workbook,
    data: {
      month: label,
      total_revenue: totalRevenue,
      category_filter: categoryId || null,
      details,
    },
  };
};

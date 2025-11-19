const ExcelJS = require("exceljs");
const productService = require("./Product.service");

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

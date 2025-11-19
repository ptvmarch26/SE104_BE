const exportService = require("../services/Export.service");

exports.exportInventoryExcel = async (req, res) => {
  try {
    const { month, categoryId } = req.query;
    const result = await exportService.exportInventoryExcel(month, categoryId);

    if (result.EC !== 0) {
      return res.status(400).json(result);
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=BaoCaoTonKho_${month}.xlsx`
    );

    await result.workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ EC: 1, EM: "Lỗi export", data: err.message });
  }
};

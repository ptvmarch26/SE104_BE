require("dotenv").config();
const { expressjwt: expressJwt } = require("express-jwt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const verifyToken = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"], // Thuật toán mã hóa JWT
  requestProperty: "user", // Lưu thông tin user vào req.user
});

const identifyAdmin = (req, res, next) => {
  if (req.user?.role === "admin") {
    next();
  } else {
    // chuyển hướng qua trang đăng nhập user
    res.error(1, "Bạn không có quyền truy cập vào trang này", 403);
  }
};

const optionalVerifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // nếu verify thành công, gán user vào req
    } catch (err) {
      console.log("Token không hợp lệ, tiếp tục như khách.");
    }
  }

  next();
};

const identifyAdminOrWarehouse = (req, res, next) => {
  const role = req.user?.role;
  if (role === "admin" || role === "warehouse_staff") {
    return next();
  }
  return res.error(1, "Bạn không có quyền thực hiện hành động này", 403);
};

const identifyAdminOrSales = (req, res, next) => {
  const role = req.user?.role;
  if (role === "admin" || role === "sales_staff") {
    return next();
  }
  return res.error(1, "Bạn không có quyền thực hiện hành động này", 403);
};

module.exports = {
  verifyToken,
  identifyAdmin,
  identifyAdminOrWarehouse,
  identifyAdminOrSales,
  optionalVerifyToken,
};

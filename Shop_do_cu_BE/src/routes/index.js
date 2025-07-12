// Import các router con tương ứng với từng module
const UserRouter = require("./UserRouter");         // Router xử lý API người dùng
const ProductRouter = require("./ProductRouter");   // Router xử lý API sản phẩm
const notificationRouter = require("./notificationRoutes"); // Router xử lý thông báo

// Hàm khởi tạo tất cả các route chính của ứng dụng
const routes = (app) => {
  // Các route API cho người dùng (đăng ký, đăng nhập, v.v.)
  app.use("/api/user", UserRouter);

  // Các route API cho sản phẩm (thêm, sửa, xóa, lấy danh sách,...)
  app.use("/api/product", ProductRouter);

  // Các route API cho thông báo (gửi, nhận, danh sách thông báo,...)
  app.use("/api/notifications", notificationRouter);
};

// Export ra ngoài để sử dụng trong file chính (server.js hoặc index.js)
module.exports = routes;

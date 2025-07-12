// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/NotificationController"); // Đảm bảo đường dẫn đúng
const { authLoggedInUser, authUserMiddleware } = require("../middleware/authMiddleware"); // Giả sử bạn có middleware xác thực để bảo vệ các tuyến này

// Tuyến để lấy tất cả thông báo của một người dùng
// Yêu cầu xác thực để đảm bảo chỉ người dùng đó mới có thể xem thông báo của mình
router.get(
  "/notifications/:id",
  authLoggedInUser,
  NotificationController.getNotificationsByUserId
);

// Tuyến để đánh dấu một thông báo là đã đọc
// Yêu cầu xác thực
router.put(
  "/mark-read/:id",
  authLoggedInUser,
  NotificationController.markNotificationAsRead
);

// tạo 1 thông báo mới
router.post(
  "/create/:id",
  authUserMiddleware,
  NotificationController.createNotification
);

// xóa 1 thông báo mới
router.delete(
  "/delete/:id",
  NotificationController.deleteNotification
);

module.exports = router;

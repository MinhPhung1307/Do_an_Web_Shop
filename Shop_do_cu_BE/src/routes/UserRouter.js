const express = require("express");
const router = express.Router();
const userContronller = require("../controllers/UserController");

// Middleware xác thực quyền truy cập
const {
  authMiddleware,       // Xác thực admin
  authUserMiddleware,   // Xác thực admin hoặc người dùng đặc quyền
  authLoggedInUser,
} = require("../middleware/authMiddleware");

// Đăng ký tài khoản
router.post("/sign-up", userContronller.createUser);
// Xác minh email qua link gửi từ mail
router.get("/verify-email", userContronller.verifyEmail);
// Đăng nhập
router.post("/sign-in", userContronller.loginUser);
// Đăng xuất 
router.post("/log-out", userContronller.logoutUser);
// Cập nhật thông tin người dùng (phải đúng chủ tài khoản)
router.put("/update-user/:id", authUserMiddleware, userContronller.updateUser);
// Cập nhật mật khẩu người dùng
router.put(
  "/update-password/:id",
  authUserMiddleware,
  userContronller.updatePassword
);
// Admin cập nhật trạng thái tài khoản
router.put(
  "/update-state/:id",
  authMiddleware,
  userContronller.updateStateUser
);
// Xoá người dùng (chỉ admin được phép)
router.delete("/delete-user/:id", authMiddleware, userContronller.deleteUser);
// Lấy tất cả người dùng (chỉ admin)
router.get("/getAll", authMiddleware, userContronller.getAllUser);
// Lấy thông tin chi tiết người dùng (phải đúng chủ tài khoản)
router.get(
  "/get-details/:id",
  authUserMiddleware,
  userContronller.getDetailsUser
);
// Làm mới access token từ refresh token
router.post("/refresh-token", userContronller.refreshToken);
// Lấy thông tin người dùng công khai (không cần login)
router.get("/public/:id", userContronller.getPublicUser);
router.put("/add-cart/:id", authLoggedInUser, userContronller.addcart);
router.delete(
  "/remove-like/:userId/:productId",
  authLoggedInUser,
  userContronller.removeProductFromLike
);
module.exports = router;

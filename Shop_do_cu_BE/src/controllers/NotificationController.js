// controllers/NotificationController.js
const NotificationService = require("../services/NotificationService"); // Đảm bảo đường dẫn đúng

const getNotificationsByUserId = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID người dùng từ tham số URL
    // Thêm kiểm tra quyền truy cập: đảm bảo người dùng đang yêu cầu thông báo của chính họ
    // (ví dụ: req.user.id === id nếu bạn sử dụng middleware xác thực)
    const response = await NotificationService.getNotifications(id);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({ message: e.message });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params; // ID thông báo từ tham số URL
    // Tùy chọn: Thêm kiểm tra quyền truy cập để đảm bảo người dùng được phép đánh dấu thông báo này
    const response = await NotificationService.markAsRead(id);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({ message: e.message });
  }
};


const createNotification = async (req, res) => {
  try {
    const data = req.body;
    const response = await NotificationService.createNotification(data);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({ message: e.message });
  }
};

// Xóa thông báo
const deleteNotification = async (req, res) => {
  try {
    const notifyId = req.params.id;
    if (!notifyId) {
      return res.status(200).json({
        status: "ERR", // Trạng thái lỗi
        message: "Không có ProductId", // Thông báo lỗi
      });
    }
    // Gọi Service để xóa thông báo
    const response = await NotificationService.deleteNotification(notifyId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

module.exports = {
  getNotificationsByUserId,
  markNotificationAsRead,
  createNotification,
  deleteNotification,
};

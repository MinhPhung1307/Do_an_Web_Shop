// services/NotificationService.js
const Notification = require("../models/NotificationModel"); // Đảm bảo đường dẫn đúng
const User = require("../models/UserModel"); 

const getNotifications = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tìm tất cả thông báo cho người nhận cụ thể và sắp xếp theo thời gian tạo giảm dần (mới nhất trước)
      const notifications = await Notification.find({
        recipientId: userId,
      }).sort({ createdAt: -1 });
      resolve({
        status: "OK",
        message: "SUCCESS",
        data: notifications,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const markAsRead = (notificationId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tìm và cập nhật thông báo thành đã đọc
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true } // Trả về tài liệu đã được cập nhật
      );
      if (!notification) {
        resolve({
          status: "ERR",
          message: "Notification not found",
        });
      }
      resolve({
        status: "OK",
        message: "Notification marked as read",
        data: notification,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const createNotification = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const admin = await User.findOne({email: "admin"})
      const notifications = await Notification.create({
        recipientId: admin._id,
        senderId: data.senderId,
        title: data.title,
        message: data.message,
        productId: data.productId,
      })
      resolve({
        status: "OK",
        message: "Báo cáo thành công",
        data: notifications,
      });
    } catch (e) {
      reject(e);
    }
  });
};

// Xóa sản phẩm
const deleteNotification = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const CheckNotify = await Notification.findOne({ _id: id }); 
      if (CheckNotify === null) {
        resolve({
          status: "OK", // trạng thái thành công
          message: "Thông báo không được xác định", // thông báo lỗi
        });
      }
      deleteNotify = await Notification.findByIdAndDelete(id);
      resolve({
        status: "OK", 
        message: "Xóa thông báo thành công", 
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  getNotifications,
  markAsRead,
  createNotification,
  deleteNotification
};

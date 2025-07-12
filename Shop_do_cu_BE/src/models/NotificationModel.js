// NotificationModel.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: String, required: true }, // ID của người dùng nhận thông báo
    senderId: { type: String }, // ID của người dùng hoặc hệ thống gửi thông báo (tùy chọn)
    type: {
      type: String,
      enum: [
        "purchase_success", // Để người mua biết mua hàng thành công
        "auction_win", // Để người mua biết đấu giá thành công
        "seller_product_sold", // Thông báo cho người bán sản phẩm của họ dã được bán
        "new_bid", // Để người bán biết có lượt đấu giá mới trên sản phẩm của họ
        "product_approved", // Để người bán biết sản phẩm của họ được quản trị viên duyệt
        "product_rejected", // Để người bán biết sản phẩm của họ bị quản trị viên từ chối
      ],
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    productId: { type: String }, // Liên kết đến sản phẩm nếu có
    read: { type: Boolean, default: false }, // Để theo dõi xem người dùng đã đọc thông báo hay chưa
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;

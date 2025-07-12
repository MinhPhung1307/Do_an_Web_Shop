const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authMiddleware = (req, res, next) => {
  const token = req.headers.token.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) {
      return res.status(404).json({
        message: "The authemtication",
        status: "ERROR",
      });
    }
    if (user?.isAdmin) {
      next();
    } else {
      return res.status(404).json({
        message: "The authemtication",
        status: "ERROR",
      });
    }
  });
};

const authUserMiddleware = (req, res, next) => {
  const token = req.headers.token.split(" ")[1];
  const userId = req.params.id;
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) {
      return res.status(401).json({
        message: "The authemtication",
        status: "ERROR",
      });
    }
    if (user?.isAdmin || user?.id === userId) {
      next();
    } else {
      return res.status(403).json({
        message: "The authemtication",
        status: "ERROR",
      });
    }
  });
};

// phục vụ cho việc thêm sản phẩm vào giỏ hàng
const authLoggedInUser = (req, res, next) => {
  const token = req.headers.token?.split(" ")[1]; // Sử dụng optional chaining để tránh lỗi nếu token không tồn tại
  if (!token) {
    return res.status(401).json({
      message: "Authentication token is missing.",
      status: "ERROR",
    });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) {
      return res.status(401).json({
        message: "Invalid or expired token.",
        status: "ERROR",
      });
    }
    req.user = user; // Gắn thông tin người dùng từ token
    next();
  });
};

module.exports = {
  authMiddleware,
  authUserMiddleware,
  authLoggedInUser,
};

const UserService = require("../services/UserService");
const JwtService = require("../services/JwtService");
const mongoose = require("mongoose");
const User = require("../models/UserModel");


// [POST] /api/user/sign-up
// Tạo người dùng mới, chỉ chấp nhận email @ut.edu.vn
const createUser = async (req, res) => {
  try {
    // Kiểm tra dữ liệu bắt buộc
    const { name, email, password, confirmPassword, address, phone } = req.body;
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !address ||
      !phone
    ) { 
      return res.status(200).json({
        status: "ERR",
        message: "The input is required",
      });
    }
    // kiểm tra email có đúng domain @ut.edu.vn không
    const isCheckEmail = /^[a-zA-Z0-9._%+-]+@ut\.edu\.vn$/;
    if (!isCheckEmail) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is Email UTH",
      });
    }
    // Xác nhận mật khẩu
    if (password !== confirmPassword) {
      return res.status(200).json({
        status: "ERR",
        message: "Xác nhận mật khẩu không đúng",
      });
    }
    // Gọi Service xử lý tạo user
    const response = await UserService.createUser(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

// [GET] /api/user/verify-email
// Xác thực người dùng thông qua token được gửi kèm trong URL (thường từ email)
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query; // Lấy token từ query string 
    // Gọi hàm xử lý trong UserService để xác minh token
    const response = await UserService.verifyEmail(token);
    // Nếu thành công, trả kết quả xác thực
    return res.status(200).json(response);
  } catch (error) { 
    // Trường hợp token sai, hết hạn, hoặc lỗi hệ thống
    return res.status(404).json({
      message: error,
    });
  }
};

// [POST] /api/user/sign-in
// Đăng nhập người dùng với email và mật khẩu
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Kiểm tra đầu vào bắt buộc
    if (!email || !password) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is required",
      });
    }
     // Gọi service để xử lý logic đăng nhập
    const response = await UserService.loginUser(req.body);
    // Tách refresh_token để gán vào cookie, phần còn lại trả về cho client
    const { refresh_token, ...newResponse } = response;
    // Đặt cookie refresh_token an toàn:
    // - httpOnly: không cho JavaScript frontend truy cập
    // - secure: chỉ hoạt động qua HTTPS (nên bật true ở môi trường production)
    // - sameSite: tránh tấn công CSRF
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: false,
      samesite: "strict",
    });
    // Trả về access token + thông tin cần thiết
    return res.status(200).json(newResponse);
  } catch (error) {
    // Lỗi có thể do tài khoản không đúng, hoặc server gặp vấn đề
    return res.status(404).json({
      message: error,
    });
  }
};

// [POST] /api/user/log-out
// Đăng xuất người dùng bằng cách xoá refresh_token trong cookie
const logoutUser = async (req, res) => {
  try {
    // Xoá cookie chứa refresh_token ở phía client
    res.clearCookie("refresh_token");
    // Trả về phản hồi đăng xuất thành công
    return res.status(200).json({
      status: "OK",
      message: "Logout successfully",
    });
  } catch (error) {
    // Nếu lỗi xảy ra (hiếm), trả lỗi server
    return res.status(404).json({
      message: error,
    });
  }
};

// [PUT] /api/user/update-user/:id
// Cập nhật thông tin cá nhân của người dùng
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id; // Lấy ID người dùng từ URL
    const data = req.body;        // Dữ liệu cập nhật từ client gửi lên
    // Kiểm tra xem có truyền ID không
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The user is required",
      });
    }
    // Gọi service để xử lý cập nhật thông tin
    const response = await UserService.updateUser(userId, data);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({
      status: "ERROR",
      message: error.message || "Internal server error",
    });
  }
};

// [PUT] /api/user/update-password/:id
// Cho phép người dùng đổi mật khẩu hiện tại sang mật khẩu mới
const updatePassword = async (req, res) => {
  try {
    const userId = req.params.id; // Lấy ID người dùng từ URL
    const data = req.body;        // Lấy dữ liệu từ body
    const { newPassword, confirmPassword } = data;
    // Kiểm tra ID người dùng hợp lệ
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The user is required",
      });
    }
    // Kiểm tra xác nhận mật khẩu có khớp không
    if (newPassword !== confirmPassword) {
      return res.status(200).json({
        status: "ERR",
        message: "Xác nhận mật khẩu không đúng",
      });
    }
    // Gọi Service để thực hiện cập nhật mật khẩu
    const response = await UserService.updatePassword(userId, data);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({
      status: "ERROR",
      message: error.message || "Internal server error",
    });
  }
};

// [DELETE] /api/user/delete-user/:id
// Xóa người dùng khỏi hệ thống (thường chỉ Admin có quyền thực hiện)
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;  // Lấy userId từ URL params
    // Kiểm tra xem ID có được cung cấp không
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The user is required",
      });
    }
    // Gọi service để xử lý xóa người dùng
    const response = await UserService.deleteUser(userId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

// [GET] /api/user/getAll
// Lấy danh sách tất cả người dùng trong hệ thống
const getAllUser = async (req, res) => {
  try {
    // Gọi service để truy xuất danh sách người dùng từ database
    const response = await UserService.getAllUser();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

// [GET] /api/user/get-details/:id
// Lấy thông tin chi tiết của một người dùng theo ID
const getDetailsUser = async (req, res) => {
  try {
    const userId = req.params.id;  // Lấy ID người dùng từ URL
    // Kiểm tra ID có tồn tại không
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The user is required",
      });
    }
    // Gọi service để lấy thông tin chi tiết người dùng
    const response = await UserService.getDetailsUser(userId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};


// [POST] /api/user/refresh-token
// Tạo access token mới từ refresh token đã được lưu trong cookie
const refreshToken = async (req, res) => {
  try {
    // Lấy refresh token từ cookie (được gửi lên từ trình duyệt)
    const token = req.cookies.refresh_token;
    // Nếu không có token, trả lỗi thiếu thông tin
    if (!token) {
      return res.status(200).json({
        status: "ERR",
        message: "The token is required",
      });
    }
    // Gọi service để kiểm tra token và tạo access token mới
    const response = await JwtService.refreshTokenJwtService(token);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};


// [GET] /api/user/public/:id
// Lấy thông tin công khai của một người dùng thông qua ID
const getPublicUser = async (req, res) => {
  try {
    const { id } = req.params;  // Lấy userId từ URL

    // Kiểm tra id hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "ERR",
        message: "ID không hợp lệ",
      });
    }

    // Truy vấn dữ liệu người dùng từ MongoDB và chỉ lấy một số trường công khai
    const user = await User.findById(id).select(
      "_id name avatar _idProductlike phone"
    );
    // Nếu không tìm thấy user
    if (!user) {
      return res.status(404).json({
        status: "ERR",
        message: "Không tìm thấy user",
      });
    }
    // Trả về dữ liệu thành công
    return res.status(200).json({
      status: "OK",
      data: user,
    });
  } catch (error) {
    console.error("Lỗi getPublicUser:", error);
    return res.status(500).json({
      status: "ERR",
      message: "Lỗi server khi lấy thông tin user công khai",
    });
  }
};

// [PUT] /api/user/update-state/:id
// thay đổi trạng thái người dùng
const updateStateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The user is required",
      });
    }
    const response = await UserService.updateStateUser(userId);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({
      status: "ERROR",
      message: error.message || "Internal server error",
    });
  }
};

// [PUT] /api/user/add-cart/:id
// Thêm một sản phẩm vào giỏ hàng của người dùng
const addcart = async (req, res) => {
  try {
    const product_id = req.params.id; // Lấy product_id từ URL params
    // authUserMiddleware sẽ gắn thông tin người dùng vào req.user (bao gồm id)
    const userId = req.user.id; // Lấy userId từ req được xác thực bởi middleware

    if (!product_id || !userId) {
      return res.status(400).json({
        // Nên trả về 400 Bad Request nếu thiếu dữ liệu
        status: "ERR",
        message: "Thiếu ID sản phẩm hoặc ID người dùng.",
      });
    }

    // Gọi UserService.addcart và truyền cả product_id và userId
    const response = await UserService.addcart(product_id, userId);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi trong UserController.addcart:", error);
    return res.status(500).json({
      // Trả về 500 Internal Server Error cho các lỗi không mong muốn
      status: "ERR",
      message: error.message || "Lỗi server khi thêm sản phẩm vào giỏ hàng.",
    });
  }
};

// [DELETE] /api/user/remove-like/:userId/:productId
// Xóa sản phẩm khỏi danh sách yêu thích (like) của người dùng
const removeProductFromLike = async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.params.userId;

    if (!productId || !userId) {
      return res.status(400).json({
        status: "ERR",
        message: "Thiếu ID sản phẩm hoặc ID người dùng.",
      });
    }

    const response = await UserService.removeProductFromLike(productId, userId);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi trong removeProductFromLike:", error);
    return res.status(500).json({
      status: "ERR",
      message: "Lỗi server khi xóa sản phẩm khỏi danh sách.",
    });
  }
};

module.exports = {
  createUser,
  verifyEmail,
  loginUser,
  logoutUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailsUser,
  refreshToken,
  getPublicUser,
  updatePassword,
  updateStateUser,
  addcart,
  removeProductFromLike,
};

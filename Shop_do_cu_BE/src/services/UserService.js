const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const { genneralAccessToken, genneralRefreshToken } = require("./JwtService");
const { sendVerificationEmail } = require("./emailService");


// Tạo tài khoản người dùng mới
const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    const { name, email, password, address, phone } = newUser;
    try {
      // Kiểm tra email đã tồn tại trong hệ thống chưa
      const CheckEmail = await User.findOne({ email });
      if (CheckEmail !== null) {
        resolve({
          status: "ERR",
          message: "The email is alrealy",
        });
      }
      // Mã hóa mật khẩu người dùng bằng bcrypt
      const hash = bcrypt.hashSync(password, 10);
      // Tạo user mới với dữ liệu đầu vào và mật khẩu đã mã hóa
      const createdUser = new User({
        name,
        email,
        password: hash,
        address,
        phone,
      });
      // Lưu user mới vào cơ sở dữ liệu
      await createdUser.save();
      // Tạo JWT token để xác minh email, thời hạn 1h
      const token = jwt.sign({ id: createdUser._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      // Tạo link xác minh gửi qua email
      const link = `http://localhost:3000/verify-email/${token}`;
      // Gửi email xác thực tới người dùng
      sendVerificationEmail(email, link);
      // Trả kết quả thành công
      if (createdUser) {
        resolve({
          status: "OK",
          message: "Vui lòng kiểm tra email để xác thực.",
          data: createdUser,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

// Xác minh địa chỉ email của người dùng bằng token (JWT)
const verifyEmail = (token) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Giải mã token để lấy userId từ payload
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Tìm user theo id trong payload
      const user = await User.findById(decoded.id);
      // Nếu không tìm thấy user, trả lỗi xác minh
      if (!user) {
        resolve({
          status: "ERR",
          title: "Xác minh thất bại!",
          message:
            "Rất tiếc, chúng tôi không thể xác thực email của bạn. Vui lòng kiểm tra lại thông tin hoặc thử lại sau.",
        });
      }
      // Nếu user đã xác minh trước đó
      if (user.isVerified) {
        resolve({
          status: "OK",
          title: "Xác minh thành công!",
          message:
            "Email của bạn đã được xác minh trước đó. Tài khoản của bạn hiện đang được kích hoạt và sẵn sàng sử dụng.",
        });
      }
      // Cập nhật trạng thái xác minh trong database
      user.isVerified = true;
      await user.save();
      // Trả kết quả xác minh thành công
      resolve({
        status: "OK",
        title: "Xác minh thành công!",
        message:
          "Email của bạn đã được xác minh thành công. Tài khoản của bạn hiện đã được kích hoạt và sẵn sàng sử dụng.",
        data: user,
      });
    } catch (error) {
      resolve({
        status: "ERR",
        title: "Xác minh thất bại!",
        message:
          "Rất tiếc, chúng tôi không thể xác thực email của bạn. Vui lòng kiểm tra lại thông tin hoặc thử lại sau.",
      });
    }
  });
};

// Xác thực tài khoản người dùng khi đăng nhập
const loginUser = (userLogin) => {
  return new Promise(async (resolve, reject) => {
    const { email, password } = userLogin;
    try {
      // Tìm người dùng theo email
      const user = await User.findOne({ email });
      // Nếu không tồn tại, báo lỗi
      if (user === null) {
        resolve({
          status: "ERR",
          message: "Tài khoản không tồn tại.",
        });
      }
      // Nếu email chưa xác thực (isVerified = false)
      if (!user.isVerified) {
        resolve({
          status: "ERR",
          message:
            "Email chưa được xác thực. Vui lòng kiểm tra hộp thư và xác thực email trước khi đăng nhập.",
        });
      }
      // So sánh mật khẩu nhập vào với mật khẩu đã mã hóa trong DB
      const comparePassword = bcrypt.compareSync(password, user.password);
      if (!comparePassword) {
        resolve({
          status: "ERR",
          message: "Email hoặc mật khẩu không đúng.",
        });
      }
      // Kiểm tra trạng thái tài khoản
      if (!user.state) {
        resolve({
          status: "ERR",
          message: "Tài khoản của bạn hiện đang bị khóa.",
        });
      }
      // Tạo access token & refresh token cho người dùng đăng nhập thành công
      const access_token = await genneralAccessToken({
        id: user._id,
        isAdmin: user.isAdmin,
      });
      const refresh_token = await genneralRefreshToken({
        id: user._id,
        isAdmin: user.isAdmin,
      });
      // Trả kết quả thành công và token cho client
      resolve({
        status: "OK",
        message: "Đăng nhập thành công",
        access_token,
        refresh_token,
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Cập nhật thông tin người dùng theo ID
const updateUser = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra xem user có tồn tại trong hệ thống không
      const CheckUser = await User.findOne({ _id: id });
      // Nếu không tồn tại, trả về thông báo lỗi
      if (CheckUser === null) {
        resolve({
          status: "OK",
          message: "The user is not defined",
        });
      }
      // Thực hiện cập nhật người dùng với thông tin mới
      // - { new: true } đảm bảo trả về document sau khi đã cập nhật
      const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
      //  Trả về thông tin người dùng sau khi cập nhật
      resolve({
        status: "OK",
        message: "Cập nhật thông tin thành công",
        data: updatedUser,
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Cho phép người dùng cập nhật mật khẩu mới
const updatePassword = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { curPassword, newPassword } = data;
      // Tìm người dùng theo ID
      const user = await User.findOne({ _id: id });
      // Nếu không tìm thấy user, trả về lỗi
      if (user === null) {
        resolve({
          status: "OK",
          message: "The user is not defined",
        });
      }
      // So sánh mật khẩu hiện tại với mật khẩu trong database
      const comparePassword = bcrypt.compareSync(curPassword, user.password);
      if (!comparePassword) {
        // Nếu mật khẩu cũ không đúng, trả về lỗi
        resolve({
          status: "ERR",
          message: "Mật khẩu cũ không đúng.",
        });
      } else {
        // Nếu đúng, mã hóa mật khẩu mới
        const hashPassword = bcrypt.hashSync(newPassword, 10);
        // Cập nhật mật khẩu mới trong database
        await User.findByIdAndUpdate(
          id,
          { password: hashPassword },
          { new: true }
        );
      }
      // Trả về thông báo thành công
      resolve({
        status: "OK",
        message: "Cập nhập mật khẩu thành công",
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Xóa người dùng khỏi hệ thống bằng ID
const deleteUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tìm người dùng theo ID để kiểm tra sự tồn tại
      const CheckUser = await User.findOne({ _id: id });
      //  Nếu người dùng không tồn tại, trả về thông báo lỗi
      if (CheckUser === null) {
        resolve({
          status: "ERR",
          message: "The user is not defined",
        });
      }
      // Nếu tồn tại, tiến hành xóa người dùng khỏi database
      await User.findByIdAndDelete(id);
      // Trả về thông báo xóa thành công
      resolve({
        status: "OK",
        message: "Xóa người dùng thành công",
      });
    } catch (error) {
      //  Bắt lỗi bất ngờ (DB lỗi, kết nối, v.v.)
      reject(error);
    }
  });
};

//  Lấy toàn bộ danh sách người dùng trong hệ thống
const getAllUser = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // Truy vấn tất cả user từ collection User
      const allUser = await User.find();
      // Trả về kết quả thành công cùng danh sách người dùng
      resolve({
        status: "OK",
        message: "get all user is success",
        data: allUser,
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Lấy thông tin chi tiết của một người dùng dựa trên ID
const getDetailsUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Truy vấn tìm người dùng theo ID
      const user = await User.findOne({ _id: id });
      // Nếu không tìm thấy, trả về lỗi
      if (user === null) {
        resolve({
          status: "ERR",
          message: "The user is not defined",
        });
      }
      // Nếu có, trả về thông tin người dùng
      resolve({
        status: "OK",
        message: "Cập nhật thành công",
        data: user,
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Thay đổi trạng thái hoạt động của người dùng
const updateStateUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tìm user theo ID
      const user = await User.findOne({ _id: id });
      // Nếu không tìm thấy user, trả về thông báo lỗi
      if (user === null) {
        resolve({
          status: "ERR",
          message: "Người dùng không được xác định",
        });
      }
      // Đảo trạng thái hiện tại: true -> false hoặc false -> true
      await User.findByIdAndUpdate(id, { state: !user.state }, { new: true });
      // Trả về thông báo thành công
      resolve({
        status: "OK",
        message: "Cập nhập trạng thái thành công",
      });
    } catch (error) {
      reject(error);
    }
  });
};

const addcart = (productId, userId) => {
  // Thay đổi tham số thành productId và userId
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId); // Tìm người dùng theo userId
      if (!user) {
        return resolve({
          status: "ERR",
          message: "Người dùng không tồn tại.",
        });
      }

      // Kiểm tra xem productId đã tồn tại trong _idProductlike chưa để tránh trùng lặp
      if (user._idProductlike.includes(productId)) {
        return resolve({
          status: "OK", // hoặc status: "ERR" tùy theo yêu cầu của bạn nếu không muốn trùng lặp
          message: "Sản phẩm đã có trong danh sách yêu thích của bạn.",
        });
      }

      user._idProductlike.push(productId); // Thêm productId vào mảng _idProductlike
      await user.save(); // Lưu lại thay đổi trên user

      resolve({
        status: "OK",
        message: "Thêm sản phẩm vào danh sách yêu thích thành công.",
      });
    } catch (error) {
      reject(error);
    }
  });
};

const removeProductFromLike = (productId, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return resolve({
          status: "ERR",
          message: "Người dùng không tồn tại.",
        });
      }

      // Lọc bỏ productId khỏi danh sách
      user._idProductlike = user._idProductlike.filter(
        (id) => id !== productId
      );
      await user.save();

      resolve({
        status: "OK",
        message: "Đã xóa sản phẩm khỏi danh sách yêu thích.",
        data: user._idProductlike, // Gửi lại danh sách mới nếu cần
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createUser,
  verifyEmail,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailsUser,
  updatePassword,
  updateStateUser,
  addcart,
  removeProductFromLike,
};

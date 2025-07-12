const ProductService = require("../services/ProductService");
const Product = require("../models/ProductModel");
const fs = require("fs");
// Tạo sản phẩm mới
const createProduct = async (req, res) => {
  try {
    // Nếu dùng multer, req.files là mảng các file ảnh
    const images = req.files
      ? req.files.map((file) => file.path)
      : req.body.images;
    const { name, price, used, category, description, _iduser } = req.body;
    const priceNumber = Number(price); // chuyển sang số
    if (
      !images ||
      images.length === 0 ||
      !name ||
      !priceNumber ||
      !used ||
      !category ||
      !_iduser
    ) {
      if (req.files) {
        // forEach là phương thức duyệt qua từng phần tử
        req.files.forEach((file) => {
          try {
            // xóa file khi đăng thất bại
            fs.unlinkSync(file.path);
          } catch (err) {
            console.error("Xóa file thất bại:", file.path);
          }
        });
      }
      return res
        .status(400)
        .json({ status: "ERR", message: "Missing required fields" });
    }
    const product = await ProductService.createProduct({
      images,
      name,
      price: priceNumber,
      used,
      category,
      description,
      _iduser,
    });
    return res.status(201).json(product);
  } catch (error) {
    console.log(error);
    // XÓA FILE nếu có lỗi trong quá trình tạo sản phẩm
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Xóa file thất bại:", file.path);
        });
      });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const data = req.body;
    // Lấy ID người dùng từ req.user (được thêm bởi authUserMiddleware của bạn)
    // Đảm bảo authUserMiddleware đặt req.user.id
    const userId = req.user.id; // <-- THÊM DÒNG NÀY

    if (!productId) {
      return res.status(400).json({
        // <-- SỬA: Dùng 400 Bad Request
        status: "ERR",
        message: "Thiếu ProductId trong yêu cầu.",
      });
    }
    // Gọi Service để cập nhật sản phẩm, truyền userId
    const response = await ProductService.updateProduct(
      productId,
      data,
      userId
    ); // <-- THÊM userId

    if (response.status === "OK") {
      return res.status(200).json(response);
    } else {
      // Dựa vào thông báo lỗi từ service để trả về status code cụ thể hơn
      if (response.message.includes("không được tìm thấy")) {
        // Hoặc "không xác định"
        return res.status(404).json(response); // 404 Not Found
      } else if (response.message.includes("không có quyền")) {
        return res.status(403).json(response); // 403 Forbidden
      }
      return res.status(400).json(response); // Các lỗi khác từ service
    }
  } catch (error) {
    console.error("Lỗi server khi cập nhật sản phẩm:", error); // Log chi tiết lỗi
    return res.status(500).json({
      // <-- SỬA: 500 Internal Server Error
      status: "ERR",
      message: "Lỗi server nội bộ. Vui lòng thử lại sau.",
      // Trong môi trường dev, có thể thêm: error: error.message
    });
  }
};

// Lấy chi tiết sản phẩm
const getDetailsProduct = async (req, res) => {
  try {
    // Lấy productId từ tham số của request
    const productId = req.params.id;
    // Kiểm tra xem productId có được cung cấp hay không
    if (!productId) {
      return res.status(200).json({
        status: "ERR", // Trạng thái lỗi
        message: "Không có ProductId", // Thông báo lỗi
      });
    }
    // Gọi Service để lấy chi tiết sản phẩm
    const response = await ProductService.getDetailsProduct(productId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
  try {
    // Lấy productId từ tham số của request
    const productId = req.params.id;
    // Kiểm tra xem productId có được cung cấp hay không
    if (!productId) {
      return res.status(200).json({
        status: "ERR", // Trạng thái lỗi
        message: "Không có ProductId", // Thông báo lỗi
      });
    }
    // Gọi Service để xóa sản phẩm
    const response = await ProductService.deleteProduct(productId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

// Lấy tất cả sản phẩm
const getAllProduct = async (req, res) => {
  try {
    // Lấy các tham số giới hạn sản phẩm của trang, trang, điều kiện sắp xếp, bộ lọc từ query của request
    const { limit, page, sort, filter } = req.query;
    // Gọi Service để lấy tất cả sản phẩm
    const response = await ProductService.getAllProduct(
      Number(limit), // Giới hạn số lượng sản phẩm trên mỗi trang
      Number(page), // Số trang hiện tại
      sort, // Điều kiện sắp xếp
      filter // Bộ lọc sản phẩm
    );
    // Trả về kết quả
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

// Lấy tất cả sản phẩm theo kiểu truyền vào
const getAllProductCheck = async (req, res) => {
  try {
    const type = req.query.type;
    const response = await ProductService.getAllProductCheck(type);
    // Trả về kết quả
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

// Xóa sản phẩm
const deleteAllProduct = async () => {
  try {
    // Gọi Service để xóa sản phẩm
    const response = await ProductService.deleteAllProduct();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

// hàm đấu giá
const placeBid = async (req, res) => {
  try {
    const productId = req.params.id;
    const { amount, bidderId } = req.body;

    if (!productId || !amount || !bidderId) {
      return res.status(400).json({
        status: "ERR",
        message: "Thiếu thông tin đặt giá",
      });
    }
    const response = await ProductService.placeBid(productId, {
      amount: Number(amount),
      bidderId,
    });

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "ERR",
      message: "Lỗi server",
    });
  }
};
// đánh dấu đã bán
const markAsSold = async (req, res) => {
  try {
    const product_id = req.params.id;
    const { price, _idbuy } = req.body;
    const response = await ProductService.markAsSold(product_id, _idbuy, price);
    // Trả về kết quả
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

// thay đổi trạng thái của sản phẩm
const updateState = async (req, res) => {
  try {
    const product_id = req.params.id;
    const response = await ProductService.updateState(product_id);
    // Trả về kết quả
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

// Lấy tất cả sản phẩm
const getAllProducts = async (req, res) => {
  try {
    const response = await ProductService.getAllProducts();
    // Trả về kết quả
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};
// Lấy sản phẩm đang đấu giá
const getAuctionProducts = async (req, res) => {
  try {
    // Lấy sản phẩm có status là "checked" và thời gian đấu giá chưa kết thúc
    const now = new Date();
    const products = await Product.find({
      status: "checked",
      auctionEndTime: { $gt: now },
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Hủy đơn đấu giá
const cancelBid = async (req, res) => {
  try {
    const productId = req.params.id;
    const { userId } = req.body;
    if (!productId || !userId) {
      return res.status(400).json({ message: "Thiếu thông tin" });
    }
    // Tìm sản phẩm
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    // Xóa bid của user khỏi mảng bids
    product.bids = product.bids.filter(
      (bid) => String(bid.bidderId) !== String(userId)
    );
    await product.save();
    return res.status(200).json({ message: "Đã hủy đơn thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
};

//Lấy sản phẩm đã mua
const getBoughtProducts = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }

    const products = await Product.find({
      status: "sold",
      _idbuy: userId,
    });

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
};


const getProductsByIds = async (req, res) => {
  try {
    const idsString = req.query.ids; // Lấy chuỗi ID từ query parameter
    if (!idsString) {
      return res.status(400).json({
        status: "ERR",
        message: "Thiếu danh sách ID sản phẩm.",
      });
    }

    const productIds = idsString.split(","); // Chuyển chuỗi ID thành mảng
    // Đảm bảo các ID là hợp lệ (ví dụ: chuyển đổi thành ObjectId nếu cần)
    const validProductIds = productIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    // Gọi service để lấy các sản phẩm
    const response = await ProductService.getProductsByIds(validProductIds); // Giả định ProductService có hàm này

    return res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi getProductsByIds:", error);
    return res.status(500).json({
      status: "ERR",
      message: error.message || "Lỗi server khi lấy sản phẩm theo ID.",
    });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getDetailsProduct,
  deleteProduct,
  getAllProduct,
  deleteAllProduct,
  getAllProductCheck,
  placeBid,
  markAsSold,
  updateState,
  getAllProducts,
  getAuctionProducts,
  cancelBid,
  getProductsByIds,
  getBoughtProducts,
};

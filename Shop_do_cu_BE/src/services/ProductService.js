const Product = require("../models/ProductModel");
const Notification = require("../models/NotificationModel");
const User = require("../models/UserModel");
// Tao sản phẩm mới
const createProduct = (newProduct) => {
  return new Promise(async (resolve, reject) => {
    // Các biến chứa các trường dữ liệu của sản phẩm mới
    const { images, name, price, used, category, description, _iduser } =
      newProduct;
    try {
      // Tiến hành tạo mới
      const createdProduct = await Product.create({
        images, // hình ảnh sản phẩm
        name, // tên sản phẩm
        price, // giá sản phẩm
        used, // thời gian đã sử dụng sản phẩm
        category, // loại sản phẩm
        description, // mô tả sản phẩm
        _iduser, // id người đăng
      });
      // Kiểm tra xem sản phẩm đã được tạo thành công hay chưa
      if (createdProduct) {
        resolve({
          status: "OK", // trạng thái thành công
          message: "Thành công", // thông báo thành công
          data: createdProduct,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

// Cập nhật sản phẩm
const updateProduct = (id, data, userId) => {
  // <-- THÊM userId
  return new Promise(async (resolve, reject) => {
    try {
      const product = await Product.findById(id); // <-- SỬA: Đổi tên biến cho rõ ràng hơn

      if (!product) {
        return resolve({
          // <-- THÊM return
          status: "ERR", // <-- SỬA: Trả về ERR khi không tìm thấy sản phẩm
          message: "Sản phẩm không được tìm thấy.",
        });
      }

      // 2. Kiểm tra quyền sở hữu sản phẩm (RẤT QUAN TRỌNG CHO BẢO MẬT)
      // Chuyển đổi _iduser về string để so sánh an toàn
      if (product._iduser.toString() !== userId) {
        // <-- THÊM LOGIC KIỂM TRA QUYỀN
        return resolve({
          // <-- THÊM return
          status: "ERR",
          message: "Bạn không có quyền cập nhật sản phẩm này.",
        });
      }

      const updatedProduct = await Product.findByIdAndUpdate(id, data, {
        new: true, // Trả về tài liệu đã cập nhật
        runValidators: true, // <-- THÊM: Đảm bảo chạy các validator trong schema
      });

      // Kiểm tra lại nếu update có vấn đề (trường hợp hiếm)
      if (updatedProduct) {
        resolve({
          status: "OK",
          message: "Cập nhật sản phẩm thành công.", // <-- SỬA: Lỗi chính tả
          data: updatedProduct,
        });
      } else {
        // Trường hợp này có thể xảy ra nếu sản phẩm bị xóa giữa chừng sau khi CheckProduct
        resolve({
          status: "ERR",
          message: "Không thể cập nhật sản phẩm.",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

// // Lấy chi tiết sản phẩm
const getDetailsProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await Product.findOne({ _id: id }); // tạo biến chứa id sản phẩm cần lấy chi tiết
      // kiểm tra xem sản phẩm có tồn tại hay không
      if (product === null) {
        resolve({
          status: "OK", // trạng thái thành công
          message: "Sản phẩm không được xác định", // thông báo lỗi
        });
      }
      resolve({
        status: "OK", // trạng thái thành công
        message: "Thanh công", // thông báo thành công
        data: product, // dữ liệu sản phẩm
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Xóa sản phẩm
const deleteProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const CheckProduct = await Product.findOne({ _id: id }); // tạo biến chứa id sản phẩm cần xóa
      // kiểm tra xem sản phẩm có tồn tại hay không
      if (CheckProduct === null) {
        resolve({
          status: "OK", // trạng thái thành công
          message: "Sản phẩm không được xác định", // thông báo lỗi
        });
      }
      // nếu sản phẩm tồn tại thì tiến hành xóa
      updatedProduct = await Product.findByIdAndDelete(id);
      // THÔNG BÁO: Duyệt Không Thành Công
      await Notification.create({
        recipientId: updatedProduct._iduser, // ID của người bán
        type: "product_approved",
        title: "Sản phẩm không được duyệt!",
        message: `Sản phẩm của bạn "${updatedProduct.name}" đã bị xóa`,
        productId: updatedProduct._id,
        // Nếu bạn có OrderId liên quan đến giao dịch này, hãy thêm vào đây
      });
      resolve({
        status: "OK", // trạng thái thành công
        message: "Xóa sản phẩm thành công", // thông báo thành công
      });
    } catch (error) {
      reject(error);
    }
  });
};

//phân loại theo Phân loại
const getAllProduct = (limit = 2, page = 1, sort = null, filter = null) => {
  return new Promise(async (resolve, reject) => {
    try {
      const totalProduct = await Product.countDocuments();
      // điều kiện thỏa fillter
      if (filter) {
        const [field, value] = filter; // filler là trường dữ liệu và giá trị
        const allProductFilter = await Product.find({ [field]: value }) // tìm trường theo giá trị
          .limit(limit) // số lượng sản phẩm tối đa
          .skip(limit * (page - 1)) // bỏ qua số lượng sản phẩm đã hiển thị
          .lean(); // chuyển đổi kết quả thành đối tượng JavaScript thuần túy
        const totalFilter = await Product.countDocuments({ [field]: value }); // đếm số lượng sản phẩm theo điều kiện filter

        resolve({
          status: "OK", // trang thái thành công
          message: `Hiện sản phẩm thành công`, // thông báo
          data: allProductFilter, // dữ liệu sản phẩm
          total: totalFilter, // tổng số sản phẩm theo điều kiện filter
          pageCurrent: page, // trang hiện tại
          totalPage: Math.ceil(totalFilter / limit), // tổng số trang
        });
      }
      // điều kiện sắp xếp
      if (sort) {
        const objectSort = {}; // tạo một đối tượng để lưu trữ điều kiện sắp xếp
        objectSort[sort[1]] = sort[0]; // sort là mảng, phần tử đầu tiên là thứ tự sắp xếp (1 hoặc -1), phần tử thứ hai là trường dữ liệu cần sắp xếp
        const allProductSort = await Product.find() // tìm tất cả sản phẩm
          .limit(limit) // giới hạn số lượng sản phẩm tối đa
          .skip(limit * (page - 1)) // bỏ qua số lượng sản phẩm đã hiển thị
          .sort(objectSort); // sắp xếp theo điều kiện đã tạo
        resolve({
          status: "OK",
          message: "Lấy sản phẩm đã sắp xếp thành công",
          data: allProductSort, // dữ liệu sản phẩm đã sắp xếp
          total: totalProduct, // tổng số sản phẩm
          pageCurrent: page, // trang hiện tại
          totalPage: Math.ceil(totalProduct / limit), // tổng số trang
        });
      }
      // nếu không có điều kiện filter và sort thì lấy tất cả sản phẩm
      const allProduct = await Product.find()
        .limit(limit) // giới hạn số lượng sản phẩm tối đa
        .skip(limit * (page - 1)); // bỏ qua số lượng sản phẩm đã hiển thị
      resolve({
        status: "OK", // trạng thái thành công
        message: "Lấy tất cả sản phẩm thành công", // thông báo
        data: allProduct, // dữ liệu sản phẩm
        total: totalProduct, // tổng số sản phẩm
        pageCurrent: page, // trang hiện tại
        totalPage: Math.ceil(totalProduct / limit), // tổng số trang
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Lấy tất cả sản phẩm đang chờ duyệt
const getAllProductCheck = (type) => {
  return new Promise(async (resolve, reject) => {
    try {
      const products = await Product.find({ status: type });
      resolve({
        status: "OK", // trạng thái thành công
        message: "Thành công", // thông báo thành công
        data: products, // dữ liệu sản phẩm
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Xóa all sản phẩm
const deleteAllProduct = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await Product.deleteMany({}); // Xóa tất cả tài liệu trong collection Product
      resolve({
        status: "OK",
        message: "Đã xóa tất cả sản phẩm thành công",
      });
    } catch (error) {
      reject(error);
    }
  });
};

// hàm đấu giá
const placeBid = (productId, bidData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        return resolve({
          status: "ERR",
          message: "Sản phẩm không tồn tại",
        });
      }
      const currentTime = new Date();
      let currentAuctionEndTime = new Date(
        product.createdAt.getTime() + 48 * 60 * 60 * 1000
      );
      product.auctionEndTime = currentAuctionEndTime;
      // Xác định giá thầu cao nhất hiện tại.
      // Nếu chưa có giá thầu nào, giá sàn để bắt đầu đấu giá là product.price / 2.
      const minStartingBid = product.price / 2;
      const highestBid =
        product.bids.length > 0
          ? Math.max(...product.bids.map((b) => b.amount))
          : minStartingBid; // Nếu chưa có bid, giá cao nhất để so sánh là giá sàn khởi điểm

      // 1. Kiểm tra giá thầu tối đa: Không được lớn hơn product.price (giá mua ngay)
      if (bidData.amount > product.price) {
        return resolve({
          status: "ERR",
          message: `Giá đấu giá không được lớn hơn giá mua ngay: ${product.price.toLocaleString(
            "vi-VN"
          )} VND`,
        });
      }

      // 2. Kiểm tra giá thầu tối thiểu: Phải lớn hơn giá cao nhất hiện tại
      // (và tự động lớn hơn hoặc bằng product.price / 2 nếu là bid đầu tiên)
      if (bidData.amount <= highestBid) {
        return resolve({
          status: "ERR",
          message: `Giá đấu giá phải lớn hơn giá hiện tại: ${highestBid.toLocaleString(
            "vi-VN"
          )} VND`,
        });
      }

      const timeLeftMs =
        currentAuctionEndTime.getTime() - currentTime.getTime();
      const oneHourInMs = 60 * 60 * 1000;
      const extensionAmountMs = 1 * 60 * 60 * 1000; // Gia hạn thêm 1 giờ
      // Nếu thời gian còn lại nhỏ hơn hoặc bằng 1 giờ VÀ đấu giá vẫn đang diễn ra
      if (timeLeftMs <= oneHourInMs && timeLeftMs > 0) {
        // Gia hạn thời gian kết thúc đấu giá từ thời điểm hiện tại của bid
        const newCalculatedEndTime = new Date(
          currentAuctionEndTime.getTime() + extensionAmountMs
        );
        // Đảm bảo thời gian kết thúc mới không sớm hơn thời gian kết thúc hiện tại
        // nếu người dùng đặt giá liên tục trong 1 giờ cuối.
        if (product.auctionEndTime.getTime() < newCalculatedEndTime.getTime()) {
          product.auctionEndTime = newCalculatedEndTime;
        } else {
          // Nếu thời gian kết thúc hiện tại đã xa hơn 1 giờ từ bây giờ
          // và vẫn nằm trong 1 giờ cuối (có thể do gia hạn nhiều lần),
          // bạn có thể chọn gia hạn từ thời điểm kết thúc hiện tại.
          // Ví dụ: product.auctionEndTime = new Date(product.auctionEndTime.getTime() + extensionAmountMs);
          // Hoặc giữ nguyên logic đảm bảo nó ít nhất là 1h từ bây giờ.
          // Với logic hiện tại, nó sẽ gia hạn nếu currentAuctionEndTime < newCalculatedEndTime.
          // Để đơn giản và hiệu quả nhất, đảm bảo nó luôn là ít nhất 1 giờ từ thời điểm bid:
          product.auctionEndTime = newCalculatedEndTime;
        }

        console.log(
          `Đấu giá sản phẩm ${product.name} được gia hạn. Thời gian kết thúc mới: ${product.auctionEndTime}`
        );
      }

      // thêm lượt đấu giá
      product.bids.unshift({
        amount: bidData.amount,
        bidderId: bidData.bidderId,
        timestamp: new Date(),
      });

      await product.save();
      // THÔNG BÁO: Lượt đấu giá mới cho người bán
      await Notification.create({
        recipientId: product._iduser, // ID của người bán (chủ sản phẩm)
        senderId: bidData.bidderId, // ID của người đặt giá
        type: "new_bid",
        title: "Có một lượt đấu giá mới!",
        message: `Sản phẩm "${
          product.name
        }" của bạn vừa nhận được một lượt đấu giá mới với giá ${bidData.amount.toLocaleString(
          "vi-VN"
        )} VND.`,
        productId: product._id,
      });
      resolve({
        status: "OK",
        message: "Đặt giá thành công",
        data: product.bids,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const markAsSold = (productId, _idbuy, price) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Tìm sản phẩm theo ID và cập nhật các trường status, price, và _idbuy
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: productId }, // Điều kiện tìm kiếm: tìm sản phẩm có _id khớp với productId
        {
          status: "sold", // Cập nhật trạng thái thành "sold"
          price: price, // Cập nhật giá cuối cùng
          _idbuy: _idbuy, // Cập nhật ID của người mua (giả sử tên trường trong ProductModel là _idbuy)
        },
        { new: true } // Tùy chọn: trả về tài liệu sau khi đã cập nhật (thay vì tài liệu cũ)
      );

      // Kiểm tra nếu không tìm thấy sản phẩm
      if (!updatedProduct) {
        return resolve({
          status: "ERR",
          message: "Không tìm thấy sản phẩm.",
        });
      }
      // THÔNG BÁO: Sản phẩm của người bán đã được bán
      if (updatedProduct._iduser) {
        // Đảm bảo người bán tồn tại
        await Notification.create({
          recipientId: updatedProduct._iduser, // ID của người bán
          senderId: _idbuy, // ID của người mua
          type: "seller_product_sold",
          title: "Sản phẩm của bạn đã được bán!",
          message: `Sản phẩm "${
            updatedProduct.name
          }" của bạn đã được bán thành công với giá ${price.toLocaleString(
            "vi-VN"
          )} VND.`,
          productId: updatedProduct._id,
          // Nếu bạn có OrderId liên quan đến giao dịch này, hãy thêm vào đây
        });
      }
      // THÔNG BÁO: Mua hàng thành công cho người mua
      await Notification.create({
        recipientId: _idbuy, // ID của người mua
        senderId: updatedProduct._iduser, // ID của người bán
        type: "purchase_success",
        title: "Mua hàng thành công!",
        message: `Bạn đã mua thành công sản phẩm "${
          updatedProduct.name
        }" với giá ${price.toLocaleString("vi-VN")} VND.`,
        productId: updatedProduct._id,
        // Nếu bạn có OrderId liên quan đến giao dịch này, hãy thêm vào đây
      });

      resolve({
        status: "OK", // trạng thái thành công
        message: "Mua thành công", // Thông báo rõ ràng hơn
        data: updatedProduct, // Có thể trả về dữ liệu sản phẩm đã cập nhật
      });
    } catch (error) {
      reject(error);
    }
  });
};

const updateState = async (id) => {
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id },
      { status: "checked" },
      { new: true }
    );

    // THÔNG BÁO: Duyệt Thành Công
    await Notification.create({
      recipientId: updatedProduct._iduser, // ID của người bán
      type: "product_approved",
      title: "Sản phẩm duyệt thành công!",
      message: `Sản phẩm của bạn "${updatedProduct.name}" Đã được duyệt`,
      productId: updatedProduct._id,
      // Nếu bạn có OrderId liên quan đến giao dịch này, hãy thêm vào đây
    });

    return { status: "OK", message: "Duyệt thành công" };
  } catch (error) {
    throw error;
  }
};

// Lấy tất cả sản phẩm
const getAllProducts = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const products = await Product.find();
      resolve({
        status: "OK", // trạng thái thành công
        message: "Thành công", // thông báo thành công
        data: products, // dữ liệu sản phẩm
      });
    } catch (error) {
      reject(error);
    }
  });
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
};

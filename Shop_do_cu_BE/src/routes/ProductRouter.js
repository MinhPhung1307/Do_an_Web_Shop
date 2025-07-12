const express = require("express");
const router = express.Router();
const productContronller = require("../controllers/ProductController");
const {
  authMiddleware,
  authUserMiddleware,
  authLoggedInUser,
} = require("../middleware/authMiddleware");
const multer = require("multer");

// Cấu hình Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Thư mục lưu file
  },
});
const upload = multer({ storage: storage });

// Thay đổi route tạo sản phẩm:
router.post(
  "/create",
  upload.array("images", 10), // nhận tối đa 5 file với field "images"
  productContronller.createProduct
);
router.put("/update/:id", authUserMiddleware, productContronller.updateProduct);
router.get("/get-details/:id", productContronller.getDetailsProduct);
router.delete(
  "/delete/:id",
  authLoggedInUser,
  productContronller.deleteProduct
);
router.get("/getproduct", productContronller.getAllProduct);
router.get(
  "/get-allproduct",
  authMiddleware,
  productContronller.getAllProducts
);

router.get(
  "/getproduct-check",
  authMiddleware,
  productContronller.getAllProductCheck
);
router.put("/update-state/:id", authMiddleware, productContronller.updateState);

router.delete("/deletes", productContronller.deleteAllProduct);
router.put("/bid/:id", productContronller.placeBid);
router.put(
  "/mark-as-sold/:id",
  authLoggedInUser,
  productContronller.markAsSold
);
// Lấy sản phẩm đang đấu giá
router.get("/auction", productContronller.getAuctionProducts);
// Hủy đơn
router.put("/cancel-bid/:id", productContronller.cancelBid);
// Lấy sản phẩm đã mua
router.get("/bought-by-user/:userId", productContronller.getBoughtProducts);

module.exports = router;

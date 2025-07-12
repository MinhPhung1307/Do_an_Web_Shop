// Import các thư viện cần thiết
const express = require("express");     // Framework giúp xây dựng server HTTP
const dotenv = require("dotenv");       // Đọc biến môi trường từ file .env
const mongoose = require("mongoose");   // Kết nối và làm việc với MongoDB
const cors = require("cors");           // Cho phép giao tiếp giữa các domain (CORS)
const bodyParser = require("body-parser"); // Phân tích dữ liệu từ request (body)
const cookieParser = require("cookie-parser"); // Hỗ trợ xử lý cookie trong request
const routes = require("./routes");      // Import các route của ứng dụng

dotenv.config();                        // Tải biến môi trường từ file .env

const app = express();                  // Khởi tạo ứng dụng Express
const PORT = process.env.PORT || 3001;  // Cổng server, ưu tiên lấy từ .env

// Connect to DB
mongoose
  .connect(
    `mongodb+srv://ShopUTH:${process.env.MONGO_DB}@minhphung.exhsh77.mongodb.net/?retryWrites=true&w=majority&appName=MinhPhung`
  )
  .then(() => console.log("Connected DB!"))
  .catch(() => console.log("Connect failure!"));

// Phân tích JSON từ body request
app.use(bodyParser.json());

// Hỗ trợ xử lý cookie
app.use(cookieParser());

// Cho phép truy cập từ domain khác (frontend)
app.use(cors());

// Cho phép truy cập tĩnh tới thư mục "uploads" (ảnh, file,...)
app.use("/uploads", express.static("uploads"));

// Khai báo các route (định tuyến API)
routes(app);

// ======= CHẠY SERVER EXPRESS =======
app.listen(PORT, () => {
  console.log(`Server is running in port: ${PORT}`);
});
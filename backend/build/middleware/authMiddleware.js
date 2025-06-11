// src/middleware/authMiddleware.js (Đã sửa lại để đọc 'userId')
import { verityJWT } from './JWTActions.js'; // Đảm bảo đường dẫn và tên file đúng

const authenticateUser = (req, res, next) => {
  // Đọc token từ cookie (Giả sử tên cookie là 'jwt')
  const token = req.cookies.jwt;
  if (!token) {
    console.log('Auth Middleware: Không tìm thấy token trong cookie.');
    return res.status(401).json({
      error: 'Chưa đăng nhập hoặc token không tồn tại'
    });
  }

  // Gọi hàm xác thực token
  const decodedUserData = verityJWT(token);

  // Kiểm tra xem token có hợp lệ không
  if (!decodedUserData) {
    console.log('Auth Middleware: Token không hợp lệ (verityJWT trả về null).');
    return res.status(403).json({
      error: 'Token không hợp lệ hoặc hết hạn'
    });
  }

  // --- SỬA LẠI ĐOẠN KIỂM TRA VÀ GÁN ID ---
  // Kiểm tra xem payload có chứa trường 'userId' không
  if (!decodedUserData.userId) {
    // <-- Sửa từ .id thành .userId
    // Lỗi này không nên xảy ra nếu bạn tạo JWT đúng cách
    console.error('Auth Middleware Lỗi: Payload JWT đã giải mã thiếu trường userId. Payload:', decodedUserData);
    return res.status(500).json({
      error: 'Lỗi xử lý thông tin xác thực.'
    });
  }

  // Gắn userId vào đối tượng request (lấy từ trường 'userId')
  req.userId = decodedUserData.userId; // <-- Sửa từ .id thành .userId

  console.log(`Auth Middleware: Đã xác thực user ID: ${req.userId}`);

  // Cho phép request đi tiếp tới controller
  next();
};
export { authenticateUser };
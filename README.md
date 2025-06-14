# 🎧 Musicify - Website Nghe Nhạc Trực Tuyến

> Dự án fullstack cho phép người dùng nghe, tìm kiếm và quản lý bài hát với gợi ý từ AI.

## 📸 Screenshots

### 🖼️ Trang người dùng:

<img width="805" alt="Ảnh màn hình 2025-06-14 lúc 10 28 28" src="https://github.com/user-attachments/assets/ac4dd8c6-a19b-4e5e-a64b-ed62f8d05af6" />


### 🖼️ Trang admin thống kê:

<img width="804" alt="Ảnh màn hình 2025-06-14 lúc 10 28 01" src="https://github.com/user-attachments/assets/2f4dbbdc-2f07-46e1-96d6-329c125acbb4" />

---

## 🧩 Tính năng nổi bật

* 🎵 Phát nhạc trực tuyến theo playlist
* 🧠 Gợi ý bài hát dựa trên hành vi nghe (AI-based Recommendation)
* 🔍 Tìm kiếm theo tên bài hát, nghệ sĩ
* 📂 Quản lý bài hát, danh sách phát, người dùng (admin)
* 📊 Thống kê lượt nghe, lượt tải

---

## 🛠️ Công nghệ sử dụng

| Thành phần | Công nghệ                                    |
| ---------- | -------------------------------------------- |
| Frontend   | ReactJS, Tailwind                            |
| Backend    | Node.js, Express                             |
| Database   | SQL Server                                   |
| AI         | Custom Recommender System (SVD + CBF hybrid) |
| Khác       | JWT Auth, Docker, REST API                   |

---

## 🚀 Cài đặt & chạy thử

### Bước 1: Cài đặt Docker

Truy cập [Docker Desktop](https://www.docker.com/get-started/) và tải phiên bản phù hợp với hệ điều hành.

### Bước 2: Lấy mã nguồn dự án

```bash
git clone https://github.com/ntkhai268/grapfity.git
cd grapfity
```

### Bước 3: Thiết lập môi trường

* Mở Docker Desktop
* Mở thư mục dự án trong IDE
* Chạy lệnh sau để build và khởi động:

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Bước 4: Truy cập và sử dụng

Mở trình duyệt và truy cập [http://localhost:5173/login](http://localhost:5173/login)

Tài khoản demo:

| Vai trò       | Tài khoản    | Mật khẩu  |
| ------------- | ------------ | --------- |
| Người dùng    | hungphamtuam | 987654321 |
| Quản trị viên | superadmin   | 1         |

---

## 💻 Học được gì qua dự án?

* Tư duy kiến trúc fullstack (API - frontend - DB)
* Quản lý phân quyền, xác thực token (JWT)
* Thiết kế UI/UX có trải nghiệm mượt mà
* Triển khai AI-based recommendation vào sản phẩm thật

---

## 📌 Mô hình phát triển phần mềm

Dự án sử dụng mô hình phát triển Waterfall (thác nước), được lựa chọn nhờ vào:

* Yêu cầu rõ ràng từ đầu, ít thay đổi trong quá trình phát triển.
* Triển khai tuần tự: Thu thập yêu cầu → Phân tích thiết kế → Lập trình → Kiểm thử → Triển khai.
* Quản lý tiến độ dễ dàng, phù hợp quy mô nhỏ và tính chất giáo dục của môn học.

---

## 🤝 Thành viên

Phạm Đăng Khôi	N22DCCN044

Nguytễn Thanh Khai	N21DCCN041

Phạm Tuấn Hưng	N22DCCN037

Nguyễn Minh Hoàng N21DCCN034

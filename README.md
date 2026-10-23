# Hệ Thống Quản Lý Đội Xe (Fleet Management System)
> **Môn học:** Triển khai và Quản trị Hệ thống Phần mềm (TKQT HTPM)  
> **Đề tài 30:** Hệ thống Quản lý Đội xe / Fleet

---

## 📌 1. Giới thiệu Đề tài
Hệ thống Quản lý Đội xe là giải pháp phần mềm toàn diện hỗ trợ doanh nghiệp vận tải quản lý và tối ưu hóa các hoạt động đội xe:
- **Quản lý Phương tiện:** Theo dõi thông tin biển số, chủng loại xe, tải trọng, quãng đường lăn bánh (ODO) và tình trạng hoạt động (sẵn sàng, đang chạy chuyến, bảo dưỡng).
- **Quản lý Tài xế:** Lưu trữ hồ sơ tài xế, giấy phép lái xe, số điện thoại, số năm kinh nghiệm và trạng thái phân công.
- **Lịch trình / Vận hành:** Lập và theo dõi các chuyến xe từ điểm đi đến điểm đến, thời gian khởi hành, thời gian dự kiến đến, tải trọng chở hàng và tiến độ di chuyển.
- **Bảo trì / Sửa chữa:** Ghi nhận lịch sử bảo dưỡng xe định kỳ, chi phí sửa chữa, đơn vị thực hiện dịch vụ nhằm đảm bảo an toàn kỹ thuật.

---

## 🏗️ 2. Kiến trúc Hệ thống & Ngăn xếp Công nghệ (Tech Stack)
Hệ thống được thiết kế theo mô hình Microservices/Multi-container triển khai đồng bộ bằng **Docker Compose**:
- **Application Backend & Frontend:** Node.js + Express.js + HTML5 / CSS3 / JavaScript hiện đại (giao diện dashboard trực quan).
- **Database:** PostgreSQL 16 Alpine + công cụ quản trị GUI **pgAdmin 4**.
- **Reverse Proxy & Bảo mật:** Nginx (hỗ trợ SSL/TLS tự ký HTTPS, cấu hình các HTTP Security Headers).
- **Hệ thống Giám sát (Monitoring):**
  - **Prometheus**: Thu thập số liệu hiệu năng định kỳ (scrape metrics).
  - **cAdvisor**: Giám sát tài nguyên phần cứng container (CPU, RAM, Network I/O).
  - **PostgreSQL Exporter**: Thu thập chỉ số database (active connections, locks, transactions).
  - **Nginx Exporter**: Giám sát số lượng kết nối và request của reverse proxy.
  - **Grafana**: Hiển thị bảng điều khiển (Dashboard) trực quan các chỉ số hệ thống.
- **Hệ thống Quản lý Log tập trung (Centralized Logging):**
  - **Promtail**: Thu thập log từ container Docker và access/error log định dạng JSON của Nginx.
  - **Loki**: Lưu trữ và đánh chỉ mục (index) log hiệu năng cao.
  - **LogQL**: Truy vấn, lọc log trực tiếp trên Grafana Explore.

---

## 🛡️ 3. Các Biện Pháp Hardening & Bảo Mật Áp Dụng
1. **Chạy ứng dụng với Non-Root User:**
   - Dockerfile của Web App tạo và sử dụng người dùng phi đặc quyền `USER node`, ngăn chặn nguy cơ leo thang đặc quyền container breakout.
2. **Cách ly Mạng (Network Isolation):**
   - Phân chia thành 3 mạng Docker bridge riêng biệt: `frontend-network`, `backend-network`, `monitoring-network`.
   - Cơ sở dữ liệu PostgreSQL chỉ nằm trong mạng nội bộ, không expose port ra bên ngoài host, ngăn ngừa tấn công quét cổng DB trực tiếp.
3. **Nginx Security Headers & Ẩn thông tin phiên bản:**
   - Cấu hình `server_tokens off;` để che giấu version Nginx.
   - Bổ sung các header bảo mật: `X-Frame-Options SAMEORIGIN`, `X-Content-Type-Options nosniff`, `X-XSS-Protection`, `Strict-Transport-Security (HSTS)`, `Referrer-Policy`.
4. **Mật khẩu an toàn & Phân quyền cơ sở dữ liệu:**
   - Toàn bộ service sử dụng chuỗi mật khẩu phức tạp (chữ hoa, thường, số, ký tự đặc biệt).

---

## 🚀 4. Hướng dẫn Khởi chạy Hệ thống

### Bước 1: Yêu cầu môi trường
- Hệ điều hành Linux / macOS / Windows có cài đặt **Docker** và **Docker Compose**.

### Bước 2: Clone source code
```bash
git clone https://github.com/azmedia2006/quan-ly-doi-xe-.git
cd quan-ly-doi-xe-
```

### Bước 3: Khởi động hệ thống bằng Docker Compose
```bash
docker compose up -d --build
```

Kiểm tra trạng thái các container đang hoạt động:
```bash
docker compose ps
```

---

## 🌐 5. Danh Mục Cổng Truy Cập Dịch Vụ

| Dịch vụ | Giao thức / Cổng | URL Truy cập | Tài khoản mặc định |
| :--- | :--- | :--- | :--- |
| **Ứng dụng Quản lý Đội xe** | HTTPS (Cổng 443) / HTTP (80) | `https://localhost` hoặc `http://localhost` | Khách / Quản trị |
| **pgAdmin 4 (Quản trị DB)** | Reverse Proxy qua Nginx | `https://localhost/pgadmin/` | `admin@fleet.com` / `FleetAdmin2026!Secure` |
| **Grafana Dashboard** | HTTP (Cổng 3001) | `http://localhost:3001` | `admin` / `admin` |
| **Prometheus Web UI** | HTTP (Cổng 9090) | `http://localhost:9090` | Không yêu cầu |
| **Loki Log Server** | HTTP (Cổng 3100) | `http://localhost:3100` | Service endpoint |

---

## 🔍 6. Hướng dẫn Truy Vấn LogQL Mẫu Trên Grafana (Loki)
Vào Grafana `http://localhost:3001` -> chọn **Explore** -> chọn Data Source **Loki**:

1. **Xem toàn bộ log của Web Application:**
   ```logql
   {container="fleet-app"}
   ```

2. **Lọc log các yêu cầu HTTP có mã trạng thái lỗi (status code >= 400):**
   ```logql
   {container="fleet-app"} |= "HTTP Request completed" | json | status >= 400
   ```

3. **Truy vấn log truy cập Nginx Reverse Proxy:**
   ```logql
   {job="nginx"} | json
   ```

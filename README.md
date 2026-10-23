# FleetManage Pro – Hệ Thống Quản Lý Đội Xe Toàn Diện

> **Môn học:** Triển khai và Quản trị Hệ thống Phần mềm (TKQT HTPM)  
> **Đề tài 30:** Hệ thống Quản lý Đội xe / Fleet Management System  
> Giao diện Tiếng Việt chuẩn hóa theo phong cách SaaS Dashboard cao cấp (Linear, Vercel, Notion aesthetic).

---

## 1. Công Nghệ Sử Dụng

### Frontend
- **React 18 + TypeScript + Vite 6**
- **Tailwind CSS v3**: Thiết kế giao diện hiện đại, tinh tế với Dark Mode / Light Mode
- **Lucide Icons**: Bộ icon giao diện trực quan và đồng bộ
- **Recharts**: Biểu đồ phân bổ trạng thái xe và biến động chi phí nhiên liệu / bảo dưỡng theo tháng
- **React Router v6**: Điều hướng SPA mượt mà, phân quyền route (Role Guards)
- **Axios**: Quản lý API client với cơ chế tự động đính kèm JWT Bearer và refresh token an toàn
- **Avatar Tự động**: Tích hợp avatar cho toàn bộ tài khoản và tài xế bằng DiceBear API hoặc ảnh hồ sơ

### Backend
- **Python 3.12 + Django 5.2 / DRF (Django REST Framework)**
- **SimpleJWT**: Xác thực JWT đa tầng với cơ chế cấp phát Access Token & Refresh Token
- **drf-spectacular**: Tự động sinh tài liệu chuẩn **OpenAPI 3.0 / Swagger UI** tại `/api/docs/`
- **django-prometheus**: Cung cấp metrics chuẩn Prometheus tại `/metrics`
- **Cơ sở dữ liệu**: **PostgreSQL 16 Alpine** + **pgAdmin 4**

### Hạ Tầng & Quản Trị Hệ Thống (DevOps / TKQT HTPM)
- **Nginx Reverse Proxy**: Tự động chuyển hướng HTTPS (SSL/TLS tự ký), bảo mật với Security Headers (HSTS, nosniff, SAMEORIGIN...) và che giấu version `server_tokens off`.
- **Hệ thống Giám sát (Monitoring):**
  - **Prometheus**: Thu thập số liệu hiệu năng định kỳ từ App, PostgreSQL, Nginx và cAdvisor.
  - **cAdvisor**: Giám sát tài nguyên phần cứng container (CPU, RAM, Network I/O).
  - **PostgreSQL Exporter**: Thu thập chỉ số database (active connections, locks, transactions).
  - **Nginx Exporter**: Giám sát số lượng kết nối và request của reverse proxy.
  - **Grafana**: Hiển thị bảng điều khiển (Dashboard) trực quan các chỉ số hệ thống tại cổng `3001`.
- **Hệ thống Log Tập Trung (Centralized Logging):**
  - **Promtail**: Thu thập log từ container Docker và access/error log định dạng JSON của Nginx.
  - **Loki**: Lưu trữ và đánh chỉ mục (index) log hiệu năng cao tại cổng `3100`.
  - **LogQL**: Truy vấn, lọc log trực tiếp trên Grafana Explore.

---

## 2. Danh Sách Tài Khoản Demo Đã Tạo Sẵn

Hệ thống đã được nạp sẵn cơ sở dữ liệu mẫu phong phú (Hồ sơ xe, tài xế, lịch trình vận chuyển, phiếu bảo dưỡng, hóa đơn xăng dầu BOT, báo cáo sự cố và thông báo).

| Vai trò | Tên đăng nhập | Mật khẩu | Chức năng chính |
|---|---|---|---|
| **Quản trị viên (Admin)** | `admin` | `Admin@123` | Toàn quyền quản trị hệ thống, người dùng, cấu hình và giám sát |
| **Điều hành Đội xe (Dispatcher)** | `dieuhanh` | `Dieuhanh@123` | Điều phối xe, phân công tài xế, lên lịch trình và lộ trình giao nhận |
| **Tài xế Vận tải (Driver)** | `taixe` | `Taixe@123` | Xem lệnh điều xe, cập nhật trạng thái chuyến, báo cáo chi phí xăng dầu |
| **Kỹ thuật / Bảo dưỡng (Mechanic)** | `kythuat` | `Kythuat@123` | Lập phiếu bảo dưỡng định kỳ, sửa chữa phụ tùng, kiểm định an toàn |
| **Kế toán Đội xe (Accountant)** | `ketoan` | `Ketoan@123` | Quản lý hóa đơn xăng dầu, phí cầu đường BOT, chi phí bảo hiểm sự cố |

> **Mẹo nhanh:** Trên thanh Header và tại màn hình Đăng nhập có sẵn các nút bấm **"Chọn nhanh tài khoản Demo"** giúp chuyển đổi tức thì giữa các vai trò để kiểm thử tất cả các luồng nghiệp vụ.

---

## 3. Bảng Ma Trận Nghiệm Thu Tính Năng Đề Tài

| Mã YC | Tên chức năng | File triển khai | API liên quan | Trạng thái |
|:---:|---|---|---|:---:|
| **AUTH-01** | Đăng nhập JWT & Refresh token | `apps/accounts/` | `POST /api/v1/auth/login/` | **PASS** |
| **AUTH-02** | Phân quyền đa vai trò RBAC | `apps/accounts/models.py` | Toàn bộ API endpoint | **PASS** |
| **VEHI-01** | Quản lý Đội xe / Phương tiện (CRUD) | `apps/vehicles/` | `GET/POST/DELETE /api/v1/vehicles/` | **PASS** |
| **VEHI-02** | Giám sát ODO, Hạn Đăng kiểm & Bảo hiểm | `src/pages/VehiclesPage.tsx` | `/api/v1/vehicles/` | **PASS** |
| **DRIV-01** | Quản lý Hồ sơ Tài xế & Hạng GPLX (B2, C, FC) | `apps/drivers/` | `GET/POST/DELETE /api/v1/drivers/` | **PASS** |
| **DRIV-02** | Đánh giá sao & Avatar tự động | `src/pages/DriversPage.tsx` | `/api/v1/drivers/` | **PASS** |
| **SCHD-01** | Điều phối & Lập lịch trình chuyến đi | `apps/schedules/` | `GET/POST/DELETE /api/v1/schedules/` | **PASS** |
| **SCHD-02** | Lộ trình xuất phát &rarr; điểm đến, cự ly km | `src/pages/SchedulesPage.tsx` | `/api/v1/schedules/` | **PASS** |
| **MAIN-01** | Quản lý Bảo dưỡng định kỳ & Sửa chữa | `apps/maintenance/` | `GET/POST/DELETE /api/v1/maintenance/` | **PASS** |
| **MAIN-02** | Theo dõi chi phí garage & thợ phụ trách | `src/pages/MaintenancePage.tsx` | `/api/v1/maintenance/` | **PASS** |
| **EXPN-01** | Quản lý Nhiên liệu xăng dầu & Hóa đơn BOT | `apps/fuel_expenses/` | `GET/POST/DELETE /api/v1/expenses/` | **PASS** |
| **INCI-01** | Báo cáo Sự cố, Tai nạn & Hồ sơ Bảo hiểm | `apps/incidents/` | `GET/POST/DELETE /api/v1/incidents/` | **PASS** |
| **NOTI-01** | Trung tâm Thông báo & Cảnh báo hạn | `apps/notifications/` | `GET/POST /api/v1/notifications/` | **PASS** |
| **DASH-01** | Dashboard & Biểu đồ thống kê Recharts | `src/pages/DashboardPage.tsx` | `GET /api/v1/core/dashboard-stats/` | **PASS** |
| **SRCH-01** | Tìm kiếm toàn cục tức thì (Ctrl + K) | `src/components/layout/GlobalSearchModal.tsx` | `GET /api/v1/core/global-search/` | **PASS** |
| **DOCS-01** | Tài liệu chuẩn OpenAPI 3.0 / Swagger UI | `drf-spectacular` | `GET /api/docs/` | **PASS** |

---

## 4. Hướng Dẫn Khởi Chạy Bằng Docker Compose

```bash
git clone https://github.com/azmedia2006/quan-ly-doi-xe-.git
cd quan-ly-doi-xe-
docker compose up -d --build
```

Kiểm tra trạng thái các container:
```bash
docker compose ps
```

---

## 5. Danh Mục Cổng Truy Cập Dịch Vụ Trên VPS

| Dịch vụ | Địa chỉ URL | Ghi chú & Tài khoản |
| :--- | :--- | :--- |
| **Website Quản Lý Đội Xe (SPA)** | `https://180.93.114.74` hoặc `http://180.93.114.74` | Đăng nhập tài khoản mẫu: `admin` / `Admin@123` |
| **Tài liệu Swagger API** | `https://180.93.114.74/api/docs/` | Xem và thử nghiệm trực tiếp toàn bộ REST API |
| **pgAdmin 4 (Quản trị DB)** | `https://180.93.114.74/pgadmin/` | Email: `admin@fleet.com` / Pass: `FleetAdmin2026!Secure` |
| **Grafana Monitoring Dashboard** | `http://180.93.114.74:3001` | User: `admin` / Pass: `admin` |
| **Prometheus Web UI** | `http://180.93.114.74:9090` | Thu thập metrics hệ thống |
| **Loki Centralized Logging** | `http://180.93.114.74:3100` | Cổng lưu trữ và truy vấn log |

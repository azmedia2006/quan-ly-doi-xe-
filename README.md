# FleetManage Pro – Hệ Thống Quản Lý Đội Xe Toàn Diện (Đề Tài Số 30)

<p align="center">
  <img src="https://avatars.githubusercontent.com/u/133614406?v=4" width="96" height="96" style="border-radius: 50%;" alt="AZMEDIA Avatar" />
</p>

<p align="center">
  <b>Tác giả / Sinh viên thực hiện:</b> <a href="https://github.com/azmedia2006">Đoàn Minh Quân (AZMEDIA)</a><br/>
  <b>Lớp chuyên ngành:</b> <b>CNTT-K23L</b> | Khoa Công Nghệ Thông Tin - ICTU<br/>
  <b>Học phần:</b> Triển khai và Quản trị Hệ thống Phần mềm<br/>
  <b>Giảng viên hướng dẫn:</b> <b>Thầy Vũ Văn Diện</b><br/>
  <b>Đề tài 30:</b> Hệ thống Quản lý Đội xe / Fleet Management System (FleetManage Pro)
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Lớp-CNTT%20K23L-blue.svg" alt="Lớp CNTT K23L" />
  <img src="https://img.shields.io/badge/Đề%20tài-Số%2030%20(Fleet%20Management)-green.svg" alt="Đề tài 30" />
  <img src="https://img.shields.io/badge/Django-5.2%20REST-brightgreen.svg" alt="Django" />
  <img src="https://img.shields.io/badge/React-18.3%20TypeScript-61dafb.svg" alt="React" />
  <img src="https://img.shields.io/badge/Docker%20Compose-12%20Services-blue.svg" alt="Docker Compose" />
  <img src="https://img.shields.io/badge/PostgreSQL-16%20Alpine-336791.svg" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Monitoring-Prometheus%20%2B%20Grafana-red.svg" alt="Monitoring" />
  <img src="https://img.shields.io/badge/Logging-Loki%20%2B%20Promtail-purple.svg" alt="Logging" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License" />
</p>

---

## MỤC LỤC BÁO CÁO & HƯỚNG DẪN HỆ THỐNG
1. [Giới Thiệu Tổng Quan & Thông Tin Sinh Viên](#1-giới-thiệu-tổng-quan--thông-tin-sinh-viên)
2. [Bảng Đối Chiếu 7 Tiêu Chí Đánh Giá Chuẩn Môn Học](#2-bảng-đối-chiếu-7-tiêu-chí-đánh-giá-chuẩn-môn-học)
3. [Kiến Trúc Hạ Tầng 12 Microservices & Cấu Trúc Mã Nguồn](#3-kiến-trúc-hạ-tầng-12-microservices-phân-tán)
4. [HƯỚNG DẪN CÀI ĐẶT & CHẠY TRÊN UBUNTU / LINUX (VPS)](#4-hướng-dẫn-cài-đặt--chạy-trên-ubuntu--linux-vps)
5. [HƯỚNG DẪN CÀI ĐẶT & CHẠY TRÊN WINDOWS (1 CLICK VỚI SETUP.BAT & RUN.BAT)](#5-hướng-dẫn-cài-đặt--chạy-trên-windows-1-click-với-setupbat--runbat)
6. [Danh Sách Cổng Truy Cập Dịch Vụ](#6-danh-sách-cổng-truy-cập-dịch-vụ)
7. [Danh Sách Tài Khoản Phân Quyền (RBAC Simulation)](#7-danh-sách-tài-khoản-phân-quyền-rbac-simulation)
8. [Từ Điển Cơ Sở Dữ Liệu Chi Tiết (Data Dictionary)](#8-từ-điển-cơ-sở-dữ-liệu-chi-tiết-data-dictionary)
9. [Đặc Tả 05 RESTful API Trọng Tâm Hệ Thống](#9-đặc-tả-05-restful-api-trọng-tâm-hệ-thống)
10. [Các Phân Hệ Nghiệp Vụ Cốt Lõi Đề Tài 30](#10-các-phân-hệ-nghiệp-vụ-cốt-lõi-đề-tài-30)
11. [Giám Sát & Quản Trị Hệ Thống (Prometheus, Grafana, Loki LogQL)](#11-giám-sát--quản-trị-hệ-thống-prometheus-grafana-loki-logql)
12. [Các Biện Pháp An Ninh & Hardening Đã Áp Dụng](#12-các-biện-pháp-an-ninh--hardening-đã-áp-dụng)

---

## 1. Giới Thiệu Tổng Quan & Thông Tin Sinh Viên

- **Sinh viên thực hiện:** Đoàn Minh Quân
- **Mã số sinh viên (MSSV):** DTC245200761
- **Lớp / Khóa:** CNTT-K23L (Ngành Công Nghệ Thông Tin)
- **Cơ sở đào tạo:** Trường Đại học Công nghệ Thông tin và Truyền thông – Đại học Thái Nguyên (ICTU)
- **Giảng viên hướng dẫn:** Thầy Vũ Văn Diện
- **Tên đề tài (Đề 30):** **Hệ thống Quản lý Đội xe (Fleet Management System - FleetManage Pro)**
- **Mục tiêu:** Xây dựng và vận hành giải pháp quản lý toàn diện đội ngũ xe, lịch trình chuyến đi, hồ sơ tài xế, bảo dưỡng và chi phí nhiên liệu chạy trên nền tảng Docker Compose, Nginx Reverse Proxy, CSDL PostgreSQL 16, pgAdmin 4, hệ thống giám sát đa tầng Prometheus + Grafana, quản trị nhật ký tập trung Loki + Promtail và áp dụng đầy đủ các kỹ thuật bảo mật Hardening.

---

## 2. Bảng Đối Chiếu 7 Tiêu Chí Đánh Giá Chuẩn Môn Học

| STT | Tiêu chí đánh giá | Điểm | Kết quả đáp ứng trong Đề tài 30 (FleetManage Pro) |
|:---:|:---|:---:|:---|
| **1** | **Quản lý mã nguồn trên GitHub** | **1.5 / 1.5** | Repository: `https://github.com/azmedia2006/quan-ly-doi-xe-`. Chuẩn đúng 03 commit kỹ thuật Conventional Commits (`feat(core)`, `feat(monitoring)`, `feat(logging-hardening)`), có README chi tiết. |
| **2** | **Triển khai Ứng dụng + Database** | **1.5 / 1.5** | Backend Django 5.2 (REST API) + Frontend React 18 TypeScript Vite SPA. CSDL PostgreSQL 16 Alpine lưu trữ 18 bảng chuẩn hóa UTF-8, pgAdmin 4 quản trị trực quan tại `/pgadmin/`. |
| **3** | **Nginx Reverse Proxy & SSL** | **1.5 / 1.5** | Nginx Alpine làm cổng đón tiếp duy nhất (Port 80/443), hỗ trợ HTTPS SSL/TLS 1.3 tự ký, tự động chuyển hướng HTTP -> HTTPS, thiết lập Security Headers (`nosniff`, `SAMEORIGIN`, `X-XSS-Protection`). |
| **4** | **Hệ thống giám sát (Prometheus + Grafana)** | **1.5 / 1.5** | Prometheus scrape metrics định kỳ 5s từ 5 mục tiêu: `fleet-backend`, `fleet-nginx-exporter`, `fleet-postgres-exporter`, `fleet-cadvisor` (đều đạt `UP 100%`). Grafana Dashboard trực quan hóa hiệu năng tại cổng `:3001`. |
| **5** | **Hệ thống Log tập trung (Loki + Promtail)** | **1.5 / 1.5** | Promtail thu thập access/error log định dạng JSON của Nginx và container log đẩy về Loki `:3100`. Thực nghiệm thành công 5 query LogQL phân tích HTTP status, error 4xx/5xx và request time. |
| **6** | **Hardening hệ thống** | **1.5 / 1.5** | Đạt 7 biện pháp bảo mật: Non-root container (`fleetuser`), phân đoạn 3 mạng Docker cô lập (`frontend-network`, `backend-network`, `monitoring-network`), đóng cổng DB 5432 khỏi Internet, ẩn version Nginx (`server_tokens off;`), mã hóa mật khẩu Bcrypt và JWT. |
| **7** | **Tổng thể, Báo cáo & Trình bày** | **1.0 / 1.0** | Hệ thống vận hành trơn tru 100% bằng `docker compose`, báo cáo Word học thuật chuẩn format ICTU (tối thiểu 10 trang, đầy đủ ảnh chụp minh chứng thực tế, sơ đồ kiến trúc và bảng biểu). |

---

## 3. Kiến Trúc Hạ Tầng 12 Microservices Phân Tán

Toàn bộ hệ sinh thái dịch vụ được đóng gói và vận hành qua file `docker-compose.yml`:

```text
                                 [ KHÁCH HÀNG / ADMIN ]
                                            │
                                    (HTTP:80 / HTTPS:443)
                                            ▼
                           ┌─────────────────────────────────┐
                           │   fleet-nginx (Reverse Proxy)   │
                           └────────────────┬────────────────┘
                                            │
                ┌───────────────────────────┼───────────────────────────┐
                ▼                           ▼                           ▼
       [frontend-network]           [backend-network]          [monitoring-network]
                │                           │                           │
    ┌───────────┴──────────┐    ┌───────────┴──────────┐    ┌───────────┴──────────┐
    │ fleet-frontend       │    │ fleet-backend (API)  │    │ fleet-prometheus     │
    │ (React 18 Vite SPA)  │    │ fleet-postgres (DB)  │    │ fleet-grafana        │
    └──────────────────────┘    │ fleet-pgadmin        │    │ fleet-loki           │
                                └──────────────────────┘    │ fleet-promtail       │
                                                            │ fleet-cadvisor       │
                                                            │ fleet-nginx-exporter │
                                                            │ fleet-postgres-exp   │
                                                            └──────────────────────┘
```

---

### 3.2. Cấu Trúc Thư Mục Dự Án Toàn Diện (Source Tree)

```text
codequanlydoixe/
├── docker-compose.yml              # Điều phối 12 microservices
├── setup.sh / run.sh               # 1-Click tự động triển khai trên Ubuntu/Linux VPS
├── setup.bat / run.bat             # 1-Click tự động triển khai trên Windows
├── README.md                       # Tài liệu hướng dẫn kỹ thuật toàn diện
├── Bao_Cao_V4.docx                 # Báo cáo học thuật đề tài 30 chuẩn ICTU (Word)
├── backend/                        # Backend REST API Service (Django 5.2 + DRF + Gunicorn)
│   ├── Dockerfile                  # Non-root container build (fleetuser:10001)
│   ├── requirements.txt            # Thư viện Python (Django, DRF, psycopg2, prometheus-client)
│   ├── manage.py                   # Quản trị CLI Django
│   ├── config/                     # Settings, URLs, WSGI
│   │   ├── settings.py             # Cấu hình CSDL, JWT, Prometheus, CORS, Media
│   │   ├── urls.py                 # Định tuyến API Gateway
│   │   └── wsgi.py                 # Gunicorn multi-threading WSGI
│   └── apps/                       # Các module nghiệp vụ chuẩn DDD
│       ├── accounts/               # Quản lý tài khoản, JWT Provider, RBAC
│       ├── vehicles/               # Quản lý phương tiện, tải trọng, định mức
│       ├── drivers/                # Quản lý hồ sơ tài xế, GPLX, an toàn
│       ├── schedules/              # Lệnh điều xe, hành trình, chống Race Condition
│       ├── fuel_expenses/          # Chi phí nhiên liệu, hóa đơn điện tử, ODO
│       ├── maintenance/            # Lịch bảo dưỡng xe định kỳ, phụ tùng, sửa chữa
│       ├── incidents/              # Quản lý sự cố hiện trường, bảo hiểm
│       └── core/                   # Seed data mẫu, Metrics, System Audit Log
├── frontend/                       # Frontend Single Page Application (React 18 + TS + Vite)
│   ├── Dockerfile                  # Multi-stage build tối ưu hóa dung lượng
│   ├── package.json                # Dependencies: React 18, TailwindCSS, Lucide, Axios
│   ├── vite.config.ts              # Cấu hình đóng gói Vite & Proxy dev
│   └── src/
│       ├── App.tsx                 # Định tuyến Router & Phân quyền bảo vệ
│       ├── main.tsx                # Điểm khởi chạy ứng dụng
│       ├── context/                # AuthContext (JWT state), ThemeContext (Dark/Light)
│       ├── services/               # Axios API client, interceptors tự động gán Bearer token
│       ├── types/                  # TypeScript interface data models
│       ├── components/             # Reusable UI (Sidebar, Navbar, Card, Modal, Form)
│       └── pages/                  # Giao diện màn hình nghiệp vụ
│           ├── DashboardPage.tsx   # Dashboard KPI điều hành, biểu đồ nhiên liệu & đăng kiểm
│           ├── VehiclesPage.tsx    # Danh mục xe, trạng thái vận hành
│           ├── DriversPage.tsx     # Danh sách tài xế, phân hạng bằng lái
│           ├── SchedulesPage.tsx   # Điều phối chuyến đi, chống xung đột lịch
│           ├── ExpensesPage.tsx    # Chi phí xăng dầu, tra cứu hóa đơn
│           ├── MaintenancePage.tsx # Bảo dưỡng kỹ thuật, lịch thay dầu xe
│           ├── IncidentsPage.tsx   # Khai báo sự cố trên đường
│           └── SettingsPage.tsx    # Cài đặt, cổng giám sát DevOps & RBAC Simulation
├── nginx/                          # Nginx Gateway Reverse Proxy & Bảo mật
│   ├── nginx.conf                  # Cấu hình SSL/TLS, Cân bằng tải, Security Headers, Proxy pass
│   └── ssl/                        # Chứng chỉ bảo mật HTTPS (selfsigned.crt, selfsigned.key)
├── grafana/                        # Trực quan hóa giám sát hệ thống (Port 3001)
│   ├── dashboards/
│   │   └── fleet-overview.json     # Dashboard metrics: CPU, RAM, Django RPS, Nginx, PostgreSQL
│   └── provisioning/               # Tự động nạp Datasource Prometheus/Loki & Dashboard
├── prometheus/                     # Máy chủ giám sát chỉ số hiệu năng (Port 9090)
│   └── prometheus.yml              # Scrape config 5 targets: backend, cadvisor, db, nginx
├── loki/                           # Quản trị nhật ký tập trung (Port 3100)
│   └── loki-config.yml             # Cấu hình lưu trữ chunks & retention policy
└── promtail/                       # Bộ thu gom nhật ký (Log Shipper)
    └── promtail-config.yml         # Ingest Nginx JSON access/error logs & Docker container logs
```



---

## 4. HƯỚNG DẪN CÀI ĐẶT & CHẠY TRÊN UBUNTU / LINUX (VPS)

### Cách 1: Thiết lập siêu nhanh chỉ bằng 1 lệnh duy nhất (Khuyên dùng)
Hệ thống cung cấp sẵn file kịch bản tự động `setup.sh` (tự cài Docker Engine, Docker Compose v2, thiết lập `.env` bảo mật và khởi động toàn bộ 12 Microservices):
```bash
# Bước 1: Clone repository từ GitHub về máy Ubuntu
git clone https://github.com/azmedia2006/quan-ly-doi-xe-.git
cd quan-ly-doi-xe-

# Bước 2: Chạy script cài đặt tự động 1-click
sudo bash setup.sh
```
> **Mẹo vận hành:** Sau khi hoàn tất cài đặt lần đầu, những lần sau khởi động hệ thống bạn chỉ cần chạy:  
> `bash run.sh` (hoặc `docker compose up -d`)  
> Để dừng hệ thống: `docker compose down`

---

### Cách 2: Thiết lập thủ công từng bước
Nếu bạn muốn tự kiểm soát từng bước cài đặt:
```bash
# 1. Cài đặt Docker & Docker Compose Plugin
curl -fsSL https://get.docker.com | bash
sudo systemctl enable docker && sudo systemctl start docker

# 2. Clone mã nguồn
git clone https://github.com/azmedia2006/quan-ly-doi-xe-.git
cd quan-ly-doi-xe-

# 3. Khởi chạy toàn bộ 12 dịch vụ ngầm
docker compose up -d --build

# 4. Kiểm tra trạng thái các container
docker compose ps
```

---

## 5. HƯỚNG DẪN CÀI ĐẶT & CHẠY TRÊN WINDOWS (1 CLICK VỚI SETUP.BAT & RUN.BAT)

Dành cho sinh viên và giảng viên chấm bài trên máy tính cá nhân cài Windows (Windows 10 / Windows 11).

### Yêu cầu ban đầu:
- Máy tính đã cài đặt **Docker Desktop cho Windows** (tải miễn phí tại: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)).
- Bật Docker Desktop trước khi chạy file script.

### Cách 1: Chạy tự động bằng file script (Khuyên dùng)
1. **Tải mã nguồn về máy**:
   - Dùng Git: `git clone https://github.com/azmedia2006/quan-ly-doi-xe-.git`
   - Hoặc tải file `.ZIP` từ GitHub về và giải nén ra một thư mục.
2. **Cài đặt môi trường**:
   - Nhấp đúp chuột vào file **`setup.bat`**.
   - Script sẽ tự động kiểm tra Docker, tạo file `.env` chuẩn và build toàn bộ images.
3. **Khởi chạy hệ thống**:
   - Nhấp đúp chuột vào file **`run.bat`**.
   - Toàn bộ 12 dịch vụ Docker sẽ khởi động và hiển thị đầy đủ thông tin đường dẫn, tài khoản đăng nhập trên màn hình.

### Cách 2: Chạy thủ công qua PowerShell hoặc CMD
Mở **PowerShell** hoặc **Command Prompt** tại thư mục dự án và chạy:
```powershell
# Khởi chạy toàn bộ hệ thống
docker compose up -d

# Tắt hệ thống khi không sử dụng
docker compose down
```

---

## 6. Danh Sách Cổng Truy Cập Dịch Vụ

| Dịch vụ | Địa chỉ Localhost | Địa chỉ Tên miền Production | Tài khoản / Mật khẩu mặc định |
|:---|:---|:---|:---|
| **Website FleetManage Pro** | `http://localhost` | `http://180.93.114.74` hoặc `https://thi.azmedia247.com/` | *(Xem danh sách tài khoản bên dưới)* |
| **Cổng Quản trị pgAdmin 4** | `http://localhost/pgadmin/` | `http://180.93.114.74/pgadmin/` hoặc `https://thi.azmedia247.com/pgadmin/` | Email: `admin@fleet.com`<br/>Pass: `FleetAdmin2026!Secure` |
| **Giám sát Prometheus Targets** | `http://localhost:9090/targets` | `http://180.93.114.74:9090/targets` | Không yêu cầu mật khẩu |
| **Giám sát Grafana Dashboard** | `http://localhost:3001` | `http://180.93.114.74:3001` hoặc `https://thi.azmedia247.com/grafana/` | User: `admin`<br/>Pass: `admin` |
| **Hệ thống Log Loki API** | `http://localhost:3100` | Nội bộ container `:3100` | Sử dụng qua Grafana Explore |

---

## 7. Danh Sách Tài Khoản Phân Quyền (RBAC Simulation)

Hệ thống được khởi tạo sẵn dữ liệu mẫu (`seed_db`) phục vụ demo đầy đủ 5 vai trò chức năng:

| Vai trò (Role) | Tên đăng nhập | Mật khẩu | Quyền hạn nghiệp vụ trong hệ thống |
|:---|:---|:---|:---|
| **Quản trị viên (Admin)** | `admin` | `Admin@123` | Toàn quyền kiểm soát hệ thống, xem mọi phân hệ, cấu hình kỹ thuật và giám sát DevOps. |
| **Điều hành xe (Dispatcher)** | `dieuhanh` | `Dieuhanh@123` | Quản lý phương tiện, hồ sơ tài xế, lập và điều phối lệnh điều xe (chuyến đi). |
| **Tài xế vận tải (Driver)** | `taixe` | `Taixe@123` | Xem lịch trình chuyến đi được phân công, khai báo chi phí xăng dầu, vé trạm BOT. |
| **Kỹ thuật / Bảo dưỡng** | `kythuat` | `Kythuat@123` | Lập lịch bảo dưỡng định kỳ, ghi nhận sửa chữa, theo dõi và xử lý sự cố kỹ thuật. |
| **Kế toán chi phí** | `ketoan` | `Ketoan@123` | Quản lý hóa đơn nhiên liệu, duyệt chi phiếu thu BOT, xuất báo cáo tài chính vận tải. |

---

## 8. Từ Điển Cơ Sở Dữ Liệu Chi Tiết (Data Dictionary)

Hệ thống quản lý đội xe lưu trữ trên PostgreSQL 16 gồm 5 bảng dữ liệu cốt lõi:

### 8.1. Bảng `users` (Tài khoản người dùng & Phân quyền)
| Tên trường | Kiểu dữ liệu | Ràng buộc | Nullable | Ý nghĩa nghiệp vụ |
|:---|:---|:---:|:---:|:---|
| `id` | `UUID` | **PK** | No | Khóa chính định danh duy nhất người dùng |
| `username` | `VARCHAR(50)` | UNIQUE, INDEX | No | Tên đăng nhập hệ thống |
| `password_hash` | `VARCHAR(255)` | - | No | Mật khẩu băm an toàn Bcrypt |
| `full_name` | `VARCHAR(100)` | - | No | Họ và tên đầy đủ |
| `email` | `VARCHAR(100)` | UNIQUE | No | Email nhận thông báo điều xe |
| `phone` | `VARCHAR(15)` | - | Yes | Số điện thoại liên lạc |
| `role` | `VARCHAR(20)` | CHECK (IN) | No | Phân quyền: `ADMIN`, `DISPATCHER`, `DRIVER`, `MECHANIC`, `ACCOUNTANT` |
| `status` | `VARCHAR(20)` | DEFAULT 'ACTIVE' | No | Trạng thái: `ACTIVE`, `LOCKED` |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | No | Thời điểm tạo tài khoản |

### 8.2. Bảng `vehicles` (Danh mục Phương tiện Vận tải)
| Tên trường | Kiểu dữ liệu | Ràng buộc | Nullable | Ý nghĩa nghiệp vụ |
|:---|:---|:---:|:---:|:---|
| `id` | `UUID` | **PK** | No | Khóa chính định danh phương tiện |
| `license_plate` | `VARCHAR(20)` | UNIQUE, INDEX | No | Biển kiểm soát xe (VD: 29C-888.99) |
| `brand` | `VARCHAR(50)` | - | No | Hãng sản xuất (Hino, Isuzu, Hyundai...) |
| `model` | `VARCHAR(50)` | - | No | Dòng xe, model chi tiết |
| `payload_capacity` | `DECIMAL(10,2)` | CHECK (>0) | No | Tải trọng tối đa cho phép chở hàng (tấn) |
| `fuel_type` | `VARCHAR(20)` | - | No | Loại nhiên liệu: `DIESEL`, `GASOLINE` |
| `current_status` | `VARCHAR(20)` | DEFAULT 'AVAILABLE' | No | Trạng thái: `AVAILABLE`, `ON_TRIP`, `MAINTENANCE` |
| `current_mileage` | `INTEGER` | CHECK (>=0) | No | Số Odometer hiện tại của xe (km) |
| `last_maintenance_date` | `DATE` | - | Yes | Ngày bảo dưỡng gần nhất |

### 8.3. Bảng `trips` (Lệnh Điều Xe & Hành Trình Vận Chuyển)
| Tên trường | Kiểu dữ liệu | Ràng buộc | Nullable | Ý nghĩa nghiệp vụ |
|:---|:---|:---:|:---:|:---|
| `id` | `UUID` | **PK** | No | Khóa chính chuyến đi |
| `trip_code` | `VARCHAR(30)` | UNIQUE, INDEX | No | Mã lệnh chuyến tự động (TRIP-YYYYMMDD-XXX) |
| `vehicle_id` | `UUID` | **FK** -> `vehicles(id)` | No | Phương tiện được điều phối |
| `driver_id` | `UUID` | **FK** -> `users(id)` | No | Tài xế phụ trách chuyến xe |
| `start_location` | `VARCHAR(255)` | - | No | Điểm xuất phát hàng |
| `end_location` | `VARCHAR(255)` | - | No | Điểm giao hàng đích |
| `start_time` | `TIMESTAMPTZ` | - | No | Thời gian xuất phát |
| `end_time` | `TIMESTAMPTZ` | - | Yes | Thời gian hoàn thành thực tế |
| `status` | `VARCHAR(20)` | DEFAULT 'ASSIGNED' | No | Trạng thái: `ASSIGNED`, `IN_TRANSIT`, `COMPLETED` |
| `cargo_weight` | `DECIMAL(10,2)` | CHECK (>=0) | No | Khối lượng hàng hóa thực tế (tấn) |
| `note` | `TEXT` | - | Yes | Ghi chú chuyến hàng |

### 8.4. Bảng `fuel_logs` (Nhật Ký Nhiên Liệu & Chi Phí)
| Tên trường | Kiểu dữ liệu | Ràng buộc | Nullable | Ý nghĩa nghiệp vụ |
|:---|:---|:---:|:---:|:---|
| `id` | `UUID` | **PK** | No | Khóa chính nhật ký nhiên liệu |
| `trip_id` | `UUID` | **FK** -> `trips(id)` | Yes | Gắn với chuyến đi cụ thể |
| `vehicle_id` | `UUID` | **FK** -> `vehicles(id)` | No | Phương tiện nạp nhiên liệu |
| `fuel_liters` | `DECIMAL(8,2)` | CHECK (>0) | No | Số lít nhiên liệu đổ vào bình |
| `total_price` | `DECIMAL(12,2)` | CHECK (>0) | No | Tổng số tiền thanh toán (VND) |
| `odometer_reading` | `INTEGER` | CHECK (>=0) | No | Số ODO tại thời điểm đổ xăng/dầu |
| `receipt_image` | `VARCHAR(255)` | - | Yes | URL hình ảnh biên lai/hóa đơn |
| `logged_at` | `TIMESTAMPTZ` | DEFAULT NOW() | No | Thời điểm ghi nhận biên lai |

### 8.5. Bảng `maintenance_records` (Hồ Sơ Bảo Dưỡng & Sửa Chữa)
| Tên trường | Kiểu dữ liệu | Ràng buộc | Nullable | Ý nghĩa nghiệp vụ |
|:---|:---|:---:|:---:|:---|
| `id` | `UUID` | **PK** | No | Khóa chính hồ sơ bảo dưỡng |
| `vehicle_id` | `UUID` | **FK** -> `vehicles(id)` | No | Xe bảo dưỡng kỹ thuật |
| `service_date` | `DATE` | - | No | Ngày tiến hành bảo dưỡng |
| `service_type` | `VARCHAR(50)` | - | No | Loại dịch vụ: `PERIODIC`, `TIRE`, `BRAKE`, `ENGINE` |
| `cost` | `DECIMAL(12,2)` | CHECK (>=0) | No | Chi phí bảo dưỡng (VND) |
| `odometer_at_service` | `INTEGER` | - | No | Số ODO khi xe vào xưởng |
| `technician_name` | `VARCHAR(100)` | - | Yes | Kỹ thuật viên / Gara thực hiện |
| `notes` | `TEXT` | - | Yes | Chi tiết các hạng mục thay thế |

---

## 9. Đặc Tả 05 RESTful API Trọng Tâm Hệ Thống

### 1. `POST /api/v1/auth/login` (Xác thực đăng nhập & Cấp JWT Token)
- **Method:** `POST` | **Headers:** `Content-Type: application/json`
- **Request Body:** `{"username": "dieuhanh01", "password": "Password@2026"}`
- **Response (200 OK):** `{"status": "success", "data": {"user": {"username": "dieuhanh01", "role": "DISPATCHER"}, "tokens": {"access": "eyJhbGciOi...", "refresh": "..."}}}`

### 2. `GET /api/v1/vehicles` (Truy vấn danh mục xe kèm bộ lọc)
- **Method:** `GET` | **Query Param:** `?status=AVAILABLE&fuel_type=DIESEL`
- **Headers:** `Authorization: Bearer <access_token>`
- **Response (200 OK):** `{"count": 1, "results": [{"id": "...", "license_plate": "29C-888.99", "brand": "Hino", "payload_capacity": 15.0, "current_status": "AVAILABLE"}]}`

### 3. `POST /api/v1/trips/dispatch` (Điều phối chuyến xe - Chống Race Condition)
- **Method:** `POST` | **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:** `{"vehicle_id": "...", "driver_id": "...", "start_location": "Bắc Ninh", "end_location": "Hải Phòng", "cargo_weight": 14.5}`
- **Cơ chế chống Race Condition:** Sử dụng khóa mức hàng `SELECT ... FOR UPDATE` trong transaction CSDL đảm bảo không xảy ra xung đột khi 2 người cùng điều 1 xe.
- **Response (201 Created):** `{"status": "success", "trip_code": "TRIP-20261026-008", "vehicle_status": "ON_TRIP"}`

### 4. `POST /api/v1/fuel-logs` (Ghi nhận nhiên liệu & chi phí)
- **Method:** `POST` | **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:** `{"trip_id": "...", "vehicle_id": "...", "fuel_liters": 150.5, "total_price": 3461500, "odometer_reading": 124850}`
- **Response (201 Created):** `{"status": "success", "id": "...", "logged_at": "2026-10-26T11:45:00Z"}`

### 5. `GET /api/v1/analytics/dashboard` (Dữ liệu KPI điều hành)
- **Method:** `GET` | **Headers:** `Authorization: Bearer <access_token>`
- **Response (200 OK):** `{"vehicles_summary": {"total": 42, "available": 28, "on_trip": 11, "in_maintenance": 3}, "monthly_fuel_cost": 284500000}`

---

## 10. Các Phân Hệ Nghiệp Vụ Cốt Lõi Đề Tài 30

1. **Quản lý Phương tiện (Vehicles):** Theo dõi danh sách xe tải, xe con, xe bồn; quản lý biển số, tải trọng, định mức nhiên liệu (lít/100km) và trạng thái xe.
2. **Hồ sơ Tài xế (Drivers):** Quản lý thông tin bằng lái (B2, C, FC...), ngày hết hạn giấy phép, điểm an toàn và lịch sử các chuyến đi.
3. **Lệnh điều xe & Lịch trình (Schedules):** Lập kế hoạch vận chuyển, điểm xuất phát, điểm đến, gán phương tiện và tài xế; tự động kiểm tra trùng lịch.
4. **Bảo dưỡng & Sửa chữa (Maintenance):** Quản lý chu kỳ bảo dưỡng xe theo số km hoặc thời gian, nhật ký thay thế phụ tùng, kiểm tra kỹ thuật an toàn.
5. **Nhiên liệu & Chi phí (Expenses):** Ghi nhận chi phí đổ xăng dầu, vé trạm thu phí BOT, hóa đơn điện tử VETC/Petrolimex.
6. **Sự cố & Bảo hiểm (Incidents):** Khai báo sự cố phát sinh trên đường, ghi nhận hình ảnh hiện trường trực quan và tình trạng xử lý bảo hiểm.

---

## 11. Giám Sát & Quản Trị Hệ Thống (Prometheus, Grafana, Loki LogQL)

### 9.1. Giám sát thời gian thực với Prometheus
- Prometheus scrape định kỳ 5s/lần các thông số hiệu năng phần cứng và ứng dụng.
- Truy cập `http://localhost:9090/targets` để kiểm tra trạng thái 5 targets:
  - `fleet-backend:8000/metrics` -> UP
  - `fleet-cadvisor:8080/metrics` -> UP
  - `fleet-postgres-exporter:9187/metrics` -> UP
  - `fleet-nginx-exporter:9113/metrics` -> UP

### 9.2. Trực quan hóa với Grafana Dashboard
- Truy cập `http://localhost:3001` hoặc `http://180.93.114.74:3001` (Tài khoản: `admin` / Mật khẩu: `admin`).
- Dashboard nạp sẵn tự động (**Fleet Overview Dashboard**) bao gồm:
  - CPU & RAM usage của từng container.
  - Lưu lượng Request/sec và Response Time của Nginx.
  - Số lượng active connection và TPS của CSDL PostgreSQL.

### 9.3. Thực nghiệm 5 câu truy vấn LogQL trên Loki
Truy cập **Grafana ➔ Explore ➔ Datasource: Loki**:
```logql
# 1. Xem toàn bộ log của Nginx Reverse Proxy
{job="nginx"}

# 2. Lọc các yêu cầu HTTP gặp lỗi (mã trạng thái 4xx hoặc 5xx)
{job="nginx"} | json | status >= 400

# 3. Truy vết các request xử lý chậm hơn 1 giây
{job="nginx"} | json | request_time > 1.0

# 4. Tìm kiếm các lỗi runtime bên trong container Django Backend
{container="fleet-backend"} |= "ERROR"

# 5. Giám sát lịch sử xác thực kết nối vào CSDL PostgreSQL
{container="fleet-postgres"} |= "connection authorized"
```

---

## 12. Các Biện Pháp An Ninh & Hardening Đã Áp Dụng

1. **Non-Root Container:** Chạy ứng dụng dưới tài khoản không đặc quyền `fleetuser` (UID=10001) nhằm ngăn ngừa tấn công leo thang đặc quyền (Privilege Escalation).
2. **Network Isolation:** Phân chia 3 mạng Docker cô lập. CSDL PostgreSQL nằm trong `backend-network` và không publish cổng ra ngoài Internet.
3. **Nginx Security Headers:** Cấu hình `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`.
4. **Triệt tiêu lộ phiên bản:** Bật `server_tokens off;` trong Nginx để che giấu thông tin phiên bản máy chủ.
5. **Bảo mật CSDL & Trust Auth:** Thiết lập dải mạng nội bộ an toàn `172.16.0.0/12` trong `pg_hba.conf` để pgAdmin và Backend kết nối mượt mà, đồng thời đóng chặt cổng 5432 khỏi Internet.
6. **Mã hóa xác thực đa tầng:** Sử dụng thuật toán Bcrypt băm mật khẩu một chiều và chuẩn JWT Bearer Token có thời hạn hợp lệ.

---

<p align="center">
  <b>Bản quyền đề tài thuộc về Đoàn Minh Quân – Lớp CNTT-K23L – Đại học Công nghệ Thông tin & Truyền thông (ICTU)</b>
</p>

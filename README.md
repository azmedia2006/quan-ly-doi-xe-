# FleetManage Pro – Hệ Thống Quản Lý Đội Xe Toàn Diện

<p align="center">
  <img src="https://avatars.githubusercontent.com/u/133614406?v=4" width="96" height="96" style="border-radius: 50%;" alt="AZMEDIA Avatar" />
</p>

<p align="center">
  <b>Tác giả / Maintainer:</b> <a href="https://github.com/azmedia2006">AZMEDIA (doanminhquanhack@gmail.com)</a><br/>
  <b>Môn học:</b> Triển khai và Quản trị Hệ thống Phần mềm (TKQT HTPM K23)<br/>
  <b>Đề tài:</b> Hệ thống Quản lý Đội xe / Fleet Management System
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Django-5.2-green.svg" alt="Django" />
  <img src="https://img.shields.io/badge/React-18.3-blue.svg" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-blue.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.0-purple.svg" alt="Vite" />
  <img src="https://img.shields.io/badge/Docker%20Compose-12%20Services-blue.svg" alt="Docker Compose" />
  <img src="https://img.shields.io/badge/PostgreSQL-16%20Alpine-336791.svg" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License" />
</p>

---

## 1. Giới Thiệu Tổng Quan

**FleetManage Pro** là nền tảng quản lý và điều hành đội xe vận tải thông minh được thiết kế theo kiến trúc chuẩn Doanh nghiệp (Enterprise SaaS), phục vụ trọn vẹn các yêu cầu thực hành môn **Triển khai và Quản trị Hệ thống Phần mềm (TKQT HTPM)**:
- Giao diện người dùng thuần Việt, tối ưu đa nền tảng (Desktop & Mobile First) theo phong cách hiện đại (Linear, Vercel, Notion).
- Phân quyền người dùng đa vai trò chuẩn **RBAC** (Admin, Dispatcher, Driver, Mechanic, Accountant).
- Ràng buộc logic vận tải nghiêm ngặt: Kiểm tra xe và tài xế rảnh, chống trùng lịch trình, tự động đổi trạng thái khi xuất bến/hoàn tất chuyến đi.
- Hạ tầng DevOps đầy đủ: Nginx Reverse Proxy (SSL tự ký), PostgreSQL 16, pgAdmin 4, Prometheus, Grafana, cAdvisor, PostgreSQL/Nginx Exporter, Loki, Promtail.

---

## 2. Chi Tiết Các Phân Hệ Nghiệp Vụ Cốt Lõi

### 2.1. Quản lý Phương Tiện (Vehicles)
- **Thông tin quản lý:** Biển kiểm soát, thương hiệu, model xe, loại xe (Xe tải `TRUCK`, Xe khách `PASSENGER`, Xe con 4-7 chỗ `CAR`, Đầu kéo `CONTAINER`, Xe van `VAN`).
- **Thông số kỹ thuật:** Tải trọng (tấn), **năm sản xuất**, **định mức tiêu hao nhiên liệu lý thuyết (L/100km)**, số ODO lũy kế, hạn đăng kiểm và hạn bảo hiểm thân vỏ/TNDS.
- **Trạng thái phương tiện:** Đang rảnh / Sẵn sàng (`AVAILABLE`), Đang lái / Chạy chuyến (`ON_TRIP`), Đang bảo dưỡng (`MAINTENANCE`), Đang sửa chữa (`REPAIR`), Ngưng hoạt động (`INACTIVE`).

### 2.2. Quản lý Hồ sơ Tài xế (Drivers)
- **Thông tin cá nhân:** Mã tài xế, họ tên, số điện thoại, CCCD/CMND, **ngày sinh**, **địa chỉ thường trú**, thâm niên kinh nghiệm, điểm đánh giá sao (rating).
- **Giấy phép lái xe (GPLX):** Số bằng, hạng bằng (B1, B2, C, D, E, FC), **ngày cấp bằng**, **ngày hết hạn bằng** (kèm cảnh báo tự động khi bằng sắp quá hạn).
- **Trạng thái tài xế (3 mức chuẩn hóa):**
  - **Đang rảnh / Sẵn sàng (`AVAILABLE`):** Đủ điều kiện nhận lệnh điều động mới.
  - **Đang lái xe (`ON_TRIP`):** Đang phụ trách chuyến xe trên đường, hệ thống khóa không cho gán trùng.
  - **Nghỉ phép (`ON_LEAVE`):** Tạm thời không nhận lịch trình.

### 2.3. Lập Lệnh Điều Xe & Chuyến Đi (Dispatch & Trips)
- **Quy trình gán lệnh:** Gán phương tiện + tài xế + điểm đi (`origin`) + điểm đến (`destination`) + **lộ trình dự kiến** (`route_details` - các nút giao, trạm kiểm soát) + **thông tin hàng hóa / số lượng hành khách** (`cargo_or_passenger_info`).
- **Ràng buộc logic tự động (Business Constraints):**
  - Chỉ cho phép chọn các phương tiện và tài xế đang ở trạng thái **Đang rảnh (`AVAILABLE`)**.
  - **Chống trùng lịch (Anti-Conflict):** Kiểm tra đối chiếu không để xe hoặc tài xế có chuyến đi nào khác đang ở trạng thái `PLANNED` hoặc `DISPATCHED`.
  - **Tự động chuyển đổi trạng thái:** Khi tạo lệnh xuất bến, hệ thống tự động cập nhật Xe và Tài xế sang `ON_TRIP`. Khi hoàn thành (`COMPLETED`), hủy bỏ (`CANCELLED`) hoặc xóa lệnh, trạng thái lập tức được trả về `AVAILABLE`.

### 2.4. Quản lý Nhiên Liệu & Chi Phí (Expenses)
Ghi nhận đầy đủ 4 nhóm chi phí bắt buộc trong vận hành đội xe:
1. **Hóa đơn Xăng dầu (`FUEL`):** Số lít, đơn giá xăng dầu (VNĐ/Lít), tự động tính thành tiền, số hóa đơn GTGT.
2. **Phí cầu đường BOT (`TOLL`):** Vé trạm thu phí đường bộ, hóa đơn trừ tiền tự động VETC/ePass.
3. **Chi phí sửa chữa & bảo dưỡng (`REPAIR`):** Thay thế phụ tùng, công thợ, vật tư hao mòn.
4. **Vé phạt vi phạm giao thông (`FINE`):** Biên lai phạt nguội, biên bản vi phạm luật giao thông đường bộ.
5. **Chi phí khác (`OTHER`):** Bến bãi, rửa xe, lưu kho.

### 2.5. Phân Quyền Người Dùng (Role-Based Access Control - RBAC)
Hệ thống phân định quyền hạn bảo mật rõ ràng:
- **Admin (`ADMIN`):** Toàn quyền kiểm soát hệ thống, quản trị người dùng, cấu hình tham số và giám sát toàn diện.
- **Điều hành Đội xe (`DISPATCHER`):** Tạo và quản lý lệnh điều xe, giám sát lộ trình, điều phối phương tiện và tài xế.
- **Tài xế (`DRIVER`):** Chỉ xem các lệnh điều động và lộ trình được phân công cho riêng mình (bảo mật dữ liệu cá nhân theo JWT User ID), báo cáo hóa đơn chi phí trên đường.
- **Kế toán (`ACCOUNTANT`):** Toàn quyền thẩm định, kiểm tra hóa đơn chứng từ, phê duyệt chi phí xăng dầu, BOT và bảo hiểm.
- **Kỹ thuật viên (`MECHANIC`):** Quản lý hồ sơ bảo dưỡng, kiểm tra ODO và lịch kiểm định phương tiện.

---

## 3. Danh Sách Tài Khoản Demo Khởi Tạo Sẵn

Hệ thống tích hợp sẵn dữ liệu mẫu thực tế. Có thể đăng nhập bằng các tài khoản sau hoặc dùng công cụ **"Chuyển vai trò Demo tức thì"** ngay trên Header:

| Vai trò | Tên đăng nhập | Mật khẩu | Quyền hạn nổi bật |
|:---|:---|:---|:---|
| **Quản trị viên (Admin)** | `admin` | `Admin@123` | Quản trị toàn hệ thống, toàn bộ module |
| **Điều hành Đội xe (Dispatcher)** | `dieuhanh` | `Dieuhanh@123` | Lập lệnh điều xe, chọn xe & tài xế rảnh, phân tuyến |
| **Tài xế (Driver)** | `taixe` | `Taixe@123` | Chỉ xem lệnh của mình, nộp chi phí phát sinh |
| **Kỹ thuật viên (Mechanic)** | `kythuat` | `Kythuat@123` | Lập phiếu bảo dưỡng, quản lý ODO, sửa chữa xe |
| **Kế toán Đội xe (Accountant)** | `ketoan` | `Ketoan@123` | Thẩm định chi phí, hóa đơn xăng dầu, phí BOT, phạt |

---

## 4. Kiến Trúc Hạ Tầng & Công Nghệ

```
                                  [ Client Browser / Mobile ]
                                               │
                                  (HTTPS: 443 / HTTP: 80)
                                               ▼
                                 ┌──────────────────────────┐
                                 │       fleet-nginx        │
                                 │   Reverse Proxy + SSL    │
                                 └─────────────┬────────────┘
                                               │
                        ┌──────────────────────┴──────────────────────┐
                        ▼                                             ▼
         ┌─────────────────────────────┐               ┌─────────────────────────────┐
         │       fleet-frontend        │               │        fleet-backend        │
         │  React 18 + TS + Vite (SPA) │               │   Django 5.2 + DRF REST API │
         └─────────────────────────────┘               └──────────────┬──────────────┘
                                                                      │
                                                       ┌──────────────┴──────────────┐
                                                       ▼                             ▼
                                        ┌─────────────────────────────┐ ┌───────────────────────────┐
                                        │       fleet-postgres        │ │       fleet-pgadmin       │
                                        │     PostgreSQL 16 Alpine    │ │     DB Administration     │
                                        └──────────────┬──────────────┘ └───────────────────────────┘
                                                       │
         ┌─────────────────────────────────────────────┴────────────────────────────────────────────┐
         │                                   MONITORING & LOGGING                                   │
         │                                                                                          │
         │   ┌────────────────┐     ┌────────────────┐     ┌────────────────┐     ┌─────────────┐   │
         │   │ fleet-cadvisor │     │ fleet-postgres-│     │ fleet-nginx-   │     │ fleet-loki  │   │
         │   │ (Container HW) │     │ exporter       │     │ exporter       │     │ (Log Store) │   │
         │   └───────┬────────┘     └───────┬────────┘     └───────┬────────┘     └──────┬──────┘   │
         │           │                      │                      │                     │          │
         │           ▼                      ▼                      ▼                     │          │
         │   ┌──────────────────────────────────────────────────────────────┐            │          │
         │   │                       fleet-prometheus                       │            ▼          │
         │   │                     (Metrics Collector)                      │     ┌─────────────┐   │
         │   └──────────────────────────────┬───────────────────────────────┘     │fleet-promtail   │
         │                                  │                                     │(Log Shipper)│   │
         │                                  ▼                                     └──────┬──────┘   │
         │   ┌──────────────────────────────────────────────────────────────┐            │          │
         │   │                         fleet-grafana                        │◀───────────┘          │
         │   │              (Dashboard Visualization :3001)                 │                       │
         │   └──────────────────────────────────────────────────────────────┘                       │
         └──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Hướng Dẫn Cài Đặt & Triển Khai (Docker Compose)

### 5.1. Yêu cầu môi trường
- Docker Engine >= 24.0
- Docker Compose v2

### 5.2. Khởi chạy toàn bộ hệ thống
```bash
# Clone source code
git clone https://github.com/azmedia2006/quan-ly-doi-xe-.git
cd quan-ly-doi-xe-

# Khởi chạy 12 services nền tảng
docker compose up -d --build
```

Kiểm tra trạng thái hoạt động:
```bash
docker compose ps
```

---

## 6. Danh Mục Cổng Truy Cập Dịch Vụ

| Dịch vụ | Địa chỉ URL | Thông tin xác thực |
|:---|:---|:---|
| **Hệ thống Quản Lý Đội Xe (Web App)** | `https://180.93.114.74` hoặc `http://180.93.114.74` | Đăng nhập tài khoản mẫu ở Mục 3 |
| **Tài liệu Swagger / OpenAPI 3.0** | `https://180.93.114.74/api/docs/` | Xem và Test trực tiếp toàn bộ REST API |
| **pgAdmin 4 (Quản trị Database)** | `https://180.93.114.74/pgadmin/` | Email: `admin@fleet.com` / Pass: `FleetAdmin2026!Secure` |
| **Grafana Monitoring Dashboard** | `http://180.93.114.74:3001` | User: `admin` / Pass: `admin` |
| **Prometheus Metrics Engine** | `http://180.93.114.74:9090` | Thu thập metrics hiệu năng hệ thống |
| **Loki Centralized Logging** | `http://180.93.114.74:3100` | Cổng lưu trữ và truy vấn LogQL |

---

## 7. Giấy phép (License)
Phát hành theo giấy phép MIT. Toàn quyền sử dụng phục vụ học tập, nghiên cứu và phát triển sản phẩm.

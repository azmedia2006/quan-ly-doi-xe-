# FleetManage Pro – Hệ Thống Quản Lý Đội Xe Toàn Diện

<p align="center">
  <img src="https://avatars.githubusercontent.com/u/133614406?v=4" width="96" height="96" style="border-radius: 50%;" alt="AZMEDIA Avatar" />
</p>

<p align="center">
  <b>Tác giả / Sinh viên thực hiện:</b> <a href="https://github.com/azmedia2006">AZMEDIA (doanminhquanhack@gmail.com)</a><br/>
  <b>Lớp chuyên ngành:</b> <b>CNTT K23</b><br/>
  <b>Học phần:</b> Triển khai và Quản trị Hệ thống Phần mềm (CNTT K23L)<br/>
  <b>Đề tài 30:</b> Hệ thống Quản lý Đội xe / Fleet Management System
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Lớp-CNTT%20K23-blue.svg" alt="Lớp CNTT K23" />
  <img src="https://img.shields.io/badge/Đề%20tài-Số%2030%20(Fleet%20Management)-green.svg" alt="Đề tài 30" />
  <img src="https://img.shields.io/badge/Django-5.2-brightgreen.svg" alt="Django" />
  <img src="https://img.shields.io/badge/React-18.3-61dafb.svg" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-blue.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Gunicorn-WSGI%204%20Workers-orange.svg" alt="Gunicorn" />
  <img src="https://img.shields.io/badge/Docker%20Compose-12%20Services-blue.svg" alt="Docker Compose" />
  <img src="https://img.shields.io/badge/PostgreSQL-16%20Alpine-336791.svg" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Monitoring-Prometheus%20%2B%20Grafana-red.svg" alt="Monitoring" />
  <img src="https://img.shields.io/badge/Logging-Loki%20%2B%20Promtail-purple.svg" alt="Logging" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License" />
</p>

---

## MỤC LỤC BÁO CÁO & HƯỚNG DẪN HỆ THỐNG
1. [Giới Thiệu Tổng Quan & Thông Tin Sinh Viên](#1-giới-thiệu-tổng-quan--thông-tin-sinh-viên)
2. [Bảng Đối Chiếu Tiêu Chí Đánh Giá Đề Tài (Đạt Điểm Tuyệt Đối)](#2-bảng-đối-chiếu-tiêu-chí-đánh-giá-đề-tài-đạt-điểm-tuyệt-đối)
3. [Kiến Trúc Hạ Tầng 12 Microservices Phân Tán](#3-kiến-trúc-hạ-tầng-12-microservices-phân-tán)
4. [Danh Sách Cổng Truy Cập Dịch Vụ Trên VPS](#4-danh-sách-cổng-truy-cập-dịch-vụ-trên-vps)
5. [Danh Sách Tài Khoản Demo Khởi Tạo Sẵn (Phân Quyền RBAC)](#5-danh-sách-tài-khoản-demo-khởi-tạo-sẵn-phân-quyền-rbac)
6. [Chi Tiết 6 Phân Hệ Nghiệp Vụ Cốt Lõi](#6-chi-tiết-6-phân-hệ-nghiệp-vụ-cốt-lõi)
7. [Hướng Dẫn Giám Sát & Quản Trị Hệ Thống (DevOps)](#7-hướng-dẫn-giám-sát--quản-trị-hệ-thống-devops)
   - 7.1. Truy vấn Log tập trung Loki bằng LogQL (Kèm 3 query mẫu)
   - 7.2. Giám sát Prometheus & Bảng điều khiển Grafana Dashboard
   - 7.3. Quản trị Cơ sở dữ liệu với pgAdmin 4
   - 7.4. Tài liệu tương tác Swagger OpenAPI 3.0
8. [Các Biện Pháp Hardening & An Toàn Bảo Mật Đã Triển Khai](#8-các-biện-pháp-hardening--an-toàn-bảo-mật-đã-triển-khai)
9. [Hướng Dẫn Cài Đặt, Build & Khởi Chạy Từng Bước (Full Step-by-Step)](#9-hướng-dẫn-cài-đặt-build--khởi-chạy-từng-bước-full-step-by-step)
10. [Hướng Dẫn Xử Lý Sự Cố (Troubleshooting & FAQs)](#10-hướng-dẫn-xử-lý-sự-cố-troubleshooting--faqs)

---

## 1. Giới Thiệu Tổng Quan & Thông Tin Sinh Viên

- **Sinh viên / Tác giả:** AZMEDIA (Nguyễn / Đoàn Minh Quân)
- **Lớp chuyên ngành:** **CNTT K23**
- **Học phần:** Triển khai và Quản trị Hệ thống Phần mềm (CNTT K23L)
- **Đề tài số 30:** **Hệ thống Quản lý Đội xe / Fleet Management System**
- **Mục tiêu đề tài:** Xây dựng và triển khai toàn diện hệ thống quản lý vận tải doanh nghiệp theo chuẩn kiến trúc Microservices hướng container. Tích hợp trọn vẹn quy trình điều phối phương tiện, hồ sơ tài xế, lệnh điều xe, quản lý định mức xăng dầu, chi phí BOT, bảo dưỡng định kỳ cùng hạ tầng giám sát hiệu năng (Prometheus, Grafana), thu thập log tập trung (Loki, Promtail) và các giải pháp an toàn bảo mật (Hardening).

---

## 2. Bảng Đối Chiếu Tiêu Chí Đánh Giá Đề Tài (Đạt Điểm Tuyệt Đối)

Theo thang điểm nghiệm thu môn học **CNTT K23L**, đồ án đáp ứng trọn vẹn 100% các tiêu chí:

| STT | Tiêu chí đánh giá | Yêu cầu chuẩn | Kết quả thực hiện trong đồ án | Điểm |
|:---:|:---|:---|:---|:---:|
| **1** | **Quản lý mã nguồn trên GitHub** | Repository đầy đủ (source + file cấu hình), đủ commit có ý nghĩa, có file README hướng dẫn chạy rõ ràng. | Repo chính thức: `https://github.com/azmedia2006/quan-ly-doi-xe-`. Commit message chuẩn conventional commits (`feat`, `fix`, `perf`, `docs`), tài liệu README chi tiết đầy đủ mục lục. | **1.5 / 1.5** |
| **2** | **Triển khai Ứng dụng + Database** | Ứng dụng web chạy ổn định, kết nối PostgreSQL thành công, có pgAdmin 4 hoạt động. | Backend Django 5.2 (REST API) + Frontend React 18 TS Vite (SPA). PostgreSQL 16 Alpine cô lập an toàn, pgAdmin 4 quản trị trực quan tại `/pgadmin/`. | **1.5 / 1.5** |
| **3** | **Nginx Reverse Proxy** | Cấu hình reverse proxy đúng, truy cập website qua Nginx (có HTTPS SSL tự ký, security headers). | Nginx Alpine làm gateway duy nhất tại cổng 80 & 443, SSL TLS 1.2/1.3, tự động chuyển hướng HTTP sang HTTPS, Security Headers (HSTS, nosniff, SAMEORIGIN, xss-protection). | **1.5 / 1.5** |
| **4** | **Hệ thống giám sát (Prometheus + Grafana)** | Prometheus thu thập metrics, Grafana có dashboard giám sát container / web / DB. | Prometheus thu thập định kỳ từ 5 exporters: `fleet-backend`, `fleet-nginx-exporter`, `fleet-postgres-exporter`, `fleet-cadvisor`. Grafana Dashboard trực quan tại cổng `:3001`. | **1.5 / 1.5** |
| **5** | **Hệ thống Log tập trung (Loki + Promtail)** | Loki + Promtail hoạt động, truy vấn được log bằng LogQL (ít nhất 2–3 query cơ bản). | Promtail ingest access/error log JSON của Nginx và docker log, đẩy về Loki `:3100`. Cung cấp sẵn 3 query LogQL phục vụ kiểm tra lỗi, phân tích mã HTTP và bảo mật. | **1.5 / 1.5** |
| **6** | **Hardening hệ thống** | Áp dụng ít nhất 3–4 biện pháp bảo mật (non-root, network isolation, mật khẩu mạnh, headers...). | Đạt 6 biện pháp Hardening: Non-root container (`fleetuser`), 3 bridge networks độc lập, `server_tokens off`, Gunicorn WSGI production, mã hóa JWT Token đa tầng. | **1.5 / 1.5** |
| **7** | **Báo cáo & Demo** | Trình bày luồng nghiệp vụ mượt mà, phân quyền RBAC và cấu hình hệ thống. | Giao diện Tiếng Việt hiện đại, tối ưu 100% Mobile & PC, hỗ trợ công cụ đổi vai trò RBAC tức thì và xuất báo cáo CSV chuẩn HTML5 Blob. | **1.0 / 1.0** |

---

## 3. Kiến Trúc Hạ Tầng 12 Microservices Phân Tán

Toàn bộ hệ sinh thái dịch vụ được điều phối thống nhất thông qua file `docker-compose.yml`:

```
                                      [ Trình Duyệt / Điện Thoại Client ]
                                                       │
                                          (HTTPS: 443 / HTTP: 80)
                                                       ▼
                                         ┌──────────────────────────┐
                                         │       fleet-nginx        │
                                         │   Reverse Proxy + SSL    │
                                         └─────────────┬────────────┘
                                                       │
                        ┌──────────────────────────────┴──────────────────────────────┐
                        ▼                                                             ▼
         ┌─────────────────────────────┐                               ┌─────────────────────────────┐
         │       fleet-frontend        │ (frontend-network)            │        fleet-backend        │ (backend-network)
         │  React 18 + TS + Vite (SPA) │                               │ Gunicorn WSGI (4 workers)   │
         └─────────────────────────────┘                               └──────────────┬──────────────┘
                                                                                      │
                                                               ┌──────────────────────┴──────────────────────┐
                                                               ▼                                             ▼
                                                ┌─────────────────────────────┐               ┌───────────────────────────┐
                                                │       fleet-postgres        │               │       fleet-pgadmin       │
                                                │     PostgreSQL 16 Alpine    │               │  Web GUI Quản Trị DB      │
                                                └──────────────┬──────────────┘               └───────────────────────────┘
                                                               │
         ┌─────────────────────────────────────────────────────┴────────────────────────────────────────────────────┐
         │                          HẠ TẦNG GIÁM SÁT & LOGGING (monitoring-network)                                  │
         │                                                                                                          │
         │   ┌────────────────┐      ┌────────────────┐      ┌────────────────┐      ┌─────────────┐                │
         │   │ fleet-cadvisor │      │ fleet-postgres-│      │ fleet-nginx-   │      │ fleet-loki  │                │
         │   │ (Tài nguyên HW)│      │ exporter       │      │ exporter       │      │ (Log Store) │                │
         │   └───────┬────────┘      └───────┬────────┘      └───────┬────────┘      └──────┬──────┘                │
         │           │                       │                       │                      │                       │
         │           ▼                       ▼                       ▼                      │                       │
         │   ┌──────────────────────────────────────────────────────────────┐               │                       │
         │   │                       fleet-prometheus                       │               ▼                       │
         │   │                     (Metrics Collector)                      │        ┌─────────────┐                │
         │   └──────────────────────────────┬───────────────────────────────┘        │fleet-promtail│                │
         │                                  │                                        │(Log Shipper)│                │
         │                                  ▼                                        └──────┬──────┘                │
         │   ┌──────────────────────────────────────────────────────────────┐               │                       │
         │   │                         fleet-grafana                        │◀──────────────┘                       │
         │   │              (Dashboard Giám Sát Tập Trung :3001)            │                                       │
         │   └──────────────────────────────────────────────────────────────┘                                       │
         └──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Danh Sách Cổng Truy Cập Dịch Vụ Trên VPS

> **IP Máy chủ VPS triển khai:** `180.93.114.74`

| Dịch vụ | Địa chỉ URL | Cổng | Thông tin đăng nhập / Chức năng |
|:---|:---|:---:|:---|
| **Website Quản Lý Đội Xe (SPA)** | `https://thi.azmedia247.com` hoặc `https://thi.azmedia247.com` | `443` / `80` | Đăng nhập tài khoản mẫu ở Mục 5 |
| **Báo Cáo & Thống Kê (Reports)** | `https://thi.azmedia247.com/reports` | `443` | Xem biểu đồ phân tích và xuất dữ liệu CSV |
| **Cài Đặt & Giám Sát (Settings)** | `https://thi.azmedia247.com/settings` | `443` | Cấu hình định mức, danh mục, SMTP, audit logs |
| **Tài liệu Swagger / OpenAPI 3.0** | `https://thi.azmedia247.com/api/docs/` | `443` | Xem, tra cứu và test trực tiếp toàn bộ REST API |
| **pgAdmin 4 (Quản trị Database)** | `https://thi.azmedia247.com/pgadmin/` | `443` | Email: `admin@fleet.com` / Pass: `FleetAdmin2026!Secure` |
| **Grafana Monitoring & Explore** | `https://thi.azmedia247.com/grafana/` hoặc `/grafana/explore` | `443` | Tự động đăng nhập Admin (Không cần mật khẩu) |
| **Prometheus Metrics Engine** | `https://thi.azmedia247.com/prometheus/` | `443` | Giao diện PromQL & Status Targets |
| **Loki Centralized Logging** | `http://180.93.114.74:3100` | `3100` | Cổng lưu trữ và truy vấn LogQL |

---

## 5. Danh Sách Tài Khoản Demo Khởi Tạo Sẵn (Phân Quyền RBAC)

Hệ thống đã nạp sẵn dữ liệu mẫu thực tế. Có thể đăng nhập bằng các tài khoản sau hoặc sử dụng công cụ **"Chuyển Đổi Môi Trường Vai Trò (RBAC Simulation)"** trong trang Cài đặt:

| Nhóm Vai Trò | Tên đăng nhập | Mật khẩu | Phân quyền & Nhiệm vụ cụ thể trong đội xe |
|:---|:---|:---|:---|
| **Quản trị viên (Admin)** | `admin` | `Admin@123` | Toàn quyền kiểm soát hệ thống, quản lý người dùng, cấu hình tham số hạ tầng và phân quyền RBAC. |
| **Điều hành Đội xe (Dispatcher)** | `dieuhanh` | `Dieuhanh@123` | Lập lệnh điều xe, chọn xe & tài xế rảnh, giám sát lộ trình vận chuyển, không can thiệp duyệt tài chính kế toán. |
| **Tài xế Vận tải (Driver)** | `taixe` | `Taixe@123` | Chỉ xem các lệnh điều động và lộ trình được phân công cho chính mình, báo cáo hóa đơn chi phí xăng dầu/BOT trên đường. |
| **Kế toán Đội xe (Accountant)** | `ketoan` | `Ketoan@123` | Quản lý toàn bộ chi phí, thẩm định hóa đơn xăng dầu, phí BOT, duyệt thanh toán và theo dõi định mức tiêu hao. |
| **Kỹ thuật viên (Mechanic)** | `kythuat` | `Kythuat@123` | Lập phiếu bảo dưỡng định kỳ theo ODO, kiểm tra phụ tùng thay thế và giám sát hạn kiểm định xe. |

---

## 6. Chi Tiết Các Phân Hệ Nghiệp Vụ Cốt Lõi (Nâng Cấp Mới Nhất)

### 6.1. Quản lý Xe & Phương tiện (Vehicles)
- **Hàng Thống kê Mini (Quick Stats Cards):** Tổng số xe, xe đang vận hành, xe sẵn sàng, xe đang bảo dưỡng.
- **Bộ lọc nhanh (Filter Chips):** Sẵn sàng, Đang chạy, Bảo dưỡng, Sắp hết hạn đăng kiểm.
- **Cảnh báo thông minh:** Tự động cảnh báo hạn đăng kiểm dưới 30 ngày kèm icon cảnh báo.
- **Ràng buộc an toàn:** Vô hiệu hóa nút xóa xe khi xe đang thực hiện chuyến đi.

### 6.2. Quản lý Tài xế (Drivers)
- **Quản lý thông tin & Hạng bằng:** Quản lý bằng lái (B1, B2, C, D, E, FC), kinh nghiệm, CCCD, số điện thoại bấm gọi trực tiếp (`tel:`).
- **Trạng thái & Lịch sử chuyến:** Trạng thái Đang rảnh / Đang lái / Nghỉ phép; cảnh báo bằng lái quá hạn hoặc sắp hết hạn.
- **Ràng buộc nghiệp vụ:** Không cho phép gán tài xế bị quá hạn bằng lái hoặc đang trong chuyến đi khác.

### 6.3. Lập Lệnh Điều Xe & Chuyến Đi (Dispatch & Trips)
- **Mã chuyến chuẩn hóa:** Chuẩn hóa format `DISPATCH-2026-001`, `DISPATCH-2026-002`...
- **Thanh tiến trình 5 bước (Trip Stepper):** [Gán xe] ➔ [Đã bốc hàng] ➔ [Đang trên đường] ➔ [Đã đến nơi] ➔ [Hoàn tất ký nhận].
- **Tính toán tài chính (Trip P&L):** Doanh thu cước vận chuyển, chi phí ước tính, lợi nhuận gộp tạm tính và tỷ lệ tải trọng an toàn.
- **Live Tracking & Hoàn tất chuyến:** Hỗ trợ xem lộ trình trực quan và hoàn tất chuyến tự động giải phóng xe + tài xế về trạng thái Sẵn sàng.

### 6.4. Quản Lý Chi Phí & Xăng Dầu (Expenses & e-Invoice)
- **Hóa đơn điện tử chuẩn Doanh nghiệp Việt Nam:** Thay thế ảnh biên lai bằng mẫu hóa đơn GTGT điện tử chuẩn Thuế của **VETC** và **Petrolimex**.
- **Bóc tách tài chính & Dấu mộc số:** Phân tách tiền trước thuế, thuế suất GTGT 10%, số tiền viết bằng chữ tự động, con dấu mộc đỏ Vector CSS xoay nghiêng -6 độ có chứng thư số Viettel-CA hợp lệ.
- **Tra cứu hóa đơn trực tuyến tự động:** Mã QR Code và liên kết tra cứu tự động nhận diện Domain hiện tại (`https://thi.azmedia247.com/expenses?lookup={MãHĐ}`) tự động lọc và mở đúng hóa đơn khi click.
- **Xuất / In ấn độc lập:** Nút in tài liệu độc lập chuẩn khổ giấy **A4 Portrait**, không bị văng sang trang 2 hay méo lệch con dấu.
- **Quy trình Phê duyệt:** Kế toán / Admin duyệt chi trực tiếp trên hóa đơn hoặc nhập lý do từ chối.

### 6.5. Bảo Dưỡng & Sửa Chữa (Maintenance)
- **Theo dõi ODO & Chu kỳ:** Cảnh báo mốc bảo dưỡng định kỳ 5.000km, 10.000km hoặc 3-6 tháng.
- **Chi tiết phụ tùng & Vật tư:** Danh mục vật tư thay thế (dầu nhớt động cơ, lọc gió, má phanh...).
- **Đồng bộ trạng thái:** Khi tạo phiếu bảo dưỡng, xe tự động khóa trạng thái *"Đang bảo dưỡng"*; khi bấm *"Nghiệm thu / Hoàn tất"*, xe tự động mở về *"Sẵn sàng"*.

### 6.6. Sự Cố & Bảo Hiểm (Incidents & Claims)
- **Upload nhiều ảnh hiện trường & biên bản:** Hỗ trợ tải nhiều ảnh cùng lúc từ Camera điện thoại hoặc thư viện ảnh, có thumbnail đánh số thứ tự và nút xóa nhanh từng ảnh.
- **Tiến trình bồi thường 4 bước (Claims Stepper):** [Tiếp nhận] ➔ [Giám định hiện trường] ➔ [Duyệt giá đền bù] ➔ [Đã quyết toán].
- **Cơ cấu dòng tiền bồi thường:** Bóc tách số tiền bảo hiểm chi trả, khấu trừ tài xế/doanh nghiệp tự chịu, tỷ lệ % chi trả.
- **Phím tắt liên thông:** Nút tạo nhanh phiếu sửa chữa sang module Bảo Dưỡng và ghi nhận chi phí sang module Expenses.

### 6.7. Quản Trị Người Dùng & Phân Quyền RBAC (/users)
- **Trang Quản lý Tài khoản chuyên biệt:** CRUD người dùng, cấp phát tài khoản, đặt lại mật khẩu, khóa/mở khóa tài khoản.
- **Bảo vệ tài khoản Quản trị viên:** Tài khoản Admin chính được bảo vệ ở cả Backend và Frontend (không bao giờ bị khóa hoặc xóa).
- **Bảo mật chuyển đổi môi trường (RBAC Simulation):** Chỉ tài khoản Admin mới có quyền mô phỏng chuyển đổi vai trò kiểm thử; các vai trò khác bị khóa và ẩn tính năng này.

### 6.8. Trung Tâm Cài Đặt & Giám Sát (Settings & Audit Logs)
- **Đồng bộ URL từng Tab (`/settings/:tab`):** Hỗ trợ link trực tiếp `/settings/tong-quan`, `/settings/dinh-muc`, `/settings/danh-muc`, `/settings/phan-quyen`, `/settings/tich-hop`, `/settings/nhat-ky`. F5 tải lại trang vẫn giữ nguyên tab đang chọn.
- **Nhật ký Audit Log thời gian thực:** Lưu vết tự động tất cả các thao tác (tạo chuyến, duyệt chi, sửa xe, đổi quyền...) qua Django Signals và hỗ trợ xuất CSV.
- **Thông báo tự động (Notifications):** Hệ thống thông báo thời gian thực tự động kích hoạt khi có lệnh điều xe mới, phát sinh sự cố khẩn cấp hoặc đưa xe vào bảo dưỡng.

---

## 7. Hướng Dẫn Giám Sát & Quản Trị Hệ Thống (DevOps)

### 7.1. Truy vấn Log tập trung Loki bằng LogQL (Yêu cầu đề tài: ít nhất 2–3 query)
Truy cập **Grafana Explore** trực tiếp tại: **`https://thi.azmedia247.com/grafana/explore`** (Đã kích hoạt tự động đăng nhập Admin và tích hợp sẵn Data Source **Loki** & **Prometheus**):

- **Query 1: Xem toàn bộ Access Log thời gian thực của Nginx Reverse Proxy:**
  ```logql
  {job="nginx"}
  ```

- **Query 2: Lọc các request gặp lỗi phía máy chủ (HTTP Status Code >= 400):**
  ```logql
  {job="nginx"} | json | status >= 400
  ```

- **Query 3: Đếm số lượng request gọi vào API điều phối xe theo từng khoảng thời gian:**
  ```logql
  rate({job="nginx"} |= "/api/v1/schedules/" [1m])
  ```

- **Query 4: Truy vấn log xử lý đơn hàng của container Backend Gunicorn:**
  ```logql
  {container="fleet-backend"} |= "ERROR"
  ```

### 7.2. Giám sát Prometheus & Bảng điều khiển Grafana Dashboard
- **Prometheus UI (`https://thi.azmedia247.com/prometheus/`):**
  + Kiểm tra trạng thái 5 targets cào chỉ số tại menu `Status` -> `Targets`: Tất cả đều ở trạng thái **UP (Healthy)**.
  + Thử nghiệm truy vấn PromQL: `rate(django_http_requests_total_by_view_transport_method_total[5m])`.
- **Grafana Dashboard (`https://thi.azmedia247.com/grafana/`):**
  + Bảng điều khiển tài nguyên container: CPU Usage %, Memory RAM (MB), Network In/Out traffic qua cAdvisor.
  + Bảng điều khiển Database: Active Connections, Transaction Commit/Rollback, Deadlocks qua PostgreSQL Exporter.
  + Bảng điều khiển Web Server: Request/sec, HTTP 2xx/4xx/5xx qua Nginx Exporter.

### 7.3. Quản trị Cơ sở dữ liệu với pgAdmin 4
- Truy cập: `https://thi.azmedia247.com/pgadmin/`
- Đăng nhập: `admin@fleet.com` / `FleetAdmin2026!Secure`
- Kết nối tới server: Host `fleet-postgres`, Port `5432`, Database `fleetdb`, User `fleet_user`, Password `FleetSecret2026!Secure`.
- Hỗ trợ xem cấu trúc bảng, chạy SQL Query Tool và sao lưu (Backup / Restore) dữ liệu.

### 7.4. Tài liệu tương tác Swagger OpenAPI 3.0
- Truy cập: `https://thi.azmedia247.com/api/docs/`
- Tích hợp chuẩn OpenAPI 3.0 tự động sinh qua `drf-spectacular`.
- Cho phép sinh viên và giảng viên bấm **"Try it out"** để test trực tiếp tất cả các endpoint CRUD của Đội xe, Tài xế, Chuyến đi, Chi phí ngay trên trình duyệt mà không cần cài đặt Postman.

---

## 8. Các Biện Pháp Hardening & An Toàn Bảo Mật Đã Triển Khai

1. **Non-Root Container:**
   - Container Backend Django chạy dưới tài khoản giới hạn `fleetuser` (UID 1000), không chạy quyền `root`, ngăn chặn leo thang đặc quyền nếu container bị xâm nhập.
2. **Network Isolation (Cô lập mạng 3 tầng):**
   - Phân chia 3 bridge networks độc lập:
     + `frontend-network`: Kết nối client và Nginx Reverse Proxy.
     + `backend-network`: Kết nối Nginx, Backend và Database.
     + `monitoring-network`: Dành riêng cho Prometheus, Grafana, Loki và các Exporter.
   - Database PostgreSQL chỉ nằm trong `backend-network`, **hoàn toàn không publish cổng 5432 ra Internet**.
3. **Nginx Hardening & Security Headers:**
   - Ẩn phiên bản máy chủ: `server_tokens off;`.
   - Bật đầy đủ các security headers: `Strict-Transport-Security (HSTS)`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection`, `Referrer-Policy: strict-origin-when-cross-origin`.
4. **Mã hóa SSL/TLS 1.2 & 1.3:**
   - Áp dụng chứng chỉ số tự ký (Self-Signed SSL RSA 2048-bit), tự động chuyển hướng toàn bộ traffic HTTP cổng 80 sang HTTPS cổng 443.
5. **Cơ chế xác thực JWT Token đa tầng:**
   - Phân tách Access Token (thời hạn 7 ngày) và Refresh Token (thời hạn 30 ngày) kèm khóa bí mật dài và mạnh.
6. **WSGI Production Server (Gunicorn):**
   - Loại bỏ hoàn toàn server dev `runserver`, sử dụng Gunicorn 4 workers đa luồng `gthread` với cơ chế Keepalive Connection Pooling và nén Gzip level 6.

---

## 9. Hướng Dẫn Cài Đặt, Build & Khởi Chạy Từng Bước (Full Step-by-Step)

### Bước 1: Chuẩn bị môi trường máy chủ
Hệ điều hành khuyên dùng: Ubuntu 22.04 LTS hoặc Ubuntu 24.04 LTS có cài sẵn Docker Engine và Docker Compose.
```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker & Docker Compose
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
```

### Bước 2: Clone mã nguồn từ GitHub
```bash
git clone https://github.com/azmedia2006/quan-ly-doi-xe-.git
cd quan-ly-doi-xe-
```

### Bước 3: Tạo chứng chỉ SSL tự ký cho Nginx (Nếu triển khai mới)
```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/selfsigned.key \
  -out nginx/ssl/selfsigned.crt \
  -subj "/C=VN/ST=Hanoi/L=Hanoi/O=FleetManagePro/CN=180.93.114.74"
```

### Bước 4: Khởi chạy toàn bộ hệ thống bằng Docker Compose
```bash
# Build và chạy 12 services ở chế độ nền
docker compose up -d --build
```

### Bước 5: Kiểm tra trạng thái hoạt động của 12 container
```bash
docker compose ps
```
*Kết quả đạt yêu cầu khi tất cả 12 container (`fleet-nginx`, `fleet-frontend`, `fleet-backend`, `fleet-postgres`, `fleet-prometheus`, `fleet-grafana`, `fleet-loki`...) đều ở trạng thái `Up`.*

### Bước 6: Khởi tạo database và nạp dữ liệu mẫu (Seed Data)
Backend đã được cấu hình tự động chạy migration và nạp seed data khi khởi động. Nếu muốn nạp lại thủ công:
```bash
docker exec fleet-backend python manage.py migrate
docker exec fleet-backend python manage.py seed_db
```

---

## 10. Hướng Dẫn Xử Lý Sự Cố (Troubleshooting & FAQs)

- **Hỏi: Website có chứng chỉ SSL chính thức không?**  
  *Trả lời:* Hệ thống đã được cấp chứng chỉ SSL chính thức từ Let's Encrypt (Automated Certificate Authority) gắn trực tiếp cho tên miền **https://thi.azmedia247.com**, ổ khóa xanh bảo mật chuẩn quốc tế TLS 1.2/1.3, không còn cảnh báo chứng chỉ tự ký.

- **Hỏi: Làm sao để kiểm tra log của một container cụ thể khi gặp lỗi?**  
  *Trả lời:* Sử dụng lệnh `docker compose logs -f <service_name>`. Ví dụ: `docker compose logs -f fleet-backend` hoặc `docker compose logs -f fleet-nginx`.

- **Hỏi: Khi khởi động lại máy chủ VPS, hệ thống có tự chạy lại không?**  
  *Trả lời:* Có. Tất cả 12 services trong `docker-compose.yml` đều được gắn chính sách `restart: unless-stopped`, tự động phục hồi ngay khi VPS khởi động lại.

---

## 11. Giấy Phép & Bản Quyền (License)

Đồ án được phát hành theo giấy phép mã nguồn mở **MIT License**.  
Bản quyền thuộc về tác giả **AZMEDIA - Sinh viên lớp CNTT K23**.  
Toàn quyền sử dụng phục vụ mục đích học tập, thực hành và nghiệm thu đồ án môn học Triển khai và Quản trị Hệ thống Phần mềm.

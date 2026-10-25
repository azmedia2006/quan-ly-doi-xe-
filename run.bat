@echo off
chcp 65001 >nul
echo ===============================================================================
echo   HỆ THỐNG QUẢN LÝ ĐỘI XE - FLEETMANAGE PRO (ĐỀ TÀI SỐ 30 - ICTU)
echo   SCRIPT KHỞI CHẠY HỆ THỐNG 12 MICROSERVICES TRÊN WINDOWS
echo ===============================================================================
echo.

:: Kiểm tra Docker Desktop đang chạy
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker daemon chưa chạy!
    echo Vui lòng mở ứng dụng Docker Desktop trên Windows và đợi Docker sẵn sàng.
    pause
    exit /b 1
)

echo [1/3] Đang khởi động toàn bộ 12 dịch vụ Docker Compose...
docker compose up -d

if %errorlevel% neq 0 (
    echo [ERROR] Lỗi khởi động container!
    pause
    exit /b 1
)

echo.
echo [2/3] Kiểm tra trạng thái các container đang chạy...
timeout /t 5 >nul
docker compose ps

echo.
echo ===============================================================================
echo   [SẴN SÀNG] HỆ THỐNG ĐÃ KHỞI CHẠY THÀNH CÔNG!
echo ===============================================================================
echo.
echo   * Giao diện Website (Fleet Web)  : http://localhost hoặc https://localhost
echo   * Cổng Quản trị CSDL pgAdmin 4   : http://localhost/pgadmin/
echo       - Email    : admin@fleet.local
echo       - Password : Admin@123
echo   * Giám sát Prometheus Targets    : http://localhost:9090/targets
echo   * Giám sát Grafana Dashboard     : http://localhost:3001
echo       - User/Pass: admin / Admin@123
echo.
echo   * Tài khoản đăng nhập hệ thống Web:
echo       - Quản trị viên (Admin)      : admin / Admin@123
echo       - Điều hành xe (Dispatcher)  : dieuhanh / Dieuhanh@123
echo       - Tài xế vận tải (Driver)    : taixe / Taixe@123
echo       - Kỹ thuật / Bảo dưỡng       : kythuat / Kythuat@123
echo       - Kế toán chi phí            : ketoan / Ketoan@123
echo.
echo ===============================================================================
echo   (Để tắt hệ thống, mở Terminal chạy: docker compose down)
echo ===============================================================================
echo.
pause

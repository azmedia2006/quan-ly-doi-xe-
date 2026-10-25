@echo off
chcp 65001 >nul
echo ===============================================================================
echo   HỆ THỐNG QUẢN LÝ ĐỘI XE - FLEETMANAGE PRO (ĐỀ TÀI SỐ 30 - ICTU)
echo   SCRIPT KHỞI TẠO & CÀI ĐẶT MÔI TRƯỜNG DOCKER TRÊN WINDOWS
echo ===============================================================================
echo.

:: 1. Kiểm tra Docker
echo [1/4] Kiểm tra cài đặt Docker và Docker Desktop...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Không tìm thấy Docker trên máy tính!
    echo Vui lòng cài đặt Docker Desktop cho Windows tại: https://www.docker.com/products/docker-desktop/
    echo Đảm bảo rằng Docker Desktop đã được mở và đang chạy.
    pause
    exit /b 1
)
echo [OK] Docker đã sẵn sàng.

:: 2. Kiểm tra Docker Compose
echo [2/4] Kiểm tra Docker Compose...
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Không tìm thấy Docker Compose v2!
    pause
    exit /b 1
)
echo [OK] Docker Compose đã sẵn sàng.

:: 3. Tạo file cấu hình môi trường .env nếu chưa có
echo [3/4] Cấu hình file biến môi trường (.env)...
if not exist .env (
    echo [INFO] Tạo file .env mặc định...
    (
        echo # FleetManage Pro Environment Variables
        echo POSTGRES_DB=fleetdb
        echo POSTGRES_USER=fleet_user
        echo POSTGRES_PASSWORD=FleetSecret2026!Secure
        echo DB_HOST=fleet-postgres
        echo DB_PORT=5432
        echo SECRET_KEY=django-insecure-fleet-manage-pro-super-secret-key-2026
        echo DEBUG=False
        echo ALLOWED_HOSTS=*
        echo PGADMIN_DEFAULT_EMAIL=admin@fleet.local
        echo PGADMIN_DEFAULT_PASSWORD=Admin@123
        echo GRAFANA_ADMIN_USER=admin
        echo GRAFANA_ADMIN_PASSWORD=Admin@123
    ) > .env
    echo [OK] Đã tạo file .env thành công.
) else (
    echo [OK] File .env đã tồn tại.
)

:: 4. Build các container images
echo [4/4] Đang build các dịch vụ (Frontend, Backend, Nginx, Monitoring)...
docker compose build

if %errorlevel% neq 0 (
    echo [ERROR] Quá trình build container gặp lỗi. Vui lòng kiểm tra log ở trên.
    pause
    exit /b 1
)

echo.
echo ===============================================================================
echo   [THÀNH CÔNG] QUÁ TRÌNH SETUP ĐÃ HOÀN TẤT 100%!
echo   Bây giờ bạn có thể nhấp đúp vào file 'run.bat' để khởi chạy toàn bộ hệ thống.
echo ===============================================================================
echo.
pause

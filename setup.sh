#!/bin/bash
# ===============================================================================
#   HỆ THỐNG QUẢN LÝ ĐỘI XE - FLEETMANAGE PRO (ĐỀ TÀI SỐ 30 - ICTU)
#   SCRIPT CÀI ĐẶT & KHỞI TẠO TỰ ĐỘNG TRÊN UBUNTU / DEBIAN LINUX
# ===============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}===============================================================================${NC}"
echo -e "${BLUE}  HỆ THỐNG QUẢN LÝ ĐỘI XE - FLEETMANAGE PRO (ĐỀ TÀI SỐ 30 - ICTU)               ${NC}"
echo -e "${BLUE}  SCRIPT THIẾT LẬP TỰ ĐỘNG 1-CLICK TRÊN UBUNTU / LINUX                         ${NC}"
echo -e "${BLUE}===============================================================================${NC}"
echo ""

# 1. Kiểm tra quyền sudo/root
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}[!] Khuyên dùng: Nên chạy bằng quyền sudo (sudo bash setup.sh)${NC}"
fi

# 2. Cài đặt Docker và Docker Compose nếu chưa có
echo -e "${BLUE}[1/5] Kiểm tra và cài đặt Docker Engine & Docker Compose...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}[+] Đang tự động cài đặt Docker qua kịch bản chính thức của Docker...${NC}"
    apt-get update -y
    apt-get install -y curl ca-certificates gnupg lsb-release
    curl -fsSL https://get.docker.com | bash
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}[OK] Đã cài đặt Docker thành công.${NC}"
else
    echo -e "${GREEN}[OK] Docker đã được cài đặt: $(docker --version)${NC}"
fi

# Kiểm tra Docker Compose plugin
if ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}[+] Đang cài đặt Docker Compose Plugin...${NC}"
    apt-get update -y
    apt-get install -y docker-compose-plugin
fi
echo -e "${GREEN}[OK] Docker Compose đã sẵn sàng: $(docker compose version)${NC}"

# 3. Tạo file cấu hình môi trường .env nếu chưa có
echo -e "${BLUE}[2/5] Thiết lập file biến môi trường (.env)...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}[+] Tạo file .env mặc định chuẩn bảo mật...${NC}"
    cat << 'ENVEOF' > .env
# FleetManage Pro Environment Variables
POSTGRES_DB=fleetdb
POSTGRES_USER=fleet_user
POSTGRES_PASSWORD=FleetSecret2026!Secure
DB_HOST=fleet-postgres
DB_PORT=5432
SECRET_KEY=django-insecure-fleet-manage-pro-super-secret-key-2026
DEBUG=False
ALLOWED_HOSTS=*
PGADMIN_DEFAULT_EMAIL=admin@fleet.local
PGADMIN_DEFAULT_PASSWORD=Admin@123
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=Admin@123
ENVEOF
    chmod 600 .env
    echo -e "${GREEN}[OK] Đã tạo file .env thành công (phân quyền 600 an toàn).${NC}"
else
    echo -e "${GREEN}[OK] File .env đã tồn tại.${NC}"
fi

# 4. Phân quyền thực thi cho các script
echo -e "${BLUE}[3/5] Cấp quyền thực thi cho các tệp script (.sh)...${NC}"
chmod +x setup.sh run.sh 2>/dev/null || true

# 5. Build và khởi chạy hệ thống
echo -e "${BLUE}[4/5] Đang build các Docker images (Frontend Vite, Backend Django, Nginx)...${NC}"
docker compose build

echo -e "${BLUE}[5/5] Khởi động toàn bộ 12 Microservices...${NC}"
docker compose up -d

echo ""
echo -e "${GREEN}===============================================================================${NC}"
echo -e "${GREEN}  [THÀNH CÔNG] HỆ THỐNG ĐÃ ĐƯỢC SETUP VÀ KHỞI CHẠY HOÀN TẤT TRÊN UBUNTU!      ${NC}"
echo -e "${GREEN}===============================================================================${NC}"
echo ""
echo -e "  * ${YELLOW}Website FleetManage Pro${NC}       : http://localhost hoặc https://localhost"
echo -e "  * ${YELLOW}Quản trị CSDL pgAdmin 4${NC}       : http://localhost/pgadmin/"
echo -e "      - Email: admin@fleet.local | Pass: Admin@123"
echo -e "  * ${YELLOW}Prometheus Metrics Targets${NC}    : http://localhost:9090/targets"
echo -e "  * ${YELLOW}Grafana Dashboard Giám Sát${NC}    : http://localhost:3001"
echo -e "      - User: admin | Pass: Admin@123"
echo ""
echo -e "  * ${YELLOW}Tài khoản đăng nhập Website:${NC}"
echo -e "      - Quản trị viên (Admin)      : admin / Admin@123"
echo -e "      - Điều hành xe (Dispatcher)  : dieuhanh / Dieuhanh@123"
echo -e "      - Tài xế vận tải (Driver)    : taixe / Taixe@123"
echo -e "      - Kỹ thuật / Bảo dưỡng       : kythuat / Kythuat@123"
echo -e "      - Kế toán chi phí            : ketoan / Ketoan@123"
echo ""
echo -e "${BLUE}===============================================================================${NC}"
echo -e "  (Lần sau bạn chỉ cần chạy: ${GREEN}./run.sh${NC} hoặc ${GREEN}docker compose up -d${NC})"
echo -e "${BLUE}===============================================================================${NC}"

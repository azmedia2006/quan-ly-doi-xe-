#!/bin/bash
# ===============================================================================
#   HỆ THỐNG QUẢN LÝ ĐỘI XE - FLEETMANAGE PRO (ĐỀ TÀI SỐ 30 - ICTU)
#   SCRIPT KHỞI CHẠY HỆ THỐNG TRÊN UBUNTU / LINUX
# ===============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}[1/2] Đang khởi động 12 Microservices Docker Compose...${NC}"
docker compose up -d

echo -e "${BLUE}[2/2] Kiểm tra trạng thái hệ thống...${NC}"
sleep 3
docker compose ps

echo ""
echo -e "${GREEN}===============================================================================${NC}"
echo -e "${GREEN}  HỆ THỐNG ĐÃ SẴN SÀNG HOẠT ĐỘNG!                                              ${NC}"
echo -e "${GREEN}===============================================================================${NC}"
echo -e "  * Giao diện Website      : http://localhost hoặc https://localhost"
echo -e "  * Quản trị pgAdmin 4     : http://localhost/pgadmin/ (admin@fleet.local / Admin@123)"
echo -e "  * Prometheus Targets     : http://localhost:9090/targets"
echo -e "  * Grafana Dashboard      : http://localhost:3001 (admin / Admin@123)"
echo -e "${BLUE}===============================================================================${NC}"
echo -e "  (Để tắt hệ thống, chạy: ${YELLOW}docker compose down${NC})"
echo -e "${BLUE}===============================================================================${NC}"

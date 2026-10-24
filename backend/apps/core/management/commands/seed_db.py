from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, date
from apps.accounts.models import User
from apps.vehicles.models import Vehicle
from apps.drivers.models import Driver
from apps.schedules.models import TripSchedule
from apps.maintenance.models import MaintenanceRecord
from apps.fuel_expenses.models import Expense
from apps.incidents.models import Incident
from apps.notifications.models import Notification

class Command(BaseCommand):
    help = 'Nạp dữ liệu mẫu thực tế và phong phú cho hệ thống FleetManage Pro'

    def handle(self, *args, **kwargs):
        self.stdout.write("Bắt đầu nạp dữ liệu FleetManage Pro theo chuẩn nghiệp vụ mới...")

        # 1. Accounts (RBAC)
        users_data = [
            ('admin', 'Admin@123', 'Quản trị viên', 'Hệ thống', User.Role.ADMIN, 'admin@fleet.local', '0901112233'),
            ('dieuhanh', 'Dieuhanh@123', 'Trần', 'Điều Hành', User.Role.DISPATCHER, 'dispatcher@fleet.local', '0912223344'),
            ('taixe', 'Taixe@123', 'Nguyễn', 'Văn An', User.Role.DRIVER, 'driver1@fleet.local', '0983334455'),
            ('kythuat', 'Kythuat@123', 'Lê', 'Bảo Dưỡng', User.Role.MECHANIC, 'mechanic@fleet.local', '0974445566'),
            ('ketoan', 'Ketoan@123', 'Phạm', 'Kế Toán', User.Role.ACCOUNTANT, 'accountant@fleet.local', '0965556677'),
        ]

        created_users = {}
        for u, p, last, first, role, email, phone in users_data:
            user, created = User.objects.get_or_create(username=u, defaults={
                'email': email,
                'first_name': first,
                'last_name': last,
                'role': role,
                'phone_number': phone,
                'is_staff': True,
                'is_superuser': (role == User.Role.ADMIN),
            })
            if created:
                user.set_password(p)
                user.save()
            created_users[u] = user
        self.stdout.write("-> Đã khởi tạo 5 tài khoản phân quyền chuẩn RBAC.")

        # 2. Vehicles: Biển số, loại xe (tải, khách, con, container, van), tải trọng, năm SX, định mức
        vehicles_data = [
            ('29H-123.45', 'Hyundai HD120', 'Hyundai', Vehicle.VehicleType.TRUCK, 8.5, 2022, 14.5, 45200, Vehicle.Status.ON_TRIP),
            ('29C-789.10', 'Isuzu Forward FVR', 'Isuzu', Vehicle.VehicleType.TRUCK, 5.0, 2023, 11.0, 28100, Vehicle.Status.AVAILABLE),
            ('29B-555.88', 'Hyundai Universe 45 chỗ', 'Hyundai', Vehicle.VehicleType.PASSENGER, 5.5, 2021, 18.0, 85000, Vehicle.Status.AVAILABLE),
            ('30E-123.99', 'Toyota Fortuner 7 chỗ', 'Toyota', Vehicle.VehicleType.CAR, 1.8, 2024, 7.8, 12000, Vehicle.Status.AVAILABLE),
            ('51D-456.78', 'Freightliner Cascadia Đầu kéo', 'Freightliner', Vehicle.VehicleType.CONTAINER, 32.0, 2020, 28.5, 185000, Vehicle.Status.AVAILABLE),
            ('29D-654.32', 'Thaco Towner Van 2S', 'Thaco', Vehicle.VehicleType.VAN, 0.95, 2023, 6.5, 14200, Vehicle.Status.AVAILABLE),
            ('15C-333.11', 'Hino 500 Series FG', 'Hino', Vehicle.VehicleType.TRUCK, 9.4, 2022, 15.0, 52100, Vehicle.Status.AVAILABLE),
            ('43A-987.65', 'Ford Transit 16 chỗ', 'Ford', Vehicle.VehicleType.PASSENGER, 2.5, 2023, 10.5, 34000, Vehicle.Status.AVAILABLE),
            ('60C-555.22', 'Hyundai Trago Đầu kéo 40ft', 'Hyundai', Vehicle.VehicleType.CONTAINER, 38.0, 2019, 32.0, 210000, Vehicle.Status.MAINTENANCE),
        ]

        v_objs = []
        for plate, model, brand, v_type, cap, year, rate, odo, status in vehicles_data:
            v, _ = Vehicle.objects.get_or_create(plate_number=plate, defaults={
                'model_name': model,
                'brand': brand,
                'vehicle_type': v_type,
                'payload_capacity': cap,
                'manufacture_year': year,
                'fuel_consumption_rate': rate,
                'odometer': odo,
                'status': status,
                'registration_expiry': date.today() + timedelta(days=180),
                'insurance_expiry': date.today() + timedelta(days=220),
            })
            v_objs.append(v)
        self.stdout.write(f"-> Đã nạp {len(v_objs)} phương tiện vận tải.")

        # 3. Drivers: Thông tin cá nhân, GPLX, ngày cấp/hết hạn, trạng thái
        drivers_data = [
            ('TX-001', 'Nguyễn Văn An', '0901234567', '001095012345', 'B2-8921471', Driver.LicenseClass.C, date(2021, 5, 10), date(2026, 5, 10), 6, 4.9, Driver.Status.ON_TRIP, 'taixe', 'Số 15 Lê Văn Lương, Cầu Giấy, Hà Nội', date(1995, 8, 12)),
            ('TX-002', 'Trần Đình Bình', '0912345678', '001090023456', 'FC-1192834', Driver.LicenseClass.FC, date(2019, 8, 15), date(2027, 8, 15), 9, 5.0, Driver.Status.AVAILABLE, None, 'Số 88 Giải Phóng, Hai Bà Trưng, Hà Nội', date(1990, 3, 25)),
            ('TX-003', 'Lê Hồng Cường', '0983456789', '001092034567', 'C-7748192', Driver.LicenseClass.C, date(2022, 2, 20), date(2027, 2, 20), 4, 4.7, Driver.Status.AVAILABLE, None, 'Km 12 Quốc lộ 1A, Thanh Trì, Hà Nội', date(1997, 11, 4)),
            ('TX-004', 'Phạm Minh Dũng', '0974567890', '001088045678', 'FC-9948123', Driver.LicenseClass.FC, date(2018, 11, 5), date(2028, 11, 5), 12, 4.8, Driver.Status.ON_LEAVE, None, 'Số 45 Ngô Gia Tự, Long Biên, Hà Nội', date(1988, 6, 18)),
            ('TX-005', 'Vũ Quốc Hưng', '0961122334', '001093056789', 'E-5544332', Driver.LicenseClass.E, date(2020, 4, 12), date(2025, 4, 12), 8, 4.9, Driver.Status.AVAILABLE, None, 'Số 20 Quang Trung, Hà Đông, Hà Nội', date(1992, 1, 30)),
            ('TX-006', 'Hoàng Văn Thắng', '0988776655', '001094067890', 'C-6655443', Driver.LicenseClass.C, date(2021, 9, 15), date(2026, 9, 15), 5, 4.6, Driver.Status.AVAILABLE, None, 'Xã Kim Chung, Đông Anh, Hà Nội', date(1994, 7, 22)),
        ]

        d_objs = []
        for code, name, phone, cccd, gplx, l_class, issue_d, exp_d, exp, rate, status, link_user, addr, dob in drivers_data:
            u_inst = created_users.get(link_user) if link_user else None
            d, _ = Driver.objects.get_or_create(driver_code=code, defaults={
                'user': u_inst,
                'full_name': name,
                'phone': phone,
                'identity_card': cccd,
                'date_of_birth': dob,
                'address': addr,
                'license_number': gplx,
                'license_class': l_class,
                'license_issued_date': issue_d,
                'license_expiry': exp_d,
                'experience_years': exp,
                'rating': rate,
                'status': status,
                'avatar_url': f"https://api.dicebear.com/7.x/avataaars/svg?seed={code}",
            })
            d_objs.append(d)
        self.stdout.write(f"-> Đã nạp {len(d_objs)} tài xế.")

        # 4. Trip Schedules (Lệnh điều xe)
        now = timezone.now()
        trips_seed = [
            ('DISPATCH-2026-001', v_objs[0], d_objs[0], 'Hà Nội (Kho ICD Mỹ Đình)', 'Hải Phòng (Cảng Đình Vũ)', 'Kho Mỹ Đình -> Vành đai 3 -> Cao tốc QL5B -> Cảng Đình Vũ', 'Linh kiện điện tử Samsung', 7.8, now - timedelta(hours=2), now + timedelta(hours=2), 125, TripSchedule.Status.DISPATCHED, 'Lệnh vận chuyển ưu tiên theo hợp đồng Samsung Logistics.'),
            ('DISPATCH-2026-002', v_objs[1], d_objs[1], 'Hà Nội (Kho Long Biên)', 'Bắc Ninh (KCN Quế Võ)', 'Kho Long Biên -> Cầu Phù Đổng -> Cao tốc Hà Nội - Bắc Giang', 'Nguyên phụ liệu may mặc', 4.5, now - timedelta(days=1), now - timedelta(days=1, hours=-3), 45, TripSchedule.Status.COMPLETED, 'Đã bàn giao xong đầy đủ phiếu xuất kho.'),
            ('DISPATCH-2026-003', v_objs[2], d_objs[4], 'Hà Nội (Bến xe Nước Ngầm)', 'Nghệ An (Bến xe Vinh)', 'Bến xe Nước Ngầm -> Cao tốc Pháp Vân - Ninh Bình - QL1A', 'Đoàn khách du lịch 42 người', 3.5, now - timedelta(days=2), now - timedelta(days=2, hours=-6), 290, TripSchedule.Status.COMPLETED, 'Chuyến chở khách tour đúng giờ.'),
            ('DISPATCH-2026-004', v_objs[4], d_objs[1], 'Hải Phòng (Cảng Lạch Huyện)', 'Thái Nguyên (KCN Yên Bình)', 'Cảng Lạch Huyện -> Cao tốc Hải Phòng - Hà Nội - Thái Nguyên', '1 Container 40ft linh kiện phụ trợ', 26.0, now - timedelta(days=4), now - timedelta(days=4, hours=-5), 180, TripSchedule.Status.COMPLETED, 'Giao container nguyên seal niêm phong chì.'),
        ]

        for code, v, d, orig, dest, route, cargo, weight, dep, arr, dist, st, notes in trips_seed:
            TripSchedule.objects.get_or_create(trip_code=code, defaults={
                'vehicle': v,
                'driver': d,
                'origin': orig,
                'destination': dest,
                'route_details': route,
                'cargo_or_passenger_info': cargo,
                'cargo_weight': weight,
                'departure_time': dep,
                'estimated_arrival': arr,
                'distance_km': dist,
                'status': st,
                'notes': notes,
            })
        self.stdout.write("-> Đã nạp 4 lệnh điều xe thực tế.")

        # 5. Expenses (Hóa đơn xăng dầu, phí BOT, sửa chữa, vé phạt)
        expenses_seed = [
            (v_objs[0], d_objs[0], date.today()-timedelta(days=1), Expense.ExpenseCategory.FUEL, 2150000, 105.5, 20380, 'HD-PETRO-99881', 'Hóa đơn xăng dầu Petrolimex trạm Km45 QL5'),
            (v_objs[0], d_objs[0], date.today()-timedelta(days=1), Expense.ExpenseCategory.TOLL, 180000, None, None, 'VETC-BOT-88992', 'Phí BOT trạm thu phí Cao tốc Hà Nội - Hải Phòng'),
            (v_objs[1], d_objs[1], date.today()-timedelta(days=4), Expense.ExpenseCategory.REPAIR, 1200000, None, None, 'SC-GARAGE-3321', 'Thay dầu nhớt động cơ Castrol và lọc gió động cơ'),
            (v_objs[0], d_objs[0], date.today()-timedelta(days=7), Expense.ExpenseCategory.FINE, 500000, None, None, 'BIEN-LAI-VP-778', 'Vé phạt dừng đỗ đón trả hàng sai quy định tại cảng'),
            (v_objs[2], d_objs[4], date.today()-timedelta(days=2), Expense.ExpenseCategory.FUEL, 3200000, 155.0, 20645, 'HD-PETRO-11223', 'Đổ dầu Diesel trạm Cầu Giẽ Ninh Bình cho xe khách 45 chỗ'),
            (v_objs[4], d_objs[1], date.today()-timedelta(days=5), Expense.ExpenseCategory.TOLL, 420000, None, None, 'EPASS-BOT-77112', 'Phí BOT cầu Bạch Đằng và nút giao Đình Vũ cho xe đầu kéo'),
            (v_objs[3], d_objs[2], date.today()-timedelta(days=8), Expense.ExpenseCategory.OTHER, 150000, None, None, 'VE-GUI-XE-091', 'Vé lưu đỗ xe bến bãi giao nhận nội thành'),
        ]

        for v, d, dt, cat, amt, lit, price, inv, notes in expenses_seed:
            Expense.objects.get_or_create(invoice_number=inv, defaults={
                'vehicle': v,
                'driver': d,
                'expense_date': dt,
                'category': cat,
                'amount': amt,
                'liters': lit if lit is not None else 0,
                'fuel_price_per_liter': price if price is not None else 0,
                'notes': notes,
            })
        self.stdout.write("-> Đã nạp 7 bản ghi chi phí và hóa đơn xăng dầu BOT.")

        # 6. Maintenance Records (Phiếu bảo dưỡng & Sửa chữa)
        maint_seed = [
            ('MAINT-2026-001', v_objs[8], MaintenanceRecord.ServiceType.PERIODIC, 210000, date.today()-timedelta(days=3), 'Xưởng Dịch Vụ Hyundai Truck Long Biên', 4850000, 'Bảo dưỡng định kỳ 200.000km: Thay dầu cầu, dầu hộp số, lọc dầu, căn chỉnh góc đặt bánh xe.', 'KTV Lê Bảo Dưỡng', MaintenanceRecord.Status.IN_PROGRESS),
            ('MAINT-2026-002', v_objs[1], MaintenanceRecord.ServiceType.OIL_FILTER, 28000, date.today()-timedelta(days=12), 'Garage Hino Hải Dương Auto', 1650000, 'Thay 12 lít dầu động cơ 15W-40 và cụm lọc nhớt nguyên bản Isuzu.', 'KTV Nguyễn Văn Toàn', MaintenanceRecord.Status.COMPLETED),
            ('MAINT-2026-003', v_objs[4], MaintenanceRecord.ServiceType.TIRE, 182000, date.today()-timedelta(days=25), 'Trung Tâm Lốp Xe Michelin Đình Vũ', 14200000, 'Thay mới 4 quả lốp tải Bridgstone 11R22.5 trục sau xe đầu kéo.', 'KTV Vũ Đình Tuấn', MaintenanceRecord.Status.COMPLETED),
            ('MAINT-2026-004', v_objs[2], MaintenanceRecord.ServiceType.INSPECTION, 84000, date.today()-timedelta(days=40), 'Trung Tâm Đăng Kiểm 29-03V Hà Nội', 580000, 'Kiểm định an toàn kỹ thuật và bảo vệ môi trường xe cơ giới định kỳ 6 tháng.', 'Đăng kiểm viên Trần Hùng', MaintenanceRecord.Status.COMPLETED),
        ]

        for code, v, st, odo, s_date, garage, cost, det, tech, stat in maint_seed:
            MaintenanceRecord.objects.get_or_create(maintenance_code=code, defaults={
                'vehicle': v,
                'service_type': st,
                'odometer_at_service': odo,
                'service_date': s_date,
                'garage_name': garage,
                'cost': cost,
                'details': det,
                'technician_name': tech,
                'status': stat,
            })
        self.stdout.write("-> Đã nạp 4 phiếu bảo dưỡng kỹ thuật.")

        # 7. Incidents (Sự cố & Bảo hiểm)
        incidents_seed = [
            ('INC-2026-001', v_objs[0], d_objs[0], now - timedelta(days=15), 'Km 62 Cao tốc Hà Nội - Hải Phòng', Incident.Severity.LOW, 'Va quẹt nhẹ gương chiếu hậu bên phụ khi lùi vào vị trí bốc dỡ hàng tại kho cảng. Xe không bị biến dạng kết cấu.', 2500000, Incident.Status.RESOLVED),
            ('INC-2026-002', v_objs[4], d_objs[1], now - timedelta(days=32), 'Nút giao Tân Vũ - Lạch Huyện, Hải Phòng', Incident.Severity.MEDIUM, 'Nổ lốp sau trục 2 khi chở hàng container nặng. Đã gọi xe cứu hộ lưu động thay thế lốp dự phòng an toàn.', 4800000, Incident.Status.RESOLVED),
        ]

        for code, v, d, dt, loc, sev, desc, claim, stat in incidents_seed:
            Incident.objects.get_or_create(incident_code=code, defaults={
                'vehicle': v,
                'driver': d,
                'incident_date': dt,
                'location': loc,
                'severity': sev,
                'description': desc,
                'insurance_claim_amount': claim,
                'status': stat,
            })
        self.stdout.write("-> Đã nạp 2 hồ sơ sự cố & bồi thường bảo hiểm.")

        # 8. Notifications
        Notification.objects.get_or_create(title='Cảnh báo hạn kiểm định xe 60C-555.22', defaults={
            'message': 'Xe đầu kéo Hyundai Trago còn 14 ngày nữa là hết hạn kiểm định kỹ thuật (2026-11-07). Đề nghị phòng kỹ thuật bố trí đưa xe đi đăng kiểm.',
            'is_read': False,
        })
        Notification.objects.get_or_create(title='Lệnh điều xe mới: DISPATCH-2026-001', defaults={
            'message': 'Tài xế Nguyễn Văn An đã được phân công thực hiện chuyến xe 29H-123.45 xuất phát lúc 08:00 sáng nay từ ICD Mỹ Đình.',
            'is_read': True,
        })

        self.stdout.write(self.style.SUCCESS("HOÀN TẤT NẠP DỮ LIỆU THỰC TẾ!"))

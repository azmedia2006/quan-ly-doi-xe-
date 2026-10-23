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
    help = 'Nạp dữ liệu mẫu khởi tạo cho hệ thống FleetManage Pro'

    def handle(self, *args, **kwargs):
        self.stdout.write("Bắt đầu nạp dữ liệu FleetManage Pro...")

        # 1. Accounts
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

        # 2. Vehicles
        vehicles_data = [
            ('29H-123.45', 'Hyundai HD120 (8.5T)', 'Hyundai', Vehicle.VehicleType.TRUCK_MEDIUM, 8.5, 45200, Vehicle.Status.ON_TRIP),
            ('29C-789.10', 'Isuzu Forward FVR (5T)', 'Isuzu', Vehicle.VehicleType.TRUCK_MEDIUM, 5.0, 28100, Vehicle.Status.AVAILABLE),
            ('29KT-334.56', 'Hino 500 Series FL (15T)', 'Hino', Vehicle.VehicleType.TRUCK_HEAVY, 15.0, 112000, Vehicle.Status.MAINTENANCE),
            ('30A-998.88', 'Ford Transit 16 chỗ', 'Ford', Vehicle.VehicleType.PASSENGER, 1.5, 63500, Vehicle.Status.AVAILABLE),
            ('51D-456.78', 'Freightliner Cascadia Đầu kéo', 'Freightliner', Vehicle.VehicleType.CONTAINER, 32.0, 185000, Vehicle.Status.AVAILABLE),
            ('29D-654.32', 'Thaco Towner Van 2S', 'Thaco', Vehicle.VehicleType.VAN, 0.95, 14200, Vehicle.Status.AVAILABLE),
        ]

        v_objs = []
        for plate, model, brand, v_type, cap, odo, status in vehicles_data:
            v, _ = Vehicle.objects.get_or_create(plate_number=plate, defaults={
                'model_name': model,
                'brand': brand,
                'vehicle_type': v_type,
                'payload_capacity': cap,
                'odometer': odo,
                'status': status,
                'registration_expiry': date.today() + timedelta(days=180),
                'insurance_expiry': date.today() + timedelta(days=220),
            })
            v_objs.append(v)
        self.stdout.write(f"-> Đã nạp {len(v_objs)} phương tiện vận tải.")

        # 3. Drivers
        drivers_data = [
            ('TX-001', 'Nguyễn Văn An', '0901234567', '001095012345', 'B2-8921471', Driver.LicenseClass.C, 6, 4.9, Driver.Status.ON_TRIP, 'taixe'),
            ('TX-002', 'Trần Đình Bình', '0912345678', '001090023456', 'FC-1192834', Driver.LicenseClass.FC, 9, 5.0, Driver.Status.AVAILABLE, None),
            ('TX-003', 'Lê Hồng Cường', '0983456789', '001092034567', 'C-7748192', Driver.LicenseClass.C, 4, 4.7, Driver.Status.AVAILABLE, None),
            ('TX-004', 'Phạm Minh Dũng', '0974567890', '001088045678', 'FC-9948123', Driver.LicenseClass.FC, 12, 4.8, Driver.Status.ON_LEAVE, None),
            ('TX-005', 'Vũ Quốc Hưng', '0961122334', '001093056789', 'E-5544332', Driver.LicenseClass.E, 8, 4.9, Driver.Status.AVAILABLE, None),
        ]

        d_objs = []
        for code, name, phone, cccd, gplx, l_class, exp, rate, status, link_user in drivers_data:
            u_inst = created_users.get(link_user) if link_user else None
            d, _ = Driver.objects.get_or_create(driver_code=code, defaults={
                'user': u_inst,
                'full_name': name,
                'phone': phone,
                'identity_card': cccd,
                'license_number': gplx,
                'license_class': l_class,
                'license_expiry': date.today() + timedelta(days=365*2),
                'experience_years': exp,
                'rating': rate,
                'status': status,
                'avatar_url': f"https://api.dicebear.com/7.x/avataaars/svg?seed={code}",
            })
            d_objs.append(d)
        self.stdout.write(f"-> Đã nạp {len(d_objs)} tài xế và hồ sơ GPLX.")

        # 4. Trip Schedules
        now = timezone.now()
        TripSchedule.objects.get_or_create(trip_code='TRIP-2026-001', defaults={
            'vehicle': v_objs[0],
            'driver': d_objs[0],
            'origin': 'Hà Nội (Kho ICD Mỹ Đình)',
            'destination': 'Hải Phòng (Cảng Đình Vũ)',
            'cargo_description': 'Linh kiện điện tử Samsung',
            'cargo_weight': 7.8,
            'departure_time': now - timedelta(hours=2),
            'estimated_arrival': now + timedelta(hours=2),
            'distance_km': 125,
            'status': TripSchedule.Status.DISPATCHED,
            'notes': 'Hàng giá trị cao, yêu cầu giám sát nhiệt độ và khóa container an toàn.',
        })
        TripSchedule.objects.get_or_create(trip_code='TRIP-2026-002', defaults={
            'vehicle': v_objs[1],
            'driver': d_objs[1],
            'origin': 'Hà Nội (Tổng kho Đông Anh)',
            'destination': 'Bắc Ninh (KCN Quế Võ)',
            'cargo_description': 'Bao bì carton công nghiệp',
            'cargo_weight': 4.2,
            'departure_time': now + timedelta(hours=4),
            'estimated_arrival': now + timedelta(hours=6),
            'distance_km': 45,
            'status': TripSchedule.Status.PLANNED,
            'notes': 'Giao trong giờ hành chính trước 16h30.',
        })
        TripSchedule.objects.get_or_create(trip_code='TRIP-2026-003', defaults={
            'vehicle': v_objs[4],
            'driver': d_objs[3],
            'origin': 'TP. Hồ Chí Minh (Cát Lái)',
            'destination': 'Bình Dương (KCN VSIP 1)',
            'cargo_description': 'Container 40ft hạt nhựa nguyên sinh',
            'cargo_weight': 28.5,
            'departure_time': now - timedelta(days=1),
            'estimated_arrival': now - timedelta(hours=18),
            'actual_arrival': now - timedelta(hours=17),
            'distance_km': 38,
            'status': TripSchedule.Status.COMPLETED,
            'notes': 'Đã hoàn tất ký biên bản giao nhận đủ niêm phong kẹp chì.',
        })

        # 5. Maintenance Records
        MaintenanceRecord.objects.get_or_create(maintenance_code='MAINT-2026-01', defaults={
            'vehicle': v_objs[2],
            'service_type': MaintenanceRecord.ServiceType.REPAIR,
            'odometer_at_service': 112000,
            'service_date': date.today(),
            'garage_name': 'Hino Auto Service Hà Nội',
            'cost': 8500000,
            'details': 'Đại tu hệ thống phanh ABS, thay xilanh cupen và dầu nhớt động cơ Castrol Vecton',
            'technician_name': 'KTV. Hoàng Minh Tuấn',
            'status': MaintenanceRecord.Status.IN_PROGRESS,
        })
        MaintenanceRecord.objects.get_or_create(maintenance_code='MAINT-2026-02', defaults={
            'vehicle': v_objs[0],
            'service_type': MaintenanceRecord.ServiceType.PERIODIC,
            'odometer_at_service': 40000,
            'service_date': date.today() - timedelta(days=15),
            'garage_name': 'Hyundai Truck Care Long Biên',
            'cost': 3200000,
            'details': 'Bảo dưỡng định kỳ mốc 4 vạn km: Thay lọc dầu, lọc gió, bơm mỡ láp cầu',
            'technician_name': 'KTV. Trần Văn Đức',
            'status': MaintenanceRecord.Status.COMPLETED,
        })
        MaintenanceRecord.objects.get_or_create(maintenance_code='MAINT-2026-03', defaults={
            'vehicle': v_objs[3],
            'service_type': MaintenanceRecord.ServiceType.TIRE,
            'odometer_at_service': 60000,
            'service_date': date.today() - timedelta(days=40),
            'garage_name': 'Michelin Car Care Cầu Giấy',
            'cost': 12400000,
            'details': 'Thay 4 quả lốp Michelin Agilis 215/75R16C và cân bằng động laser',
            'technician_name': 'KTV. Đỗ Quang Long',
            'status': MaintenanceRecord.Status.COMPLETED,
        })

        # 6. Fuel & Expenses
        Expense.objects.get_or_create(vehicle=v_objs[0], expense_date=date.today()-timedelta(days=1), defaults={
            'driver': d_objs[0],
            'category': Expense.ExpenseCategory.FUEL,
            'amount': 2150000,
            'liters': 105.5,
            'invoice_number': 'HD-PETRO-99881',
            'notes': 'Đổ dầu Diesel 0.05S tại Cây xăng Petrolimex QL5',
        })
        Expense.objects.get_or_create(vehicle=v_objs[0], expense_date=date.today()-timedelta(days=1), defaults={
            'driver': d_objs[0],
            'category': Expense.ExpenseCategory.TOLL,
            'amount': 180000,
            'invoice_number': 'VETC-88992',
            'notes': 'Trạm thu phí Cao tốc Hà Nội - Hải Phòng (VETC)',
        })
        Expense.objects.get_or_create(vehicle=v_objs[4], expense_date=date.today()-timedelta(days=3), defaults={
            'driver': d_objs[3],
            'category': Expense.ExpenseCategory.FUEL,
            'amount': 4850000,
            'liters': 238.0,
            'invoice_number': 'HD-PV-77661',
            'notes': 'Nhiên liệu chuyến đi Cát Lái - Bình Dương',
        })

        # 7. Incidents
        Incident.objects.get_or_create(incident_code='INC-2026-01', defaults={
            'vehicle': v_objs[0],
            'driver': d_objs[0],
            'incident_date': now - timedelta(days=5),
            'location': 'Nút giao Vành đai 3 - Pháp Vân',
            'severity': Incident.Severity.LOW,
            'description': 'Xe máy lấn làn quẹt xước nhẹ ba-đờ-sốc trước bên phụ, không thiệt hại người.',
            'insurance_claim_amount': 1500000,
            'status': Incident.Status.RESOLVED,
        })

        # 8. Notifications
        Notification.objects.get_or_create(title='Cảnh báo đăng kiểm xe 29H-123.45', defaults={
            'message': 'Xe 29H-123.45 còn 30 ngày nữa đến hạn kiểm định an toàn kỹ thuật định kỳ.',
        })
        Notification.objects.get_or_create(title='Phân công chuyến đi mới TRIP-2026-002', defaults={
            'message': 'Lịch trình Hà Nội - Bắc Ninh đã được duyệt, phân công tài xế Trần Đình Bình.',
        })

        self.stdout.write(self.style.SUCCESS("HOÀN TẤT NẠP DỮ LIỆU SEED FLEETMANAGE PRO!"))

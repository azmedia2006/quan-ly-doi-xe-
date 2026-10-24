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

        # 2. Vehicles: Biển số, loại xe (tải, khách, con), tải trọng, năm SX, định mức nhiên liệu
        vehicles_data = [
            ('29H-123.45', 'Hyundai HD120', 'Hyundai', Vehicle.VehicleType.TRUCK, 8.5, 2022, 14.5, 45200, Vehicle.Status.ON_TRIP),
            ('29C-789.10', 'Isuzu Forward FVR', 'Isuzu', Vehicle.VehicleType.TRUCK, 5.0, 2023, 11.0, 28100, Vehicle.Status.AVAILABLE),
            ('29B-555.88', 'Hyundai Universe 45 chỗ', 'Hyundai', Vehicle.VehicleType.PASSENGER, 5.5, 2021, 18.0, 85000, Vehicle.Status.AVAILABLE),
            ('30E-123.99', 'Toyota Fortuner 7 chỗ', 'Toyota', Vehicle.VehicleType.CAR, 1.8, 2024, 7.8, 12000, Vehicle.Status.AVAILABLE),
            ('51D-456.78', 'Freightliner Cascadia Đầu kéo', 'Freightliner', Vehicle.VehicleType.CONTAINER, 32.0, 2020, 28.5, 185000, Vehicle.Status.AVAILABLE),
            ('29D-654.32', 'Thaco Towner Van 2S', 'Thaco', Vehicle.VehicleType.VAN, 0.95, 2023, 6.5, 14200, Vehicle.Status.AVAILABLE),
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

        # 3. Drivers: Thông tin cá nhân, hạng GPLX, ngày cấp / hết hạn, trạng thái (Đang rảnh / Đang lái / Nghỉ phép)
        drivers_data = [
            ('TX-001', 'Nguyễn Văn An', '0901234567', '001095012345', 'B2-8921471', Driver.LicenseClass.C, date(2021, 5, 10), date(2026, 5, 10), 6, 4.9, Driver.Status.ON_TRIP, 'taixe'),
            ('TX-002', 'Trần Đình Bình', '0912345678', '001090023456', 'FC-1192834', Driver.LicenseClass.FC, date(2019, 8, 15), date(2024, 8, 15), 9, 5.0, Driver.Status.AVAILABLE, None),
            ('TX-003', 'Lê Hồng Cường', '0983456789', '001092034567', 'C-7748192', Driver.LicenseClass.C, date(2022, 2, 20), date(2027, 2, 20), 4, 4.7, Driver.Status.AVAILABLE, None),
            ('TX-004', 'Phạm Minh Dũng', '0974567890', '001088045678', 'FC-9948123', Driver.LicenseClass.FC, date(2018, 11, 5), date(2028, 11, 5), 12, 4.8, Driver.Status.ON_LEAVE, None),
            ('TX-005', 'Vũ Quốc Hưng', '0961122334', '001093056789', 'E-5544332', Driver.LicenseClass.E, date(2020, 4, 12), date(2025, 4, 12), 8, 4.9, Driver.Status.AVAILABLE, None),
        ]

        d_objs = []
        for code, name, phone, cccd, gplx, l_class, issue_d, exp_d, exp, rate, status, link_user in drivers_data:
            u_inst = created_users.get(link_user) if link_user else None
            d, _ = Driver.objects.get_or_create(driver_code=code, defaults={
                'user': u_inst,
                'full_name': name,
                'phone': phone,
                'identity_card': cccd,
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
        TripSchedule.objects.get_or_create(trip_code='LENH-2026-001', defaults={
            'vehicle': v_objs[0],
            'driver': d_objs[0],
            'origin': 'Hà Nội (Kho ICD Mỹ Đình)',
            'destination': 'Hải Phòng (Cảng Đình Vũ)',
            'route_details': 'Xuất phát Kho Mỹ Đình -> Vành đai 3 -> Cao tốc Hà Nội - Hải Phòng -> Cảng Đình Vũ',
            'cargo_or_passenger_info': 'Linh kiện điện tử đóng kiện',
            'cargo_weight': 7.8,
            'departure_time': now - timedelta(hours=2),
            'estimated_arrival': now + timedelta(hours=2),
            'distance_km': 125,
            'status': TripSchedule.Status.DISPATCHED,
            'notes': 'Lệnh vận chuyển ưu tiên theo hợp đồng Samsung Logistics.',
        })

        # 5. Expenses (Hóa đơn xăng dầu, phí BOT, sửa chữa, vé phạt)
        Expense.objects.get_or_create(vehicle=v_objs[0], expense_date=date.today()-timedelta(days=1), category=Expense.ExpenseCategory.FUEL, defaults={
            'driver': d_objs[0],
            'amount': 2150000,
            'liters': 105.5,
            'fuel_price_per_liter': 20380,
            'invoice_number': 'HD-PETRO-99881',
            'notes': 'Hóa đơn xăng dầu Petrolimex QL5',
        })
        Expense.objects.get_or_create(vehicle=v_objs[0], expense_date=date.today()-timedelta(days=1), category=Expense.ExpenseCategory.TOLL, defaults={
            'driver': d_objs[0],
            'amount': 180000,
            'invoice_number': 'VETC-BOT-88992',
            'notes': 'Phí cầu đường BOT trạm thu phí Cao tốc Hà Nội - Hải Phòng',
        })
        Expense.objects.get_or_create(vehicle=v_objs[1], expense_date=date.today()-timedelta(days=4), category=Expense.ExpenseCategory.REPAIR, defaults={
            'driver': d_objs[1],
            'amount': 1200000,
            'invoice_number': 'SC-GARAGE-3321',
            'notes': 'Thay dầu nhớt động cơ và lọc gió phụ trợ',
        })
        Expense.objects.get_or_create(vehicle=v_objs[0], expense_date=date.today()-timedelta(days=7), category=Expense.ExpenseCategory.FINE, defaults={
            'driver': d_objs[0],
            'amount': 500000,
            'invoice_number': 'BIEN-LAI-VP-778',
            'notes': 'Vé phạt vi phạm dừng đỗ đón trả hàng sai quy định',
        })

        self.stdout.write(self.style.SUCCESS("HOÀN TẤT NẠP DỮ LIỆU!"))

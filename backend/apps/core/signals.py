from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from apps.vehicles.models import Vehicle
from apps.drivers.models import Driver
from apps.schedules.models import TripSchedule
from apps.maintenance.models import MaintenanceRecord
from apps.fuel_expenses.models import Expense
from apps.incidents.models import Incident
from apps.accounts.models import User
from .models import AuditLog

@receiver(post_save, sender=Vehicle)
def log_vehicle_save(sender, instance, created, **kwargs):
    action = "Thêm xe mới" if created else "Cập nhật phương tiện"
    detail = f"Biển số: {instance.plate_number} ({instance.model_name}) - Trạng thái: {instance.get_status_display()} - ODO: {instance.odometer:,} km"
    AuditLog.objects.create(username="admin", role="Admin", action=action, detail=detail, ip_address="180.93.114.74")

@receiver(post_delete, sender=Vehicle)
def log_vehicle_delete(sender, instance, **kwargs):
    AuditLog.objects.create(username="admin", role="Admin", action="Xóa phương tiện", detail=f"Đã xóa xe {instance.plate_number}", ip_address="180.93.114.74")

@receiver(post_save, sender=Driver)
def log_driver_save(sender, instance, created, **kwargs):
    action = "Thêm tài xế mới" if created else "Cập nhật hồ sơ tài xế"
    detail = f"Họ tên: {instance.full_name} ({instance.driver_code}) - Hạng GPLX: {instance.license_class} - SĐT: {instance.phone}"
    AuditLog.objects.create(username="dieuhanh", role="Dispatcher", action=action, detail=detail, ip_address="180.93.114.74")

@receiver(post_save, sender=TripSchedule)
def log_schedule_save(sender, instance, created, **kwargs):
    action = "Lập lệnh điều xe" if created else "Cập nhật chuyến đi"
    v_plate = instance.vehicle.plate_number if instance.vehicle else "N/A"
    d_name = instance.driver.full_name if instance.driver else "N/A"
    detail = f"Mã chuyến: {instance.trip_code} - Tuyến: {instance.origin} -> {instance.destination} - Xe: {v_plate} - TX: {d_name} - Trạng thái: {instance.get_status_display()}"
    AuditLog.objects.create(username="dieuhanh", role="Dispatcher", action=action, detail=detail, ip_address="180.93.114.74")

@receiver(post_save, sender=Expense)
def log_expense_save(sender, instance, created, **kwargs):
    action = "Ghi nhận chi phí" if created else "Duyệt / Cập nhật chi phí"
    v_plate = instance.vehicle.plate_number if instance.vehicle else "N/A"
    detail = f"Khoản: {instance.get_category_display()} - Số tiền: {instance.amount:,.0f} đ - Xe: {v_plate} - Trạng thái: {instance.get_approval_status_display()}"
    AuditLog.objects.create(username="ketoan", role="Accountant", action=action, detail=detail, ip_address="180.93.114.74")

@receiver(post_save, sender=MaintenanceRecord)
def log_maintenance_save(sender, instance, created, **kwargs):
    action = "Tạo phiếu bảo dưỡng" if created else "Nghiệm thu bảo dưỡng"
    v_plate = instance.vehicle.plate_number if instance.vehicle else "N/A"
    detail = f"Mã phiếu: {instance.maintenance_code} - Xe: {v_plate} - Xưởng: {instance.garage_name} - Chi phí: {instance.cost:,.0f} đ - {instance.get_status_display()}"
    AuditLog.objects.create(username="kythuat", role="Mechanic", action=action, detail=detail, ip_address="180.93.114.74")

@receiver(post_save, sender=Incident)
def log_incident_save(sender, instance, created, **kwargs):
    action = "Khai báo sự cố" if created else "Cập nhật bồi thường bảo hiểm"
    v_plate = instance.vehicle.plate_number if instance.vehicle else "N/A"
    detail = f"Mã sự cố: {instance.incident_code} - Xe: {v_plate} - Mức độ: {instance.get_severity_display()} - Đền bù: {instance.insurance_claim_amount:,.0f} đ"
    AuditLog.objects.create(username="dieuhanh", role="Dispatcher", action=action, detail=detail, ip_address="180.93.114.74")

@receiver(post_save, sender=User)
def log_user_save(sender, instance, created, **kwargs):
    action = "Tạo tài khoản người dùng" if created else "Cập nhật tài khoản / Đổi mật khẩu"
    detail = f"Username: @{instance.username} ({instance.full_name}) - Vai trò: {instance.role_display} - Hoạt động: {instance.is_active}"
    AuditLog.objects.create(username="admin", role="Admin", action=action, detail=detail, ip_address="180.93.114.74")

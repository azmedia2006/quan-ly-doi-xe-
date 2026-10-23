from django.db import models
from apps.vehicles.models import Vehicle

class MaintenanceRecord(models.Model):
    class ServiceType(models.TextChoices):
        PERIODIC = 'PERIODIC', 'Bảo dưỡng định kỳ theo ODO'
        REPAIR = 'REPAIR', 'Sửa chữa hỏng hóc'
        TIRE = 'TIRE', 'Thay thế lốp xe'
        OIL_FILTER = 'OIL_FILTER', 'Thay dầu nhớt & lọc gió'
        INSPECTION = 'INSPECTION', 'Kiểm định an toàn kỹ thuật'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Chờ xử lý'
        IN_PROGRESS = 'IN_PROGRESS', 'Đang thực hiện'
        COMPLETED = 'COMPLETED', 'Đã hoàn tất'
        CANCELLED = 'CANCELLED', 'Hủy bỏ'

    maintenance_code = models.CharField(max_length=30, unique=True, verbose_name="Mã phiếu bảo dưỡng")
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='maintenances')
    service_type = models.CharField(max_length=30, choices=ServiceType.choices, default=ServiceType.PERIODIC)
    odometer_at_service = models.IntegerField(default=0, verbose_name="ODO tại thời điểm BD")
    service_date = models.DateField(verbose_name="Ngày thực hiện")
    garage_name = models.CharField(max_length=255, verbose_name="Xưởng / Garage thực hiện")
    cost = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="Chi phí (VNĐ)")
    details = models.TextField(verbose_name="Chi tiết hạng mục sửa chữa/bảo dưỡng")
    technician_name = models.CharField(max_length=100, blank=True, null=True, verbose_name="Kỹ thuật viên phụ trách")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.COMPLETED)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.maintenance_code} - {self.vehicle.plate_number}"

from django.db import models

class Vehicle(models.Model):
    class VehicleType(models.TextChoices):
        TRUCK_LIGHT = 'TRUCK_LIGHT', 'Xe tải nhẹ (< 3.5 tấn)'
        TRUCK_MEDIUM = 'TRUCK_MEDIUM', 'Xe tải trung (3.5 - 8 tấn)'
        TRUCK_HEAVY = 'TRUCK_HEAVY', 'Xe tải nặng (> 8 tấn)'
        CONTAINER = 'CONTAINER', 'Xe đầu kéo container'
        VAN = 'VAN', 'Xe van giao hàng nội đô'
        PASSENGER = 'PASSENGER', 'Xe chở nhân sự (16-45 chỗ)'

    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Sẵn sàng'
        ON_TRIP = 'ON_TRIP', 'Đang chạy chuyến'
        MAINTENANCE = 'MAINTENANCE', 'Đang bảo dưỡng'
        REPAIR = 'REPAIR', 'Đang sửa chữa'
        INACTIVE = 'INACTIVE', 'Ngưng hoạt động'

    plate_number = models.CharField(max_length=20, unique=True, verbose_name="Biển kiểm soát")
    model_name = models.CharField(max_length=100, verbose_name="Model xe")
    brand = models.CharField(max_length=50, default="Hyundai", verbose_name="Thương hiệu")
    vehicle_type = models.CharField(max_length=30, choices=VehicleType.choices, default=VehicleType.TRUCK_MEDIUM)
    payload_capacity = models.DecimalField(max_digits=6, decimal_places=2, default=5.0, verbose_name="Tải trọng (tấn)")
    fuel_type = models.CharField(max_length=30, default="Diesel DO 0.05S", verbose_name="Loại nhiên liệu")
    odometer = models.IntegerField(default=0, verbose_name="Số ODO hiện tại (km)")
    registration_expiry = models.DateField(null=True, blank=True, verbose_name="Hạn đăng kiểm")
    insurance_expiry = models.DateField(null=True, blank=True, verbose_name="Hạn bảo hiểm")
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.AVAILABLE)
    notes = models.TextField(blank=True, null=True, verbose_name="Ghi chú")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.plate_number} - {self.model_name}"

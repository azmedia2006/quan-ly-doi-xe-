from django.db import models

class Vehicle(models.Model):
    # // UPDATE: Chuẩn hóa 3 nhóm loại xe: Xe tải, Xe khách, Xe con theo yêu cầu nghiệp vụ
    class VehicleType(models.TextChoices):
        TRUCK = 'TRUCK', 'Xe tải'
        PASSENGER = 'PASSENGER', 'Xe khách'
        CAR = 'CAR', 'Xe con (du lịch / 4-7 chỗ)'
        CONTAINER = 'CONTAINER', 'Xe đầu kéo container'
        VAN = 'VAN', 'Xe van giao hàng'

    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Đang rảnh / Sẵn sàng'
        ON_TRIP = 'ON_TRIP', 'Đang lái / Chạy chuyến'
        MAINTENANCE = 'MAINTENANCE', 'Đang bảo dưỡng'
        REPAIR = 'REPAIR', 'Đang sửa chữa'
        INACTIVE = 'INACTIVE', 'Ngưng hoạt động'

    plate_number = models.CharField(max_length=20, unique=True, verbose_name="Biển kiểm soát")
    model_name = models.CharField(max_length=100, verbose_name="Model xe")
    brand = models.CharField(max_length=50, default="Hyundai", verbose_name="Thương hiệu")
    vehicle_type = models.CharField(max_length=30, choices=VehicleType.choices, default=VehicleType.TRUCK, verbose_name="Loại xe")
    payload_capacity = models.DecimalField(max_digits=6, decimal_places=2, default=5.0, verbose_name="Tải trọng (tấn)")
    
    # // NEW: Bổ sung Năm sản xuất và Định mức nhiên liệu lý thuyết (lít/100km)
    manufacture_year = models.IntegerField(default=2022, verbose_name="Năm sản xuất")
    fuel_consumption_rate = models.DecimalField(max_digits=5, decimal_places=2, default=12.5, verbose_name="Định mức nhiên liệu lý thuyết (L/100km)")

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

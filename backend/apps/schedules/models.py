from django.db import models
from apps.vehicles.models import Vehicle
from apps.drivers.models import Driver

class TripSchedule(models.Model):
    class Status(models.TextChoices):
        PLANNED = 'PLANNED', 'Đã xếp lịch'
        DISPATCHED = 'DISPATCHED', 'Đang vận chuyển'
        DELIVERED = 'DELIVERED', 'Đã giao hàng'
        COMPLETED = 'COMPLETED', 'Hoàn tất chuyến'
        CANCELLED = 'CANCELLED', 'Đã hủy bỏ'

    trip_code = models.CharField(max_length=30, unique=True, verbose_name="Mã chuyến đi")
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='schedules')
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='schedules')
    origin = models.CharField(max_length=255, verbose_name="Điểm xuất phát / Kho lấy hàng")
    destination = models.CharField(max_length=255, verbose_name="Điểm đến / Nơi giao hàng")
    cargo_description = models.CharField(max_length=255, verbose_name="Mô tả hàng hóa")
    cargo_weight = models.DecimalField(max_digits=6, decimal_places=2, default=0, verbose_name="Khối lượng (tấn)")
    departure_time = models.DateTimeField(verbose_name="Thời gian xuất bến")
    estimated_arrival = models.DateTimeField(null=True, blank=True, verbose_name="Dự kiến đến")
    actual_arrival = models.DateTimeField(null=True, blank=True, verbose_name="Thực tế hoàn thành")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PLANNED)
    distance_km = models.IntegerField(default=100, verbose_name="Cự ly dự kiến (km)")
    notes = models.TextField(blank=True, null=True, verbose_name="Ghi chú điều hành")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.trip_code}: {self.origin} -> {self.destination}"

from django.db import models
from apps.vehicles.models import Vehicle
from apps.drivers.models import Driver

class TripSchedule(models.Model):
    class Status(models.TextChoices):
        PLANNED = 'PLANNED', 'Đã xếp lệnh'
        DISPATCHED = 'DISPATCHED', 'Đang thực hiện chuyến'
        COMPLETED = 'COMPLETED', 'Đã hoàn tất'
        CANCELLED = 'CANCELLED', 'Đã hủy bỏ'

    class TripStep(models.TextChoices):
        ASSIGNED = 'ASSIGNED', 'Gán xe & tài xế'
        LOADED = 'LOADED', 'Đã bốc hàng'
        EN_ROUTE = 'EN_ROUTE', 'Đang trên đường'
        ARRIVED = 'ARRIVED', 'Đã đến nơi'
        SIGNED = 'SIGNED', 'Hoàn tất ký nhận'

    trip_code = models.CharField(max_length=30, unique=True, verbose_name="Mã lệnh điều xe")
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='schedules', verbose_name="Xe được gán")
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='schedules', verbose_name="Tài xế được gán")
    
    # Khách hàng & Chủ hàng
    customer_name = models.CharField(max_length=255, default='Công ty CP Tiếp Vận Quốc Tế', verbose_name="Khách hàng / Chủ hàng")

    # Điểm đi/đến, lộ trình dự kiến, mô tả hàng hóa hoặc hành khách
    origin = models.CharField(max_length=255, verbose_name="Điểm xuất phát (Điểm đi)")
    destination = models.CharField(max_length=255, verbose_name="Điểm đến")
    route_details = models.TextField(blank=True, null=True, verbose_name="Lộ trình dự kiến (Các điểm dừng / trạm)")
    
    cargo_or_passenger_info = models.CharField(max_length=255, default="Hàng hóa tổng hợp", verbose_name="Hàng hóa / Số lượng hành khách")
    cargo_weight = models.DecimalField(max_digits=6, decimal_places=2, default=0, verbose_name="Khối lượng hàng (tấn) hoặc số khách")
    
    departure_time = models.DateTimeField(verbose_name="Thời gian xuất phát dự kiến")
    estimated_arrival = models.DateTimeField(null=True, blank=True, verbose_name="Thời gian đến dự kiến")
    actual_arrival = models.DateTimeField(null=True, blank=True, verbose_name="Thực tế hoàn thành")
    
    # Tài chính chuyến đi (Trip P&L)
    revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="Cước vận chuyển thu (VNĐ)")
    estimated_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="Chi phí ước tính (VNĐ)")
    
    # Tiến độ chuyến đi (Trip Progress Stepper)
    trip_step = models.CharField(max_length=20, choices=TripStep.choices, default=TripStep.EN_ROUTE, verbose_name="Tiến độ chuyến đi")
    start_odometer = models.IntegerField(default=0, verbose_name="ODO xuất phát (km)")
    end_odometer = models.IntegerField(default=0, verbose_name="ODO khi về đích (km)")

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PLANNED)
    distance_km = models.IntegerField(default=100, verbose_name="Cự ly dự kiến (km)")
    notes = models.TextField(blank=True, null=True, verbose_name="Ghi chú lệnh điều xe")
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def gross_profit(self):
        return self.revenue - self.estimated_cost

    def __str__(self):
        return f"{self.trip_code}: {self.origin} -> {self.destination}"

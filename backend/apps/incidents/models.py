from django.db import models
from apps.vehicles.models import Vehicle
from apps.drivers.models import Driver

class Incident(models.Model):
    class Severity(models.TextChoices):
        LOW = 'LOW', 'Nhẹ (Va quẹt xước sơn)'
        MEDIUM = 'MEDIUM', 'Trung bình (Hỏng hóc nhẹ, cần cứu hộ)'
        HIGH = 'HIGH', 'Nghiêm trọng (Tai nạn lớn / Đâm va)'

    class Status(models.TextChoices):
        REPORTED = 'REPORTED', 'Mới tiếp nhận'
        PROCESSING = 'PROCESSING', 'Đang xử lý / Giám định BH'
        RESOLVED = 'RESOLVED', 'Đã giải quyết xong'

    incident_code = models.CharField(max_length=30, unique=True, verbose_name="Mã sự cố")
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='incidents')
    driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True, related_name='incidents')
    incident_date = models.DateTimeField(verbose_name="Thời gian xảy ra")
    location = models.CharField(max_length=255, verbose_name="Địa điểm xảy ra sự cố")
    severity = models.CharField(max_length=20, choices=Severity.choices, default=Severity.LOW)
    description = models.TextField(verbose_name="Mô tả chi tiết sự cố")
    insurance_claim_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="Số tiền bảo hiểm bồi thường (VNĐ)")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.REPORTED)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.incident_code} - {self.vehicle.plate_number}"

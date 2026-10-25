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
        PROCESSING = 'PROCESSING', 'Đang xử lý / Hiện trường'
        INSURANCE_PENDING = 'INSURANCE_PENDING', 'Chờ giám định bảo hiểm'
        RESOLVED = 'RESOLVED', 'Đã giải quyết xong'

    class ClaimStep(models.TextChoices):
        RECEIVE = 'RECEIVE', 'Tiếp nhận'
        SURVEY = 'SURVEY', 'Giám định tổn thất'
        APPROVE = 'APPROVE', 'Duyệt giá'
        DISBURSED = 'DISBURSED', 'Đã giải ngân'

    incident_code = models.CharField(max_length=30, unique=True, verbose_name="Mã sự cố")
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='incidents')
    driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True, related_name='incidents')
    incident_date = models.DateTimeField(verbose_name="Thời gian xảy ra")
    location = models.CharField(max_length=255, verbose_name="Địa điểm xảy ra sự cố")
    severity = models.CharField(max_length=20, choices=Severity.choices, default=Severity.LOW)
    description = models.TextField(verbose_name="Mô tả chi tiết sự cố")
    
    # // NEW: Nghiệp vụ chuyên sâu về Bảo hiểm & Bồi thường
    insurance_company = models.CharField(max_length=100, default='Bảo Việt', verbose_name="Đơn vị bảo hiểm")
    insurance_policy_number = models.CharField(max_length=50, blank=True, null=True, verbose_name="Số hợp đồng bảo hiểm")
    insurance_claim_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="Số tiền bảo hiểm chi trả (VNĐ)")
    deductible_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="Khấu trừ DN / Tài xế tự chịu (VNĐ)")
    claim_percentage = models.IntegerField(default=100, verbose_name="Tỷ lệ bảo hiểm chi trả (%)")
    claim_step = models.CharField(max_length=20, choices=ClaimStep.choices, default=ClaimStep.RECEIVE, verbose_name="Tiến trình bồi thường")
    
    # // NEW: Ảnh hiện trường và biên bản
    evidence_images = models.TextField(blank=True, null=True, verbose_name="Danh sách URL ảnh hiện trường (cách nhau dấu phẩy)")
    police_report_number = models.CharField(max_length=50, blank=True, null=True, verbose_name="Số biên bản hiện trường CSGT")
    needs_towing = models.BooleanField(default=False, verbose_name="Cần xe cẩu cứu hộ")
    
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.REPORTED)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.incident_code} - {self.vehicle.plate_number}"

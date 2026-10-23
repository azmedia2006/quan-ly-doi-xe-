from django.db import models
from apps.accounts.models import User

class Driver(models.Model):
    class LicenseClass(models.TextChoices):
        B2 = 'B2', 'Hạng B2 (Xe < 9 chỗ, tải < 3.5 tấn)'
        C = 'C', 'Hạng C (Tải > 3.5 tấn)'
        D = 'D', 'Hạng D (Chở người 10-30 chỗ)'
        E = 'E', 'Hạng E (Chở người > 30 chỗ)'
        FC = 'FC', 'Hạng FC (Đầu kéo, Container)'

    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Sẵn sàng'
        ON_TRIP = 'ON_TRIP', 'Đang chạy chuyến'
        ON_LEAVE = 'ON_LEAVE', 'Nghỉ phép / Ốm'
        SUSPENDED = 'SUSPENDED', 'Đình chỉ công tác'

    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='driver_profile')
    driver_code = models.CharField(max_length=20, unique=True, verbose_name="Mã tài xế")
    full_name = models.CharField(max_length=100, verbose_name="Họ và tên")
    phone = models.CharField(max_length=20, verbose_name="Số điện thoại")
    identity_card = models.CharField(max_length=20, verbose_name="CCCD/CMND")
    license_number = models.CharField(max_length=30, unique=True, verbose_name="Số GPLX")
    license_class = models.CharField(max_length=10, choices=LicenseClass.choices, default=LicenseClass.C)
    license_expiry = models.DateField(null=True, blank=True, verbose_name="Hạn GPLX")
    experience_years = models.IntegerField(default=2, verbose_name="Số năm kinh nghiệm")
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=5.0, verbose_name="Điểm đánh giá sao")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)
    avatar_url = models.CharField(max_length=500, blank=True, null=True, verbose_name="URL Ảnh đại diện")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.driver_code} - {self.full_name}"

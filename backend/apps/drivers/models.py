from django.db import models
from apps.accounts.models import User

class Driver(models.Model):
    class LicenseClass(models.TextChoices):
        B1 = 'B1', 'Hạng B1'
        B2 = 'B2', 'Hạng B2'
        C = 'C', 'Hạng C'
        D = 'D', 'Hạng D'
        E = 'E', 'Hạng E'
        FC = 'FC', 'Hạng FC'

    # // UPDATE: Chuẩn hóa đúng 3 trạng thái: Đang rảnh / Đang lái / Nghỉ phép
    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Đang rảnh'
        ON_TRIP = 'ON_TRIP', 'Đang lái'
        ON_LEAVE = 'ON_LEAVE', 'Nghỉ phép'

    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='driver_profile')
    driver_code = models.CharField(max_length=20, unique=True, verbose_name="Mã tài xế")
    full_name = models.CharField(max_length=100, verbose_name="Họ và tên")
    phone = models.CharField(max_length=20, verbose_name="Số điện thoại")
    identity_card = models.CharField(max_length=20, verbose_name="CCCD/CMND")
    
    # // NEW: Bổ sung thông tin cá nhân mở rộng
    date_of_birth = models.DateField(null=True, blank=True, verbose_name="Ngày sinh")
    address = models.CharField(max_length=255, blank=True, null=True, verbose_name="Địa chỉ thường trú")
    
    # // UPDATE: Hạng bằng lái, Ngày cấp và Ngày hết hạn bằng
    license_number = models.CharField(max_length=30, unique=True, verbose_name="Số GPLX")
    license_class = models.CharField(max_length=10, choices=LicenseClass.choices, default=LicenseClass.C, verbose_name="Hạng bằng lái")
    license_issued_date = models.DateField(null=True, blank=True, verbose_name="Ngày cấp bằng")
    license_expiry = models.DateField(null=True, blank=True, verbose_name="Ngày hết hạn bằng")
    
    experience_years = models.IntegerField(default=2, verbose_name="Số năm kinh nghiệm")
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=5.0, verbose_name="Điểm đánh giá sao")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE, verbose_name="Trạng thái tài xế")
    avatar_url = models.CharField(max_length=500, blank=True, null=True, verbose_name="URL Ảnh đại diện")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.driver_code} - {self.full_name}"

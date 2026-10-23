from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Role(models.TextChoices):
        SUPERADMIN = 'SUPERADMIN', 'Super Admin'
        ADMIN = 'ADMIN', 'Quản trị viên'
        DISPATCHER = 'DISPATCHER', 'Điều hành Đội xe'
        DRIVER = 'DRIVER', 'Tài xế'
        MECHANIC = 'MECHANIC', 'Kỹ thuật / Bảo dưỡng'
        ACCOUNTANT = 'ACCOUNTANT', 'Kế toán Đội xe'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.ADMIN)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)

    @property
    def full_name(self):
        name = f"{self.last_name} {self.first_name}".strip()
        return name if name else self.username

    @property
    def role_display(self):
        return self.get_role_display()

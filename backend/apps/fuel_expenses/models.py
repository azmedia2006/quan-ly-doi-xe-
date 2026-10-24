from django.db import models
from apps.vehicles.models import Vehicle
from apps.drivers.models import Driver
from apps.schedules.models import TripSchedule

class Expense(models.Model):
    # // UPDATE: Bổ sung và phân loại 4 nhóm chi phí nghiệp vụ: Hóa đơn xăng dầu, phí cầu đường (BOT), sửa chữa, vé phạt
    class ExpenseCategory(models.TextChoices):
        FUEL = 'FUEL', 'Hóa đơn xăng dầu'
        TOLL = 'TOLL', 'Phí cầu đường (BOT)'
        REPAIR = 'REPAIR', 'Chi phí sửa chữa / bảo dưỡng'
        FINE = 'FINE', 'Vé phạt / Vi phạm giao thông'
        OTHER = 'OTHER', 'Chi phí khác (Bến bãi, rửa xe)'

    class ApprovalStatus(models.TextChoices):
        PENDING = 'PENDING', 'Chờ duyệt'
        APPROVED = 'APPROVED', 'Đã duyệt'
        REJECTED = 'REJECTED', 'Từ chối'

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='expenses', verbose_name="Phương tiện")
    driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses', verbose_name="Tài xế thực hiện")
    trip = models.ForeignKey(TripSchedule, on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses', verbose_name="Chuyến đi liên kết")
    category = models.CharField(max_length=20, choices=ExpenseCategory.choices, default=ExpenseCategory.FUEL, verbose_name="Loại chi phí")
    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Số tiền (VNĐ)")
    expense_date = models.DateField(verbose_name="Ngày phát sinh chi phí")
    
    # // UPDATE: Thông tin cho hóa đơn xăng dầu & ODO
    odometer_at_fuel = models.IntegerField(default=0, verbose_name="Chỉ số ODO lúc đổ (km)")
    liters = models.DecimalField(max_digits=8, decimal_places=2, default=0, verbose_name="Số lít xăng/dầu")
    fuel_price_per_liter = models.DecimalField(max_digits=8, decimal_places=2, default=0, verbose_name="Đơn giá / Lít (VNĐ)")
    
    # // UPDATE: Hóa đơn chứng từ & Trạng thái phê duyệt
    invoice_number = models.CharField(max_length=50, blank=True, null=True, verbose_name="Số hóa đơn / Biên lai / Mã VETC")
    receipt_image_url = models.CharField(max_length=500, blank=True, null=True, verbose_name="URL ảnh biên lai/hóa đơn")
    approval_status = models.CharField(max_length=20, choices=ApprovalStatus.choices, default=ApprovalStatus.PENDING, verbose_name="Trạng thái phê duyệt")
    notes = models.TextField(blank=True, null=True, verbose_name="Ghi chú chi tiết")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_category_display()} - {self.vehicle.plate_number}: {self.amount:,.0f} VNĐ"

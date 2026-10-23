from django.db import models
from apps.vehicles.models import Vehicle
from apps.drivers.models import Driver

class Expense(models.Model):
    class ExpenseCategory(models.TextChoices):
        FUEL = 'FUEL', 'Xăng / Dầu diesel'
        TOLL = 'TOLL', 'Vé trạm thu phí BOT'
        PARKING = 'PARKING', 'Phí bến bãi đỗ xe'
        POLICE_FINE = 'POLICE_FINE', 'Phạt vi phạm giao thông'
        OTHER = 'OTHER', 'Chi phí khác'

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='expenses')
    driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses')
    category = models.CharField(max_length=20, choices=ExpenseCategory.choices, default=ExpenseCategory.FUEL)
    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Số tiền (VNĐ)")
    expense_date = models.DateField(verbose_name="Ngày phát sinh")
    liters = models.DecimalField(max_digits=8, decimal_places=2, default=0, verbose_name="Số lít (nếu là xăng/dầu)")
    invoice_number = models.CharField(max_length=50, blank=True, null=True, verbose_name="Số hóa đơn GTGT")
    notes = models.TextField(blank=True, null=True, verbose_name="Ghi chú")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_category_display()} - {self.vehicle.plate_number}: {self.amount:,.0f} VNĐ"

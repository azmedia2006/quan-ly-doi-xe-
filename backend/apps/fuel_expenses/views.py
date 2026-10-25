from rest_framework import viewsets, permissions, filters
from .models import Expense
from .serializers import ExpenseSerializer

# // NEW: RBAC Permission cho Chi phí & Hóa đơn
class IsAccountantOrAdminOrDriverExpense(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # Admin và Kế toán có toàn quyền quản lý chi phí
        if request.user.role in ['ADMIN', 'SUPERADMIN', 'ACCOUNTANT']:
            return True
        # Driver có thể tạo báo cáo chi phí hoặc xem
        if request.user.role == 'DRIVER':
            return True
        return request.method in permissions.SAFE_METHODS

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, IsAccountantOrAdminOrDriverExpense]
    filter_backends = [filters.SearchFilter]
    search_fields = ['invoice_number', 'notes', 'vehicle__plate_number', 'driver__full_name']

    # // UPDATE: Lọc chi phí theo vai trò người dùng
    def get_queryset(self):
        user = self.request.user
        queryset = Expense.objects.all().order_by('-expense_date')
        if user.role == 'DRIVER':
            driver_profile = getattr(user, 'driver_profile', None)
            if driver_profile:
                return queryset.filter(driver=driver_profile)
            return queryset.filter(driver__user=user)
        return queryset

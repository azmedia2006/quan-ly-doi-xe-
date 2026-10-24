from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from .models import TripSchedule
from .serializers import TripScheduleSerializer
from apps.vehicles.models import Vehicle
from apps.drivers.models import Driver

# // NEW: RBAC Permission cho Lệnh điều xe
class IsDispatcherOrAdminOrDriverReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # Admin và Dispatcher có quyền tạo/sửa/xóa
        if request.user.role in ['ADMIN', 'SUPERADMIN', 'DISPATCHER']:
            return True
        # Driver chỉ có quyền xem (GET)
        if request.user.role == 'DRIVER' and request.method in permissions.SAFE_METHODS:
            return True
        # Các role khác nếu GET thì cho phép
        return request.method in permissions.SAFE_METHODS

class TripScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = TripScheduleSerializer
    permission_classes = [permissions.IsAuthenticated, IsDispatcherOrAdminOrDriverReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['trip_code', 'origin', 'destination', 'cargo_or_passenger_info', 'vehicle__plate_number', 'driver__full_name']

    # // UPDATE: Phân quyền lọc dữ liệu theo RBAC
    def get_queryset(self):
        user = self.request.user
        queryset = TripSchedule.objects.all().order_by('-departure_time')
        # Nếu là Tài xế (Driver), chỉ hiển thị các chuyến đi được phân công cho chính tài xế đó
        if user.role == 'DRIVER':
            driver_profile = getattr(user, 'driver_profile', None)
            if driver_profile:
                return queryset.filter(driver=driver_profile)
            return queryset.filter(driver__user=user)
        return queryset

    # // NEW: Tự động cập nhật trạng thái Xe & Tài xế sang "Đang lái" khi tạo lệnh điều xe
    def perform_create(self, serializer):
        schedule = serializer.save()
        vehicle = schedule.vehicle
        driver = schedule.driver
        
        # Cập nhật trạng thái xe và tài xế
        vehicle.status = Vehicle.Status.ON_TRIP
        vehicle.save(update_fields=['status'])
        
        driver.status = Driver.Status.ON_TRIP
        driver.save(update_fields=['status'])

    # // NEW: Tự động cập nhật lại trạng thái Xe & Tài xế khi hoàn thành hoặc hủy lệnh điều xe
    def perform_update(self, serializer):
        schedule = serializer.save()
        if schedule.status in [TripSchedule.Status.COMPLETED, TripSchedule.Status.CANCELLED]:
            vehicle = schedule.vehicle
            driver = schedule.driver
            vehicle.status = Vehicle.Status.AVAILABLE
            vehicle.save(update_fields=['status'])
            driver.status = Driver.Status.AVAILABLE
            driver.save(update_fields=['status'])

    # // NEW: Tự động hoàn lại trạng thái Xe & Tài xế sang AVAILABLE khi xóa lệnh điều xe
    def perform_destroy(self, instance):
        vehicle = instance.vehicle
        driver = instance.driver
        super().perform_destroy(instance)
        # Nếu không còn chuyến nào đang chạy thì trả về AVAILABLE
        if vehicle and not TripSchedule.objects.filter(vehicle=vehicle, status__in=[TripSchedule.Status.PLANNED, TripSchedule.Status.DISPATCHED]).exists():
            vehicle.status = Vehicle.Status.AVAILABLE
            vehicle.save(update_fields=['status'])
        if driver and not TripSchedule.objects.filter(driver=driver, status__in=[TripSchedule.Status.PLANNED, TripSchedule.Status.DISPATCHED]).exists():
            driver.status = Driver.Status.AVAILABLE
            driver.save(update_fields=['status'])

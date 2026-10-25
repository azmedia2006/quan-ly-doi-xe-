from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import TripSchedule
from .serializers import TripScheduleSerializer
from apps.vehicles.models import Vehicle
from apps.drivers.models import Driver

class IsDispatcherOrAdminOrDriverReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in ['ADMIN', 'SUPERADMIN', 'DISPATCHER']:
            return True
        if request.user.role == 'DRIVER' and request.method in permissions.SAFE_METHODS:
            return True
        return request.method in permissions.SAFE_METHODS

class TripScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = TripScheduleSerializer
    permission_classes = [permissions.IsAuthenticated, IsDispatcherOrAdminOrDriverReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['trip_code', 'origin', 'destination', 'cargo_or_passenger_info', 'customer_name', 'vehicle__plate_number', 'driver__full_name']

    def get_queryset(self):
        user = self.request.user
        queryset = TripSchedule.objects.all().order_by('-departure_time')
        if user.role == 'DRIVER':
            driver_profile = getattr(user, 'driver_profile', None)
            if driver_profile:
                return queryset.filter(driver=driver_profile)
            return queryset.filter(driver__user=user)
        return queryset

    def perform_create(self, serializer):
        schedule = serializer.save()
        vehicle = schedule.vehicle
        driver = schedule.driver
        
        vehicle.status = Vehicle.Status.ON_TRIP
        vehicle.save(update_fields=['status'])
        
        driver.status = Driver.Status.ON_TRIP
        driver.save(update_fields=['status'])

    def perform_update(self, serializer):
        schedule = serializer.save()
        if schedule.status in [TripSchedule.Status.COMPLETED, TripSchedule.Status.CANCELLED]:
            vehicle = schedule.vehicle
            driver = schedule.driver
            vehicle.status = Vehicle.Status.AVAILABLE
            vehicle.save(update_fields=['status'])
            driver.status = Driver.Status.AVAILABLE
            driver.save(update_fields=['status'])

    def perform_destroy(self, instance):
        vehicle = instance.vehicle
        driver = instance.driver
        super().perform_destroy(instance)
        if vehicle and not TripSchedule.objects.filter(vehicle=vehicle, status__in=[TripSchedule.Status.PLANNED, TripSchedule.Status.DISPATCHED]).exists():
            vehicle.status = Vehicle.Status.AVAILABLE
            vehicle.save(update_fields=['status'])
        if driver and not TripSchedule.objects.filter(driver=driver, status__in=[TripSchedule.Status.PLANNED, TripSchedule.Status.DISPATCHED]).exists():
            driver.status = Driver.Status.AVAILABLE
            driver.save(update_fields=['status'])

    @action(detail=True, methods=['post'], url_path='complete')
    def complete_trip(self, request, pk=None):
        trip = self.get_object()
        end_odo = request.data.get('end_odometer')
        if end_odo:
            try:
                trip.end_odometer = int(end_odo)
                if trip.vehicle and trip.end_odometer > trip.vehicle.odometer:
                    trip.vehicle.odometer = trip.end_odometer
                    trip.vehicle.save(update_fields=['odometer'])
            except (ValueError, TypeError):
                pass
        trip.status = TripSchedule.Status.COMPLETED
        trip.trip_step = TripSchedule.TripStep.SIGNED
        trip.actual_arrival = timezone.now()
        trip.save()

        # Giải phóng phương tiện và tài xế
        if trip.vehicle:
            trip.vehicle.status = Vehicle.Status.AVAILABLE
            trip.vehicle.save(update_fields=['status'])
        if trip.driver:
            trip.driver.status = Driver.Status.AVAILABLE
            trip.driver.save(update_fields=['status'])

        return Response(TripScheduleSerializer(trip).data)

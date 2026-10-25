from rest_framework import serializers
from .models import Vehicle
from apps.schedules.models import TripSchedule

class VehicleSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    vehicle_type_display = serializers.CharField(source='get_vehicle_type_display', read_only=True)
    current_driver_name = serializers.SerializerMethodField()
    active_trip_code = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = '__all__'

    def get_current_driver_name(self, obj):
        # Lấy tài xế của chuyến đi đang diễn ra (DISPATCHED hoặc PLANNED)
        active_trip = TripSchedule.objects.filter(
            vehicle=obj,
            status__in=[TripSchedule.Status.DISPATCHED, TripSchedule.Status.PLANNED]
        ).order_by('-departure_time').first()
        if active_trip and active_trip.driver:
            return active_trip.driver.full_name
        return None

    def get_active_trip_code(self, obj):
        active_trip = TripSchedule.objects.filter(
            vehicle=obj,
            status__in=[TripSchedule.Status.DISPATCHED, TripSchedule.Status.PLANNED]
        ).order_by('-departure_time').first()
        return active_trip.trip_code if active_trip else None

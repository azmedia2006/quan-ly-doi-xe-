from rest_framework import serializers
from .models import Driver
from apps.schedules.models import TripSchedule

class DriverSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    license_class_display = serializers.CharField(source='get_license_class_display', read_only=True)
    current_vehicle_plate = serializers.SerializerMethodField()
    current_vehicle_model = serializers.SerializerMethodField()
    active_trip_code = serializers.SerializerMethodField()

    class Meta:
        model = Driver
        fields = '__all__'

    def get_current_vehicle_plate(self, obj):
        active_trip = TripSchedule.objects.filter(
            driver=obj,
            status__in=[TripSchedule.Status.DISPATCHED, TripSchedule.Status.PLANNED]
        ).order_by('-departure_time').first()
        if active_trip and active_trip.vehicle:
            return active_trip.vehicle.plate_number
        return None

    def get_current_vehicle_model(self, obj):
        active_trip = TripSchedule.objects.filter(
            driver=obj,
            status__in=[TripSchedule.Status.DISPATCHED, TripSchedule.Status.PLANNED]
        ).order_by('-departure_time').first()
        if active_trip and active_trip.vehicle:
            return active_trip.vehicle.model
        return None

    def get_active_trip_code(self, obj):
        active_trip = TripSchedule.objects.filter(
            driver=obj,
            status__in=[TripSchedule.Status.DISPATCHED, TripSchedule.Status.PLANNED]
        ).order_by('-departure_time').first()
        return active_trip.trip_code if active_trip else None

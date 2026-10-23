from rest_framework import serializers
from .models import TripSchedule

class TripScheduleSerializer(serializers.ModelSerializer):
    vehicle_plate = serializers.CharField(source='vehicle.plate_number', read_only=True)
    vehicle_model = serializers.CharField(source='vehicle.model_name', read_only=True)
    driver_name = serializers.CharField(source='driver.full_name', read_only=True)
    driver_phone = serializers.CharField(source='driver.phone', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = TripSchedule
        fields = '__all__'

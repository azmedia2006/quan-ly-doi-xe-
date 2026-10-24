from rest_framework import serializers
from .models import Expense

class ExpenseSerializer(serializers.ModelSerializer):
    vehicle_plate = serializers.CharField(source='vehicle.plate_number', read_only=True)
    vehicle_model = serializers.CharField(source='vehicle.model_name', read_only=True)
    driver_name = serializers.CharField(source='driver.full_name', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    approval_status_display = serializers.CharField(source='get_approval_status_display', read_only=True)
    trip_code = serializers.CharField(source='trip.trip_code', read_only=True)
    trip_route = serializers.SerializerMethodField()

    class Meta:
        model = Expense
        fields = '__all__'

    def get_trip_route(self, obj):
        if obj.trip:
            return f"{obj.trip.origin} - {obj.trip.destination}"
        return None

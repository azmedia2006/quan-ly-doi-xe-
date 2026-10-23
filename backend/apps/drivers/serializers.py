from rest_framework import serializers
from .models import Driver

class DriverSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    license_class_display = serializers.CharField(source='get_license_class_display', read_only=True)

    class Meta:
        model = Driver
        fields = '__all__'

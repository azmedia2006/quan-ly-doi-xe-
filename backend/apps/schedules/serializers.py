from rest_framework import serializers
from .models import TripSchedule
from apps.vehicles.models import Vehicle
from apps.drivers.models import Driver

class TripScheduleSerializer(serializers.ModelSerializer):
    vehicle_plate = serializers.CharField(source='vehicle.plate_number', read_only=True)
    vehicle_model = serializers.CharField(source='vehicle.model_name', read_only=True)
    vehicle_type_display = serializers.CharField(source='vehicle.get_vehicle_type_display', read_only=True)
    driver_name = serializers.CharField(source='driver.full_name', read_only=True)
    driver_phone = serializers.CharField(source='driver.phone', read_only=True)
    driver_license = serializers.CharField(source='driver.license_class', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = TripSchedule
        fields = '__all__'

    # // NEW: Kiểm tra logic ràng buộc khi lập lệnh điều xe
    def validate(self, data):
        vehicle = data.get('vehicle')
        driver = data.get('driver')
        departure_time = data.get('departure_time')
        instance_id = self.instance.id if self.instance else None

        # 1. Ràng buộc trạng thái Xe: chỉ cho phép chọn xe đang ở trạng thái rảnh/hợp lệ
        if vehicle and not instance_id:
            if vehicle.status not in [Vehicle.Status.AVAILABLE, 'AVAILABLE']:
                raise serializers.ValidationError({
                    'vehicle': f"Phương tiện [{vehicle.plate_number}] hiện đang ở trạng thái '{vehicle.get_status_display()}'. Chỉ được điều phối xe đang rảnh/sẵn sàng!"
                })

        # 2. Ràng buộc trạng thái Tài xế: chỉ cho phép chọn tài xế đang rảnh
        if driver and not instance_id:
            if driver.status not in [Driver.Status.AVAILABLE, 'AVAILABLE']:
                raise serializers.ValidationError({
                    'driver': f"Tài xế [{driver.full_name}] hiện đang ở trạng thái '{driver.get_status_display()}'. Không thể điều phối tài xế đang lái hoặc nghỉ phép!"
                })

        # 3. Ràng buộc chống trùng lịch: kiểm tra xe hoặc tài xế có chuyến đi khác đang hoạt động cùng thời điểm
        if vehicle and departure_time:
            overlapping_vehicle = TripSchedule.objects.filter(
                vehicle=vehicle,
                status__in=[TripSchedule.Status.PLANNED, TripSchedule.Status.DISPATCHED]
            ).exclude(id=instance_id)
            if overlapping_vehicle.exists():
                raise serializers.ValidationError({
                    'vehicle': f"Phương tiện [{vehicle.plate_number}] đã được lên lịch trong một lệnh điều xe chưa hoàn tất khác ({overlapping_vehicle.first().trip_code})!"
                })

        if driver and departure_time:
            overlapping_driver = TripSchedule.objects.filter(
                driver=driver,
                status__in=[TripSchedule.Status.PLANNED, TripSchedule.Status.DISPATCHED]
            ).exclude(id=instance_id)
            if overlapping_driver.exists():
                raise serializers.ValidationError({
                    'driver': f"Tài xế [{driver.full_name}] đã được phân công trong lệnh điều xe ({overlapping_driver.first().trip_code}) chưa hoàn tất!"
                })

        return data

from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import MaintenanceRecord
from .serializers import MaintenanceRecordSerializer
from apps.vehicles.models import Vehicle

class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRecord.objects.all().order_by('-service_date')
    serializer_class = MaintenanceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['maintenance_code', 'garage_name', 'details', 'technician_name']

    def perform_create(self, serializer):
        record = serializer.save()
        # Đồng bộ: Khi tạo phiếu đang thực hiện, chuyển trạng thái xe sang MAINTENANCE
        if record.status == MaintenanceRecord.Status.IN_PROGRESS and record.vehicle:
            record.vehicle.status = Vehicle.Status.MAINTENANCE
            record.vehicle.save(update_fields=['status'])

    def perform_update(self, serializer):
        record = serializer.save()
        if record.vehicle:
            if record.status == MaintenanceRecord.Status.IN_PROGRESS:
                record.vehicle.status = Vehicle.Status.MAINTENANCE
                record.vehicle.save(update_fields=['status'])
            elif record.status == MaintenanceRecord.Status.COMPLETED:
                record.vehicle.status = Vehicle.Status.AVAILABLE
                record.vehicle.save(update_fields=['status'])

    @action(detail=True, methods=['post'], url_path='complete')
    def mark_completed(self, request, pk=None):
        record = self.get_object()
        record.status = MaintenanceRecord.Status.COMPLETED
        record.save(update_fields=['status'])
        if record.vehicle:
            record.vehicle.status = Vehicle.Status.AVAILABLE
            record.vehicle.save(update_fields=['status'])
        return Response(MaintenanceRecordSerializer(record).data)

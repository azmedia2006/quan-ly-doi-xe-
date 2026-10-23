from rest_framework import viewsets, permissions, filters
from .models import MaintenanceRecord
from .serializers import MaintenanceRecordSerializer

class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRecord.objects.all().order_by('-service_date')
    serializer_class = MaintenanceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['maintenance_code', 'garage_name', 'details', 'technician_name']

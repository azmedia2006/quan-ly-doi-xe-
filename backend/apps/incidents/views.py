from rest_framework import viewsets, permissions, filters
from .models import Incident
from .serializers import IncidentSerializer

class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.all().order_by('-incident_date')
    serializer_class = IncidentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['incident_code', 'location', 'description']

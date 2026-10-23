from rest_framework import viewsets, permissions, filters
from .models import TripSchedule
from .serializers import TripScheduleSerializer

class TripScheduleViewSet(viewsets.ModelViewSet):
    queryset = TripSchedule.objects.all().order_by('-departure_time')
    serializer_class = TripScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['trip_code', 'origin', 'destination', 'cargo_description']

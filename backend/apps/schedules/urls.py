from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripScheduleViewSet

router = DefaultRouter()
router.register(r'', TripScheduleViewSet, basename='schedule')

urlpatterns = [
    path('', include(router.urls)),
]

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('', include('django_prometheus.urls')),
    path('admin/', admin.site.urls),
    
    # OpenAPI Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Fleet API Endpoints
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/vehicles/', include('apps.vehicles.urls')),
    path('api/v1/drivers/', include('apps.drivers.urls')),
    path('api/v1/schedules/', include('apps.schedules.urls')),
    path('api/v1/maintenance/', include('apps.maintenance.urls')),
    path('api/v1/expenses/', include('apps.fuel_expenses.urls')),
    path('api/v1/incidents/', include('apps.incidents.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/core/', include('apps.core.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

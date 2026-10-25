from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Count
from apps.vehicles.models import Vehicle
from apps.drivers.models import Driver
from apps.schedules.models import TripSchedule
from apps.maintenance.models import MaintenanceRecord
from apps.fuel_expenses.models import Expense

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_vehicles = Vehicle.objects.count()
        available_vehicles = Vehicle.objects.filter(status='AVAILABLE').count()
        ontrip_vehicles = Vehicle.objects.filter(status='ON_TRIP').count()
        maintenance_vehicles = Vehicle.objects.filter(status__in=['MAINTENANCE', 'REPAIR']).count()

        total_drivers = Driver.objects.count()
        available_drivers = Driver.objects.filter(status='AVAILABLE').count()

        total_schedules = TripSchedule.objects.count()
        active_schedules = TripSchedule.objects.filter(status='DISPATCHED').count()

        total_maintenance_cost = MaintenanceRecord.objects.aggregate(total=Sum('cost'))['total'] or 0
        total_fuel_expense = Expense.objects.filter(category='FUEL').aggregate(total=Sum('amount'))['total'] or 0

        # Status distribution for charts
        vehicle_status_chart = [
            {'name': 'Sẵn sàng', 'value': available_vehicles, 'color': '#10b981'},
            {'name': 'Đang chạy', 'value': ontrip_vehicles, 'color': '#3b82f6'},
            {'name': 'Bảo dưỡng', 'value': maintenance_vehicles, 'color': '#f59e0b'},
        ]

        # Monthly expense trend (sample mock)
        monthly_trend = [
            {'month': 'T5', 'maintenance': 12000000, 'fuel': 45000000},
            {'month': 'T6', 'maintenance': 18500000, 'fuel': 52000000},
            {'month': 'T7', 'maintenance': 8000000, 'fuel': 48000000},
            {'month': 'T8', 'maintenance': 24000000, 'fuel': 61000000},
            {'month': 'T9', 'maintenance': 15000000, 'fuel': 58000000},
            {'month': 'T10', 'maintenance': float(total_maintenance_cost), 'fuel': float(total_fuel_expense)},
        ]

        return Response({
            'stats': {
                'total_vehicles': total_vehicles,
                'available_vehicles': available_vehicles,
                'ontrip_vehicles': ontrip_vehicles,
                'maintenance_vehicles': maintenance_vehicles,
                'total_drivers': total_drivers,
                'available_drivers': available_drivers,
                'total_schedules': total_schedules,
                'active_schedules': active_schedules,
                'total_maintenance_cost': total_maintenance_cost,
                'total_fuel_expense': total_fuel_expense,
            },
            'charts': {
                'vehicle_status': vehicle_status_chart,
                'monthly_trend': monthly_trend,
            }
        })

class GlobalSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        if not q:
            return Response({'results': []})

        results = []
        # Search vehicles
        for v in Vehicle.objects.filter(plate_number__icontains=q)[:5]:
            results.append({
                'type': 'vehicle',
                'category': 'Xe / Phương tiện',
                'title': v.plate_number,
                'subtitle': f"{v.model_name} • {v.get_vehicle_type_display()} • ODO: {v.odometer:,} km",
                'url': '/vehicles'
            })

        # Search drivers
        for d in Driver.objects.filter(full_name__icontains=q)[:5]:
            results.append({
                'type': 'driver',
                'category': 'Tài xế',
                'title': d.full_name,
                'subtitle': f"Mã: {d.driver_code} • GPLX {d.license_class} • SĐT: {d.phone}",
                'url': '/drivers'
            })

        # Search schedules
        for s in TripSchedule.objects.filter(trip_code__icontains=q)[:5]:
            results.append({
                'type': 'schedule',
                'category': 'Lịch trình',
                'title': s.trip_code,
                'subtitle': f"{s.origin} -> {s.destination} ({s.vehicle.plate_number})",
                'url': '/schedules'
            })

        return Response({'results': results})

class AuditLogListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from .models import AuditLog
        logs = AuditLog.objects.all().order_by('-timestamp')[:50]
        results = [
            {
                'id': log.id,
                'ts': log.timestamp.strftime('%d/%m/%Y %H:%M:%S'),
                'user': log.username,
                'role': log.role,
                'action': log.action,
                'detail': log.detail,
                'ip': log.ip_address,
            }
            for log in logs
        ]
        return Response({'results': results})

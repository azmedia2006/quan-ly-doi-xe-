from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.fleet.models import DispatchOrder, MaintenanceRecord, IncidentReport, Expense
from apps.notifications.models import Notification

@receiver(post_save, sender=DispatchOrder)
def notify_dispatch(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            title=f"Lệnh điều xe mới: {instance.code}",
            message=f"Chuyến {instance.code} đã được lập. Phương tiện {instance.vehicle.plate_number if instance.vehicle else 'N/A'}, Tài xế {instance.driver.full_name if instance.driver else 'Chưa gán'}. Tuyến {instance.start_location} ➔ {instance.end_location}."
        )

@receiver(post_save, sender=MaintenanceRecord)
def notify_maintenance(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            title=f"Phiếu bảo dưỡng mới: {instance.code}",
            message=f"Đã lập phiếu bảo dưỡng {instance.code} cho xe {instance.vehicle.plate_number if instance.vehicle else 'N/A'} tại xưởng {instance.garage_name or 'Xưởng nội bộ'}."
        )

@receiver(post_save, sender=IncidentReport)
def notify_incident(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            title=f"Cảnh báo sự cố: {instance.code}",
            message=f"Sự cố {instance.code} mức độ [{instance.severity}] tại {instance.location}. Xe {instance.vehicle.plate_number if instance.vehicle else 'N/A'}, Tài xế {instance.driver.full_name if instance.driver else 'N/A'}."
        )

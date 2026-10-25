from django.db import models
from apps.accounts.models import User

class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    username = models.CharField(max_length=150, default='system')
    role = models.CharField(max_length=50, default='Admin')
    action = models.CharField(max_length=255)
    detail = models.TextField(blank=True, null=True)
    ip_address = models.CharField(max_length=50, default='180.93.114.74')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.timestamp} - {self.username} - {self.action}"

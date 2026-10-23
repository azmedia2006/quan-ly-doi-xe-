from django.urls import path
from .views import NotificationListView, MarkAllReadView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification_list'),
    path('mark-all-read/', MarkAllReadView.as_view(), name='mark_all_read'),
]

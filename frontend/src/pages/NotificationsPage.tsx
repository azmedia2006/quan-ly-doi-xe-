import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, ShieldAlert, Info } from 'lucide-react';
import api from '../services/api';
import { NotificationItem } from '../types';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const { success } = useToast();

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data.results || res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read/');
      success('Đã đánh dấu tất cả thông báo là đã đọc');
      fetchNotifs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" /> Trung Tâm Thông Báo (Notifications)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cảnh báo hạn kiểm định, lịch bảo dưỡng sắp đến mốc và cập nhật hành trình các chuyến xe.
          </p>
        </div>
        <Button onClick={handleMarkAllRead} variant="outline" className="flex items-center gap-2">
          <CheckCheck className="w-4 h-4" /> Đánh Dấu Tất Cả Đã Đọc
        </Button>
      </div>

      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
        {notifications.map((n) => (
          <div key={n.id} className="py-4 px-3 flex items-start gap-4">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mt-0.5">
              <Info className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{n.title}</h3>
                {!n.is_read && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    Mới
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

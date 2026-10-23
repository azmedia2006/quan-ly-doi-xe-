import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu, Search, Bell, Sun, Moon, LogOut, User as UserIcon,
  ChevronDown, Truck
} from 'lucide-react';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../ui/Toast';
import api from '../../services/api';
import { NotificationItem, UserRole } from '../../types';

export interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onOpenSearch }) => {
  const { user, logout, switchRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success } = useToast();
  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifications/');
        setNotifications(res.data.results || res.data || []);
      } catch (e) {
        // silent
      }
    };
    if (user) fetchNotifs();
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read/');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (e) {
      // silent
    }
  };

  const handleRoleSwitch = async (targetRole: UserRole) => {
    setShowUserMenu(false);
    await switchRole(targetRole);
    success(`Đã chuyển đổi vai trò: ${DEMO_CREDENTIALS[targetRole]?.label || targetRole}`);
    navigate('/dashboard');
  };

  // Avatar URL resolution: Custom Avatar or DiceBear or Initials
  const avatarUrl = user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'fleet'}`;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Sidebar Toggle + Global Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Thu gọn / Mở rộng Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-400 text-xs transition-colors border border-slate-200/60 dark:border-slate-700/60 w-64 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Tìm xe, tài xế, lịch trình...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Quick Role Switcher + Theme Toggle + Notifications + User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Role Switcher Pill (Desktop) */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
          <span className="text-[11px] font-semibold px-2 text-slate-500">Demo Role:</span>
          {(['ADMIN', 'DISPATCHER', 'DRIVER', 'MECHANIC', 'ACCOUNTANT'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => handleRoleSwitch(r)}
              className={`px-2 py-1 rounded-lg font-medium transition-all ${
                user?.role === r
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {r === 'ADMIN' ? 'Admin' : r === 'DISPATCHER' ? 'Điều Hành' : r === 'DRIVER' ? 'Tài Xế' : r === 'MECHANIC' ? 'Kỹ Thuật' : 'Kế Toán'}
            </button>
          ))}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Chuyển chế độ Sáng / Tối"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Thông báo"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Thông báo hệ thống ({unreadCount})
                </span>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-[10px] text-blue-600 hover:underline">
                    Đã đọc tất cả
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">Không có thông báo mới</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-3 text-left ${n.is_read ? 'opacity-60' : 'bg-blue-50/30 dark:bg-blue-950/20'}`}>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar with Image */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border-2 border-blue-500/40 shadow-xs"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {user?.full_name || user?.username}
              </span>
              <span className="text-[10px] text-slate-400 capitalize">
                {user?.role_display || 'Quản trị'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-blue-400" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {user?.full_name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user?.email}
                  </p>
                  <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {user?.role_display}
                  </span>
                </div>
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

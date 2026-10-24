import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu, Search, Bell, Sun, Moon, LogOut, ChevronDown, Check, User, Mail, Phone, MapPin, Shield, Calendar, IdCard, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../ui/Toast';
import { Modal } from '../ui/Modal';
import api from '../../services/api';
import { NotificationItem } from '../../types';

export interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onOpenSearch }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success } = useToast();
  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
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

  const avatarUrl = user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'fleet'}`;

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 flex items-center justify-between">
        {/* Left: Hamburger menu + Search */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Menu"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop search bar */}
          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 text-xs transition-colors border border-slate-200/60 dark:border-slate-700/60 w-56 lg:w-64 justify-between"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">Tìm xe, tài xế...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500">
              Ctrl K
            </kbd>
          </button>

          {/* Mobile search icon button */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Tìm kiếm"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              title="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {showNotifMenu && (
              <div className="fixed sm:absolute top-16 sm:top-full right-2 sm:right-0 w-[calc(100vw-1rem)] sm:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Thông báo ({unreadCount})
                  </h4>
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
                      <div key={n.id} className={`p-3 text-left ${n.is_read ? 'opacity-60' : 'bg-blue-50/40 dark:bg-blue-950/20'}`}>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar with dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover border-2 border-blue-500/50 shadow-xs"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {user?.full_name || user?.username}
                </span>
                <span className="text-[10px] text-slate-400">
                  {user?.role_display || 'Quản trị'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="fixed sm:absolute top-16 sm:top-full right-2 sm:right-0 w-[calc(100vw-1rem)] sm:w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-blue-400 shrink-0" />
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

                {/* Profile actions menu */}
                <div className="p-1.5 space-y-0.5">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition-colors"
                  >
                    <User className="w-4 h-4 text-blue-500" />
                    Hồ sơ cá nhân & Tài khoản
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-emerald-500" />
                    Cài đặt bảo mật & Phiên làm việc
                  </button>
                </div>

                <div className="pt-1.5 px-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={logout}
                    className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất tài khoản
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* User Profile Details Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Thông Tin Hồ Sơ & Tài Khoản"
        maxWidth="md"
      >
        <div className="space-y-4">
          {/* Avatar and Main Header */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent border border-blue-200/50 dark:border-blue-900/50">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-16 h-16 rounded-full border-2 border-blue-500 shadow-md shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 truncate">
                {user?.full_name || user?.username}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">@{user?.username}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {user?.role_display || user?.role}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Đang hoạt động
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Info List */}
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" /> Hộp thư điện tử:
              </span>
              <strong className="text-slate-900 dark:text-slate-100 font-mono truncate max-w-xs">{user?.email || 'Chưa cập nhật'}</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" /> Số điện thoại:
              </span>
              <strong className="text-slate-900 dark:text-slate-100 font-mono">{user?.phone_number || '0901112233'}</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" /> Địa chỉ trụ sở:
              </span>
              <strong className="text-slate-900 dark:text-slate-100 truncate max-w-xs">{user?.address || 'Hà Nội, Việt Nam'}</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-400" /> Mã định danh hệ thống (UID):
              </span>
              <strong className="text-slate-900 dark:text-slate-100 font-mono">UID-{user?.id ? String(user.id).padStart(4, '0') : '0001'}</strong>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              onClick={() => setShowProfileModal(false)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            >
              Đóng hồ sơ
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

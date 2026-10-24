import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Truck, Users, CalendarDays, Wrench, Fuel,
  AlertTriangle, Bell, Settings, X, ShieldCheck, MapPin, DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  allowedRoles?: UserRole[];
  badge?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, isMobileOpen, onCloseMobile }) => {
  const { user } = useAuth();
  const currentRole = user?.role || 'ADMIN';

  // Role-based Nav Structure: Each role has tailored menus
  const navGroups: NavGroup[] = [
    {
      group: 'TỔNG QUAN',
      items: [
        {
          name: 'Bàn làm việc (Dashboard)',
          path: '/dashboard',
          icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
        },
      ],
    },
    {
      group: 'VẬN HÀNH & ĐIỀU PHỐI',
      items: [
        {
          name: 'Quản lý Đội xe (Vehicles)',
          path: '/vehicles',
          icon: <Truck className="w-5 h-5 shrink-0" />,
          allowedRoles: ['ADMIN', 'SUPERADMIN', 'DISPATCHER', 'MECHANIC'],
        },
        {
          name: 'Hồ sơ Tài xế (Drivers)',
          path: '/drivers',
          icon: <Users className="w-5 h-5 shrink-0" />,
          allowedRoles: ['ADMIN', 'SUPERADMIN', 'DISPATCHER'],
        },
        {
          name: 'Lịch trình & Chuyến đi',
          path: '/schedules',
          icon: <CalendarDays className="w-5 h-5 shrink-0" />,
          allowedRoles: ['ADMIN', 'SUPERADMIN', 'DISPATCHER', 'DRIVER'],
          badge: currentRole === 'DRIVER' ? 'Việc của tôi' : 'Live',
        },
      ],
    },
    {
      group: 'KỸ THUẬT & TÀI CHÍNH',
      items: [
        {
          name: 'Bảo dưỡng & Sửa chữa',
          path: '/maintenance',
          icon: <Wrench className="w-5 h-5 shrink-0" />,
          allowedRoles: ['ADMIN', 'SUPERADMIN', 'MECHANIC', 'ACCOUNTANT'],
          badge: currentRole === 'MECHANIC' ? 'Xưởng' : undefined,
        },
        {
          name: 'Nhiên liệu & Chi phí',
          path: '/expenses',
          icon: <Fuel className="w-5 h-5 shrink-0" />,
          allowedRoles: ['ADMIN', 'SUPERADMIN', 'ACCOUNTANT', 'DRIVER'],
          badge: currentRole === 'ACCOUNTANT' ? 'Kế toán' : undefined,
        },
        {
          name: 'Sự cố & Bảo hiểm',
          path: '/incidents',
          icon: <AlertTriangle className="w-5 h-5 shrink-0" />,
          allowedRoles: ['ADMIN', 'SUPERADMIN', 'DISPATCHER', 'MECHANIC', 'ACCOUNTANT', 'DRIVER'],
        },
      ],
    },
    {
      group: 'HỆ THỐNG',
      items: [
        {
          name: 'Trung tâm Thông báo',
          path: '/notifications',
          icon: <Bell className="w-5 h-5 shrink-0" />,
        },
        {
          name: 'Cài đặt & Giám sát',
          path: '/settings',
          icon: <Settings className="w-5 h-5 shrink-0" />,
          allowedRoles: ['ADMIN', 'SUPERADMIN'],
        },
      ],
    },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between shadow-2xl lg:shadow-none ${
        isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
      } ${
        isCollapsed ? 'lg:w-20' : 'lg:w-64'
      }`}
    >
      <div>
        {/* Brand Logo & Name */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent truncate">
                  FleetManage Pro
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                  Quản Lý Đội Xe
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Badge in Sidebar */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="px-4 py-2.5 mx-3 mt-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Không gian làm việc</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {user?.role_display || 'Quản trị viên'}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Groups */}
        <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-13rem)]">
          {navGroups.map((group, gIdx) => {
            const filteredItems = group.items.filter((item) => {
              if (!item.allowedRoles) return true;
              return item.allowedRoles.includes(currentRole as UserRole) || currentRole === 'SUPERADMIN' || currentRole === 'ADMIN';
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1">
                {(!isCollapsed || isMobileOpen) && (
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {group.group}
                  </p>
                )}
                {filteredItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    title={isCollapsed && !isMobileOpen ? item.name : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      } ${isCollapsed && !isMobileOpen ? 'lg:justify-center lg:px-0' : ''}`
                    }
                  >
                    {item.icon}
                    {(!isCollapsed || isMobileOpen) && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}
                    {(!isCollapsed || isMobileOpen) && item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        {!isCollapsed || isMobileOpen ? (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-500 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-300">FleetManage v2.0</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Phiên làm việc bảo mật
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Hệ thống hoạt động tốt" />
          </div>
        )}
      </div>
    </aside>
  );
};

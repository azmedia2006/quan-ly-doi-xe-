import React from 'react';
import { Settings, ShieldCheck, Server, ExternalLink, UserCheck, Shield } from 'lucide-react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { UserRole } from '../types';
import { useToast } from '../components/ui/Toast';

export const SettingsPage: React.FC = () => {
  const { user, switchRole } = useAuth();
  const { success } = useToast();

  const handleRoleSwitch = async (targetRole: UserRole) => {
    await switchRole(targetRole);
    success(`Đã chuyển đổi môi trường sang: ${DEMO_CREDENTIALS[targetRole]?.label || targetRole}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" /> Cài Đặt & Quản Trị Hệ Thống
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
          Quản trị hạ tầng phân tán, cấu hình bảo mật Hardening và công cụ chuyển đổi phân quyền thử nghiệm.
        </p>
      </div>

      {/* Công cụ chuyển đổi vai trò Demo độc lập trong trang cài đặt */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-500" /> Chuyển Đổi Môi Trường Vai Trò (RBAC Simulation)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Dành riêng cho Quản trị viên và Giảng viên chấm bài kiểm thử quyền hạn giữa các nhóm vai trò.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            Hiện tại: {user?.role_display}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
          {(['ADMIN', 'DISPATCHER', 'DRIVER', 'MECHANIC', 'ACCOUNTANT'] as UserRole[]).map((r) => {
            const isCurrent = user?.role === r;
            const cred = DEMO_CREDENTIALS[r];
            return (
              <button
                key={r}
                onClick={() => handleRoleSwitch(r)}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <p className="text-xs font-bold truncate">
                  {r === 'ADMIN' ? '👑 Admin' : r === 'DISPATCHER' ? '🚛 Điều Hành' : r === 'DRIVER' ? '👨‍✈️ Tài Xế' : r === 'MECHANIC' ? '🔧 Kỹ Thuật' : '💵 Kế Toán'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono truncate">@{cred?.u}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Hạ tầng dịch vụ */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-500" /> Cổng Truy Cập Dịch Vụ Quản Trị
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">pgAdmin 4 (PostgreSQL GUI)</p>
                <p className="text-[11px] text-slate-400">Tài khoản: admin@fleet.com</p>
              </div>
              <a
                href="/pgadmin/"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-semibold flex items-center gap-1 hover:bg-blue-500"
              >
                Mở pgAdmin <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Grafana Monitoring & Logs</p>
                <p className="text-[11px] text-slate-400">Dashboard Metrics & LogQL Loki</p>
              </div>
              <a
                href="http://180.93.114.74:3001"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-semibold flex items-center gap-1 hover:bg-purple-500"
              >
                Mở Grafana <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Prometheus Web UI</p>
                <p className="text-[11px] text-slate-400">Thu thập chỉ số container, app & database</p>
              </div>
              <a
                href="http://180.93.114.74:9090"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-white font-semibold flex items-center gap-1 hover:bg-slate-700"
              >
                Mở Prometheus <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Swagger OpenAPI 3.0</p>
                <p className="text-[11px] text-slate-400">Tài liệu tương tác REST API</p>
              </div>
              <a
                href="/api/docs/"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold flex items-center gap-1 hover:bg-emerald-500"
              >
                Tài liệu API <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Biện pháp Hardening & Security */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Chính Sách Hardening Đã Áp Dụng
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span><strong>Non-Root Container:</strong> Các container web backend & frontend chạy dưới quyền tài khoản giới hạn.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span><strong>Network Isolation:</strong> Phân chia 3 bridge networks độc lập, cô lập hoàn toàn database.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span><strong>Security Headers:</strong> Cấu hình Nginx tự động đính kèm HSTS, X-Frame-Options, X-Content-Type-Options nosniff.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span><strong>WSGI Production:</strong> Chạy Gunicorn 4 workers đa luồng gthread, loại bỏ hoàn toàn dev server.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span><strong>JWT Token Expiration:</strong> Xác thực Access Token & Refresh Token độc lập.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Settings, ShieldCheck, Server, Database, Activity, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-600" /> Cài Đặt & Quản Trị Hệ Thống
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Thông tin cấu hình hạ tầng Microservices, chính sách Hardening và đường link truy cập công cụ quản trị.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hạ tầng dịch vụ */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
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
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
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
              <span><strong>Network Isolation:</strong> Phân chia 3 bridge networks độc lập (frontend, backend, monitoring), cô lập hoàn toàn PostgreSQL.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span><strong>Security Headers:</strong> Cấu hình Nginx tự động đính kèm HSTS, X-Frame-Options, X-Content-Type-Options nosniff.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span><strong>HTTPS / SSL Tự Ký:</strong> Mã hóa đường truyền đạt chuẩn TLS 1.2 / 1.3 với thuật toán RSA 2048-bit.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span><strong>JWT Token Expiration:</strong> Cơ chế xác thực phân cấp Access Token (7 ngày) & Refresh Token (30 ngày).</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

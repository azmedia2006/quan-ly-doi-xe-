import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
 Settings, ShieldCheck, Server, ExternalLink, UserCheck, Bell, Database,
 Shield, Fuel, Wrench, Key, Send, Search, Download, Clock, CheckCircle2,
 XCircle, ToggleLeft, ToggleRight, Truck, CreditCard, ListChecks, FileText,
 Globe, Webhook, History, Filter, Eye, Plus, Pencil, Trash2, Award
} from 'lucide-react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { UserRole } from '../types';
import { useToast } from '../components/ui/Toast';

type TabKey = 'general' | 'rules' | 'masterdata' | 'rbac' | 'integrations' | 'audit';

// URL slug <-> TabKey mapping
const SLUG_TO_TAB: Record<string, TabKey> = {
  'tongquan': 'general',
  'tong-quan': 'general',
  'general': 'general',
  'dinhmuc': 'rules',
  'dinh-muc': 'rules',
  'rules': 'rules',
  'danhmuc': 'masterdata',
  'danh-muc': 'masterdata',
  'masterdata': 'masterdata',
  'phanquyen': 'rbac',
  'phan-quyen': 'rbac',
  'rbac': 'rbac',
  'tichhop': 'integrations',
  'tich-hop': 'integrations',
  'integrations': 'integrations',
  'nhatky': 'audit',
  'nhat-ky': 'audit',
  'audit': 'audit',
};

const TAB_TO_SLUG: Record<TabKey, string> = {
  general: 'tong-quan',
  rules: 'dinh-muc',
  masterdata: 'danh-muc',
  rbac: 'phan-quyen',
  integrations: 'tich-hop',
  audit: 'nhat-ky',
};

// ============== MOCK DATA ==============
const MOCK_AUDIT_LOGS = [
 { id: 1, ts: '2026-10-24 07:12:41', user: 'admin', role: 'Admin', action: 'Đăng nhập hệ thống', detail: 'Phiên JWT mới khởi tạo', ip: '180.93.114.74' },
 { id: 2, ts: '2026-10-24 06:58:10', user: 'dieuhanh', role: 'Dispatcher', action: 'Tạo lệnh điều xe', detail: 'Mã DISPATCH-2026-015, Xe 30H-88821 → Hải Phòng', ip: '113.22.45.12' },
 { id: 3, ts: '2026-10-24 06:45:33', user: 'ketoan', role: 'Accountant', action: 'Duyệt chi phí xăng dầu', detail: 'HD-PETRO-99881, 2.150.000₫, 65L Diesel', ip: '42.116.8.90' },
 { id: 4, ts: '2026-10-23 22:10:05', user: 'taixe', role: 'Driver', action: 'Báo cáo chi phí BOT', detail: 'Vé VETC Pháp Vân – Cầu Giẽ, 120.000₫', ip: '14.225.3.77' },
 { id: 5, ts: '2026-10-23 18:30:22', user: 'kythuat', role: 'Mechanic', action: 'Tạo phiếu bảo dưỡng', detail: 'MAINT-2026-008, Xe 51D-333.22, thay nhớt + lọc gió', ip: '42.112.55.8' },
 { id: 6, ts: '2026-10-23 15:20:11', user: 'admin', role: 'Admin', action: 'Thêm phương tiện mới', detail: 'Biển số 29D-654.32, Hyundai Porter 150, Van', ip: '180.93.114.74' },
 { id: 7, ts: '2026-10-23 14:05:44', user: 'dieuhanh', role: 'Dispatcher', action: 'Hoàn tất chuyến đi', detail: 'TRIP-2026-003, trả xe + tài xế về trạng thái rảnh', ip: '113.22.45.12' },
 { id: 8, ts: '2026-10-23 10:15:30', user: 'ketoan', role: 'Accountant', action: 'Xóa bản ghi chi phí', detail: 'Xóa hóa đơn trùng lặp HD-TOLL-VETC-0091', ip: '42.116.8.90' },
 { id: 9, ts: '2026-10-22 20:00:00', user: 'admin', role: 'Admin', action: 'Cập nhật cấu hình hệ thống', detail: 'Thay đổi định mức nhiên liệu xe tải 5T: 15→14 L/100km', ip: '180.93.114.74' },
 { id: 10, ts: '2026-10-22 16:45:18', user: 'dieuhanh', role: 'Dispatcher', action: 'Gán tài xế cho chuyến', detail: 'Vũ Quốc Hưng → DISPATCH-2026-012, tuyến HN–HP', ip: '113.22.45.12' },
];

const VEHICLE_TYPE_CATALOG = [
 { code: 'TRUCK_1.5T', name: 'Xe tải 1.5 tấn', payload: 1.5, fuel: 9.5 },
 { code: 'TRUCK_5T', name: 'Xe tải 5 tấn', payload: 5.0, fuel: 14.0 },
 { code: 'TRUCK_10T', name: 'Xe tải 10 tấn', payload: 10.0, fuel: 22.0 },
 { code: 'CONTAINER_20FT', name: 'Xe đầu kéo Container 20ft', payload: 20.0, fuel: 28.0 },
 { code: 'PASSENGER_16', name: 'Xe khách 16 chỗ', payload: 0, fuel: 12.0 },
 { code: 'PASSENGER_45', name: 'Xe khách 45 chỗ', payload: 0, fuel: 25.0 },
 { code: 'CAR_5SEAT', name: 'Xe con 5 chỗ (Du lịch)', payload: 0, fuel: 7.5 },
 { code: 'VAN', name: 'Xe van giao hàng', payload: 0.95, fuel: 6.5 },
 { code: 'PICKUP', name: 'Xe bán tải (Pickup)', payload: 0.8, fuel: 9.0 },
];

const LICENSE_CATALOG = [
 { class: 'B1', desc: 'Xe con tự động ≤ 9 chỗ', vehicles: 'Xe số tự động đến 9 chỗ' },
 { class: 'B2', desc: 'Xe con ≤ 9 chỗ', vehicles: 'Xe con đến 9 chỗ, xe tải ≤ 3.5T' },
 { class: 'C', desc: 'Xe tải > 3.5 tấn', vehicles: 'Xe tải trên 3.5T, xe chuyên dụng' },
 { class: 'D', desc: 'Xe khách 10–30 chỗ', vehicles: 'Xe khách từ 10 đến 30 chỗ ngồi' },
 { class: 'E', desc: 'Xe khách > 30 chỗ', vehicles: 'Xe khách lớn trên 30 chỗ ngồi' },
 { class: 'FC', desc: 'Xe đầu kéo container', vehicles: 'Đầu kéo sơ-mi rơ-moóc, container' },
];

const EXPENSE_CATALOG = [
 { code: 'FUEL', name: 'Xăng / Dầu diesel', icon: '' },
 { code: 'TOLL', name: 'Phí cầu đường BOT / VETC', icon: '️' },
 { code: 'REPAIR', name: 'Sửa chữa / Phụ tùng', icon: '' },
 { code: 'FINE', name: 'Vé phạt vi phạm giao thông', icon: '' },
 { code: 'PARKING', name: 'Phí bến bãi đỗ xe', icon: '️' },
 { code: 'CARWASH', name: 'Rửa xe / Vệ sinh phương tiện', icon: '' },
 { code: 'OTHER', name: 'Chi phí phát sinh khác', icon: '' },
];

const MAINTENANCE_CATALOG = [
 { code: 'OIL_CHANGE', name: 'Thay dầu nhớt động cơ', interval: '5.000 km / 3 tháng' },
 { code: 'AIR_FILTER', name: 'Thay lọc gió', interval: '10.000 km / 6 tháng' },
 { code: 'OIL_FILTER', name: 'Thay lọc dầu', interval: '5.000 km' },
 { code: 'TIRE_ROTATE', name: 'Đảo lốp / Cân bằng động', interval: '10.000 km' },
 { code: 'BRAKE_PAD', name: 'Thay má phanh', interval: '30.000 km' },
 { code: 'BATTERY', name: 'Kiểm tra / Thay bình ắc quy', interval: '12 tháng' },
 { code: 'COOLANT', name: 'Thay nước làm mát', interval: '20.000 km / 12 tháng' },
 { code: 'BELT', name: 'Thay dây curoa', interval: '40.000 km' },
 { code: 'INSPECTION', name: 'Kiểm định an toàn kỹ thuật (Đăng kiểm)', interval: 'Theo hạn đăng kiểm' },
];

const RBAC_MATRIX = [
 { module: 'Quản lý Xe (Vehicles)', admin: 'CRUD', dispatcher: 'CR', accountant: 'R', driver: 'R', mechanic: 'CR' },
 { module: 'Hồ sơ Tài xế (Drivers)', admin: 'CRUD', dispatcher: 'CR', accountant: 'R', driver: 'R(self)', mechanic: '—' },
 { module: 'Lập lệnh Điều xe', admin: 'CRUD', dispatcher: 'CRUD', accountant: 'R', driver: 'R(self)', mechanic: '—' },
 { module: 'Chi phí & Xăng dầu', admin: 'CRUD', dispatcher: 'R', accountant: 'CRUD+Duyệt', driver: 'CR(self)', mechanic: '—' },
 { module: 'Bảo dưỡng & Sửa chữa', admin: 'CRUD', dispatcher: 'R', accountant: 'R+Duyệt CP', driver: '—', mechanic: 'CRUD' },
 { module: 'Sự cố & Bảo hiểm', admin: 'CRUD', dispatcher: 'CR', accountant: 'R+Duyệt BT', driver: 'CR(self)', mechanic: 'R' },
 { module: 'Báo cáo Thống kê', admin: 'R+Xuất', dispatcher: 'R+Xuất', accountant: 'R+Xuất', driver: '—', mechanic: '—' },
 { module: 'Cài đặt Hệ thống', admin: 'CRUD', dispatcher: '—', accountant: '—', driver: '—', mechanic: '—' },
 { module: 'Nhật ký Audit Log', admin: 'R+Xuất', dispatcher: '—', accountant: '—', driver: '—', mechanic: '—' },
];

// ============== COMPONENT ==============
export const SettingsPage: React.FC = () => {
 const { user, switchRole } = useAuth();
 const { success } = useToast();
 const { tab: tabParam } = useParams<{ tab?: string }>();
 const navigate = useNavigate();

 // Resolve initial tab from URL param (supports tongquan, tong-quan, general, dinhmuc, etc.)
 const resolvedTab = (tabParam && SLUG_TO_TAB[tabParam.toLowerCase()]) ? SLUG_TO_TAB[tabParam.toLowerCase()] : 'general';
 const [activeTab, setActiveTab] = useState<TabKey>(resolvedTab);

 // Sync state if URL changes (e.g. back/forward buttons or direct navigation)
 useEffect(() => {
   if (tabParam && SLUG_TO_TAB[tabParam.toLowerCase()]) {
     const target = SLUG_TO_TAB[tabParam.toLowerCase()];
     if (target !== activeTab) {
       setActiveTab(target);
     }
   } else if (!tabParam && activeTab !== 'general') {
     setActiveTab('general');
   }
 }, [tabParam]);

 const handleTabChange = (key: TabKey) => {
   setActiveTab(key);
   navigate('/settings/' + TAB_TO_SLUG[key], { replace: true });
 };

 // Real Audit log states
 const [auditLogs, setAuditLogs] = useState<any[]>([]);
 const [auditSearch, setAuditSearch] = useState('');
 const [auditRoleFilter, setAuditRoleFilter] = useState('');

 const fetchAuditLogs = async () => {
 try {
 const res = await api.get('/core/audit-logs/');
 setAuditLogs(res.data.results || res.data || []);
 } catch (e) {
 console.error('Failed to load audit logs', e);
 }
 };

 useEffect(() => {
 fetchAuditLogs();
 const interval = setInterval(fetchAuditLogs, 4000);
 return () => clearInterval(interval);
 }, []);

 // Config states (mock)
 const [alertRegDays, setAlertRegDays] = useState(30);
 const [alertInsuranceDays, setAlertInsuranceDays] = useState(30);
 const [alertLicenseDays, setAlertLicenseDays] = useState(15);
 const [maintenanceOdo, setMaintenanceOdo] = useState(5000);
 const [maintenanceMonths, setMaintenanceMonths] = useState(3);
 const [blockExpired, setBlockExpired] = useState(true);
 const [autoAlert, setAutoAlert] = useState(true);

 // Integration states
 const [mapsApiKey, setMapsApiKey] = useState('');
 const [telegramBotToken, setTelegramBotToken] = useState('');
 const [telegramChatId, setTelegramChatId] = useState('');
 const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
 const [smtpPort, setSmtpPort] = useState(587);
 const [smtpUser, setSmtpUser] = useState('fleet.system@company.vn');
 const [smtpPassword, setSmtpPassword] = useState('');
 const [smtpSenderName, setSmtpSenderName] = useState('FleetManage Pro System');
 const [smtpEncryption, setSmtpEncryption] = useState<'TLS' | 'SSL' | 'NONE'>('TLS');
 const [smtpEmail, setSmtpEmail] = useState('fleet.notifications@company.vn');
 const [testReceiverEmail, setTestReceiverEmail] = useState('admin@company.vn');

 const handleRoleSwitch = async (targetRole: UserRole) => {
    if (user?.role !== 'ADMIN') {
      return;
    }
    try {
      await switchRole(targetRole);
      success(`Đã chuyển đổi môi trường sang: ${DEMO_CREDENTIALS[targetRole]?.label || targetRole}`);
    } catch (err: any) {
      console.error(err);
    }
  };

 const filteredAuditLogs = auditLogs.filter(log => {
 const matchSearch = !auditSearch || log.action.toLowerCase().includes(auditSearch.toLowerCase()) || log.detail.toLowerCase().includes(auditSearch.toLowerCase()) || log.user.includes(auditSearch);
 const matchRole = !auditRoleFilter || log.role === auditRoleFilter;
 return matchSearch && matchRole;
 });

 const handleExportAudit = () => {
 const rows = [
 ['Thời gian', 'Người thực hiện', 'Vai trò', 'Hành động', 'Chi tiết', 'Địa chỉ IP'],
 ...filteredAuditLogs.map(l => [l.ts, l.user, l.role, l.action, l.detail, l.ip])
 ];
 const csv = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(r => r.join(',')).join('\n');
 const link = document.createElement('a');
 link.setAttribute('href', encodeURI(csv));
 link.setAttribute('download', `Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 success('Đã xuất nhật ký hoạt động ra file CSV!');
 };

 const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
 { key: 'general', label: 'Tổng quan', icon: <Server className="w-4 h-4" /> },
 { key: 'rules', label: 'Định mức & Cảnh báo', icon: <Bell className="w-4 h-4" /> },
 { key: 'masterdata', label: 'Danh mục dữ liệu', icon: <Database className="w-4 h-4" /> },
 { key: 'rbac', label: 'Phân quyền RBAC', icon: <Shield className="w-4 h-4" /> },
 { key: 'integrations', label: 'Tích hợp API', icon: <Globe className="w-4 h-4" /> },
 { key: 'audit', label: 'Nhật ký hệ thống', icon: <History className="w-4 h-4" /> },
 ];

 const cardCls = "p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4";
 const inputCls = "w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none";
 const labelCls = "text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1";

 return (
 <div className="space-y-4 sm:space-y-6">
 {/* Page Header */}
 <div>
 <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
 <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" /> Cài Đặt & Giám Sát (Settings & Monitoring)
 </h1>
 <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
 Quản trị hạ tầng, cấu hình định mức vận hành, danh mục dùng chung, phân quyền và nhật ký hoạt động.
 </p>
 </div>

 {/* Tab Navigation */}
 <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
 {tabs.map(t => (
 <button
 key={t.key}
 onClick={() => handleTabChange(t.key)}
 className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all shrink-0 ${
 activeTab === t.key
 ? 'bg-blue-600 text-white shadow-md'
 : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
 }`}
 >
 {t.icon} {t.label}
 </button>
 ))}
 </div>

 {/* ========== TAB: TỔNG QUAN (GIỮ NGUYÊN NỘI DUNG CŨ) ========== */}
 {activeTab === 'general' && (
 <div className="space-y-4 sm:space-y-6">
 {/* RBAC Simulation - CHỈ ADMIN MỚI CÓ QUYỀN CHUYỂN ĐỔI MÔI TRƯỜNG */}
        {user?.role === 'ADMIN' ? (
          <div className={cardCls}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-500" /> Chuyển Đổi Môi Trường Vai Trò (RBAC Simulation)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Dành riêng cho Quản trị viên (Admin) kiểm thử và mô phỏng giao diện quyền hạn.</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 shrink-0">Hiện tại: {user?.role_display}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
              {(['ADMIN', 'DISPATCHER', 'DRIVER', 'MECHANIC', 'ACCOUNTANT'] as UserRole[]).map(r => {
                const isCurrent = user?.role === r;
                const cred = DEMO_CREDENTIALS[r];
                return (
                  <button key={r} onClick={() => handleRoleSwitch(r)} className={`p-3 rounded-2xl text-left border transition-all ${isCurrent ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/30' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
                    <p className="text-xs font-bold truncate">{r === 'ADMIN' ? 'Admin' : r === 'DISPATCHER' ? 'Điều Hành' : r === 'DRIVER' ? 'Tài Xế' : r === 'MECHANIC' ? 'Kỹ Thuật' : 'Kế Toán'}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono truncate">@{cred?.u}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Bạn đang đăng nhập với vai trò <strong>{user?.role_display}</strong>. Chức năng mô phỏng chuyển đổi vai trò chỉ dành riêng cho tài khoản <strong>Quản trị viên (Admin)</strong>.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Hạ tầng dịch vụ (GIỮ NGUYÊN) */}
 <div className={cardCls}>
 <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Server className="w-4 h-4 text-blue-500" /> Cổng Truy Cập Dịch Vụ Quản Trị</h3>
 <div className="space-y-3 text-xs">
 {[
 { name: 'pgAdmin 4 (PostgreSQL GUI)', sub: 'Tài khoản: admin@fleet.com', href: '/pgadmin/', color: 'bg-blue-600 hover:bg-blue-500', label: 'Mở pgAdmin' },
 { name: 'Grafana Monitoring & Logs', sub: 'Dashboard Metrics & LogQL Loki', href: `${window.location.protocol}//${window.location.hostname}:3001`, color: 'bg-purple-600 hover:bg-purple-500', label: 'Mở Grafana' },
 { name: 'Prometheus Web UI', sub: 'Thu thập chỉ số container, app & database', href: '/prometheus/', color: 'bg-slate-800 hover:bg-slate-700', label: 'Mở Prometheus' },
 { name: 'Swagger OpenAPI 3.0', sub: 'Tài liệu tương tác REST API', href: '/api/docs/', color: 'bg-emerald-600 hover:bg-emerald-500', label: 'Tài liệu API' },
 ].map((svc, i) => (
 <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
 <div><p className="font-bold text-slate-800 dark:text-slate-200">{svc.name}</p><p className="text-[11px] text-slate-400">{svc.sub}</p></div>
 <a href={svc.href} target="_blank" rel="noreferrer" className={`px-3 py-1.5 rounded-xl text-white font-semibold flex items-center gap-1 shrink-0 ${svc.color}`}>{svc.label} <ExternalLink className="w-3.5 h-3.5" /></a>
 </div>
 ))}
 </div>
 </div>

 {/* Hardening (GIỮ NGUYÊN) */}
 <div className={cardCls}>
 <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Chính Sách Hardening Đã Áp Dụng</h3>
 <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
 {['Non-Root Container: Các container chạy dưới quyền tài khoản giới hạn.', 'Network Isolation: 3 bridge networks độc lập, cô lập database.', 'Security Headers: Nginx đính kèm HSTS, X-Frame-Options, nosniff.', 'WSGI Production: Gunicorn 4 workers đa luồng gthread.', 'JWT Token Expiration: Access Token & Refresh Token độc lập.'].map((item, i) => (
 <li key={i} className="flex items-start gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" /><span><strong>{item.split(':')[0]}:</strong>{item.split(':').slice(1).join(':')}</span></li>
 ))}
 </ul>
 </div>
 </div>
 </div>
 )}

 {/* ========== TAB: ĐỊNH MỨC & CẢNH BÁO ========== */}
 {activeTab === 'rules' && (
 <div className="space-y-4 sm:space-y-6">
 <div className={cardCls}>
 <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Bell className="w-4 h-4 text-amber-500" /> Cấu Hình Cảnh Báo Hết Hạn Giấy Tờ</h3>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
 <div><label className={labelCls}>Hạn đăng kiểm (ngày trước)</label><input type="number" value={alertRegDays} onChange={e => setAlertRegDays(+e.target.value)} className={inputCls} /></div>
 <div><label className={labelCls}>Hạn bảo hiểm (ngày trước)</label><input type="number" value={alertInsuranceDays} onChange={e => setAlertInsuranceDays(+e.target.value)} className={inputCls} /></div>
 <div><label className={labelCls}>Hạn GPLX tài xế (ngày trước)</label><input type="number" value={alertLicenseDays} onChange={e => setAlertLicenseDays(+e.target.value)} className={inputCls} /></div>
 </div>
 </div>

 <div className={cardCls}>
 <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Wrench className="w-4 h-4 text-purple-500" /> Chu Kỳ Bảo Dưỡng Định Kỳ</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
 <div><label className={labelCls}>Nhắc bảo dưỡng mỗi (km)</label>
 <select value={maintenanceOdo} onChange={e => setMaintenanceOdo(+e.target.value)} className={inputCls}>
 <option value={5000}>Mỗi 5.000 km</option><option value={10000}>Mỗi 10.000 km</option><option value={15000}>Mỗi 15.000 km</option><option value={20000}>Mỗi 20.000 km</option>
 </select>
 </div>
 <div><label className={labelCls}>Hoặc nhắc bảo dưỡng mỗi (tháng)</label>
 <select value={maintenanceMonths} onChange={e => setMaintenanceMonths(+e.target.value)} className={inputCls}>
 <option value={3}>Mỗi 3 tháng</option><option value={6}>Mỗi 6 tháng</option><option value={12}>Mỗi 12 tháng</option>
 </select>
 </div>
 </div>
 </div>

 <div className={cardCls}>
 <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Fuel className="w-4 h-4 text-amber-500" /> Định Mức Nhiên Liệu Theo Loại Xe</h3>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-left">
 <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
 <tr><th className="py-2 px-3">Loại xe</th><th className="py-2 px-3">Tải trọng</th><th className="py-2 px-3">Định mức (L/100km)</th></tr>
 </thead>
 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
 {VEHICLE_TYPE_CATALOG.map(v => (
 <tr key={v.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
 <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{v.name}</td>
 <td className="py-2.5 px-3 text-slate-500">{v.payload > 0 ? `${v.payload}T` : '—'}</td>
 <td className="py-2.5 px-3 font-bold text-amber-600">{v.fuel} L/100km</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 <div className={cardCls}>
 <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-rose-500" /> Chính Sách Ràng Buộc An Toàn</h3>
 <div className="space-y-3">
 <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
 <div><p className="text-xs font-bold text-slate-800 dark:text-slate-200">Tự động gửi cảnh báo khi giấy tờ sắp hết hạn</p><p className="text-[11px] text-slate-400">Gửi thông báo tới Dashboard và Trung tâm Thông báo</p></div>
 <button onClick={() => { setAutoAlert(!autoAlert); success(`Đã ${!autoAlert ? 'bật' : 'tắt'} cảnh báo tự động`); }} className="shrink-0">{autoAlert ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}</button>
 </div>
 <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
 <div><p className="text-xs font-bold text-slate-800 dark:text-slate-200">Chặn gán chuyến nếu xe / tài xế quá hạn giấy tờ</p><p className="text-[11px] text-slate-400">Ngăn điều phối viên tạo lệnh điều xe vi phạm quy định</p></div>
 <button onClick={() => { setBlockExpired(!blockExpired); success(`Đã ${!blockExpired ? 'bật' : 'tắt'} chặn gán chuyến quá hạn`); }} className="shrink-0">{blockExpired ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}</button>
 </div>
 </div>
 </div>

 <div className="flex justify-end"><button onClick={() => success('Đã lưu cấu hình định mức & cảnh báo!')} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">Lưu Cấu Hình</button></div>
 </div>
 )}

 {/* ========== TAB: DANH MỤC DỮ LIỆU ========== */}
 {activeTab === 'masterdata' && (
 <div className="space-y-4 sm:space-y-6">
 <div className={cardCls}>
 <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Truck className="w-4 h-4 text-blue-500" /> Danh Mục Loại Xe & Tải Trọng</h3>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-left">
 <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
 <tr><th className="py-2 px-3">Mã</th><th className="py-2 px-3">Tên loại xe</th><th className="py-2 px-3">Tải trọng</th><th className="py-2 px-3">Định mức NL</th></tr>
 </thead>
 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
 {VEHICLE_TYPE_CATALOG.map(v => (
 <tr key={v.code}><td className="py-2.5 px-3 font-mono text-slate-400">{v.code}</td><td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{v.name}</td><td className="py-2.5 px-3">{v.payload > 0 ? `${v.payload}T` : '—'}</td><td className="py-2.5 px-3 font-bold text-amber-600">{v.fuel} L</td></tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
 <div className={cardCls}>
 <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Award className="w-4 h-4 text-emerald-500" /> Danh Mục Hạng Bằng Lái Xe (GPLX)</h3>
 <div className="space-y-2 pt-1">
 {LICENSE_CATALOG.map(l => (
 <div key={l.class} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
 <div><span className="inline-block px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold mr-2">Hạng {l.class}</span><span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{l.desc}</span><p className="text-[11px] text-slate-400 mt-0.5">{l.vehicles}</p></div>
 </div>
 ))}
 </div>
 </div>

 <div className={cardCls}>
 <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><CreditCard className="w-4 h-4 text-amber-500" /> Danh Mục Loại Chi Phí Chuyến Đi</h3>
 <div className="space-y-2 pt-1">
 {EXPENSE_CATALOG.map(e => (
 <div key={e.code} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex items-center gap-3">
 <span className="text-lg">{e.icon}</span>
 <div><p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{e.name}</p><p className="text-[10px] text-slate-400 font-mono">{e.code}</p></div>
 </div>
 ))}
 </div>
 </div>
 </div>

 <div className={cardCls}>
 <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><ListChecks className="w-4 h-4 text-purple-500" /> Danh Mục Hạng Mục Bảo Dưỡng Định Kỳ</h3>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-left">
 <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
 <tr><th className="py-2 px-3">Mã</th><th className="py-2 px-3">Hạng mục</th><th className="py-2 px-3">Chu kỳ khuyến nghị</th></tr>
 </thead>
 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
 {MAINTENANCE_CATALOG.map(m => (
 <tr key={m.code}><td className="py-2.5 px-3 font-mono text-slate-400">{m.code}</td><td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{m.name}</td><td className="py-2.5 px-3 text-purple-600 dark:text-purple-400 font-bold">{m.interval}</td></tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* ========== TAB: PHÂN QUYỀN RBAC ========== */}
 {activeTab === 'rbac' && (
 <div className={cardCls}>
 <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Shield className="w-4 h-4 text-blue-500" /> Ma Trận Phân Quyền Hệ Thống (Permissions Matrix)</h3>
 <p className="text-[11px] text-slate-500">C = Tạo mới, R = Xem, U = Chỉnh sửa, D = Xóa. Hàng đặc biệt: Duyệt = Phê duyệt chi phí/chuyến đi.</p>
 <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
 <table className="w-full text-xs text-left min-w-[640px]">
 <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
 <tr>
 <th className="py-2.5 px-3">Module nghiệp vụ</th>
 <th className="py-2.5 px-3 text-center"> Admin</th>
 <th className="py-2.5 px-3 text-center"> Dispatcher</th>
 <th className="py-2.5 px-3 text-center"> Accountant</th>
 <th className="py-2.5 px-3 text-center">‍️ Driver</th>
 <th className="py-2.5 px-3 text-center"> Mechanic</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
 {RBAC_MATRIX.map((row, i) => (
 <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
 <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{row.module}</td>
 {[row.admin, row.dispatcher, row.accountant, row.driver, row.mechanic].map((perm, j) => (
 <td key={j} className="py-2.5 px-3 text-center">
 <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${perm === 'CRUD' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : perm === '—' ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'}`}>
 {perm}
 </span>
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* ========== TAB: TÍCH HỢP API ========== */}
 {activeTab === 'integrations' && (
 <div className="space-y-4 sm:space-y-6">


 <div className={cardCls}>
 <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Send className="w-4 h-4 text-blue-500" /> Webhook Thông Báo Tự Động (Telegram)</h3>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
 <div><label className={labelCls}>Bot Token</label><input type="password" value={telegramBotToken} onChange={e => setTelegramBotToken(e.target.value)} placeholder="123456:ABC-DEF..." className={inputCls} /></div>
 <div><label className={labelCls}>Chat ID</label><input value={telegramChatId} onChange={e => setTelegramChatId(e.target.value)} placeholder="-10012345678" className={inputCls} /></div>
 <div className="flex items-end"><button onClick={() => success('Gửi tin nhắn test Telegram thành công!')} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap"><Send className="w-3.5 h-3.5" /> Test gửi Telegram</button></div>
 </div>
 </div>

 <div className={cardCls}>
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
 <Webhook className="w-4 h-4 text-purple-500" /> Cấu Hình Email SMTP (Gửi Thông Báo / Cảnh Báo Tự Động)
 </h3>
 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
 Giao thức SMTP
 </span>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
 <div>
 <label className={labelCls}>Máy chủ SMTP (Host) *</label>
 <input value={smtpHost} onChange={e => setSmtpHost(e.target.value)} placeholder="VD: smtp.gmail.com" className={inputCls} />
 </div>

 <div>
 <label className={labelCls}>Cổng kết nối (Port) *</label>
 <input type="number" value={smtpPort} onChange={e => setSmtpPort(+e.target.value)} placeholder="587 hoặc 465" className={inputCls} />
 </div>

 <div>
 <label className={labelCls}>Phương thức mã hóa</label>
 <select value={smtpEncryption} onChange={e => setSmtpEncryption(e.target.value as any)} className={inputCls}>
 <option value="TLS">STARTTLS (Khuyên dùng - Port 587)</option>
 <option value="SSL">SSL / TLS (Port 465)</option>
 <option value="NONE">Không mã hóa (Port 25)</option>
 </select>
 </div>

 <div>
 <label className={labelCls}>Tên tài khoản đăng nhập (Username) *</label>
 <input value={smtpUser} onChange={e => setSmtpUser(e.target.value)} placeholder="VD: notifications@company.vn" className={inputCls} />
 </div>

 <div>
 <label className={labelCls}>Mật khẩu ứng dụng (App Password) *</label>
 <input type="password" value={smtpPassword} onChange={e => setSmtpPassword(e.target.value)} placeholder="••••••••••••••••" className={inputCls} />
 </div>

 <div>
 <label className={labelCls}>Tên hiển thị người gửi (Sender Name)</label>
 <input value={smtpSenderName} onChange={e => setSmtpSenderName(e.target.value)} placeholder="VD: Hệ Thống Quản Lý Đội Xe" className={inputCls} />
 </div>

 <div>
 <label className={labelCls}>Địa chỉ Email gửi đi (From Email) *</label>
 <input type="email" value={smtpEmail} onChange={e => setSmtpEmail(e.target.value)} placeholder="fleet.system@company.vn" className={inputCls} />
 </div>

 <div>
 <label className={labelCls}>Email nhận thử nghiệm (Test Receiver)</label>
 <input type="email" value={testReceiverEmail} onChange={e => setTestReceiverEmail(e.target.value)} placeholder="admin@company.vn" className={inputCls} />
 </div>

 <div className="flex items-end gap-2">
 <button
 onClick={() => success('Đã gửi email test tới: ' + (testReceiverEmail || 'admin@company.vn'))}
 className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap"
 >
 <Send className="w-3.5 h-3.5" /> Gửi Thử Email
 </button>
 <button
 onClick={() => success('Đã lưu cấu hình SMTP thành công!')}
 className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold whitespace-nowrap"
 >
 Lưu Cấu Hình
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* ========== TAB: NHẬT KÝ HỆ THỐNG (AUDIT LOG) ========== */}
 {activeTab === 'audit' && (
 <div className={cardCls}>
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
 <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><History className="w-4 h-4 text-blue-500" /> Nhật Ký Hoạt Động Hệ Thống (Audit Logs)</h3>
 <button onClick={handleExportAudit} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold flex items-center gap-1.5 shrink-0"><Download className="w-3.5 h-3.5" /> Xuất CSV</button>
 </div>

 {/* Filters */}
 <div className="flex flex-col sm:flex-row gap-2 pt-1">
 <div className="relative flex-1">
 <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
 <input value={auditSearch} onChange={e => setAuditSearch(e.target.value)} placeholder="Tìm theo hành động, chi tiết, user..." className={`${inputCls} pl-8`} />
 </div>
 <select value={auditRoleFilter} onChange={e => setAuditRoleFilter(e.target.value)} className={`${inputCls} sm:w-44`}>
 <option value="">Tất cả vai trò</option>
 <option value="Admin">Admin</option><option value="Dispatcher">Dispatcher</option><option value="Accountant">Accountant</option><option value="Driver">Driver</option><option value="Mechanic">Mechanic</option>
 </select>
 </div>

 {/* Mobile card view */}
 <div className="block md:hidden space-y-2.5">
 {filteredAuditLogs.map(log => (
 <div key={log.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1.5 text-xs">
 <div className="flex items-center justify-between">
 <span className="font-bold text-slate-900 dark:text-slate-100">{log.action}</span>
 <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">{log.role}</span>
 </div>
 <p className="text-[11px] text-slate-500 dark:text-slate-400">{log.detail}</p>
 <div className="flex justify-between text-[10px] text-slate-400">
 <span>@{log.user} • {log.ip}</span>
 <span>{log.ts}</span>
 </div>
 </div>
 ))}
 </div>

 {/* Desktop table */}
 <div className="hidden md:block overflow-x-auto">
 <table className="w-full text-xs text-left">
 <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
 <tr><th className="py-2 px-3">Thời gian</th><th className="py-2 px-3">User</th><th className="py-2 px-3">Vai trò</th><th className="py-2 px-3">Hành động</th><th className="py-2 px-3">Chi tiết thay đổi</th><th className="py-2 px-3">IP</th></tr>
 </thead>
 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
 {filteredAuditLogs.map(log => (
 <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
 <td className="py-2.5 px-3 text-slate-500 font-mono whitespace-nowrap">{log.ts}</td>
 <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">@{log.user}</td>
 <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">{log.role}</span></td>
 <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{log.action}</td>
 <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">{log.detail}</td>
 <td className="py-2.5 px-3 font-mono text-slate-400">{log.ip}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </div>
 );
};

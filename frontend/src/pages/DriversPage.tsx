// UPDATE: Bổ sung Quick Stats, Filter Chips, Xe phụ trách, Cảnh báo hạn bằng, Nút Edit/TripHistory, Logic xóa an toàn
import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Trash2, Calendar, ShieldCheck, AlertTriangle, Pencil, History, Phone, Truck, CheckCircle, Coffee, CircleDot, User } from 'lucide-react';
import api from '../services/api';
import { Driver } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';

// NEW: Filter type
type StatusFilter = 'ALL' | 'AVAILABLE' | 'ON_TRIP' | 'ON_LEAVE' | 'LICENSE_EXPIRING';

export const DriversPage: React.FC = () => {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL'); // NEW
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null); // NEW: Editing state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // NEW: Trip history modal
  const [historyDriver, setHistoryDriver] = useState<Driver | null>(null); // NEW

  // // UPDATE: Thông tin cá nhân, hạng GPLX, ngày cấp / hết hạn bằng, 3 trạng thái
  const [form, setForm] = useState({
    driver_code: '',
    full_name: '',
    phone: '',
    identity_card: '',
    date_of_birth: '1992-05-15',
    address: 'Hà Nội',
    license_number: '',
    license_class: 'C',
    license_issued_date: '2021-05-10',
    license_expiry: '2026-05-10',
    experience_years: 3,
    status: 'AVAILABLE',
  });
  const { success, error } = useToast();

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/drivers/');
      setDrivers(res.data.results || res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // NEW: Reset form helper
  const resetForm = () => {
    setForm({
      driver_code: '', full_name: '', phone: '', identity_card: '',
      date_of_birth: '1992-05-15', address: 'Hà Nội', license_number: '',
      license_class: 'C', license_issued_date: '2021-05-10', license_expiry: '2026-05-10',
      experience_years: 3, status: 'AVAILABLE',
    });
  };

  // NEW: Open create modal
  const handleOpenCreate = () => {
    setEditingDriver(null);
    resetForm();
    setIsModalOpen(true);
  };

  // NEW: Open edit modal
  const handleEdit = (d: Driver) => {
    setEditingDriver(d);
    setForm({
      driver_code: d.driver_code,
      full_name: d.full_name,
      phone: d.phone,
      identity_card: d.identity_card,
      date_of_birth: d.date_of_birth || '1992-01-01',
      address: d.address || '',
      license_number: d.license_number,
      license_class: d.license_class,
      license_issued_date: d.license_issued_date || '',
      license_expiry: d.license_expiry || '',
      experience_years: d.experience_years,
      status: d.status,
    });
    setIsModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/drivers/', {
        ...form,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.driver_code || 'driver'}`,
      });
      success('Thêm tài xế thành công!');
      setIsModalOpen(false);
      resetForm();
      fetchDrivers();
    } catch (err: any) {
      error('Lỗi khi thêm tài xế', 'Vui lòng kiểm tra trùng mã hoặc số GPLX');
    }
  };

  // NEW: Handle update existing driver
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;
    try {
      await api.put(`/drivers/${editingDriver.id}/`, {
        ...form,
        avatar_url: editingDriver.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.driver_code}`,
      });
      success('Cập nhật tài xế thành công!');
      setIsModalOpen(false);
      setEditingDriver(null);
      fetchDrivers();
    } catch (err: any) {
      error('Lỗi khi cập nhật', err.response?.data?.driver_code?.[0] || 'Vui lòng kiểm tra dữ liệu');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa hồ sơ tài xế này?')) return;
    try {
      await api.delete(`/drivers/${id}/`);
      success('Đã xóa hồ sơ tài xế');
      fetchDrivers();
    } catch (e) {
      error('Lỗi xóa tài xế');
    }
  };

  const canEdit = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' || user?.role === 'DISPATCHER';

  // NEW: Helper kiểm tra hạn bằng lái
  const getDaysUntilExpiry = (dateStr?: string) => {
    if (!dateStr) return 999;
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  // NEW: Stats calculations
  const totalDrivers = drivers.length;
  const availableCount = drivers.filter(d => d.status === 'AVAILABLE').length;
  const onTripCount = drivers.filter(d => d.status === 'ON_TRIP').length;
  const onLeaveCount = drivers.filter(d => d.status === 'ON_LEAVE').length;
  const expiringCount = drivers.filter(d => getDaysUntilExpiry(d.license_expiry) <= 30).length;

  // NEW: Combined filter + search
  const filtered = drivers.filter(d => {
    const matchSearch = d.full_name.toLowerCase().includes(search.toLowerCase()) ||
      d.driver_code.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search);
    if (!matchSearch) return false;
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'LICENSE_EXPIRING') return getDaysUntilExpiry(d.license_expiry) <= 30;
    return d.status === statusFilter;
  });

  // NEW: Filter chip definitions
  const filterChips: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'ALL', label: 'Tất cả', count: totalDrivers },
    { key: 'AVAILABLE', label: 'Đang rảnh', count: availableCount },
    { key: 'ON_TRIP', label: 'Đang lái', count: onTripCount },
    { key: 'ON_LEAVE', label: 'Nghỉ phép', count: onLeaveCount },
    { key: 'LICENSE_EXPIRING', label: '⚠️ Hết hạn bằng', count: expiringCount },
  ];

  // NEW: Stats cards config
  const statsCards = [
    { label: 'Tổng tài xế', value: totalDrivers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
    { label: 'Đang lái', value: onTripCount, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Sẵn sàng', value: availableCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { label: 'Nghỉ phép', value: onLeaveCount, icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Bằng hết hạn', value: expiringCount, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" /> Quản Lý Tài Xế (Drivers)
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Hồ sơ nhân thân, hạng giấy phép lái xe, ngày cấp &amp; hết hạn bằng, trạng thái (Đang rảnh / Đang lái / Nghỉ phép).
          </p>
        </div>
        {canEdit && (
          <Button onClick={handleOpenCreate} className="w-full sm:w-auto !flex-row !inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap">
            <Plus className="w-4 h-4" /> Thêm Tài Xế Mới
          </Button>
        )}
      </div>

      {/* NEW: Quick Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {statsCards.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3 border border-white/60 dark:border-slate-800`}>
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-white/70 dark:bg-slate-800/60 shrink-0`}>
              <s.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${s.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 leading-none">{s.value}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo họ tên, mã tài xế hoặc số điện thoại..."
          className="bg-transparent text-xs w-full focus:outline-none text-slate-900 dark:text-slate-100"
        />
      </div>

      {/* NEW: Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {filterChips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => setStatusFilter(chip.key)}
            className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all border shrink-0 ${
              statusFilter === chip.key
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 dark:shadow-indigo-900/40'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {chip.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
              statusFilter === chip.key
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>{chip.count}</span>
          </button>
        ))}
      </div>

      {/* Grid of Drivers Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filtered.map((d) => {
          // NEW: Tính toán hạn bằng lái
          const daysLeft = getDaysUntilExpiry(d.license_expiry);
          const isExpired = daysLeft <= 0;
          const isExpiring = daysLeft > 0 && daysLeft <= 30;
          const licenseWarning = isExpired || isExpiring;

          return (
          <div key={d.id} className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border shadow-xs flex flex-col justify-between ${
            licenseWarning ? 'border-rose-300 dark:border-rose-800' : 'border-slate-200 dark:border-slate-800'
          }`}>
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={d.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.driver_code}`}
                    alt={d.full_name}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{d.full_name}</h3>
                    <p className="text-[11px] font-mono text-blue-600 font-semibold">{d.driver_code}</p>
                  </div>
                </div>
                {/* // UPDATE: Badges - 3 trạng thái + cảnh báo bằng quá hạn */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    d.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                    d.status === 'ON_TRIP' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                    'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {d.status === 'AVAILABLE' ? 'Đang rảnh' : d.status === 'ON_TRIP' ? 'Đang lái' : 'Nghỉ phép'}
                  </span>
                  {/* NEW: Badge cảnh báo bằng quá hạn */}
                  {licenseWarning && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-0.5">
                      ⚠️ {isExpired ? 'Bằng quá hạn' : `Còn ${daysLeft} ngày`}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-xs border-t border-slate-100 dark:border-slate-800 pt-2.5">
                {/* NEW: Xe đang điều khiển */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1"><Truck className="w-3 h-3" /> Xe phụ trách:</span>
                  {d.status === 'ON_TRIP' && d.current_vehicle_plate ? (
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-[11px]">
                      {d.current_vehicle_plate}{d.current_vehicle_model ? ` - ${d.current_vehicle_model}` : ''}
                      {d.active_trip_code && <span className="text-slate-400 font-normal ml-1">({d.active_trip_code})</span>}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">Chưa phân công</span>
                  )}
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Hạng bằng lái:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{d.license_number} ({d.license_class})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngày cấp bằng:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{d.license_issued_date || '—'}</span>
                </div>
                {/* UPDATE: Cảnh báo hạn bằng lái */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Hạn bằng lái:</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    isExpired ? 'text-rose-600 dark:text-rose-400' :
                    isExpiring ? 'text-amber-600 dark:text-amber-400' :
                    'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {licenseWarning && <AlertTriangle className="w-3 h-3" />}
                    {d.license_expiry || '—'}
                  </span>
                </div>
                {/* UPDATE: Điện thoại gọi nhanh */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Điện thoại:</span>
                  <a href={`tel:${d.phone}`} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                    <Phone className="w-3 h-3" />{d.phone}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CCCD:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{d.identity_card}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kinh nghiệm:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{d.experience_years} năm</span>
                </div>
              </div>
            </div>

            {/* UPDATE: Action Buttons - Edit, Trip History, Delete with safety check */}
            {canEdit && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-1.5 w-full flex-wrap">
                <button
                  onClick={() => handleEdit(d)}
                  className="px-2.5 py-1.5 text-[11px] text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg flex items-center gap-1 font-semibold transition-colors"
                  title="Chỉnh sửa thông tin"
                >
                  <Pencil className="w-3.5 h-3.5" /> Sửa
                </button>
                <button
                  onClick={() => { setHistoryDriver(d); setIsHistoryOpen(true); }}
                  className="px-2.5 py-1.5 text-[11px] text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg flex items-center gap-1 font-semibold transition-colors"
                  title="Xem lịch sử chuyến đi"
                >
                  <History className="w-3.5 h-3.5" /> Lịch sử
                </button>
                {/* UPDATE: Logic an toàn - vô hiệu hóa nút xóa khi đang lái */}
                <button
                  onClick={() => d.status !== 'ON_TRIP' && handleDelete(d.id)}
                  disabled={d.status === 'ON_TRIP'}
                  className={`px-2.5 py-1.5 text-[11px] rounded-lg flex items-center gap-1 font-semibold transition-colors ${
                    d.status === 'ON_TRIP'
                      ? 'text-slate-400 cursor-not-allowed opacity-50'
                      : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                  }`}
                  title={d.status === 'ON_TRIP' ? 'Không thể xóa tài xế đang trong chuyến đi' : 'Xóa tài xế'}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa
                </button>
              </div>
            )}
          </div>
        );
        })}
      </div>

      {/* Khi danh sách rỗng */}
      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400 dark:text-slate-600">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Không tìm thấy tài xế nào phù hợp.</p>
        </div>
      )}

      {/* Modal Thêm / Chỉnh sửa Tài Xế */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingDriver(null); }} title={editingDriver ? 'Chỉnh Sửa Hồ Sơ Tài Xế' : 'Thêm Hồ Sơ Tài Xế Mới'}>
        <form onSubmit={editingDriver ? handleUpdate : handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Mã tài xế *"
              value={form.driver_code}
              onChange={(e) => setForm({ ...form, driver_code: e.target.value })}
              placeholder="VD: TX-009"
              required
              disabled={!!editingDriver}
            />
            <Input
              label="Họ và tên *"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="VD: Hoàng Văn Nam"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Số điện thoại *"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="VD: 0912345678"
              required
            />
            <Input
              label="Số CCCD/CMND *"
              value={form.identity_card}
              onChange={(e) => setForm({ ...form, identity_card: e.target.value })}
              placeholder="VD: 001099012345"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Ngày sinh"
              type="date"
              value={form.date_of_birth}
              onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
            />
            <Input
              label="Địa chỉ thường trú"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="VD: Long Biên, Hà Nội"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Số GPLX *"
              value={form.license_number}
              onChange={(e) => setForm({ ...form, license_number: e.target.value })}
              placeholder="VD: FC-8899112"
              required
            />
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Hạng bằng lái *</label>
              <select
                value={form.license_class}
                onChange={(e) => setForm({ ...form, license_class: e.target.value })}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <option value="B1">Hạng B1</option>
                <option value="B2">Hạng B2</option>
                <option value="C">Hạng C (Tải &gt; 3.5 tấn)</option>
                <option value="D">Hạng D (Chở người 10-30 chỗ)</option>
                <option value="E">Hạng E (Chở người &gt; 30 chỗ)</option>
                <option value="FC">Hạng FC (Đầu kéo / Container)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Ngày cấp bằng"
              type="date"
              value={form.license_issued_date}
              onChange={(e) => setForm({ ...form, license_issued_date: e.target.value })}
            />
            <Input
              label="Ngày hết hạn bằng *"
              type="date"
              value={form.license_expiry}
              onChange={(e) => setForm({ ...form, license_expiry: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Số năm kinh nghiệm</label>
              <input
                type="number"
                min={0}
                value={form.experience_years}
                onChange={(e) => setForm({ ...form, experience_years: parseInt(e.target.value) || 0 })}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Trạng thái tài xế</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <option value="AVAILABLE">Đang rảnh</option>
                <option value="ON_TRIP">Đang lái</option>
                <option value="ON_LEAVE">Nghỉ phép</option>
              </select>
            </div>
          </div>
          <div className="pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2 w-full">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => { setIsModalOpen(false); setEditingDriver(null); }}>Hủy</Button>
            <Button type="submit" className="w-full sm:w-auto">{editingDriver ? 'Cập Nhật' : 'Lưu Tài Xế'}</Button>
          </div>
        </form>
      </Modal>

      {/* NEW: Modal Lịch sử chuyến đi */}
      <Modal isOpen={isHistoryOpen} onClose={() => { setIsHistoryOpen(false); setHistoryDriver(null); }} title={`Lịch Sử Chuyến Đi — ${historyDriver?.full_name || ''}`}>
        <div className="space-y-3">
          {historyDriver && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <img
                src={historyDriver.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${historyDriver.driver_code}`}
                alt={historyDriver.full_name}
                className="w-10 h-10 rounded-xl"
              />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{historyDriver.full_name}</p>
                <p className="text-[11px] text-slate-500">{historyDriver.driver_code} • Bằng {historyDriver.license_class} • KN {historyDriver.experience_years} năm</p>
              </div>
            </div>
          )}
          {/* Mock trip history data */}
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-semibold">Các chuyến đi gần đây:</div>
          {[
            { code: 'DISPATCH-2026-001', route: 'Hà Nội → Đà Nẵng', date: '15/10/2026', status: 'Hoàn tất', km: 768 },
            { code: 'DISPATCH-2026-002', route: 'TP.HCM → Cần Thơ', date: '08/10/2026', status: 'Hoàn tất', km: 170 },
            { code: 'DISPATCH-2026-003', route: 'Hải Phòng → Hà Nội', date: '01/10/2026', status: 'Hoàn tất', km: 120 },
          ].map((trip, i) => (
            <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">{trip.code}</p>
                <p className="text-[11px] text-slate-500 truncate">{trip.route}</p>
                <p className="text-[10px] text-slate-400">{trip.date} • {trip.km} km</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 whitespace-nowrap shrink-0">
                {trip.status}
              </span>
            </div>
          ))}
          <div className="pt-2 flex justify-end">
            <Button variant="outline" className="text-xs" onClick={() => { setIsHistoryOpen(false); setHistoryDriver(null); }}>Đóng</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

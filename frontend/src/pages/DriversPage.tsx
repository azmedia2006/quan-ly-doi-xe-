import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Trash2, Calendar, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { Driver } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';

export const DriversPage: React.FC = () => {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/drivers/', {
        ...form,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.driver_code || 'driver'}`,
      });
      success('Thêm tài xế thành công!');
      setIsModalOpen(false);
      fetchDrivers();
    } catch (err: any) {
      error('Lỗi khi thêm tài xế', 'Vui lòng kiểm tra trùng mã hoặc số GPLX');
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

  const filtered = drivers.filter(d =>
    d.full_name.toLowerCase().includes(search.toLowerCase()) ||
    d.driver_code.toLowerCase().includes(search.toLowerCase()) ||
    d.phone.includes(search)
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" /> Quản Lý Tài Xế (Drivers)
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Hồ sơ nhân thân, hạng giấy phép lái xe, ngày cấp & hết hạn bằng, trạng thái (Đang rảnh / Đang lái / Nghỉ phép).
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto !flex-row !inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap">
            <Plus className="w-4 h-4" /> Thêm Tài Xế Mới
          </Button>
        )}
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

      {/* Grid of Drivers Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filtered.map((d) => (
          <div key={d.id} className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
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
                {/* // UPDATE: 3 trạng thái Đang rảnh / Đang lái / Nghỉ phép */}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  d.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                  d.status === 'ON_TRIP' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                  'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {d.status === 'AVAILABLE' ? 'Đang rảnh' : d.status === 'ON_TRIP' ? 'Đang lái' : 'Nghỉ phép'}
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs border-t border-slate-100 dark:border-slate-800 pt-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Hạng bằng lái:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{d.license_number} ({d.license_class})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngày cấp bằng:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{d.license_issued_date || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hạn bằng lái:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{d.license_expiry || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Điện thoại / CCCD:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{d.phone} • {d.identity_card}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kinh nghiệm:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{d.experience_years} năm</span>
                </div>
              </div>
            </div>

            {canEdit && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 w-full">
                <button
                  onClick={() => handleDelete(d.id)}
                  className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-1 font-semibold"
                  title="Xóa tài xế"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa tài xế
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Thêm Tài Xế */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Thêm Hồ Sơ Tài Xế Mới">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Mã tài xế *"
              value={form.driver_code}
              onChange={(e) => setForm({ ...form, driver_code: e.target.value })}
              placeholder="VD: TX-009"
              required
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
          <div className="pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2 w-full">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" className="w-full sm:w-auto">Lưu Tài Xế</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

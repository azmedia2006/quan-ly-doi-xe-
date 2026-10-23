import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Trash2, Award, Phone, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { Driver } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';

export const DriversPage: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    driver_code: '',
    full_name: '',
    phone: '',
    identity_card: '',
    license_number: '',
    license_class: 'C',
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

  const filtered = drivers.filter(d =>
    d.full_name.toLowerCase().includes(search.toLowerCase()) ||
    d.driver_code.toLowerCase().includes(search.toLowerCase()) ||
    d.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" /> Quản Lý Tài Xế (Drivers)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Lưu trữ hồ sơ tài xế, phân hạng giấy phép lái xe (B2, C, FC), thâm niên và trạng thái phân công.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Thêm Tài Xế Mới
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo họ tên, mã tài xế hoặc số điện thoại..."
          className="bg-transparent text-xs w-full focus:outline-none text-slate-900 dark:text-slate-100"
        />
      </div>

      {/* Grid of Drivers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((d) => (
          <div key={d.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={d.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.driver_code}`}
                    alt={d.full_name}
                    className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 object-cover"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{d.full_name}</h3>
                    <p className="text-[11px] font-mono text-blue-600 font-semibold">{d.driver_code}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  d.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                  d.status === 'ON_TRIP' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                  'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {d.status_display || d.status}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Số GPLX:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{d.license_number} ({d.license_class})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Điện thoại:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{d.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kinh nghiệm:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{d.experience_years} năm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Đánh giá chất lượng:</span>
                  <span className="font-bold text-amber-500">★ {d.rating} / 5.0</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => handleDelete(d.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Xóa tài xế"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Thêm Tài Xế */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Thêm Hồ Sơ Tài Xế">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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
          <div className="grid grid-cols-2 gap-3">
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
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Số GPLX *"
              value={form.license_number}
              onChange={(e) => setForm({ ...form, license_number: e.target.value })}
              placeholder="VD: FC-8899112"
              required
            />
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Hạng GPLX</label>
              <select
                value={form.license_class}
                onChange={(e) => setForm({ ...form, license_class: e.target.value })}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <option value="B2">Hạng B2 (&lt; 3.5 tấn)</option>
                <option value="C">Hạng C (&gt; 3.5 tấn)</option>
                <option value="D">Hạng D (10-30 chỗ)</option>
                <option value="E">Hạng E (&gt; 30 chỗ)</option>
                <option value="FC">Hạng FC (Đầu kéo / Container)</option>
              </select>
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit">Lưu Tài Xế</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Trash2 } from 'lucide-react';
import api from '../services/api';
import { Vehicle } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';

export const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    plate_number: '',
    model_name: '',
    brand: 'Hyundai',
    vehicle_type: 'TRUCK_MEDIUM',
    payload_capacity: 5.0,
    fuel_type: 'Diesel DO 0.05S',
    odometer: 0,
    status: 'AVAILABLE',
  });
  const { success, error } = useToast();

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles/');
      setVehicles(res.data.results || res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/vehicles/', form);
      success('Thêm phương tiện thành công!');
      setIsModalOpen(false);
      setForm({
        plate_number: '',
        model_name: '',
        brand: 'Hyundai',
        vehicle_type: 'TRUCK_MEDIUM',
        payload_capacity: 5.0,
        fuel_type: 'Diesel DO 0.05S',
        odometer: 0,
        status: 'AVAILABLE',
      });
      fetchVehicles();
    } catch (err: any) {
      error('Lỗi khi thêm xe', err.response?.data?.plate_number?.[0] || 'Vui lòng kiểm tra dữ liệu');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phương tiện này?')) return;
    try {
      await api.delete(`/vehicles/${id}/`);
      success('Đã xóa phương tiện');
      fetchVehicles();
    } catch (e) {
      error('Lỗi xóa phương tiện');
    }
  };

  const filtered = vehicles.filter(v =>
    v.plate_number.toLowerCase().includes(search.toLowerCase()) ||
    v.model_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" /> Quản Lý Đội Xe (Vehicles)
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Theo dõi danh sách phương tiện, trọng tải, chỉ số ODO và đăng kiểm.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Thêm Xe Mới
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo biển số hoặc model xe..."
          className="bg-transparent text-xs w-full focus:outline-none text-slate-900 dark:text-slate-100"
        />
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {filtered.map((v) => (
          <div key={v.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-black text-base text-blue-600 dark:text-blue-400">{v.plate_number}</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {v.model_name} <span className="text-slate-400 font-normal">({v.brand})</span>
                </p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                v.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                v.status === 'ON_TRIP' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {v.status_display || v.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>Loại xe: <strong className="text-slate-800 dark:text-slate-200">{v.vehicle_type_display || v.vehicle_type}</strong></div>
              <div>Tải trọng: <strong className="text-slate-800 dark:text-slate-200">{v.payload_capacity} tấn</strong></div>
              <div>ODO: <strong className="font-mono text-slate-800 dark:text-slate-200">{v.odometer.toLocaleString('vi-VN')} km</strong></div>
              <div>Đăng kiểm: <strong className="text-slate-800 dark:text-slate-200">{v.registration_expiry || 'Còn hạn'}</strong></div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => handleDelete(v.id)}
                className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa xe
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Data Table */}
      <div className="hidden md:block rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Biển Số</th>
                <th className="py-3 px-4">Model & Thương Hiệu</th>
                <th className="py-3 px-4">Chủng Loại</th>
                <th className="py-3 px-4">Tải Trọng</th>
                <th className="py-3 px-4">Chỉ Số ODO</th>
                <th className="py-3 px-4">Hạn Đăng Kiểm</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-black text-blue-600 dark:text-blue-400">{v.plate_number}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {v.model_name}
                    <span className="text-[10px] text-slate-400 block font-normal">{v.brand}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{v.vehicle_type_display || v.vehicle_type}</td>
                  <td className="py-3.5 px-4 font-bold">{v.payload_capacity} tấn</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                    {v.odometer.toLocaleString('vi-VN')} km
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{v.registration_expiry || 'Còn hiệu lực'}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      v.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                      v.status === 'ON_TRIP' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {v.status_display || v.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Xóa phương tiện"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm Xe */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Thêm Phương Tiện Mới">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Biển kiểm soát *"
            value={form.plate_number}
            onChange={(e) => setForm({ ...form, plate_number: e.target.value })}
            placeholder="VD: 29H-999.88"
            required
          />
          <Input
            label="Model xe *"
            value={form.model_name}
            onChange={(e) => setForm({ ...form, model_name: e.target.value })}
            placeholder="VD: Hino 500 Series FL"
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Loại xe</label>
              <select
                value={form.vehicle_type}
                onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <option value="TRUCK_LIGHT">Xe tải nhẹ (&lt; 3.5 tấn)</option>
                <option value="TRUCK_MEDIUM">Xe tải trung (3.5 - 8 tấn)</option>
                <option value="TRUCK_HEAVY">Xe tải nặng (&gt; 8 tấn)</option>
                <option value="CONTAINER">Xe đầu kéo container</option>
                <option value="VAN">Xe van giao hàng</option>
                <option value="PASSENGER">Xe đưa đón nhân sự</option>
              </select>
            </div>
            <Input
              label="Tải trọng (tấn)"
              type="number"
              step="0.1"
              value={form.payload_capacity}
              onChange={(e) => setForm({ ...form, payload_capacity: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Chỉ số ODO (km)"
              type="number"
              value={form.odometer}
              onChange={(e) => setForm({ ...form, odometer: parseInt(e.target.value) || 0 })}
            />
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Trạng thái</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <option value="AVAILABLE">Sẵn sàng</option>
                <option value="ON_TRIP">Đang chạy chuyến</option>
                <option value="MAINTENANCE">Đang bảo dưỡng</option>
              </select>
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit">Lưu Phương Tiện</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

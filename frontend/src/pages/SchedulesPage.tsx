import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Search, Trash2, ArrowRight, MapPin, Truck } from 'lucide-react';
import api from '../services/api';
import { TripSchedule, Vehicle, Driver } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';

export const SchedulesPage: React.FC = () => {
  const [schedules, setSchedules] = useState<TripSchedule[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    trip_code: '',
    vehicle: 0,
    driver: 0,
    origin: '',
    destination: '',
    cargo_description: '',
    cargo_weight: 5.0,
    departure_time: new Date().toISOString().slice(0, 16),
    distance_km: 100,
    status: 'PLANNED',
  });
  const { success, error } = useToast();

  const fetchData = async () => {
    try {
      const [sRes, vRes, dRes] = await Promise.all([
        api.get('/schedules/'),
        api.get('/vehicles/'),
        api.get('/drivers/'),
      ]);
      setSchedules(sRes.data.results || sRes.data || []);
      setVehicles(vRes.data.results || vRes.data || []);
      setDrivers(dRes.data.results || dRes.data || []);
      if (vRes.data.length > 0) setForm(prev => ({ ...prev, vehicle: vRes.data[0].id }));
      if (dRes.data.length > 0) setForm(prev => ({ ...prev, driver: dRes.data[0].id }));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/schedules/', form);
      success('Lập lịch trình chuyến xe thành công!');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      error('Lỗi khi lập lịch trình', 'Vui lòng kiểm tra lại thông tin');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch trình này?')) return;
    try {
      await api.delete(`/schedules/${id}/`);
      success('Đã xóa lịch trình');
      fetchData();
    } catch (e) {
      error('Lỗi xóa lịch trình');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-amber-600" /> Điều Phối & Lịch Trình (Schedules)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Điều hành phân công xe, tài xế, điểm giao nhận và kiểm soát tiến độ vận chuyển hàng hóa.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Lập Chuyến Mới
        </Button>
      </div>

      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Mã Chuyến</th>
                <th className="py-3 px-4">Phương Tiện</th>
                <th className="py-3 px-4">Tài Xế Phụ Trách</th>
                <th className="py-3 px-4">Điểm Xuất Phát &rarr; Điểm Đến</th>
                <th className="py-3 px-4">Hàng Hóa & Tải</th>
                <th className="py-3 px-4">Khởi Hành</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {schedules.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-slate-100">{s.trip_code}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{s.vehicle_plate}</span>
                    <span className="text-[10px] text-slate-400 block">{s.vehicle_model}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{s.driver_name}</span>
                    <span className="text-[10px] text-slate-400 block">{s.driver_phone}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{s.origin}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{s.destination}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Cự ly: {s.distance_km} km</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{s.cargo_description}</span>
                    <span className="text-[10px] text-slate-400 block font-bold">{s.cargo_weight} tấn</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {new Date(s.departure_time).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      s.status === 'DISPATCHED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                      s.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {s.status_display || s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Xóa lịch trình"
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

      {/* Modal Lập Lịch Trình */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Lập Kế Hoạch Chuyến Đi Mới">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Mã chuyến đi *"
            value={form.trip_code}
            onChange={(e) => setForm({ ...form, trip_code: e.target.value })}
            placeholder="VD: TRIP-2026-99"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Xe vận tải *</label>
              <select
                value={form.vehicle}
                onChange={(e) => setForm({ ...form, vehicle: parseInt(e.target.value) })}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                required
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.plate_number} - {v.model_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tài xế nhận lệnh *</label>
              <select
                value={form.driver}
                onChange={(e) => setForm({ ...form, driver: parseInt(e.target.value) })}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                required
              >
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.full_name} ({d.driver_code})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Điểm xuất phát *"
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
              placeholder="VD: Tổng kho Long Biên"
              required
            />
            <Input
              label="Điểm đến *"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              placeholder="VD: Cảng Hải Phòng"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Mô tả hàng hóa *"
              value={form.cargo_description}
              onChange={(e) => setForm({ ...form, cargo_description: e.target.value })}
              placeholder="VD: Thùng nước ngọt đóng chai"
              required
            />
            <Input
              label="Khối lượng (tấn)"
              type="number"
              step="0.1"
              value={form.cargo_weight}
              onChange={(e) => setForm({ ...form, cargo_weight: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit">Phân Công & Lên Lịch</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

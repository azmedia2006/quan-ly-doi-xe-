// UPDATE: Cập nhật SchedulesPage hỗ trợ phân quyền RBAC, kiểm tra ràng buộc rảnh/trùng lịch, bổ sung lộ trình và hàng hóa/hành khách
import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Trash2, ArrowRight, MapPin, Route, Users, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { TripSchedule, Vehicle, Driver } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';

export const SchedulesPage: React.FC = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<TripSchedule[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // UPDATE: Phân quyền vai trò: Chỉ Admin và Dispatcher mới được tạo và hủy lệnh điều xe
  const canDispatch = user?.role === 'ADMIN' || user?.role === 'DISPATCHER';

  // UPDATE: Bổ sung các trường nghiệp vụ mới: route_details, cargo_or_passenger_info
  const [form, setForm] = useState({
    trip_code: '',
    vehicle: 0,
    driver: 0,
    origin: '',
    destination: '',
    route_details: '',
    cargo_or_passenger_info: '',
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
      const vList: Vehicle[] = vRes.data.results || vRes.data || [];
      const dList: Driver[] = dRes.data.results || dRes.data || [];
      setVehicles(vList);
      setDrivers(dList);

      // Ưu tiên chọn xe và tài xế đang rảnh
      const availableVehicles = vList.filter(v => v.status === 'AVAILABLE');
      const availableDrivers = dList.filter(d => d.status === 'AVAILABLE');

      setForm(prev => ({
        ...prev,
        vehicle: availableVehicles.length > 0 ? availableVehicles[0].id : (vList[0]?.id || 0),
        driver: availableDrivers.length > 0 ? availableDrivers[0].id : (dList[0]?.id || 0),
      }));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // NEW: Lọc danh sách xe và tài xế hợp lệ/rảnh để đưa vào dropdown tạo lệnh
  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE');
  const availableDrivers = drivers.filter(d => d.status === 'AVAILABLE');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicle || !form.driver) {
      error('Thiếu thông tin', 'Vui lòng chọn xe và tài xế đang ở trạng thái rảnh!');
      return;
    }

    try {
      await api.post('/schedules/', form);
      success('Lập lệnh điều xe thành công!', 'Hệ thống đã tự động chuyển trạng thái Xe & Tài xế sang Đang lái.');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.non_field_errors?.[0] || 
                  err.response?.data?.vehicle?.[0] || 
                  err.response?.data?.driver?.[0] || 
                  'Vui lòng kiểm tra lại ràng buộc trạng thái rảnh và trùng lịch';
      error('Lỗi khi lập lệnh điều xe', msg);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lệnh điều xe này? Trạng thái xe và tài xế sẽ được hoàn lại.')) return;
    try {
      await api.delete(`/schedules/${id}/`);
      success('Đã hủy lệnh điều xe', 'Xe và tài xế liên quan đã được trả về trạng thái rảnh.');
      fetchData();
    } catch (e: any) {
      error('Lỗi hủy lệnh', e.response?.data?.detail || 'Không thể xóa lệnh điều xe');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" /> Điều Phối & Lệnh Điều Xe (Dispatch & Trips)
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            {user?.role === 'DRIVER' 
              ? 'Danh sách các lệnh điều động và lộ trình được phân công cho riêng bạn.'
              : 'Gán xe + tài xế rảnh, lộ trình dự kiến, hàng hóa/hành khách và kiểm soát tiến độ chuyến.'}
          </p>
        </div>
        {canDispatch && (
          <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Lập Lệnh Điều Xe
          </Button>
        )}
      </div>

      {/* Driver notice banner */}
      {user?.role === 'DRIVER' && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
          <Users className="w-4 h-4 shrink-0" />
          <span>Bạn đang đăng nhập với vai trò <strong>Tài xế</strong>. Chỉ hiển thị các lệnh điều động được phân công cho bạn.</span>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {schedules.map((s) => (
          <div key={s.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-slate-900 dark:text-slate-100">{s.trip_code}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                s.status === 'DISPATCHED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                s.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}>
                {s.status_display || s.status}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">{s.origin}</span>
              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{s.destination}</span>
            </div>

            {s.route_details && (
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <Route className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">Lộ trình: {s.route_details}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>Xe: <strong className="text-blue-600 dark:text-blue-400">{s.vehicle_plate}</strong></div>
              <div>Tài xế: <strong className="text-slate-800 dark:text-slate-200">{s.driver_name}</strong></div>
              <div className="col-span-2">
                Thông tin: <strong className="text-slate-800 dark:text-slate-200">{s.cargo_or_passenger_info || s.cargo_or_passenger_info || '—'}</strong> 
                {s.cargo_weight ? ` (${s.cargo_weight}T)` : ''}
              </div>
              <div>Khởi hành: <strong className="text-slate-800 dark:text-slate-200">{new Date(s.departure_time).toLocaleDateString('vi-VN')}</strong></div>
              <div>Cự ly: <strong className="text-slate-800 dark:text-slate-200">{s.distance_km} km</strong></div>
            </div>

            {canDispatch && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => handleDelete(s.id)}
                  className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hủy lệnh
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Mã Chuyến</th>
                <th className="py-3 px-4">Phương Tiện</th>
                <th className="py-3 px-4">Tài Xế Phụ Trách</th>
                <th className="py-3 px-4">Điểm Xuất Phát &rarr; Điểm Đến</th>
                <th className="py-3 px-4">Lộ Trình Dự Kiến</th>
                <th className="py-3 px-4">Hàng Hóa / Hành Khách</th>
                <th className="py-3 px-4">Khởi Hành</th>
                <th className="py-3 px-4">Trạng Thái</th>
                {canDispatch && <th className="py-3 px-4 text-right">Thao Tác</th>}
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
                  <td className="py-3.5 px-4 max-w-xs">
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate block">
                      {s.route_details || 'Tuyến mặc định theo GPS'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {s.cargo_or_passenger_info || s.cargo_or_passenger_info || 'Hàng tiêu chuẩn'}
                    </span>
                    {s.cargo_weight ? (
                      <span className="text-[10px] text-slate-400 block font-bold">{s.cargo_weight} tấn</span>
                    ) : null}
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
                  {canDispatch && (
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Hủy lệnh điều xe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Lập Lệnh Điều Xe */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Lập Lệnh Điều Xe & Phân Công Chuyến Đi">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Mã lệnh điều xe *"
            value={form.trip_code}
            onChange={(e) => setForm({ ...form, trip_code: e.target.value })}
            placeholder="VD: DISPATCH-2026-001"
            required
          />

          {/* Ràng buộc chọn xe và tài xế đang rảnh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Phương tiện (Chỉ xe Đang rảnh) *
              </label>
              <select
                value={form.vehicle}
                onChange={(e) => setForm({ ...form, vehicle: parseInt(e.target.value) })}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                required
              >
                <option value={0}>-- Chọn xe khả dụng --</option>
                {availableVehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.plate_number} ({v.vehicle_type_display || v.vehicle_type} - {v.payload_capacity}T)
                  </option>
                ))}
              </select>
              {availableVehicles.length === 0 && (
                <p className="text-[10px] text-rose-500 mt-1">Hiện không có xe nào ở trạng thái Đang rảnh!</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Tài xế phân công (Chỉ tài xế Đang rảnh) *
              </label>
              <select
                value={form.driver}
                onChange={(e) => setForm({ ...form, driver: parseInt(e.target.value) })}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                required
              >
                <option value={0}>-- Chọn tài xế khả dụng --</option>
                {availableDrivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.full_name} (Hạng {d.license_class}) - {d.phone}
                  </option>
                ))}
              </select>
              {availableDrivers.length === 0 && (
                <p className="text-[10px] text-rose-500 mt-1">Hiện không có tài xế nào ở trạng thái Đang rảnh!</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Điểm xuất phát *"
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
              placeholder="VD: Tổng kho ICD Long Biên, Hà Nội"
              required
            />
            <Input
              label="Điểm đến *"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              placeholder="VD: Cảng Đình Vũ, Hải Phòng"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Lộ trình dự kiến (Các điểm dừng / trạm kiểm soát)
            </label>
            <Input
              value={form.route_details}
              onChange={(e) => setForm({ ...form, route_details: e.target.value })}
              placeholder="VD: QL5B mới -> Nút giao Đình Vũ -> Kho bãi 3"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Thông tin Hàng hóa / Hành khách *"
              value={form.cargo_or_passenger_info}
              onChange={(e) => setForm({ ...form, cargo_or_passenger_info: e.target.value, cargo_description: e.target.value })}
              placeholder="VD: 40 thùng linh kiện hoặc 16 hành khách đoàn du lịch"
              required
            />
            <Input
              label="Tải trọng hàng (Tấn)"
              type="number"
              step="0.1"
              value={form.cargo_weight}
              onChange={(e) => setForm({ ...form, cargo_weight: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Thời gian khởi hành *"
              type="datetime-local"
              value={form.departure_time}
              onChange={(e) => setForm({ ...form, departure_time: e.target.value })}
              required
            />
            <Input
              label="Cự ly dự kiến (km) *"
              type="number"
              value={form.distance_km}
              onChange={(e) => setForm({ ...form, distance_km: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={availableVehicles.length === 0 || availableDrivers.length === 0}>
              Ký Lệnh & Xuất Bến
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Trash2, Calendar, Gauge, Building2 } from 'lucide-react';
import api from '../services/api';
import { MaintenanceRecord, Vehicle } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';

export const MaintenancePage: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { success, error } = useToast();

  const canEdit = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' || user?.role === 'MECHANIC' || user?.role === 'ACCOUNTANT';

  // Function sinh mã phiếu ngẫu nhiên để không bao giờ bị trùng
  const generateMaintenanceCode = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `MAINT-${new Date().getFullYear()}-${randomNum}`;
  };

  const [form, setForm] = useState({
    maintenance_code: '',
    vehicle: 0,
    service_type: 'PERIODIC',
    odometer_at_service: 50000,
    service_date: new Date().toISOString().slice(0, 10),
    garage_name: '',
    cost: 5000000,
    details: '',
    technician_name: user?.full_name || 'KTV Xưởng Dịch Vụ',
    status: 'COMPLETED',
  });

  const fetchData = async () => {
    try {
      const [mRes, vRes] = await Promise.all([
        api.get('/maintenance/'),
        api.get('/vehicles/'),
      ]);
      setRecords(mRes.data.results || mRes.data || []);
      const vList: Vehicle[] = vRes.data.results || vRes.data || [];
      setVehicles(vList);
      if (vList.length > 0) {
        setForm(prev => ({
          ...prev,
          vehicle: prev.vehicle || vList[0].id,
          odometer_at_service: vList[0].odometer || 50000,
          maintenance_code: prev.maintenance_code || generateMaintenanceCode(),
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = () => {
    const defaultVehicle = vehicles[0];
    setForm({
      maintenance_code: generateMaintenanceCode(),
      vehicle: defaultVehicle ? defaultVehicle.id : 0,
      service_type: 'PERIODIC',
      odometer_at_service: defaultVehicle ? defaultVehicle.odometer : 50000,
      service_date: new Date().toISOString().slice(0, 10),
      garage_name: '',
      cost: 3500000,
      details: '',
      technician_name: user?.full_name || 'Kỹ thuật viên xưởng',
      status: 'COMPLETED',
    });
    setIsModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicle) {
      error('Thiếu thông tin', 'Vui lòng chọn phương tiện cần bảo dưỡng');
      return;
    }

    try {
      await api.post('/maintenance/', form);
      success('Tạo phiếu bảo dưỡng thành công!');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.maintenance_code?.[0] ||
        err.response?.data?.vehicle?.[0] ||
        err.response?.data?.details?.[0] ||
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Vui lòng kiểm tra lại thông tin nhập';
      error('Lỗi tạo phiếu bảo dưỡng', errorMsg);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa phiếu bảo dưỡng này?')) return;
    try {
      await api.delete(`/maintenance/${id}/`);
      success('Đã xóa phiếu bảo dưỡng');
      fetchData();
    } catch (e) {
      error('Lỗi xóa phiếu bảo dưỡng');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" /> Bảo Dưỡng & Sửa Chữa (Maintenance)
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Theo dõi bảo trì theo ODO, thay thế phụ tùng, xưởng thực hiện và chi phí.
          </p>
        </div>
        {canEdit && (
          <Button
            onClick={handleOpenModal}
            className="w-full sm:w-auto !flex-row !inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Tạo Phiếu Bảo Dưỡng
          </Button>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {records.map((r) => (
          <div key={r.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-black text-sm text-slate-900 dark:text-slate-100">{r.maintenance_code}</span>
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">{r.vehicle_plate}</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                r.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                r.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}>
                {r.status_display || r.status}
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{r.service_type_display || r.service_type}</p>
            <p className="text-[11px] text-slate-500 line-clamp-2">{r.details}</p>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>Chi phí: <strong className="text-purple-600 dark:text-purple-400 font-bold">{Number(r.cost).toLocaleString('vi-VN')} ₫</strong></div>
              <div>ODO: <strong className="font-mono text-slate-800 dark:text-slate-200">{Number(r.odometer_at_service || 0).toLocaleString('vi-VN')} km</strong></div>
              <div>Ngày: <strong className="text-slate-800 dark:text-slate-200">{new Date(r.service_date).toLocaleDateString('vi-VN')}</strong></div>
              <div>KTV: <strong className="text-slate-800 dark:text-slate-200">{r.technician_name || '—'}</strong></div>
              <div className="col-span-2 truncate">Garage: <strong className="text-slate-800 dark:text-slate-200">{r.garage_name}</strong></div>
            </div>

            {canEdit && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 w-full">
                <button
                  onClick={() => handleDelete(r.id)}
                  className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa phiếu
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
                <th className="py-3 px-4">Mã Phiếu</th>
                <th className="py-3 px-4">Phương Tiện</th>
                <th className="py-3 px-4">Hạng Mục</th>
                <th className="py-3 px-4">ODO & Ngày</th>
                <th className="py-3 px-4">Garage & Kỹ Thuật Viên</th>
                <th className="py-3 px-4">Chi Phí (VNĐ)</th>
                <th className="py-3 px-4">Trạng Thái</th>
                {canEdit && <th className="py-3 px-4 text-right">Thao Tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">{r.maintenance_code}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{r.vehicle_plate}</span>
                    <span className="text-[10px] text-slate-400 block">{r.vehicle_model}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{r.service_type_display || r.service_type}</span>
                    <span className="text-[11px] text-slate-500 block truncate max-w-xs">{r.details}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{Number(r.odometer_at_service || 0).toLocaleString('vi-VN')} km</span>
                    <span className="text-[10px] text-slate-400 block">{new Date(r.service_date).toLocaleDateString('vi-VN')}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    <span className="font-medium text-slate-800 dark:text-slate-200 block truncate max-w-xs">{r.garage_name}</span>
                    <span className="text-[10px] text-slate-400 block">KTV: {r.technician_name || '—'}</span>
                  </td>
                  <td className="py-3.5 px-4 font-black text-purple-600 dark:text-purple-400">
                    {Number(r.cost).toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      r.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                      r.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {r.status_display || r.status}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Xóa phiếu"
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

      {/* Modal Thêm Bảo Dưỡng */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Lập Phiếu Bảo Dưỡng & Sửa Chữa">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Mã phiếu bảo dưỡng *"
              value={form.maintenance_code}
              onChange={(e) => setForm({ ...form, maintenance_code: e.target.value })}
              placeholder="VD: MAINT-2026-99"
              required
            />
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Phương tiện *</label>
              <select
                value={form.vehicle}
                onChange={(e) => {
                  const selectedId = parseInt(e.target.value);
                  const selectedVehicle = vehicles.find(v => v.id === selectedId);
                  setForm(prev => ({
                    ...prev,
                    vehicle: selectedId,
                    odometer_at_service: selectedVehicle ? selectedVehicle.odometer : prev.odometer_at_service,
                  }));
                }}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                required
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.plate_number} - {v.model_name} (ODO: {v.odometer.toLocaleString('vi-VN')} km)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Hạng mục dịch vụ *</label>
              <select
                value={form.service_type}
                onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                <option value="PERIODIC">Bảo dưỡng định kỳ theo ODO</option>
                <option value="REPAIR">Sửa chữa hỏng hóc kỹ thuật</option>
                <option value="TIRE">Thay thế lốp xe & cân mâm</option>
                <option value="OIL_FILTER">Thay dầu nhớt động cơ & lọc gió</option>
                <option value="INSPECTION">Kiểm định an toàn kỹ thuật (Đăng kiểm)</option>
              </select>
            </div>
            <Input
              label="Số ODO tại thời điểm bảo dưỡng (km) *"
              type="number"
              value={form.odometer_at_service}
              onChange={(e) => setForm({ ...form, odometer_at_service: parseInt(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Garage / Xưởng sửa chữa thực hiện *"
              value={form.garage_name}
              onChange={(e) => setForm({ ...form, garage_name: e.target.value })}
              placeholder="VD: Xưởng Dịch Vụ Isuzu Long Biên"
              required
            />
            <Input
              label="Tổng chi phí thực hiện (VNĐ) *"
              type="number"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Ngày thực hiện dịch vụ *"
              type="date"
              value={form.service_date}
              onChange={(e) => setForm({ ...form, service_date: e.target.value })}
              required
            />
            <Input
              label="Kỹ thuật viên / Thợ phụ trách"
              value={form.technician_name}
              onChange={(e) => setForm({ ...form, technician_name: e.target.value })}
              placeholder="VD: KTV Nguyễn Văn Cường"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nội dung chi tiết thực hiện & Phụ tùng thay thế *</label>
            <textarea
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              placeholder="Ghi rõ chi tiết công việc thực hiện, mã phụ tùng thay thế và hiện trạng sau sửa chữa..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 h-20 outline-none focus:ring-2 focus:ring-purple-500/30"
              required
            />
          </div>

          <div className="pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2 w-full">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" className="w-full sm:w-auto">Lưu Phiếu Bảo Dưỡng</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Search, Trash2, ShieldCheck, MapPin } from 'lucide-react';
import api from '../services/api';
import { Incident, Vehicle, Driver } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';

export const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    incident_code: '',
    vehicle: 0,
    driver: 0,
    incident_date: new Date().toISOString().slice(0, 16),
    location: '',
    severity: 'LOW',
    description: '',
    insurance_claim_amount: 0,
    status: 'REPORTED',
  });
  const { success, error } = useToast();

  const fetchData = async () => {
    try {
      const [iRes, vRes, dRes] = await Promise.all([
        api.get('/incidents/'),
        api.get('/vehicles/'),
        api.get('/drivers/'),
      ]);
      setIncidents(iRes.data.results || iRes.data || []);
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
      await api.post('/incidents/', form);
      success('Báo cáo sự cố thành công!');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      error('Lỗi lưu sự cố', 'Vui lòng kiểm tra lại thông tin');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa bản ghi sự cố này?')) return;
    try {
      await api.delete(`/incidents/${id}/`);
      success('Đã xóa sự cố');
      fetchData();
    } catch (e) {
      error('Lỗi xóa sự cố');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-600" /> Sự Cố & Bảo Hiểm (Incidents)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ghi nhận tai nạn, va quẹt, hư hỏng đột xuất trên đường và quy trình thẩm định bảo hiểm bồi thường.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Khai Báo Sự Cố
        </Button>
      </div>

      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Mã Sự Cố</th>
                <th className="py-3 px-4">Phương Tiện</th>
                <th className="py-3 px-4">Tài Xế</th>
                <th className="py-3 px-4">Địa Điểm</th>
                <th className="py-3 px-4">Mức Độ</th>
                <th className="py-3 px-4">Bảo Hiểm Đền Bù</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-slate-100">{inc.incident_code}</td>
                  <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">{inc.vehicle_plate}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{inc.driver_name || '—'}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    <span className="font-semibold block">{inc.location}</span>
                    <span className="text-[10px] text-slate-400">{inc.description}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      inc.severity === 'HIGH' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                      inc.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {inc.severity_display || inc.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">
                    {Number(inc.insurance_claim_amount).toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      inc.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {inc.status_display || inc.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(inc.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Xóa sự cố"
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

      {/* Modal Khai Báo Sự Cố */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Khai Báo Sự Cố Xe">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Mã sự cố *"
            value={form.incident_code}
            onChange={(e) => setForm({ ...form, incident_code: e.target.value })}
            placeholder="VD: INC-2026-99"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Xe *</label>
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
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tài xế lái xe</label>
              <select
                value={form.driver}
                onChange={(e) => setForm({ ...form, driver: parseInt(e.target.value) })}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.full_name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Địa điểm xảy ra *"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="VD: Km 18 Cao tốc Hà Nội - Hải Phòng"
              required
            />
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mức độ nghiêm trọng</label>
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <option value="LOW">Nhẹ (Va quẹt xước sơn)</option>
                <option value="MEDIUM">Trung bình (Hỏng hóc nhẹ, cần cứu hộ)</option>
                <option value="HIGH">Nghiêm trọng (Tai nạn lớn)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mô tả diễn biến sự cố *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ghi rõ tình huống, nguyên nhân và thiệt hại sơ bộ..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-20"
              required
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit">Gửi Báo Cáo Sự Cố</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

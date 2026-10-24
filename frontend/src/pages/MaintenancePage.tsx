// UPDATE: Bổ sung Quick Stats, Filter Chips, Next Due, Parts Replaced, Edit/Complete/Delete safety
import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Search, Trash2, Calendar, Gauge, Building2, Pencil, CheckCircle, Clock, AlertTriangle, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';
import { MaintenanceRecord, Vehicle } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';

type MaintFilter = 'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'PERIODIC' | 'REPAIR';

export const MaintenancePage: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MaintFilter>('ALL');
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [expandedParts, setExpandedParts] = useState<number | null>(null);
  const { success, error } = useToast();

  const canEdit = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' || user?.role === 'MECHANIC' || user?.role === 'ACCOUNTANT';

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
    parts_replaced: '',
    technician_name: user?.full_name || 'KTV Xưởng Dịch Vụ',
    status: 'IN_PROGRESS',
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

  useEffect(() => { fetchData(); }, []);

  const handleOpenCreate = () => {
    const defaultVehicle = vehicles[0];
    setEditingRecord(null);
    setForm({
      maintenance_code: generateMaintenanceCode(),
      vehicle: defaultVehicle ? defaultVehicle.id : 0,
      service_type: 'PERIODIC',
      odometer_at_service: defaultVehicle ? defaultVehicle.odometer : 50000,
      service_date: new Date().toISOString().slice(0, 10),
      garage_name: '',
      cost: 3500000,
      details: '',
      parts_replaced: '',
      technician_name: user?.full_name || 'Kỹ thuật viên xưởng',
      status: 'IN_PROGRESS',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (r: MaintenanceRecord) => {
    setEditingRecord(r);
    setForm({
      maintenance_code: r.maintenance_code,
      vehicle: r.vehicle,
      service_type: r.service_type,
      odometer_at_service: r.odometer_at_service,
      service_date: r.service_date,
      garage_name: r.garage_name,
      cost: Number(r.cost),
      details: r.details,
      parts_replaced: r.parts_replaced || '',
      technician_name: r.technician_name || '',
      status: r.status,
    });
    setIsModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicle) { error('Thiếu thông tin', 'Vui lòng chọn phương tiện'); return; }
    try {
      await api.post('/maintenance/', form);
      success('Tạo phiếu bảo dưỡng thành công!');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.maintenance_code?.[0] || err.response?.data?.detail || 'Vui lòng kiểm tra lại';
      error('Lỗi tạo phiếu', msg);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    try {
      await api.put(`/maintenance/${editingRecord.id}/`, form);
      success('Cập nhật phiếu bảo dưỡng thành công!');
      setIsModalOpen(false);
      setEditingRecord(null);
      fetchData();
    } catch (err: any) {
      error('Lỗi cập nhật', err.response?.data?.detail || 'Vui lòng kiểm tra dữ liệu');
    }
  };

  const handleComplete = async (id: number) => {
    if (!window.confirm('Xác nhận nghiệm thu hoàn tất phiếu bảo dưỡng này? Phương tiện sẽ chuyển về trạng thái Sẵn sàng.')) return;
    try {
      await api.post(`/maintenance/${id}/complete/`, {});
      success('Đã nghiệm thu hoàn tất! Phương tiện đã sẵn sàng vận hành.');
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.message || err.message || 'Lỗi nghiệm thu';
      error('Lỗi nghiệm thu', msg);
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

  // Stats
  const totalCost = records.reduce((s, r) => s + Number(r.cost), 0);
  const inProgressCount = records.filter(r => r.status === 'IN_PROGRESS' || r.status === 'PENDING').length;
  const completedCount = records.filter(r => r.status === 'COMPLETED').length;
  const dueSoonCount = records.filter(r => {
    if (!r.next_due_odo) return false;
    const v = vehicles.find(v => v.id === r.vehicle);
    return v && v.odometer >= r.next_due_odo - 1000;
  }).length;

  // Filter + Search
  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (r.vehicle_plate || '').toLowerCase().includes(q) ||
      r.maintenance_code.toLowerCase().includes(q) ||
      r.garage_name.toLowerCase().includes(q) ||
      (r.technician_name || '').toLowerCase().includes(q);
    if (!matchSearch) return false;
    if (filter === 'ALL') return true;
    if (filter === 'IN_PROGRESS') return r.status === 'IN_PROGRESS' || r.status === 'PENDING';
    if (filter === 'COMPLETED') return r.status === 'COMPLETED';
    if (filter === 'PERIODIC') return r.service_type === 'PERIODIC' || r.service_type === 'OIL_FILTER';
    if (filter === 'REPAIR') return r.service_type === 'REPAIR' || r.service_type === 'TIRE' || r.service_type === 'INSPECTION';
    return true;
  });

  const statsCards = [
    { label: 'Tổng chi phí BD', value: totalCost.toLocaleString('vi-VN') + '₫', icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
    { label: 'Đang thực hiện', value: inProgressCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Đã hoàn tất', value: completedCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { label: 'Sắp đến hạn BD', value: dueSoonCount, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40' },
  ];

  const filterChips: { key: MaintFilter; label: string; count: number }[] = [
    { key: 'ALL', label: 'Tất cả', count: records.length },
    { key: 'IN_PROGRESS', label: '🔧 Đang thực hiện', count: inProgressCount },
    { key: 'COMPLETED', label: '✅ Đã hoàn tất', count: completedCount },
    { key: 'PERIODIC', label: 'BD định kỳ', count: records.filter(r => r.service_type === 'PERIODIC' || r.service_type === 'OIL_FILTER').length },
    { key: 'REPAIR', label: 'Sửa chữa đột xuất', count: records.filter(r => r.service_type === 'REPAIR' || r.service_type === 'TIRE' || r.service_type === 'INSPECTION').length },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> Đang thực hiện</span>;
      case 'COMPLETED': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-0.5"><CheckCircle className="w-2.5 h-2.5" /> Hoàn tất</span>;
      case 'PENDING': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">Chờ xử lý</span>;
      default: return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Hủy bỏ</span>;
    }
  };

  const getServiceTypeBadge = (type: string) => {
    switch (type) {
      case 'PERIODIC': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">BD định kỳ</span>;
      case 'REPAIR': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">Sửa chữa</span>;
      case 'TIRE': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">Thay lốp</span>;
      case 'OIL_FILTER': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Dầu nhớt</span>;
      case 'INSPECTION': return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">Đăng kiểm</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
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
          <Button onClick={handleOpenCreate} className="w-full sm:w-auto !flex-row !inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap">
            <Plus className="w-4 h-4" /> Tạo Phiếu Bảo Dưỡng
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {statsCards.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3 border border-white/60 dark:border-slate-800`}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-white/70 dark:bg-slate-800/60 shrink-0">
              <s.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${s.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 leading-none truncate">{s.value}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo biển số xe, mã phiếu, tên garage, kỹ thuật viên..."
          className="bg-transparent text-xs w-full focus:outline-none text-slate-900 dark:text-slate-100" />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {filterChips.map((chip) => (
          <button key={chip.key} onClick={() => setFilter(chip.key)}
            className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all border shrink-0 ${
              filter === chip.key
                ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200 dark:shadow-purple-900/40'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}>
            {chip.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
              filter === chip.key ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>{chip.count}</span>
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filtered.map((r) => {
          const isCompleted = r.status === 'COMPLETED';
          const isInProgress = r.status === 'IN_PROGRESS';
          return (
          <div key={r.id} className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border shadow-xs flex flex-col justify-between ${
            isInProgress ? 'border-amber-300 dark:border-amber-800' : 'border-slate-200 dark:border-slate-800'
          }`}>
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">{r.maintenance_code}</h3>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate">{r.vehicle_plate} <span className="text-slate-400 font-normal text-[11px]">• {r.vehicle_model}</span></p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {getStatusBadge(r.status)}
                  {getServiceTypeBadge(r.service_type)}
                </div>
              </div>

              {/* Info */}
              <div className="mt-3 space-y-1.5 text-xs border-t border-slate-100 dark:border-slate-800 pt-2.5">
                <p className="text-slate-600 dark:text-slate-400 line-clamp-2">{r.details}</p>

                <div className="flex justify-between"><span className="text-slate-400">Chi phí:</span>
                  <span className="font-black text-slate-900 dark:text-slate-100">{Number(r.cost).toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between"><span className="text-slate-400 flex items-center gap-1"><Gauge className="w-3 h-3" /> ODO:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{r.odometer_at_service.toLocaleString('vi-VN')} km</span>
                </div>
                <div className="flex justify-between"><span className="text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Ngày:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{new Date(r.service_date).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between"><span className="text-slate-400 flex items-center gap-1"><Building2 className="w-3 h-3" /> Garage:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[180px] text-right">{r.garage_name}</span>
                </div>
                {r.technician_name && (
                  <div className="flex justify-between"><span className="text-slate-400">KTV:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{r.technician_name}</span>
                  </div>
                )}

                {/* Next Due */}
                {r.next_due_odo ? (
                  <div className="flex justify-between items-center mt-1 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">📅 Lần tới dự kiến:</span>
                    <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300">{r.next_due_odo.toLocaleString('vi-VN')} km {r.next_due_date ? `/ ${new Date(r.next_due_date).toLocaleDateString('vi-VN')}` : ''}</span>
                  </div>
                ) : null}

                {/* Parts Replaced (accordion) */}
                {r.parts_replaced && (
                  <div className="mt-1">
                    <button onClick={() => setExpandedParts(expandedParts === r.id ? null : r.id)}
                      className="w-full flex items-center justify-between text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 py-1">
                      <span>🔩 Chi tiết phụ tùng thay thế</span>
                      {expandedParts === r.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {expandedParts === r.id && (
                      <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/50 text-[11px] text-slate-700 dark:text-slate-300 space-y-0.5">
                        {r.parts_replaced.split(',').map((part, i) => (
                          <div key={i} className="flex items-start gap-1.5"><span className="text-purple-500 mt-0.5">•</span><span className="leading-snug">{part.trim()}</span></div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {canEdit && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-1.5 w-full flex-wrap">
                <button onClick={() => handleEdit(r)} className="px-2.5 py-1.5 text-[11px] text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg flex items-center gap-1 font-semibold transition-colors" title="Cập nhật">
                  <Pencil className="w-3.5 h-3.5" /> Sửa
                </button>
                {isInProgress && (
                  <button onClick={() => handleComplete(r.id)} className="px-2.5 py-1.5 text-[11px] text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg flex items-center gap-1 font-semibold transition-colors" title="Nghiệm thu hoàn tất">
                    <CheckCircle className="w-3.5 h-3.5" /> Nghiệm thu
                  </button>
                )}
                <button
                  onClick={() => !isCompleted && handleDelete(r.id)}
                  disabled={isCompleted}
                  className={`px-2.5 py-1.5 text-[11px] rounded-lg flex items-center gap-1 font-semibold transition-colors ${
                    isCompleted ? 'text-slate-400 cursor-not-allowed opacity-50' : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                  }`}
                  title={isCompleted ? 'Không thể xóa phiếu đã hoàn tất nghiệm thu' : 'Xóa phiếu'}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa
                </button>
              </div>
            )}
          </div>
        );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400 dark:text-slate-600">
          <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Không tìm thấy phiếu bảo dưỡng nào phù hợp.</p>
        </div>
      )}

      {/* Modal Thêm / Chỉnh sửa */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingRecord(null); }} title={editingRecord ? 'Cập Nhật Phiếu Bảo Dưỡng' : 'Tạo Phiếu Bảo Dưỡng Mới'}>
        <form onSubmit={editingRecord ? handleUpdate : handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Mã phiếu bảo dưỡng *" value={form.maintenance_code}
              onChange={(e) => setForm({ ...form, maintenance_code: e.target.value })} placeholder="VD: MAINT-2026-0019" required disabled={!!editingRecord} />
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Phương tiện *</label>
              <select value={form.vehicle} onChange={(e) => {
                  const selectedId = parseInt(e.target.value);
                  const selectedVehicle = vehicles.find(v => v.id === selectedId);
                  setForm(prev => ({ ...prev, vehicle: selectedId, odometer_at_service: selectedVehicle ? selectedVehicle.odometer : prev.odometer_at_service }));
                }}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" required>
                {vehicles.map(v => (<option key={v.id} value={v.id}>{v.plate_number} - {v.model_name} (ODO: {v.odometer.toLocaleString('vi-VN')} km)</option>))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Hạng mục dịch vụ *</label>
              <select value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                <option value="PERIODIC">Bảo dưỡng định kỳ theo ODO</option>
                <option value="REPAIR">Sửa chữa hỏng hóc kỹ thuật</option>
                <option value="TIRE">Thay thế lốp xe & cân mâm</option>
                <option value="OIL_FILTER">Thay dầu nhớt động cơ & lọc gió</option>
                <option value="INSPECTION">Kiểm định an toàn kỹ thuật (Đăng kiểm)</option>
              </select>
            </div>
            <Input label="Số ODO tại thời điểm bảo dưỡng (km) *" type="number" value={form.odometer_at_service}
              onChange={(e) => setForm({ ...form, odometer_at_service: parseInt(e.target.value) || 0 })} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Garage / Xưởng sửa chữa thực hiện *" value={form.garage_name}
              onChange={(e) => setForm({ ...form, garage_name: e.target.value })} placeholder="VD: Xưởng Dịch Vụ Isuzu Long Biên" required />
            <Input label="Tổng chi phí thực hiện (VNĐ) *" type="number" value={form.cost}
              onChange={(e) => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Ngày thực hiện dịch vụ *" type="date" value={form.service_date}
              onChange={(e) => setForm({ ...form, service_date: e.target.value })} required />
            <Input label="Kỹ thuật viên / Thợ phụ trách" value={form.technician_name}
              onChange={(e) => setForm({ ...form, technician_name: e.target.value })} placeholder="VD: KTV Nguyễn Văn Cường" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nội dung chi tiết thực hiện *</label>
            <textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })}
              placeholder="Ghi rõ chi tiết công việc thực hiện..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 h-20 outline-none focus:ring-2 focus:ring-purple-500/30" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Phụ tùng / Vật tư thay thế (cách nhau bởi dấu phẩy)</label>
            <textarea value={form.parts_replaced} onChange={(e) => setForm({ ...form, parts_replaced: e.target.value })}
              placeholder="VD: Dầu nhớt Total Rubia 20L, Lọc nhớt chính hãng, Lọc gió động cơ..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 h-16 outline-none focus:ring-2 focus:ring-purple-500/30" />
          </div>
          {editingRecord && (
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Trạng thái phiếu</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                <option value="PENDING">Chờ xử lý</option>
                <option value="IN_PROGRESS">Đang thực hiện</option>
                <option value="COMPLETED">Đã hoàn tất</option>
              </select>
            </div>
          )}
          <div className="pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2 w-full">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => { setIsModalOpen(false); setEditingRecord(null); }}>Hủy</Button>
            <Button type="submit" className="w-full sm:w-auto">{editingRecord ? 'Cập Nhật' : 'Lưu Phiếu Bảo Dưỡng'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

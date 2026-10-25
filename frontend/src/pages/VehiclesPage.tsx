// UPDATE: Bổ sung Quick Stats, Filter Chips, Tài xế phụ trách, Cảnh báo đăng kiểm, Nút Edit/Detail, Logic xóa an toàn
import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Trash2, Fuel, Calendar, AlertTriangle, Pencil, Eye, CheckCircle, Wrench, CircleDot, User } from 'lucide-react';
import api from '../services/api';
import { Vehicle } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';

type StatusFilter = 'ALL' | 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE' | 'EXPIRING';

export const VehiclesPage: React.FC = () => {
 const { user } = useAuth();
 const [vehicles, setVehicles] = useState<Vehicle[]>([]);
 const [search, setSearch] = useState('');
 const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [isDetailOpen, setIsDetailOpen] = useState(false);
 const [detailVehicle, setDetailVehicle] = useState<Vehicle | null>(null);
 const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

 const [form, setForm] = useState({
 plate_number: '',
 model_name: '',
 brand: 'Hyundai',
 vehicle_type: 'TRUCK',
 payload_capacity: 5.0,
 manufacture_year: 2022,
 fuel_consumption_rate: 12.5,
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

 useEffect(() => { fetchVehicles(); }, []);

 const handleCreate = async (e: React.FormEvent) => {
 e.preventDefault();
 try {
 await api.post('/vehicles/', form);
 success('Thêm phương tiện thành công!');
 setIsModalOpen(false);
 setForm({ plate_number: '', model_name: '', brand: 'Hyundai', vehicle_type: 'TRUCK', payload_capacity: 5.0, manufacture_year: 2022, fuel_consumption_rate: 12.5, fuel_type: 'Diesel DO 0.05S', odometer: 0, status: 'AVAILABLE' });
 fetchVehicles();
 } catch (err: any) {
 error('Lỗi khi thêm xe', err.response?.data?.plate_number?.[0] || 'Vui lòng kiểm tra dữ liệu');
 }
 };

 const handleEdit = (v: Vehicle) => {
 setEditingVehicle(v);
 setForm({
 plate_number: v.plate_number,
 model_name: v.model_name,
 brand: v.brand,
 vehicle_type: v.vehicle_type,
 payload_capacity: Number(v.payload_capacity),
 manufacture_year: v.manufacture_year,
 fuel_consumption_rate: Number(v.fuel_consumption_rate),
 fuel_type: v.fuel_type,
 odometer: v.odometer,
 status: v.status,
 });
 setIsModalOpen(true);
 };

 const handleUpdate = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!editingVehicle) return;
 try {
 await api.put(`/vehicles/${editingVehicle.id}/`, form);
 success('Cập nhật phương tiện thành công!');
 setIsModalOpen(false);
 setEditingVehicle(null);
 fetchVehicles();
 } catch (err: any) {
 error('Lỗi khi cập nhật', err.response?.data?.plate_number?.[0] || 'Vui lòng kiểm tra dữ liệu');
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

 const handleOpenCreate = () => {
 setEditingVehicle(null);
 setForm({ plate_number: '', model_name: '', brand: 'Hyundai', vehicle_type: 'TRUCK', payload_capacity: 5.0, manufacture_year: 2022, fuel_consumption_rate: 12.5, fuel_type: 'Diesel DO 0.05S', odometer: 0, status: 'AVAILABLE' });
 setIsModalOpen(true);
 };

 const canEdit = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' || user?.role === 'DISPATCHER';

 // Helper: Kiểm tra hạn đăng kiểm
 const getDaysUntilExpiry = (dateStr?: string) => {
 if (!dateStr) return 999;
 return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
 };

 // Stats
 const totalVehicles = vehicles.length;
 const availableCount = vehicles.filter(v => v.status === 'AVAILABLE').length;
 const onTripCount = vehicles.filter(v => v.status === 'ON_TRIP').length;
 const maintCount = vehicles.filter(v => v.status === 'MAINTENANCE' || v.status === 'REPAIR').length;
 const expiringCount = vehicles.filter(v => getDaysUntilExpiry(v.registration_expiry) <= 30).length;

 // Filter logic
 const filtered = vehicles.filter(v => {
 const matchSearch = v.plate_number.toLowerCase().includes(search.toLowerCase()) || v.model_name.toLowerCase().includes(search.toLowerCase());
 if (!matchSearch) return false;
 if (statusFilter === 'ALL') return true;
 if (statusFilter === 'AVAILABLE') return v.status === 'AVAILABLE';
 if (statusFilter === 'ON_TRIP') return v.status === 'ON_TRIP';
 if (statusFilter === 'MAINTENANCE') return v.status === 'MAINTENANCE' || v.status === 'REPAIR';
 if (statusFilter === 'EXPIRING') return getDaysUntilExpiry(v.registration_expiry) <= 30;
 return true;
 });

 const filterChips: { key: StatusFilter; label: string; count: number; color: string }[] = [
 { key: 'ALL', label: 'Tất cả', count: totalVehicles, color: 'bg-slate-600' },
 { key: 'AVAILABLE', label: 'Sẵn sàng', count: availableCount, color: 'bg-emerald-600' },
 { key: 'ON_TRIP', label: 'Đang chạy', count: onTripCount, color: 'bg-blue-600' },
 { key: 'MAINTENANCE', label: 'Bảo dưỡng', count: maintCount, color: 'bg-amber-600' },
 { key: 'EXPIRING', label: 'Sắp hết hạn ĐK', count: expiringCount, color: 'bg-rose-600' },
 ];

 const statusBadge = (v: Vehicle) => {
 const cls = v.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
 : v.status === 'ON_TRIP' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
 : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
 return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cls}`}>{v.status_display || v.status}</span>;
 };

 const expiryLabel = (v: Vehicle) => {
 const days = getDaysUntilExpiry(v.registration_expiry);
 if (days <= 0) return <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />ĐÃ QUÁ HẠN</span>;
 if (days <= 30) return <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Còn {days} ngày</span>;
 return <span className="text-slate-600 dark:text-slate-400">{v.registration_expiry ? new Date(v.registration_expiry).toLocaleDateString('vi-VN') : '—'}</span>;
 };

 return (
 <div className="space-y-4 sm:space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
 <div>
 <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
 <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" /> Quản Lý Đội Xe (Vehicles)
 </h1>
 <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
 Theo dõi loại xe, tải trọng, năm SX, định mức nhiên liệu, hạn đăng kiểm và tài xế phụ trách.
 </p>
 </div>
 {canEdit && (
 <Button onClick={handleOpenCreate} className="w-full sm:w-auto !flex-row !inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap">
 <Plus className="w-4 h-4" /> Thêm Xe Mới
 </Button>
 )}
 </div>

 {/* NEW: Quick Stats Cards */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
 <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
 <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tổng số xe</p>
 <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">{totalVehicles}</p>
 </div>
 <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900 shadow-xs">
 <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">Đang chạy</p>
 <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{onTripCount}</p>
 </div>
 <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900 shadow-xs">
 <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Sẵn sàng</p>
 <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{availableCount}</p>
 </div>
 <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900 shadow-xs">
 <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">Bảo dưỡng</p>
 <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{maintCount}</p>
 </div>
 </div>

 {/* Search bar */}
 <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
 <Search className="w-4 h-4 text-slate-400 shrink-0" />
 <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo biển số, model xe..." className="bg-transparent text-xs w-full focus:outline-none text-slate-900 dark:text-slate-100" />
 </div>

 {/* NEW: Filter Chips */}
 <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
 {filterChips.map(chip => (
 <button
 key={chip.key}
 onClick={() => setStatusFilter(chip.key)}
 className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
 statusFilter === chip.key
 ? `${chip.color} text-white shadow-md`
 : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
 }`}
 >
 {chip.label}
 <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusFilter === chip.key ? 'bg-white/25' : 'bg-slate-200 dark:bg-slate-700'}`}>{chip.count}</span>
 </button>
 ))}
 </div>

 {/* Mobile Card View */}
 <div className="block md:hidden space-y-3">
 {filtered.map((v) => {
 const isOnTrip = v.status === 'ON_TRIP';
 return (
 <div key={v.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
 <div className="flex items-start justify-between">
 <div>
 <span className="font-black text-base text-blue-600 dark:text-blue-400">{v.plate_number}</span>
 <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{v.model_name} <span className="text-slate-400 font-normal">({v.brand})</span></p>
 </div>
 {statusBadge(v)}
 </div>

 {/* NEW: Tài xế phụ trách */}
 <div className="flex items-center gap-1.5 text-xs">
 <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
 {v.current_driver_name
 ? <span className="text-blue-600 dark:text-blue-400 font-semibold">TX: {v.current_driver_name} <span className="text-[10px] text-slate-400">({v.active_trip_code})</span></span>
 : <span className="text-slate-400 italic">Chưa phân công tài xế</span>
 }
 </div>

 <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
 <div>Loại: <strong className="text-slate-800 dark:text-slate-200">{v.vehicle_type_display || v.vehicle_type}</strong></div>
 <div>Tải: <strong className="text-slate-800 dark:text-slate-200">{v.payload_capacity}T</strong></div>
 <div>Năm SX: <strong className="text-slate-800 dark:text-slate-200">{v.manufacture_year}</strong></div>
 <div>NL: <strong className="text-amber-600">{v.fuel_consumption_rate} L/100km</strong></div>
 <div>ODO: <strong className="font-mono text-slate-800 dark:text-slate-200">{Number(v.odometer).toLocaleString('vi-VN')} km</strong></div>
 <div className="flex items-center gap-1">ĐK: {expiryLabel(v)}</div>
 </div>

 {/* NEW: Action buttons */}
 {canEdit && (
 <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 w-full">
 <button onClick={() => { setDetailVehicle(v); setIsDetailOpen(true); }} className="px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg flex items-center gap-1 font-semibold">
 <Eye className="w-3.5 h-3.5" /> Chi tiết
 </button>
 <button onClick={() => handleEdit(v)} className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1 font-semibold">
 <Pencil className="w-3.5 h-3.5" /> Sửa
 </button>
 <button
 onClick={() => handleDelete(v.id)}
 disabled={isOnTrip}
 title={isOnTrip ? 'Không thể xóa xe khi đang thực hiện chuyến đi' : 'Xóa phương tiện'}
 className={`px-2.5 py-1 text-xs rounded-lg flex items-center gap-1 font-semibold ${isOnTrip ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'}`}
 >
 <Trash2 className="w-3.5 h-3.5" /> Xóa
 </button>
 </div>
 )}
 </div>
 );
 })}
 {filtered.length === 0 && <div className="text-center text-xs text-slate-400 py-8">Không tìm thấy phương tiện nào phù hợp bộ lọc.</div>}
 </div>

 {/* Desktop Table */}
 <div className="hidden md:block rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
 <tr>
 <th className="py-3 px-4">Biển Số</th>
 <th className="py-3 px-4">Model / Hãng</th>
 <th className="py-3 px-4">Tài Xế Phụ Trách</th>
 <th className="py-3 px-4">Loại / Tải</th>
 <th className="py-3 px-4">ODO & Năm SX</th>
 <th className="py-3 px-4">Nhiên Liệu</th>
 <th className="py-3 px-4">Đăng Kiểm</th>
 <th className="py-3 px-4">Trạng Thái</th>
 {canEdit && <th className="py-3 px-4 text-right">Thao Tác</th>}
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
 {filtered.map((v) => {
 const isOnTrip = v.status === 'ON_TRIP';
 return (
 <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
 <td className="py-3.5 px-4 font-black text-blue-600 dark:text-blue-400">{v.plate_number}</td>
 <td className="py-3.5 px-4">
 <span className="font-semibold text-slate-800 dark:text-slate-200">{v.model_name}</span>
 <span className="text-[10px] text-slate-400 block">{v.brand}</span>
 </td>
 <td className="py-3.5 px-4">
 {v.current_driver_name
 ? <span className="text-blue-600 dark:text-blue-400 font-semibold">{v.current_driver_name}</span>
 : <span className="text-slate-400 italic">Chưa phân công</span>
 }
 </td>
 <td className="py-3.5 px-4">
 <span className="font-medium text-slate-700 dark:text-slate-300">{v.vehicle_type_display || v.vehicle_type}</span>
 <span className="text-[10px] text-slate-400 block">{v.payload_capacity}T</span>
 </td>
 <td className="py-3.5 px-4">
 <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{Number(v.odometer).toLocaleString('vi-VN')} km</span>
 <span className="text-[10px] text-slate-400 block">NSX: {v.manufacture_year}</span>
 </td>
 <td className="py-3.5 px-4 text-amber-600 font-bold">{v.fuel_consumption_rate} L/100km</td>
 <td className="py-3.5 px-4 text-xs">{expiryLabel(v)}</td>
 <td className="py-3.5 px-4">{statusBadge(v)}</td>
 {canEdit && (
 <td className="py-3.5 px-4 text-right">
 <div className="flex items-center justify-end gap-1">
 <button onClick={() => { setDetailVehicle(v); setIsDetailOpen(true); }} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors" title="Xem chi tiết hồ sơ xe"><Eye className="w-4 h-4" /></button>
 <button onClick={() => handleEdit(v)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Chỉnh sửa thông tin xe"><Pencil className="w-4 h-4" /></button>
 <button
 onClick={() => handleDelete(v.id)}
 disabled={isOnTrip}
 title={isOnTrip ? 'Không thể xóa xe khi đang thực hiện chuyến đi' : 'Xóa phương tiện'}
 className={`p-1.5 rounded-lg transition-colors ${isOnTrip ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'}`}
 ><Trash2 className="w-4 h-4" /></button>
 </div>
 </td>
 )}
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>

 {/* Modal Thêm / Sửa Xe */}
 <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingVehicle(null); }} title={editingVehicle ? `Chỉnh Sửa: ${editingVehicle.plate_number}` : 'Thêm Phương Tiện Mới'}>
 <form onSubmit={editingVehicle ? handleUpdate : handleCreate} className="space-y-4">
 <Input label="Biển kiểm soát *" value={form.plate_number} onChange={(e) => setForm({ ...form, plate_number: e.target.value })} placeholder="VD: 29H-999.88" required />
 <Input label="Model xe & Thương hiệu *" value={form.model_name} onChange={(e) => setForm({ ...form, model_name: e.target.value })} placeholder="VD: Hino 500 Series FL" required />
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Loại xe *</label>
 <select value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })} className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
 <option value="TRUCK">Xe tải</option><option value="PASSENGER">Xe khách</option><option value="CAR">Xe con (4-7 chỗ)</option><option value="CONTAINER">Xe đầu kéo container</option><option value="VAN">Xe van giao hàng</option>
 </select>
 </div>
 <Input label="Tải trọng (tấn) *" type="number" step="0.1" value={form.payload_capacity} onChange={(e) => setForm({ ...form, payload_capacity: parseFloat(e.target.value) || 0 })} />
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Input label="Năm sản xuất *" type="number" value={form.manufacture_year} onChange={(e) => setForm({ ...form, manufacture_year: parseInt(e.target.value) || 2022 })} placeholder="VD: 2023" />
 <Input label="Định mức NL (L/100km) *" type="number" step="0.1" value={form.fuel_consumption_rate} onChange={(e) => setForm({ ...form, fuel_consumption_rate: parseFloat(e.target.value) || 12 })} />
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Input label="Chỉ số ODO (km)" type="number" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: parseInt(e.target.value) || 0 })} />
 <div>
 <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Trạng thái xe</label>
 <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
 <option value="AVAILABLE">Đang rảnh / Sẵn sàng</option><option value="ON_TRIP">Đang lái / Chạy chuyến</option><option value="MAINTENANCE">Đang bảo dưỡng</option><option value="INACTIVE">Ngưng hoạt động</option>
 </select>
 </div>
 </div>
 <div className="pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2 w-full">
 <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => { setIsModalOpen(false); setEditingVehicle(null); }}>Hủy</Button>
 <Button type="submit" className="w-full sm:w-auto">{editingVehicle ? 'Lưu Thay Đổi' : 'Lưu Phương Tiện'}</Button>
 </div>
 </form>
 </Modal>

 {/* NEW: Modal Chi tiết Hồ sơ Xe */}
 <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={`Hồ Sơ Xe: ${detailVehicle?.plate_number || ''}`} maxWidth="lg">
 {detailVehicle && (
 <div className="space-y-4">
 <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent border border-blue-200/50 dark:border-blue-900/50">
 <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0"><Truck className="w-7 h-7 text-blue-600" /></div>
 <div className="min-w-0 flex-1">
 <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">{detailVehicle.plate_number}</h3>
 <p className="text-xs text-slate-500">{detailVehicle.model_name} ({detailVehicle.brand}) - {detailVehicle.vehicle_type_display}</p>
 <div className="mt-1 flex items-center gap-2">{statusBadge(detailVehicle)}</div>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-2.5 text-xs">
 {[
 ['Tải trọng thiết kế', `${detailVehicle.payload_capacity} tấn`],
 ['Năm sản xuất', `${detailVehicle.manufacture_year}`],
 ['Định mức nhiên liệu', `${detailVehicle.fuel_consumption_rate} L/100km`],
 ['Loại nhiên liệu', detailVehicle.fuel_type],
 ['Chỉ số ODO', `${Number(detailVehicle.odometer).toLocaleString('vi-VN')} km`],
 ['Hạn đăng kiểm', detailVehicle.registration_expiry ? new Date(detailVehicle.registration_expiry).toLocaleDateString('vi-VN') : '—'],
 ['Hạn bảo hiểm', detailVehicle.insurance_expiry ? new Date(detailVehicle.insurance_expiry).toLocaleDateString('vi-VN') : '—'],
 ['Tài xế phụ trách', detailVehicle.current_driver_name || 'Chưa phân công'],
 ].map(([label, val], i) => (
 <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
 <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{label}</span>
 <strong className="text-slate-900 dark:text-slate-100">{val}</strong>
 </div>
 ))}
 </div>

 {getDaysUntilExpiry(detailVehicle.registration_expiry) <= 30 && (
 <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
 <AlertTriangle className="w-4 h-4 shrink-0" />
 <span><strong>Cảnh báo:</strong> Hạn đăng kiểm xe còn dưới 30 ngày hoặc đã quá hạn. Cần liên hệ phòng kỹ thuật để bố trí đưa xe đi đăng kiểm.</span>
 </div>
 )}

 <div className="pt-3 flex justify-end">
 <button onClick={() => setIsDetailOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors">Đóng hồ sơ</button>
 </div>
 </div>
 )}
 </Modal>
 </div>
 );
};

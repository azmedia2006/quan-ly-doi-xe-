// UPDATE: Nâng cấp toàn diện Lệnh Điều Xe - Stats, Filters, Trip Stepper, P&L, Customer & Payload %, Live Tracking, Actions
import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Search, Trash2, ArrowRight, MapPin, Route, Users, ShieldAlert, CheckCircle, Clock, DollarSign, TrendingUp, Truck, Navigation, ReceiptText } from 'lucide-react';
import api from '../services/api';
import { TripSchedule, Vehicle, Driver } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type ScheduleFilter = 'ALL' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';

export const SchedulesPage: React.FC = () => {
 const { user } = useAuth();
 const navigate = useNavigate();
 const [schedules, setSchedules] = useState<TripSchedule[]>([]);
 const [vehicles, setVehicles] = useState<Vehicle[]>([]);
 const [drivers, setDrivers] = useState<Driver[]>([]);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [search, setSearch] = useState('');
 const [filter, setFilter] = useState<ScheduleFilter>('ALL');
 const [trackingModal, setTrackingModal] = useState<TripSchedule | null>(null);
 const [completeModal, setCompleteModal] = useState<TripSchedule | null>(null);
 const [endOdo, setEndOdo] = useState<number>(0);

 const canDispatch = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' || user?.role === 'DISPATCHER';

 const [form, setForm] = useState({
 trip_code: '',
 customer_name: 'Tập Đoàn Thép Hòa Phát',
 vehicle: 0,
 driver: 0,
 origin: '',
 destination: '',
 route_details: '',
 cargo_or_passenger_info: '',
 cargo_weight: 5.0,
 revenue: 5000000,
 estimated_cost: 2500000,
 departure_time: new Date().toISOString().slice(0, 16),
 distance_km: 100,
 status: 'PLANNED',
 });
 const { success, error } = useToast();

 const generateTripCode = () => {
 const num = Math.floor(100 + Math.random() * 900);
 return `DISPATCH-${new Date().getFullYear()}-${num}`;
 };

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

 const availV = vList.filter(v => v.status === 'AVAILABLE');
 const availD = dList.filter(d => d.status === 'AVAILABLE');
 setForm(prev => ({
 ...prev,
 trip_code: generateTripCode(),
 vehicle: availV[0]?.id || vList[0]?.id || 0,
 driver: availD[0]?.id || dList[0]?.id || 0,
 }));
 } catch (e) {
 console.error(e);
 }
 };

 useEffect(() => { fetchData(); }, []);

 const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE');
 const availableDrivers = drivers.filter(d => d.status === 'AVAILABLE');

 const handleCreate = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!form.vehicle || !form.driver) {
 error('Thiếu thông tin', 'Vui lòng chọn xe và tài xế đang rảnh!');
 return;
 }
 try {
 await api.post('/schedules/', form);
 success('Lập lệnh điều xe thành công!', 'Xe và tài xế đã chuyển sang trạng thái Đang lái.');
 setIsModalOpen(false);
 fetchData();
 } catch (err: any) {
 const msg = err.response?.data?.vehicle?.[0] || err.response?.data?.driver?.[0] || 'Lỗi khi lập lệnh';
 error('Lỗi khi lập lệnh', msg);
 }
 };

 const handleCompleteTrip = async () => {
 if (!completeModal) return;
 try {
 await api.post(`/schedules/${completeModal.id}/complete/`, { end_odometer: endOdo });
 success('Chuyến đi đã hoàn tất!', 'Phương tiện và tài xế đã được hoàn trả về trạng thái Sẵn sàng.');
 setCompleteModal(null);
 fetchData();
 } catch (err: any) {
 error('Lỗi hoàn tất chuyến');
 }
 };

 const handleDelete = async (id: number) => {
 if (!window.confirm('Hủy lệnh điều xe này? Xe và tài xế sẽ được hoàn trả về trạng thái rảnh.')) return;
 try {
 await api.delete(`/schedules/${id}/`);
 success('Đã hủy lệnh điều xe');
 fetchData();
 } catch {
 error('Lỗi hủy lệnh');
 }
 };

 // Stats
 const totalTrips = schedules.length;
 const enRouteCount = schedules.filter(s => s.status === 'DISPATCHED' || s.status === 'PLANNED').length;
 const completedCount = schedules.filter(s => s.status === 'COMPLETED').length;
 const cancelledCount = schedules.filter(s => s.status === 'CANCELLED').length;

 const filtered = schedules.filter(s => {
 const q = search.toLowerCase();
 const ms = !q || s.trip_code.toLowerCase().includes(q) || s.origin.toLowerCase().includes(q) || s.destination.toLowerCase().includes(q) || (s.customer_name || '').toLowerCase().includes(q) || (s.vehicle_plate || '').toLowerCase().includes(q) || (s.driver_name || '').toLowerCase().includes(q);
 if (!ms) return false;
 if (filter === 'ALL') return true;
 if (filter === 'DISPATCHED') return s.status === 'DISPATCHED' || s.status === 'PLANNED';
 if (filter === 'COMPLETED') return s.status === 'COMPLETED';
 if (filter === 'CANCELLED') return s.status === 'CANCELLED';
 return true;
 });

 const tripSteps = ['ASSIGNED', 'LOADED', 'EN_ROUTE', 'ARRIVED', 'SIGNED'];
 const stepLabels: Record<string, string> = { ASSIGNED: 'Gán xe', LOADED: 'Bốc hàng', EN_ROUTE: 'Trên đường', ARRIVED: 'Đến nơi', SIGNED: 'Ký nhận' };
 const getStepIndex = (step?: string) => tripSteps.indexOf(step || 'EN_ROUTE');

 const statsCards = [
 { label: 'Tổng số chuyến', value: totalTrips, icon: CalendarDays, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
 { label: 'Đang trên đường', value: enRouteCount, icon: Truck, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
 { label: 'Đã hoàn tất', value: completedCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
 { label: 'Đã hủy', value: cancelledCount, icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40' },
 ];

 const filterChips: { key: ScheduleFilter; label: string; count: number }[] = [
 { key: 'ALL', label: 'Tất cả', count: totalTrips },
 { key: 'DISPATCHED', label: ' Đang thực hiện', count: enRouteCount },
 { key: 'COMPLETED', label: ' Đã hoàn tất', count: completedCount },
 { key: 'CANCELLED', label: ' Đã hủy', count: cancelledCount },
 ];

 return (
 <div className="space-y-4 sm:space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
 <div>
 <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
 <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" /> Điều Phối & Lệnh Điều Xe (Dispatch & Trips)
 </h1>
 <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
 Gán xe & tài xế rảnh, lộ trình, tải trọng an toàn, tiến độ chuyến đi và hiệu quả tài chính.
 </p>
 </div>
 {canDispatch && (
 <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto !flex-row !inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap">
 <Plus className="w-4 h-4" /> Lập Lệnh Điều Xe
 </Button>
 )}
 </div>

 {/* Stats */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
 {statsCards.map(s => (
 <div key={s.label} className={`${s.bg} rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 border border-white/60 dark:border-slate-800`}>
 <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-white/70 dark:bg-slate-800/60 shrink-0">
 <s.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${s.color}`} />
 </div>
 <div className="min-w-0">
 <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 leading-none">{s.value}</p>
 <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{s.label}</p>
 </div>
 </div>
 ))}
 </div>

 {/* Search */}
 <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
 <Search className="w-4 h-4 text-slate-400 shrink-0" />
 <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo biển số, mã chuyến, khách hàng, điểm đến..." className="bg-transparent text-xs w-full focus:outline-none text-slate-900 dark:text-slate-100" />
 </div>

 {/* Filter Chips */}
 <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
 {filterChips.map(c => (
 <button key={c.key} onClick={() => setFilter(c.key)} className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all border shrink-0 ${filter === c.key ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-200 dark:shadow-amber-900/40' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
 {c.label}
 <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${filter === c.key ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>{c.count}</span>
 </button>
 ))}
 </div>

 {/* Cards */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
 {filtered.map(s => {
 const isDone = s.status === 'COMPLETED';
 const isCancel = s.status === 'CANCELLED';
 const stepIdx = isDone ? 4 : getStepIndex(s.trip_step);
 const maxPayload = Number(s.vehicle_payload_capacity) || 10;
 const cargoWeight = Number(s.cargo_weight) || 0;
 const payloadPercent = maxPayload > 0 ? Math.min(100, Math.round((cargoWeight / maxPayload) * 100)) : 0;
 const revenue = Number(s.revenue || 0);
 const cost = Number(s.estimated_cost || 0);
 const profit = revenue - cost;

 return (
 <div key={s.id} className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs flex flex-col justify-between ${s.status === 'DISPATCHED' ? 'border-amber-300 dark:border-amber-800' : 'border-slate-200 dark:border-slate-800'}`}>
 <div>
 {/* Header */}
 <div className="flex items-start justify-between gap-2">
 <div className="min-w-0">
 <div className="flex items-center gap-2">
 <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">{s.trip_code}</span>
 <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold truncate max-w-[150px]">{s.customer_name || 'Khách hàng'}</span>
 </div>
 <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{s.vehicle_plate} <span className="text-slate-400 font-normal text-xs">• {s.vehicle_model}</span></h3>
 </div>
 <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${isDone ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : isCancel ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'}`}>
 {s.status_display || s.status}
 </span>
 </div>

 {/* Stepper */}
 <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
 <div className="flex items-center justify-between gap-0.5">
 {tripSteps.map((step, idx) => (
 <React.Fragment key={step}>
 <div className={`flex flex-col items-center gap-0.5 min-w-0 ${idx <= stepIdx ? 'text-amber-600 dark:text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}>
 <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${idx <= stepIdx ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
 {idx < stepIdx || isDone ? '' : idx + 1}
 </div>
 <span className="text-[8px] sm:text-[9px] font-semibold text-center leading-tight">{stepLabels[step]}</span>
 </div>
 {idx < tripSteps.length - 1 && (
 <div className={`flex-1 h-0.5 rounded ${idx < stepIdx ? 'bg-amber-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
 )}
 </React.Fragment>
 ))}
 </div>
 </div>

 {/* Route & Cargo */}
 <div className="mt-3 space-y-1.5 text-xs border-t border-slate-100 dark:border-slate-800 pt-2.5">
 <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
 <span className="text-emerald-600 shrink-0">●</span> <span className="truncate">{s.origin}</span>
 <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
 <span className="text-rose-600 shrink-0">●</span> <span className="truncate">{s.destination}</span>
 </div>
 {s.route_details && <p className="text-[11px] text-slate-500 truncate">Lộ trình: {s.route_details}</p>}

 <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
 <div>Tài xế: <strong className="text-slate-800 dark:text-slate-200">{s.driver_name}</strong> {s.driver_phone && <span className="text-slate-400">({s.driver_phone})</span>}</div>
 <div>Cự ly: <strong className="text-slate-800 dark:text-slate-200">{s.distance_km} km</strong></div>
 </div>

 {/* Payload safety bar */}
 <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
 <div className="flex justify-between text-[11px]">
 <span className="text-slate-500">Hàng hóa: <strong>{s.cargo_or_passenger_info}</strong></span>
 <span className="font-bold text-slate-700 dark:text-slate-300">{cargoWeight > 0 ? `${cargoWeight.toFixed(2)}T / ${maxPayload.toFixed(2)}T (${payloadPercent}%)` : 'Xe khách/hành khách'}</span>
 </div>
 {cargoWeight > 0 && (
 <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
 <div className={`h-full rounded-full ${payloadPercent > 90 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${payloadPercent}%` }} />
 </div>
 )}
 </div>

 {/* Trip P&L Box */}
 {revenue > 0 && (
 <div className="grid grid-cols-3 gap-1 p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-[10px]">
 <div><span className="text-slate-400 block">Cước thu:</span><strong className="text-slate-800 dark:text-slate-200 text-[11px]">{revenue.toLocaleString('vi-VN')}₫</strong></div>
 <div><span className="text-slate-400 block">Chi phí ước:</span><strong className="text-amber-700 dark:text-amber-400 text-[11px]">{cost.toLocaleString('vi-VN')}₫</strong></div>
 <div><span className="text-slate-400 block">Lợi nhuận gộp:</span><strong className="text-emerald-700 dark:text-emerald-300 text-[11px]">+{profit.toLocaleString('vi-VN')}₫</strong></div>
 </div>
 )}
 </div>
 </div>

 {/* Actions */}
 {canDispatch && (
 <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 w-full flex-wrap">
 <button onClick={() => setTrackingModal(s)} className="px-2 py-1 text-[11px] text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg flex items-center gap-1 font-semibold">
 <Navigation className="w-3 h-3" /> Live Tracking
 </button>
 <div className="flex items-center gap-1 ml-auto">
 {!isDone && !isCancel && (
 <button onClick={() => { setCompleteModal(s); setEndOdo(s.start_odometer ? s.start_odometer + s.distance_km : 50000); }} className="px-2 py-1 text-[11px] text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg flex items-center gap-1 font-semibold">
 <CheckCircle className="w-3 h-3" /> Hoàn tất
 </button>
 )}
 <button onClick={() => navigate('/expenses')} className="px-2 py-1 text-[11px] text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg flex items-center gap-1 font-semibold">
 <ReceiptText className="w-3 h-3" /> Chi phí
 </button>
 {!isDone && (
 <button onClick={() => handleDelete(s.id)} className="px-2 py-1 text-[11px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-1 font-semibold">
 <Trash2 className="w-3 h-3" /> Hủy lệnh
 </button>
 )}
 </div>
 </div>
 )}
 </div>);
 })}
 </div>

 {filtered.length === 0 && (
 <div className="text-center py-12 text-slate-400">
 <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
 <p className="text-sm">Không tìm thấy chuyến đi nào.</p>
 </div>
 )}

 {/* Live Tracking Modal */}
 <Modal isOpen={!!trackingModal} onClose={() => setTrackingModal(null)} title={`️ Live Tracking: ${trackingModal?.trip_code}`}>
 <div className="space-y-3">
 <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
 <div>
 <p className="text-xs text-slate-400">Phương tiện đang giám sát:</p>
 <p className="text-base font-bold text-amber-400">{trackingModal?.vehicle_plate} - {trackingModal?.vehicle_model}</p>
 </div>
 <div className="text-right">
 <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">● GPS Online</span>
 <p className="text-[11px] text-slate-400 mt-1">Tốc độ: 64 km/h</p>
 </div>
 </div>
 <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
 <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
 <div className="relative z-10 text-center space-y-1">
 <Truck className="w-10 h-10 text-amber-500 mx-auto animate-bounce" />
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{trackingModal?.origin} {trackingModal?.destination}</p>
 <p className="text-[11px] text-slate-500">Tọa độ: 20.9812° N, 105.8642° E (QL1A)</p>
 </div>
 </div>
 <Button variant="outline" className="w-full" onClick={() => setTrackingModal(null)}>Đóng bản đồ</Button>
 </div>
 </Modal>

 {/* Complete Trip Modal */}
 <Modal isOpen={!!completeModal} onClose={() => setCompleteModal(null)} title=" Xác nhận Hoàn tất Chuyến Đi">
 <div className="space-y-4">
 <p className="text-xs text-slate-600 dark:text-slate-400">
 Xác nhận hoàn thành lệnh điều xe <strong>{completeModal?.trip_code}</strong>. Phương tiện và tài xế sẽ được tự động giải phóng về trạng thái <strong>Sẵn sàng</strong>.
 </p>
 <Input label="Số ODO về đích (km) *" type="number" value={endOdo} onChange={e => setEndOdo(parseInt(e.target.value) || 0)} required />
 <div className="flex justify-end gap-2">
 <Button variant="outline" onClick={() => setCompleteModal(null)}>Hủy</Button>
 <Button onClick={handleCompleteTrip}>Xác nhận Hoàn tất</Button>
 </div>
 </div>
 </Modal>

 {/* Create Modal */}
 <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Lập Lệnh Điều Xe Mới">
 <form onSubmit={handleCreate} className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Input label="Mã lệnh điều xe *" value={form.trip_code} onChange={e => setForm({ ...form, trip_code: e.target.value })} required />
 <Input label="Khách hàng / Chủ hàng *" value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} required />
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Phương tiện (Chỉ xe Rảnh) *</label>
 <select value={form.vehicle} onChange={e => setForm({ ...form, vehicle: parseInt(e.target.value) })} className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" required>
 <option value={0}>-- Chọn xe khả dụng --</option>
 {availableVehicles.map(v => (<option key={v.id} value={v.id}>{v.plate_number} ({v.model_name} - {v.payload_capacity}T)</option>))}
 </select>
 </div>
 <div>
 <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tài xế (Chỉ TX Rảnh) *</label>
 <select value={form.driver} onChange={e => setForm({ ...form, driver: parseInt(e.target.value) })} className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" required>
 <option value={0}>-- Chọn tài xế khả dụng --</option>
 {availableDrivers.map(d => (<option key={d.id} value={d.id}>{d.full_name} ({d.driver_code} - Hạng {d.license_class})</option>))}
 </select>
 </div>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Input label="Điểm xuất phát *" value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} required />
 <Input label="Điểm đến *" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} required />
 </div>
 <Input label="Lộ trình chi tiết" value={form.route_details} onChange={e => setForm({ ...form, route_details: e.target.value })} placeholder="VD: QL1A -> Cao tốc Hải Phòng" />
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Input label="Hàng hóa / Hành khách *" value={form.cargo_or_passenger_info} onChange={e => setForm({ ...form, cargo_or_passenger_info: e.target.value })} required />
 <Input label="Khối lượng hàng (Tấn)" type="number" step="0.1" value={form.cargo_weight} onChange={e => setForm({ ...form, cargo_weight: parseFloat(e.target.value) || 0 })} />
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Input label="Cước thu dự kiến (VNĐ)" type="number" value={form.revenue} onChange={e => setForm({ ...form, revenue: parseFloat(e.target.value) || 0 })} />
 <Input label="Chi phí ước tính (VNĐ)" type="number" value={form.estimated_cost} onChange={e => setForm({ ...form, estimated_cost: parseFloat(e.target.value) || 0 })} />
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Input label="Thời gian khởi hành *" type="datetime-local" value={form.departure_time} onChange={e => setForm({ ...form, departure_time: e.target.value })} required />
 <Input label="Cự ly dự kiến (km) *" type="number" value={form.distance_km} onChange={e => setForm({ ...form, distance_km: parseFloat(e.target.value) || 0 })} required />
 </div>
 <div className="pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2 w-full">
 <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setIsModalOpen(false)}>Hủy</Button>
 <Button type="submit" className="w-full sm:w-auto">Ký Lệnh & Xuất Bến</Button>
 </div>
 </form>
 </Modal>
 </div>
 );
};

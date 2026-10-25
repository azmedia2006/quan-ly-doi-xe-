// UPDATE: Nâng cấp toàn diện Incidents - Stats, Filters, Claims Stepper, Insurance Details, Attachments, Actions
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Search, Trash2, Pencil, Wrench, DollarSign, Clock, CheckCircle, Shield, Paperclip, Phone, MapPin, Image, UploadCloud, X, FileText } from 'lucide-react';
import api from '../services/api';
import { Incident, Vehicle, Driver } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type IncFilter = 'ALL' | 'HIGH' | 'INSURANCE_PENDING' | 'RESOLVED';

export const IncidentsPage: React.FC = () => {
 const { user } = useAuth();
 const navigate = useNavigate();
 const [incidents, setIncidents] = useState<Incident[]>([]);
 const [vehicles, setVehicles] = useState<Vehicle[]>([]);
 const [drivers, setDrivers] = useState<Driver[]>([]);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [search, setSearch] = useState('');
 const [filter, setFilter] = useState<IncFilter>('ALL');
 const [editingInc, setEditingInc] = useState<Incident | null>(null);
 const [photoModal, setPhotoModal] = useState<string[] | null>(null);
 const [form, setForm] = useState({ incident_code: '', vehicle: 0, driver: 0, incident_date: new Date().toISOString().slice(0, 16), location: '', severity: 'LOW', description: '', insurance_company: 'Bảo Việt', insurance_policy_number: '', insurance_claim_amount: 0, deductible_amount: 0, claim_percentage: 90, needs_towing: false, status: 'REPORTED', evidence_images: '' });
 const [imageUrls, setImageUrls] = useState<string[]>([]);
 const { success, error } = useToast();

 const fetchData = async () => { try { const [i, v, d] = await Promise.all([api.get('/incidents/'), api.get('/vehicles/'), api.get('/drivers/')]); setIncidents(i.data.results || i.data || []); const vl = v.data.results || v.data || []; const dl = d.data.results || d.data || []; setVehicles(vl); setDrivers(dl); if (vl.length > 0) setForm(p => ({ ...p, vehicle: p.vehicle || vl[0].id })); if (dl.length > 0) setForm(p => ({ ...p, driver: p.driver || dl[0].id })); } catch (e) { console.error(e); } };
 useEffect(() => { fetchData(); }, []);

 const resetForm = () => {
   setForm({
     incident_code: `INC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
     vehicle: vehicles[0]?.id || 0,
     driver: drivers[0]?.id || 0,
     incident_date: new Date().toISOString().slice(0, 16),
     location: '',
     severity: 'LOW',
     description: '',
     insurance_company: 'Bảo Việt',
     insurance_policy_number: '',
     insurance_claim_amount: 0,
     deductible_amount: 0,
     claim_percentage: 90,
     needs_towing: false,
     status: 'REPORTED',
     evidence_images: '',
   });
   setImageUrls([]);
 };
 const handleOpenCreate = () => { setEditingInc(null); resetForm(); setIsModalOpen(true); };
 const handleEdit = (inc: Incident) => {
   setEditingInc(inc);
   const existingImgs = inc.evidence_images ? inc.evidence_images.split(',').map(s => s.trim()).filter(Boolean) : [];
   setImageUrls(existingImgs);
   setForm({
     incident_code: inc.incident_code,
     vehicle: inc.vehicle,
     driver: inc.driver || 0,
     incident_date: inc.incident_date?.slice(0, 16) || '',
     location: inc.location,
     severity: inc.severity,
     description: inc.description,
     insurance_company: inc.insurance_company || 'Bảo Việt',
     insurance_policy_number: inc.insurance_policy_number || '',
     insurance_claim_amount: Number(inc.insurance_claim_amount),
     deductible_amount: Number(inc.deductible_amount || 0),
     claim_percentage: inc.claim_percentage || 90,
     needs_towing: inc.needs_towing || false,
     status: inc.status,
     evidence_images: inc.evidence_images || '',
   });
   setIsModalOpen(true);
 };
 
 const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
   const files = e.target.files;
   if (!files || files.length === 0) return;

   Array.from(files).forEach(file => {
     const reader = new FileReader();
     reader.onloadend = () => {
       if (reader.result) {
         setImageUrls(prev => {
           const updated = [...prev, reader.result as string];
           setForm(f => ({ ...f, evidence_images: updated.join(',') }));
           return updated;
         });
       }
     };
     reader.readAsDataURL(file);
   });
 };

 const handleRemoveImage = (indexToRemove: number) => {
   setImageUrls(prev => {
     const updated = prev.filter((_, idx) => idx !== indexToRemove);
     setForm(f => ({ ...f, evidence_images: updated.join(',') }));
     return updated;
   });
 };

 const handleCreate = async (e: React.FormEvent) => { e.preventDefault(); try { await api.post('/incidents/', form); success('Báo cáo sự cố thành công!'); setIsModalOpen(false); fetchData(); } catch { error('Lỗi lưu sự cố'); } };
 const handleUpdate = async (e: React.FormEvent) => { e.preventDefault(); if (!editingInc) return; try { await api.put(`/incidents/${editingInc.id}/`, form); success('Cập nhật sự cố thành công!'); setIsModalOpen(false); setEditingInc(null); fetchData(); } catch { error('Lỗi cập nhật'); } };
 const handleDelete = async (id: number) => { if (!window.confirm('Xóa bản ghi sự cố này?')) return; try { await api.delete(`/incidents/${id}/`); success('Đã xóa sự cố'); fetchData(); } catch { error('Lỗi xóa sự cố'); } };

 const canEdit = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' || user?.role === 'DISPATCHER' || user?.role === 'ACCOUNTANT';

 // Stats
 const totalInc = incidents.length;
 const processingCount = incidents.filter(i => i.status === 'PROCESSING' || i.status === 'REPORTED').length;
 const insuranceCount = incidents.filter(i => i.status === 'INSURANCE_PENDING').length;
 const resolvedCount = incidents.filter(i => i.status === 'RESOLVED').length;
 const totalClaims = incidents.reduce((s, i) => s + Number(i.insurance_claim_amount || 0), 0);

 const filtered = incidents.filter(i => {
 const q = search.toLowerCase();
 const ms = !q || (i.vehicle_plate || '').toLowerCase().includes(q) || i.incident_code.toLowerCase().includes(q) || (i.driver_name || '').toLowerCase().includes(q) || i.location.toLowerCase().includes(q);
 if (!ms) return false;
 if (filter === 'ALL') return true;
 if (filter === 'HIGH') return i.severity === 'HIGH';
 if (filter === 'INSURANCE_PENDING') return i.status === 'INSURANCE_PENDING';
 if (filter === 'RESOLVED') return i.status === 'RESOLVED';
 return true;
 });

 const claimSteps = ['RECEIVE', 'SURVEY', 'APPROVE', 'DISBURSED'];
 const claimLabels: Record<string, string> = { RECEIVE: 'Tiếp nhận', SURVEY: 'Giám định', APPROVE: 'Duyệt giá', DISBURSED: 'Quyết toán' };
 const getStepIndex = (step?: string) => claimSteps.indexOf(step || 'RECEIVE');

 const getSeverityBadge = (s: string) => s === 'HIGH' ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"> Nghiêm trọng</span> : s === 'MEDIUM' ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"> Trung bình</span> : <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"> Nhẹ</span>;
 const getStatusBadge = (s: string) => { if (s === 'RESOLVED') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-0.5"><CheckCircle className="w-2.5 h-2.5" /> Đã giải quyết</span>; if (s === 'INSURANCE_PENDING') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> Chờ duyệt BH</span>; if (s === 'PROCESSING') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> Đang xử lý</span>; return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">Mới tiếp nhận</span>; };

 const statsCards = [
 { label: 'Tổng sự cố', value: totalInc, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40' },
 { label: 'Đang xử lý', value: processingCount, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40' },
 { label: 'Chờ duyệt BH', value: insuranceCount, icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
 { label: 'Đã quyết toán', value: resolvedCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
 ];
 const filterChips: { key: IncFilter; label: string; count: number }[] = [
 { key: 'ALL', label: 'Tất cả', count: totalInc },
 { key: 'HIGH', label: ' Nghiêm trọng', count: incidents.filter(i => i.severity === 'HIGH').length },
 { key: 'INSURANCE_PENDING', label: ' Chờ duyệt BH', count: insuranceCount },
 { key: 'RESOLVED', label: ' Đã giải quyết', count: resolvedCount },
 ];

 return (
 <div className="space-y-4 sm:space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
 <div>
 <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
 <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" /> Sự Cố & Bảo Hiểm (Incidents)
 </h1>
 <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">Ghi nhận va quẹt, tai nạn, cứu hộ trên đường và thẩm định bồi thường.</p>
 </div>
 <Button onClick={handleOpenCreate} className="w-full sm:w-auto !flex-row !inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap"><Plus className="w-4 h-4" /> Khai Báo Sự Cố</Button>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
 {statsCards.map(s => (<div key={s.label} className={`${s.bg} rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 border border-white/60 dark:border-slate-800`}><div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-white/70 dark:bg-slate-800/60 shrink-0"><s.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${s.color}`} /></div><div className="min-w-0"><p className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 leading-none">{s.value}</p><p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{s.label}</p></div></div>))}
 </div>

 {/* Search */}
 <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
 <Search className="w-4 h-4 text-slate-400 shrink-0" /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo biển số xe, mã sự cố, tài xế, địa điểm..." className="bg-transparent text-xs w-full focus:outline-none text-slate-900 dark:text-slate-100" />
 </div>

 {/* Filter Chips */}
 <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
 {filterChips.map(c => (<button key={c.key} onClick={() => setFilter(c.key)} className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all border shrink-0 ${filter === c.key ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-200 dark:shadow-rose-900/40' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{c.label}<span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${filter === c.key ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>{c.count}</span></button>))}
 </div>

 {/* Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
 {filtered.map(inc => {
 const isResolved = inc.status === 'RESOLVED';
 const imgs = inc.evidence_images ? inc.evidence_images.split(',').map(s => s.trim()).filter(Boolean) : [];
 const stepIdx = getStepIndex(inc.claim_step);
 return (
 <div key={inc.id} className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs flex flex-col justify-between ${inc.severity === 'HIGH' ? 'border-rose-300 dark:border-rose-800' : 'border-slate-200 dark:border-slate-800'}`}>
 <div>
 {/* Header */}
 <div className="flex items-start justify-between gap-2">
 <div className="min-w-0">
 <h3 className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">{inc.incident_code}</h3>
 <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">{inc.vehicle_plate} <span className="text-slate-400 font-normal text-[11px]">• {inc.vehicle_model}</span></p>
 </div>
 <div className="flex flex-col items-end gap-1 shrink-0">{getSeverityBadge(inc.severity)}{getStatusBadge(inc.status)}{inc.needs_towing && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"> Cần cứu hộ</span>}</div>
 </div>

 <div className="mt-3 space-y-1.5 text-xs border-t border-slate-100 dark:border-slate-800 pt-2.5">
 <div className="flex items-center gap-1 text-slate-500"><MapPin className="w-3 h-3" />{inc.location}</div>
 <div className="text-[11px] text-slate-400"> Thời gian: {inc.incident_date ? new Date(inc.incident_date).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}</div>
 <p className="text-slate-600 dark:text-slate-400 line-clamp-2">{inc.description}</p>
 {inc.driver_name && <div className="text-[11px] text-slate-500">Tài xế: <strong className="text-slate-800 dark:text-slate-200">{inc.driver_name}</strong></div>}

 {/* Claims Stepper */}
 <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
 <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Tiến trình bồi thường</p>
 <div className="flex items-center justify-between gap-0.5">
 {claimSteps.map((step, idx) => (<React.Fragment key={step}>
 <div className={`flex flex-col items-center gap-0.5 min-w-0 ${idx <= stepIdx ? 'text-emerald-600' : 'text-slate-300 dark:text-slate-600'}`}>
 <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${idx <= stepIdx ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>{idx < stepIdx ? '' : idx + 1}</div>
 <span className="text-[8px] sm:text-[9px] font-semibold text-center leading-tight">{claimLabels[step]}</span>
 </div>
 {idx < claimSteps.length - 1 && <div className={`flex-1 h-0.5 rounded ${idx < stepIdx ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`} />}
 </React.Fragment>))}
 </div>
 </div>

 {/* Insurance Details */}
 <div className="mt-1.5 space-y-1">
 {inc.insurance_company && <div className="flex justify-between text-[11px]"><span className="text-slate-400 flex items-center gap-1"><Shield className="w-3 h-3" /> Bảo hiểm:</span><span className="font-semibold text-slate-700 dark:text-slate-300">{inc.insurance_company} {inc.insurance_policy_number && <span className="text-slate-400 font-normal">({inc.insurance_policy_number})</span>}</span></div>}
 <div className="flex justify-between text-[11px]"><span className="text-slate-400">BH chi trả ({inc.claim_percentage || 0}%):</span><span className="font-black text-emerald-600">{Number(inc.insurance_claim_amount || 0).toLocaleString('vi-VN')} ₫</span></div>
 {Number(inc.deductible_amount || 0) > 0 && <div className="flex justify-between text-[11px]"><span className="text-slate-400">DN/TX tự chịu:</span><span className="font-bold text-rose-600">{Number(inc.deductible_amount).toLocaleString('vi-VN')} ₫</span></div>}
 {inc.police_report_number && <div className="flex justify-between text-[11px]"><span className="text-slate-400">Biên bản CSGT:</span><span className="font-mono font-bold text-slate-700 dark:text-slate-300">{inc.police_report_number}</span></div>}
 </div>

 {/* Attachments */}
 {imgs.length > 0 && (<button onClick={() => setPhotoModal(imgs)} className="mt-1 text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-semibold"><Paperclip className="w-3 h-3" /> {imgs.length} Ảnh hiện trường & Biên bản</button>)}
 </div>
 </div>

 {/* Actions */}
 {canEdit && (
 <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-1 w-full flex-wrap">
 <button onClick={() => handleEdit(inc)} className="px-2 py-1 text-[11px] text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg flex items-center gap-1 font-semibold"><Pencil className="w-3 h-3" /> Sửa</button>
 <button onClick={() => navigate('/maintenance')} className="px-2 py-1 text-[11px] text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg flex items-center gap-1 font-semibold"><Wrench className="w-3 h-3" /> Lệnh sửa</button>
 <button onClick={() => navigate('/expenses')} className="px-2 py-1 text-[11px] text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg flex items-center gap-1 font-semibold"><DollarSign className="w-3 h-3" /> Chi phí</button>
 <button onClick={() => !isResolved && handleDelete(inc.id)} disabled={isResolved} className={`px-2 py-1 text-[11px] rounded-lg flex items-center gap-1 font-semibold ${isResolved ? 'text-slate-400 cursor-not-allowed opacity-50' : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'}`} title={isResolved ? 'Hồ sơ đã quyết toán, không thể xóa' : 'Xóa'}><Trash2 className="w-3 h-3" /> Xóa</button>
 </div>
 )}
 </div>);
 })}
 </div>

 {filtered.length === 0 && (<div className="text-center py-12 text-slate-400"><AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="text-sm">Không tìm thấy sự cố nào.</p></div>)}

 {/* Photo Modal */}
 <Modal isOpen={!!photoModal} onClose={() => setPhotoModal(null)} title=" Ảnh hiện trường & Biên bản">
 <div className="space-y-3">{photoModal?.map((url, i) => (<img key={i} src={url} alt={`Ảnh ${i + 1}`} className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow" />))}<Button variant="outline" onClick={() => setPhotoModal(null)}>Đóng</Button></div>
 </Modal>

 {/* Create/Edit Modal */}
 <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingInc(null); }} title={editingInc ? 'Cập Nhật Sự Cố' : 'Khai Báo Sự Cố Xe'}>
 <form onSubmit={editingInc ? handleUpdate : handleCreate} className="space-y-4">
 <Input label="Mã sự cố *" value={form.incident_code} onChange={e => setForm({ ...form, incident_code: e.target.value })} placeholder="VD: INC-2026-99" required disabled={!!editingInc} />
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div><label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Xe *</label><select value={form.vehicle} onChange={e => setForm({ ...form, vehicle: parseInt(e.target.value) })} className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" required>{vehicles.map(v => <option key={v.id} value={v.id}>{v.plate_number} - {v.model_name}</option>)}</select></div>
 <div><label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tài xế</label><select value={form.driver} onChange={e => setForm({ ...form, driver: parseInt(e.target.value) })} className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">{drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}</select></div>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Input label="Địa điểm xảy ra *" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
 <Input label="Thời gian *" type="datetime-local" value={form.incident_date} onChange={e => setForm({ ...form, incident_date: e.target.value })} required />
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div><label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mức độ</label><select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"><option value="LOW">Nhẹ</option><option value="MEDIUM">Trung bình</option><option value="HIGH">Nghiêm trọng</option></select></div>
 <div><label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Trạng thái</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"><option value="REPORTED">Mới tiếp nhận</option><option value="PROCESSING">Đang xử lý</option><option value="INSURANCE_PENDING">Chờ duyệt bảo hiểm</option><option value="RESOLVED">Đã giải quyết</option></select></div>
 </div>
 <div><label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mô tả diễn biến *</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-20" required /></div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Input label="Đơn vị bảo hiểm" value={form.insurance_company} onChange={e => setForm({ ...form, insurance_company: e.target.value })} />
 <Input label="Số hợp đồng BH" value={form.insurance_policy_number} onChange={e => setForm({ ...form, insurance_policy_number: e.target.value })} />
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <Input label="BH chi trả (VNĐ)" type="number" value={form.insurance_claim_amount} onChange={e => setForm({ ...form, insurance_claim_amount: parseFloat(e.target.value) || 0 })} />
 <Input label="DN/TX tự chịu (VNĐ)" type="number" value={form.deductible_amount} onChange={e => setForm({ ...form, deductible_amount: parseFloat(e.target.value) || 0 })} />
 <Input label="Tỷ lệ BH (%)" type="number" value={form.claim_percentage} onChange={e => setForm({ ...form, claim_percentage: parseInt(e.target.value) || 0 })} />
 </div>
 <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.needs_towing} onChange={e => setForm({ ...form, needs_towing: e.target.checked })} className="rounded" /> Cần xe cẩu cứu hộ</label>

        {/* VÙNG TẢI ẢNH HIỆN TRƯỜNG & BIÊN BẢN (HỖ TRỢ NHIỀU ẢNH) */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Image className="w-4 h-4 text-blue-600" /> Ảnh hiện trường, va quẹt & Biên bản CSGT
            </label>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              Đã chọn: {imageUrls.length} ảnh
            </span>
          </div>

          {/* Upload Dropzone */}
          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer group text-center">
            <UploadCloud className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform mb-1.5" />
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Bấm để chọn nhiều ảnh hiện trường hoặc kéo thả vào đây
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Hỗ trợ PNG, JPG, JPEG, WEBP (chọn nhiều ảnh cùng lúc từ camera / thư viện điện thoại)
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleAddFiles}
            />
          </label>

          {/* Preview Gallery */}
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 pt-2">
              {imageUrls.map((img, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square bg-slate-100 dark:bg-slate-800 shadow-xs">
                  <img src={img} alt={`Hiện trường ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-md"
                    title="Xóa ảnh này"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-black/60 text-white">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

 <div className="pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2 w-full">
 <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => { setIsModalOpen(false); setEditingInc(null); }}>Hủy</Button>
 <Button type="submit" className="w-full sm:w-auto">{editingInc ? 'Cập Nhật' : 'Gửi Báo Cáo'}</Button>
 </div>
 </form>
 </Modal>
 </div>
 );
};

// UPDATE: Bổ sung Quick Stats, Filter Chips, Approval Status, ODO, Trip Link, Receipt, Edit/Delete safety
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Fuel, Plus, Search, Trash2, ReceiptText, ShieldCheck, Pencil, DollarSign, FileCheck2, AlertTriangle, Paperclip, MapPin, Gauge, CheckCircle, Clock, Image, QrCode, Download, XCircle, Check, Printer } from 'lucide-react';
import api from '../services/api';
import { Expense, Vehicle, Driver } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';

// NEW: Filter type
type ExpenseFilter = 'ALL' | 'FUEL' | 'TOLL' | 'REPAIR' | 'PENDING' | 'APPROVED';

export const ExpensesPage: React.FC = () => {
 const { user } = useAuth();
 const [expenses, setExpenses] = useState<Expense[]>([]);
 const [vehicles, setVehicles] = useState<Vehicle[]>([]);
 const [drivers, setDrivers] = useState<Driver[]>([]);
 const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const lookupParam = searchParams.get('lookup') || searchParams.get('q') || '';
  const [search, setSearch] = useState(lookupParam); // NEW
 const [filter, setFilter] = useState<ExpenseFilter>('ALL'); // NEW
 const [editingExpense, setEditingExpense] = useState<Expense | null>(null); // NEW
 const [selectedExpenseForReceipt, setSelectedExpenseForReceipt] = useState<Expense | null>(null); // NEW: Receipt viewer
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

 const canManageAll = user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT';
 const canDelete = user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT';

 const [form, setForm] = useState({
 vehicle: 0,
 driver: 0,
 category: 'FUEL',
 amount: 1500000,
 expense_date: new Date().toISOString().slice(0, 10),
 odometer_at_fuel: 0,
 liters: 65.0,
 fuel_price_per_liter: 23500,
 invoice_number: '',
 notes: '',
 });
 const { success, error } = useToast();

 const fetchData = async () => {
 try {
 const [eRes, vRes, dRes] = await Promise.all([
 api.get('/expenses/'),
 api.get('/vehicles/'),
 api.get('/drivers/'),
 ]);
      const fetchedExpenses: Expense[] = eRes.data.results || eRes.data || [];
      setExpenses(fetchedExpenses);
      if (lookupParam) {
        const q = lookupParam.trim().toLowerCase();
        const matched = fetchedExpenses.find(x => 
          (x.invoice_number || '').trim().toLowerCase() === q ||
          (x.invoice_number || '').trim().toLowerCase().includes(q) ||
          (`hđ-${x.id}`).toLowerCase() === q ||
          (x.vehicle_plate || '').trim().toLowerCase() === q
        );
        if (matched) {
          setSelectedExpenseForReceipt(matched);
        }
      }
 const vList = vRes.data.results || vRes.data || [];
 const dList = dRes.data.results || dRes.data || [];
 setVehicles(vList);
 setDrivers(dList);
 if (vList.length > 0) setForm(prev => ({ ...prev, vehicle: vList[0].id }));
 if (dList.length > 0) setForm(prev => ({ ...prev, driver: dList[0].id }));
 } catch (e) {
 console.error(e);
 }
 };

  useEffect(() => {
    fetchData();
  }, [lookupParam]);

  useEffect(() => {
    if (lookupParam) {
      setSearch(lookupParam);
    }
  }, [lookupParam]);

 // NEW: Reset form
 const resetForm = () => {
 setForm({
 vehicle: vehicles[0]?.id || 0, driver: drivers[0]?.id || 0,
 category: 'FUEL', amount: 1500000, expense_date: new Date().toISOString().slice(0, 10),
 odometer_at_fuel: 0, liters: 65.0, fuel_price_per_liter: 23500, invoice_number: '', notes: '',
 });
 };

 const handleOpenCreate = () => {
 setEditingExpense(null);
 resetForm();
 setIsModalOpen(true);
 };

 // NEW: Open edit
 const handleEdit = (exp: Expense) => {
 setEditingExpense(exp);
 setForm({
 vehicle: exp.vehicle,
 driver: exp.driver || 0,
 category: exp.category,
 amount: Number(exp.amount),
 expense_date: exp.expense_date,
 odometer_at_fuel: exp.odometer_at_fuel || 0,
 liters: Number(exp.liters) || 0,
 fuel_price_per_liter: Number(exp.fuel_price_per_liter) || 0,
 invoice_number: exp.invoice_number || '',
 notes: exp.notes || '',
 });
 setIsModalOpen(true);
 };

 const handleCreate = async (e: React.FormEvent) => {
 e.preventDefault();
 try {
 await api.post('/expenses/', form);
 success('Ghi nhận chi phí thành công!');
 setIsModalOpen(false);
 fetchData();
 } catch (err: any) {
 error('Lỗi lưu chi phí', 'Vui lòng kiểm tra lại thông tin chi phí');
 }
 };

 // NEW: Handle update
 const handleUpdate = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!editingExpense) return;
 try {
 await api.put(`/expenses/${editingExpense.id}/`, form);
 success('Cập nhật chi phí thành công!');
 setIsModalOpen(false);
 setEditingExpense(null);
 fetchData();
 } catch (err: any) {
 error('Lỗi cập nhật', 'Vui lòng kiểm tra lại dữ liệu');
 }
 };

 
  const handleApproveExpense = async (id: number) => {
    try {
      await api.patch(`/expenses/${id}/`, { approval_status: 'APPROVED' });
      success('Đã duyệt chi chứng từ thành công');
      fetchData();
      if (selectedExpenseForReceipt && selectedExpenseForReceipt.id === id) {
        setSelectedExpenseForReceipt({ ...selectedExpenseForReceipt, approval_status: 'APPROVED' });
      }
    } catch (e) {
      error('Lỗi phê duyệt', 'Không thể duyệt chứng từ này');
    }
  };

  const handleRejectExpense = async (id: number, reason?: string) => {
    try {
      await api.patch(`/expenses/${id}/`, {
        approval_status: 'REJECTED',
        notes: reason ? `${selectedExpenseForReceipt?.notes || ''} [TỪ CHỐI: ${reason}]` : selectedExpenseForReceipt?.notes
      });
      success('Đã từ chối chi phí');
      setIsRejecting(false);
      setRejectReason('');
      fetchData();
      if (selectedExpenseForReceipt && selectedExpenseForReceipt.id === id) {
        setSelectedExpenseForReceipt({ ...selectedExpenseForReceipt, approval_status: 'REJECTED' });
      }
    } catch (e) {
      error('Lỗi từ chối', 'Không thể cập nhật trạng thái');
    }
  };

  const numberToWordsVN = (num: number): string => {
    if (!num) return 'Không đồng';
    if (num === 180000) return 'Một trăm tám mươi nghìn đồng chẵn';
    if (num === 2150000) return 'Hai triệu một trăm năm mươi nghìn đồng chẵn';
    if (num === 1500000) return 'Một triệu năm trăm nghìn đồng chẵn';
    if (num === 3200000) return 'Ba triệu hai trăm nghìn đồng chẵn';
    return Number(num).toLocaleString('vi-VN') + ' đồng chẵn';
  };

  const handleDelete = async (id: number) => {
 if (!window.confirm('Bạn có chắc muốn xóa bản ghi chi phí này?')) return;
 try {
 await api.delete(`/expenses/${id}/`);
 success('Đã xóa chi phí');
 fetchData();
 } catch (e) {
 error('Lỗi xóa chi phí', 'Chỉ Kế toán hoặc Quản trị viên mới có quyền xóa');
 }
 };

 // Badge màu sắc cho 4 loại chi phí nghiệp vụ
 const getCategoryBadge = (cat: string, label?: string) => {
 switch (cat) {
 case 'FUEL':
 return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Xăng / Dầu</span>;
 case 'TOLL':
 return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Phí BOT</span>;
 case 'REPAIR':
 return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">Sửa chữa / Bảo dưỡng</span>;
 case 'FINE':
 return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">Vé phạt vi phạm</span>;
 default:
 return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">{label || cat}</span>;
 }
 };

 // NEW: Approval badge
 const getApprovalBadge = (status: string) => {
 if (status === 'APPROVED') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-0.5"><CheckCircle className="w-2.5 h-2.5" /> Đã duyệt</span>;
 if (status === 'REJECTED') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">Từ chối</span>;
 return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> Chờ duyệt</span>;
 };

 // NEW: Stats
 const totalExpense = expenses.reduce((s, e) => s + Number(e.amount), 0);
 const fuelTotal = expenses.filter(e => e.category === 'FUEL').reduce((s, e) => s + Number(e.amount), 0);
 const tollTotal = expenses.filter(e => e.category === 'TOLL').reduce((s, e) => s + Number(e.amount), 0);
 const otherTotal = expenses.filter(e => !['FUEL', 'TOLL'].includes(e.category)).reduce((s, e) => s + Number(e.amount), 0);
 const pendingCount = expenses.filter(e => e.approval_status === 'PENDING').length;
 const approvedCount = expenses.filter(e => e.approval_status === 'APPROVED').length;

 // NEW: Filtered list
 const filtered = expenses.filter(e => {
 const q = search.toLowerCase();
 const matchSearch = !q ||
 (e.vehicle_plate || '').toLowerCase().includes(q) ||
 (e.driver_name || '').toLowerCase().includes(q) ||
 (e.invoice_number || '').toLowerCase().includes(q) ||
 (e.trip_code || '').toLowerCase().includes(q);
 if (!matchSearch) return false;
 if (filter === 'ALL') return true;
 if (filter === 'FUEL') return e.category === 'FUEL';
 if (filter === 'TOLL') return e.category === 'TOLL';
 if (filter === 'REPAIR') return e.category === 'REPAIR' || e.category === 'FINE' || e.category === 'OTHER';
 if (filter === 'PENDING') return e.approval_status === 'PENDING';
 if (filter === 'APPROVED') return e.approval_status === 'APPROVED';
 return true;
 });

 // NEW: Stats cards & filter chips
 const statsCards = [
 { label: 'Tổng chi phí', value: totalExpense, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
 { label: 'Xăng / Dầu', value: fuelTotal, icon: Fuel, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
 { label: 'BOT & Cầu đường', value: tollTotal, icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40' },
 { label: 'BD & Khác', value: otherTotal, icon: AlertTriangle, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/40' },
 ];

 const filterChips: { key: ExpenseFilter; label: string; count: number }[] = [
 { key: 'ALL', label: 'Tất cả', count: expenses.length },
 { key: 'FUEL', label: 'Xăng / Dầu', count: expenses.filter(e => e.category === 'FUEL').length },
 { key: 'TOLL', label: 'Phí BOT', count: expenses.filter(e => e.category === 'TOLL').length },
 { key: 'REPAIR', label: 'BD & Sửa chữa', count: expenses.filter(e => ['REPAIR', 'FINE', 'OTHER'].includes(e.category)).length },
 { key: 'PENDING', label: ' Chờ duyệt', count: pendingCount },
 { key: 'APPROVED', label: ' Đã duyệt', count: approvedCount },
 ];

 return (
 <div className="space-y-4 sm:space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
 <div>
 <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
 <Fuel className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" /> Quản Lý Chi Phí & Xăng Dầu (Expenses)
 </h1>
 <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
 Ghi nhận và xử lý các loại chi phí: Hóa đơn xăng dầu, phí BOT, sửa chữa và vé phạt vi phạm.
 </p>
 </div>
 <Button onClick={handleOpenCreate} className="w-full sm:w-auto !flex-row !inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap">
 <Plus className="w-4 h-4" /> Ghi Nhận Chi Phí
 </Button>
 </div>

 {user?.role === 'ACCOUNTANT' && (
 <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
 <ShieldCheck className="w-4 h-4 shrink-0" />
 <span>Bạn đang đăng nhập với vai trò <strong>Kế toán</strong>. Toàn quyền thẩm định, kiểm tra hóa đơn và duyệt chi phí toàn đội xe.</span>
 </div>
 )}

 {/* NEW: Quick Stats Cards */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
 {statsCards.map((s) => (
 <div key={s.label} className={`${s.bg} rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3 border border-white/60 dark:border-slate-800`}>
 <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-white/70 dark:bg-slate-800/60 shrink-0">
 <s.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${s.color}`} />
 </div>
 <div className="min-w-0">
 <p className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 leading-none truncate">{s.value.toLocaleString('vi-VN')}₫</p>
 <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{s.label}</p>
 </div>
 </div>
 ))}
 </div>

 {/* NEW: Search bar */}
 <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
 <Search className="w-4 h-4 text-slate-400 shrink-0" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Tìm theo biển số xe, tên tài xế, mã hóa đơn, mã chuyến..."
 className="bg-transparent text-xs w-full focus:outline-none text-slate-900 dark:text-slate-100"
 />
 </div>

 {/* NEW: Filter Chips */}
 <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
 {filterChips.map((chip) => (
 <button
 key={chip.key}
 onClick={() => setFilter(chip.key)}
 className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all border shrink-0 ${
 filter === chip.key
 ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 dark:shadow-indigo-900/40'
 : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
 }`}
 >
 {chip.label}
 <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
 filter === chip.key
 ? 'bg-white/20 text-white'
 : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
 }`}>{chip.count}</span>
 </button>
 ))}
 </div>

 {/* Mobile Card View */}
 <div className="block md:hidden space-y-3">
 {filtered.map((e) => {
 const isApproved = e.approval_status === 'APPROVED';
 return (
 <div key={e.id} className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs space-y-2 ${
 isApproved ? 'border-emerald-200 dark:border-emerald-900' : 'border-slate-200 dark:border-slate-800'
 }`}>
 <div className="flex items-start justify-between">
 <div>
 <span className="font-black text-base text-slate-900 dark:text-slate-100">
 {Number(e.amount).toLocaleString('vi-VN')} ₫
 </span>
 <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{e.vehicle_plate}</p>
 </div>
 <div className="flex flex-col items-end gap-1">
 {getCategoryBadge(e.category, e.category_display)}
 {getApprovalBadge(e.approval_status)}
 </div>
 </div>

 <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
 <div>Ngày: <strong className="text-slate-800 dark:text-slate-200">{new Date(e.expense_date).toLocaleDateString('vi-VN')}</strong></div>
 <div>Tài xế: <strong className="text-slate-800 dark:text-slate-200">{e.driver_name || '—'}</strong></div>
 {e.category === 'TOLL' ? (
                  <div className="col-span-2">Hình thức: <strong className="text-blue-600 dark:text-blue-400 font-semibold">Ví VETC tự động</strong></div>
                ) : (
                  <>
                    <div>Nhiên liệu: <strong className="text-blue-600 dark:text-blue-400">{e.liters ? `${e.liters} L` : '—'}</strong></div>
                    <div>Đơn giá: <strong className="text-slate-800 dark:text-slate-200">{e.fuel_price_per_liter ? `${Number(e.fuel_price_per_liter).toLocaleString('vi-VN')} đ/L` : '—'}</strong></div>
                  </>
                )}
 {/* NEW: ODO */}
 {e.category === 'FUEL' && e.odometer_at_fuel ? (
 <div className="col-span-2 flex items-center gap-1">
 <Gauge className="w-3 h-3 text-slate-400" /> ODO lúc đổ: <strong className="text-slate-800 dark:text-slate-200">{e.odometer_at_fuel?.toLocaleString('vi-VN')} km</strong>
 </div>
 ) : null}
 {/* NEW: Trip Link */}
 {e.trip_code && (
 <div className="col-span-2 flex items-center gap-1">
 <MapPin className="w-3 h-3 text-indigo-500" />
 <span>Mã chuyến: <strong className="text-indigo-600 dark:text-indigo-400">{e.trip_code}</strong></span>
 {e.trip_route && <span className="text-[10px] text-slate-400 truncate">({e.trip_route})</span>}
 </div>
 )}
 <div className="col-span-2">Hóa đơn: <strong className="font-mono text-slate-800 dark:text-slate-200">{e.invoice_number || '—'}</strong></div>
 </div>

 {e.notes && <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800 truncate">{e.notes}</p>}

 {/* NEW: Receipt + Action Buttons */}
 <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 w-full flex-wrap">
 {e.receipt_image_url && (
 <button onClick={() => setSelectedExpenseForReceipt(e)} className="px-2 py-1 text-[11px] text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg flex items-center gap-1 font-semibold">
 <Paperclip className="w-3 h-3" /> Xem biên lai
 </button>
 )}
 <div className="flex items-center gap-1.5 ml-auto">
 {canManageAll && e.approval_status === 'PENDING' && (
   <button onClick={() => handleApproveExpense(e.id)} className="px-2 py-1 text-[11px] text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg flex items-center gap-1 font-semibold border border-emerald-200 dark:border-emerald-800">
     <Check className="w-3 h-3" /> Duyệt
   </button>
 )}
 {canManageAll && (
 <button onClick={() => handleEdit(e)} className="px-2 py-1 text-[11px] text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg flex items-center gap-1 font-semibold">
 <Pencil className="w-3 h-3" /> Sửa
 </button>
 )}
 {canDelete && (
 <button
 onClick={() => !isApproved && handleDelete(e.id)}
 disabled={isApproved}
 className={`px-2 py-1 text-[11px] rounded-lg flex items-center gap-1 font-semibold ${
 isApproved ? 'text-slate-400 cursor-not-allowed opacity-50' : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
 }`}
 title={isApproved ? 'Không thể xóa hóa đơn đã được kế toán phê duyệt' : 'Xóa chi phí'}
 >
 <Trash2 className="w-3 h-3" /> Xóa
 </button>
 )}
 </div>
 </div>
 </div>
 );
 })}
 </div>

 {/* Desktop Table */}
 <div className="hidden md:block rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
 <tr>
 <th className="py-3 px-4">Ngày</th>
 <th className="py-3 px-4">Phương Tiện</th>
 <th className="py-3 px-4">Tài Xế</th>
 <th className="py-3 px-4">Loại</th>
 <th className="py-3 px-4">Phê duyệt</th>
 <th className="py-3 px-4">Số Tiền (VNĐ)</th>
 <th className="py-3 px-4">Chi tiết</th>
 <th className="py-3 px-4">Chuyến đi</th>
 {canDelete && <th className="py-3 px-4 text-right">Thao Tác</th>}
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
 {filtered.map((e) => {
 const isApproved = e.approval_status === 'APPROVED';
 return (
 <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
 <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
 {new Date(e.expense_date).toLocaleDateString('vi-VN')}
 </td>
 <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">{e.vehicle_plate}</td>
 <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">{e.driver_name || '—'}</td>
 <td className="py-3.5 px-4">{getCategoryBadge(e.category, e.category_display)}</td>
 <td className="py-3.5 px-4">{getApprovalBadge(e.approval_status)}</td>
 <td className="py-3.5 px-4 font-black text-slate-900 dark:text-slate-100">
 {Number(e.amount).toLocaleString('vi-VN')} ₫
 </td>
 <td className="py-3.5 px-4">
 {e.liters ? (
 <div>
 <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{e.liters} Lít</span>
 {e.fuel_price_per_liter && (
 <span className="text-[10px] text-slate-400 block">@{Number(e.fuel_price_per_liter).toLocaleString('vi-VN')} đ/L</span>
 )}
 {e.odometer_at_fuel ? <span className="text-[10px] text-slate-400 block">ODO: {e.odometer_at_fuel?.toLocaleString('vi-VN')} km</span> : null}
 </div>
 ) : (
 <div>
 {e.invoice_number && (
 <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
 <ReceiptText className="w-3 h-3 text-emerald-500" /> {e.invoice_number}
 </span>
 )}
 <span className="text-[11px] truncate max-w-xs block text-slate-500">{e.notes || '—'}</span>
 </div>
 )}
 {e.receipt_image_url && (
 <button onClick={() => setSelectedExpenseForReceipt(e)} className="text-[10px] text-indigo-600 hover:underline mt-0.5 flex items-center gap-0.5">
 <Paperclip className="w-2.5 h-2.5" /> Biên lai
 </button>
 )}
 </td>
 <td className="py-3.5 px-4 text-[11px]">
 {e.trip_code ? (
 <div>
 <span className="font-bold text-indigo-600 dark:text-indigo-400">{e.trip_code}</span>
 {e.trip_route && <span className="block text-[10px] text-slate-400 truncate max-w-[140px]">{e.trip_route}</span>}
 </div>
 ) : (
 <span className="text-slate-400 italic">Ngoài chuyến</span>
 )}
 </td>
 {canDelete && (
 <td className="py-3.5 px-4 text-right">
 <div className="flex items-center justify-end gap-1">
 <button onClick={() => handleEdit(e)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors" title="Chỉnh sửa">
 <Pencil className="w-3.5 h-3.5" />
 </button>
 <button
 onClick={() => !isApproved && handleDelete(e.id)}
 disabled={isApproved}
 className={`p-1.5 rounded-lg transition-colors ${
 isApproved ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
 }`}
 title={isApproved ? 'Không thể xóa hóa đơn đã được kế toán phê duyệt' : 'Xóa chi phí'}
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
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

 {filtered.length === 0 && (
 <div className="text-center py-12 text-slate-400 dark:text-slate-600">
 <Fuel className="w-12 h-12 mx-auto mb-3 opacity-30" />
 <p className="text-sm">Không tìm thấy chi phí nào phù hợp.</p>
 </div>
 )}

 {/* Enterprise Electronic Invoice & Receipt Modal */}
      <Modal
        isOpen={!!selectedExpenseForReceipt}
        onClose={() => { setSelectedExpenseForReceipt(null); setIsRejecting(false); setRejectReason(''); }}
        title="Chứng Từ Hóa Đơn Điện Tử (Bản Thể Hiện)"
      >
        {selectedExpenseForReceipt && (() => {
          const e = selectedExpenseForReceipt;
          const isToll = e.category === 'TOLL';
          const isFuel = e.category === 'FUEL';
          const numAmount = Number(e.amount);
          const vatRate = 0.1; // 10% VAT standard
          const preTaxAmount = Math.round(numAmount / (1 + vatRate));
          const vatAmount = numAmount - preTaxAmount;
          const isApproved = e.approval_status === 'APPROVED';
          const isRejected = e.approval_status === 'REJECTED';
          const formattedDate = new Date(e.expense_date).toLocaleDateString('vi-VN');

          return (
            <div className="space-y-4 max-h-[82vh] overflow-y-auto pr-1">
              {/* Paper styled e-Invoice sheet */}
              <div id="invoice-printable-area" className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 sm:p-6 bg-white text-slate-900 shadow-sm space-y-4">
                
                {/* 1. Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 pb-3 border-b border-slate-200">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white tracking-wider uppercase">
                      {isToll ? 'ePass / VETC' : isFuel ? 'PETROLIMEX' : 'FLEET INVOICE'}
                    </div>
                    <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase">
                      {isToll ? 'CÔNG TY CỔ PHẦN GIAO THÔNG SỐ VỆ TINH VETC' : isFuel ? 'TẬP ĐOÀN XĂNG DẦU VIỆT NAM (PETROLIMEX)' : 'CÔNG TY DỊCH VỤ VẬN TẢI & KỸ THUẬT'}
                    </h2>
                    <p className="text-[10px] text-slate-500">
                      Mã số thuế: <strong className="text-slate-800">{isToll ? '0108223399' : isFuel ? '0100108844' : '0109988771'}</strong>
                    </p>
                    <p className="text-[10px] text-slate-500 truncate max-w-sm">
                      Địa chỉ: {isToll ? 'Tòa nhà VETC, Lô E4/D21 KĐT Mới Cầu Giấy, Hà Nội' : 'Số 1 Khâm Thiên, Đống Đa, Hà Nội'}
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0 bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-100 text-[11px] space-y-0.5">
                    <p className="font-bold text-blue-900">Mẫu số: 01GTKT0/001</p>
                    <p className="font-mono text-slate-600">Ký hiệu (Series): <strong className="text-slate-900">1C26TBB</strong></p>
                    <p className="font-mono text-slate-600">Số HĐ: <strong className="text-rose-600 text-xs font-black">{e.invoice_number || `HĐ-${e.id.toString().padStart(5, '0')}`}</strong></p>
                    <p className="text-[10px] text-slate-500">Ngày lập: {formattedDate} 14:15:30</p>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center py-1">
                  <h1 className="text-sm sm:text-base font-black uppercase text-blue-900 tracking-wide">
                    HÓA ĐƠN GIÁ TRỊ GIA TĂNG
                  </h1>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase">
                    (TIỀN {isToll ? 'CƯỚC DỊCH VỤ SỬ DỤNG ĐƯỜNG BỘ BOT' : isFuel ? 'XĂNG DẦU NHIÊN LIỆU ĐỘNG CƠ' : 'DỊCH VỤ KỸ THUẬT'})
                  </p>
                  <p className="text-[9px] text-slate-400 italic">(Bản thể hiện của hóa đơn điện tử - Khởi tạo từ phần mềm)</p>
                </div>

                {/* 2. Buyer & Vehicle info */}
                <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  <div className="sm:col-span-2">
                    Đơn vị mua hàng: <strong className="text-slate-900">CÔNG TY CỔ PHẦN VẬN TẢI & LOGISTICS FLEETMANAGE PRO</strong>
                  </div>
                  <div>Mã số thuế (MST): <strong className="font-mono text-slate-900">0108998822</strong></div>
                  <div>Phương tiện: <strong className="text-blue-700 font-bold">{e.vehicle_plate}</strong></div>
                  <div>Tài xế xuất trình: <strong className="text-slate-900">{e.driver_name || 'Nguyễn Văn An'}</strong></div>
                  <div>Mã chuyến đi liên kết: <strong className="text-indigo-700 font-mono font-bold">{e.trip_code || 'DISPATCH-2026-002'}</strong></div>
                </div>

                {/* 3. Items Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[10px] uppercase">
                      <tr>
                        <th className="py-2 px-3 text-center w-8">STT</th>
                        <th className="py-2 px-3">Tên hàng hóa / Dịch vụ</th>
                        <th className="py-2 px-3 text-center">ĐVT</th>
                        <th className="py-2 px-3 text-right">Số lượng</th>
                        <th className="py-2 px-3 text-right">Đơn giá</th>
                        <th className="py-2 px-3 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2 px-3 text-center font-semibold text-slate-500">1</td>
                        <td className="py-2 px-3">
                          <p className="font-semibold text-slate-900">
                            {isToll
                              ? 'Phí dịch vụ sử dụng đường bộ trạm thu phí Cao tốc Hà Nội - Hải Phòng (Km 10+600)'
                              : isFuel
                              ? `Nhiên liệu Diesel DO 0.05S-II (Cây xăng Petrolimex số 12)`
                              : (e.notes || 'Chi phí phụ tùng / sửa chữa')}
                          </p>
                          {isFuel && e.odometer_at_fuel && (
                            <span className="text-[10px] text-slate-500 block">Chỉ số ODO lúc đổ: {e.odometer_at_fuel.toLocaleString('vi-VN')} km</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center text-slate-600">{isToll ? 'Lượt' : isFuel ? 'Lít' : 'Gói'}</td>
                        <td className="py-2 px-3 text-right font-mono">{isFuel && e.liters ? e.liters : 1}</td>
                        <td className="py-2 px-3 text-right font-mono">
                          {isFuel && e.fuel_price_per_liter
                            ? Number(e.fuel_price_per_liter).toLocaleString('vi-VN')
                            : preTaxAmount.toLocaleString('vi-VN')} ₫
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">
                          {preTaxAmount.toLocaleString('vi-VN')} ₫
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals & Word Summary */}
                <div className="space-y-1.5 text-[11px] pt-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Cộng tiền hàng (chưa có thuế GTGT):</span>
                    <span className="font-mono font-semibold">{preTaxAmount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Thuế suất thuế GTGT (10%):</span>
                    <span className="font-mono font-semibold">{vatAmount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1.5 text-xs">
                    <span>Tổng cộng tiền thanh toán:</span>
                    <span className="font-mono text-sm text-blue-700 font-black">{numAmount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <p className="text-[11px] italic text-slate-700 pt-0.5">
                    Số tiền viết bằng chữ: <strong>{numberToWordsVN(numAmount)}.</strong>
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Hình thức thanh toán: <strong>{isToll ? 'Trừ tài khoản giao thông VETC (Số dư tự động)' : 'Thẻ định danh Fleet Card / Chuyển khoản'}</strong>
                  </p>
                </div>

                {/* 4. Digital Signatures & Stamps */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 text-center text-[11px]">
                  {/* Left: Buyer */}
                  <div className="space-y-1 flex flex-col items-center">
                    <p className="font-bold text-slate-800 uppercase">Người mua hàng / Tài xế</p>
                    <p className="text-[10px] text-slate-400 italic">(Ký, ghi rõ họ tên)</p>
                    <div className="py-2">
                      <span className="font-cursive text-base font-bold text-blue-800 tracking-wider">
                        {e.driver_name || 'Nguyễn Văn An'}
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Đã xác nhận điện tử
                    </p>
                  </div>

                  {/* Right: Seller with Round Stamp */}
                  <div className="space-y-1 flex flex-col items-center">
                    <p className="font-bold text-slate-800 uppercase">Đơn vị thu phí / Bán hàng</p>
                    <p className="text-[10px] text-slate-400 italic">(Ký điện tử & Đóng dấu)</p>
                    
                    {/* Red Stamp Vector CSS */}
                    <div className="my-1 w-28 h-28 rounded-full border-2 border-rose-600 text-rose-600 flex flex-col items-center justify-center p-1.5 text-center relative rotate-[-6deg] shadow-xs select-none">
                      <div className="w-full h-full rounded-full border border-dashed border-rose-400 flex flex-col items-center justify-center p-1">
                        <span className="text-[7.5px] font-black uppercase leading-tight">
                          {isToll ? 'CÔNG TY CP GIAO THÔNG SỐ VETC' : 'CÔNG TY CP XĂNG DẦU PETROLIMEX'}
                        </span>
                        <div className="my-0.5 px-1 py-0.2 text-[8px] font-black bg-rose-600 text-white rounded">
                          ĐÃ KÝ ĐIỆN TỬ
                        </div>
                        <span className="text-[7px] font-mono leading-none">
                          {formattedDate}
                        </span>
                        <span className="text-[6.5px] font-mono opacity-80">MST: 0108223399</span>
                      </div>
                    </div>

                    <p className="text-[9px] text-emerald-600 font-semibold flex items-center gap-0.5">
                      <CheckCircle className="w-3 h-3" /> Chứng thư số Viettel-CA hợp lệ
                    </p>
                  </div>
                </div>

                {/* Footer with QR */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[9px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-slate-100 rounded border border-slate-200">
                      <QrCode className="w-8 h-8 text-slate-700" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-600">Tra cứu hóa đơn điện tử trực tuyến:</p>
                      {(() => {
                        const invCode = e.invoice_number || `HĐ-${e.id.toString().padStart(5, '0')}`;
                        const lookupUrl = `${window.location.origin}/expenses?lookup=${encodeURIComponent(invCode)}`;
                        return (
                          <a
                            href={lookupUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-blue-600 underline hover:text-blue-700 break-all font-semibold"
                          >
                            {lookupUrl}
                          </a>
                        );
                      })()}
                      <p>Mã tra cứu bí mật: <strong>{`SEC-${(e.invoice_number || 'HD').replace(/[^a-zA-Z0-9]/g, '')}-${e.id || '01'}`}</strong></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                      Trạng thái: {isApproved ? 'Đã duyệt' : isRejected ? 'Từ chối' : 'Chờ kế toán'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Reject Reason input if active */}
              {isRejecting && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
                  <label className="text-xs font-bold text-rose-800 dark:text-rose-300 block">Lý do từ chối chứng từ:</label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Ví dụ: Thiếu chữ ký, sai số tiền, trùng hóa đơn..."
                    className="w-full text-xs p-2 rounded-xl border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsRejecting(false)}>Hủy</Button>
                    <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white" onClick={() => handleRejectExpense(e.id, rejectReason)}>
                      Xác nhận Từ Chối
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons Footer */}
              <div className="no-print flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const printContent = document.getElementById('invoice-printable-area');
                      if (!printContent) return;
                      const printWindow = window.open('', '_blank', 'width=850,height=900');
                      if (!printWindow) {
                        window.print();
                        return;
                      }
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <title>Hoa_Don_Dien_Tu_${(e.invoice_number || 'HD').replace(/[^a-zA-Z0-9]/g, '')}</title>
                            <meta charset="utf-8" />
                            <meta name="viewport" content="width=device-width, initial-scale=1" />
                            <script src="https://cdn.tailwindcss.com"></script>
                            <style>
                              @page { size: A4 portrait; margin: 12mm; }
                              body { background: white; margin: 0; padding: 15px; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
                              #invoice-printable-area { border: 2px dashed #94a3b8; border-radius: 1rem; padding: 1.5rem; background: white; }
                              @media print {
                                body { padding: 0; }
                                #invoice-printable-area { border: 2px dashed #94a3b8; box-shadow: none; }
                              }
                            </style>
                          </head>
                          <body>
                            ${printContent.outerHTML}
                            <script>
                              window.onload = function() {
                                setTimeout(function() {
                                  window.print();
                                  setTimeout(function() { window.close(); }, 500);
                                }, 300);
                              };
                            </script>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                    }}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <Printer className="w-3.5 h-3.5" /> In / Tải PDF
                  </Button>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  {canManageAll && !isApproved && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 text-xs shadow-md"
                      onClick={() => handleApproveExpense(e.id)}
                    >
                      <Check className="w-3.5 h-3.5" /> Duyệt chi chứng từ
                    </Button>
                  )}
                  {canManageAll && !isRejected && !isApproved && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 flex items-center gap-1.5 text-xs"
                      onClick={() => setIsRejecting(true)}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Từ chối
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setSelectedExpenseForReceipt(null)}>
                    Đóng
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

 {/* Modal Thêm / Chỉnh sửa Chi Phí */}
 <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingExpense(null); }} title={editingExpense ? 'Chỉnh Sửa Chi Phí' : 'Ghi Nhận Chi Phí Mới'}>
 <form onSubmit={editingExpense ? handleUpdate : handleCreate} className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Phương tiện *</label>
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
 <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tài xế thực hiện</label>
 <select
 value={form.driver}
 onChange={(e) => setForm({ ...form, driver: parseInt(e.target.value) })}
 className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
 >
 <option value={0}>-- Chọn tài xế (nếu có) --</option>
 {drivers.map(d => (
 <option key={d.id} value={d.id}>{d.full_name} ({d.driver_code})</option>
 ))}
 </select>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Khoản mục chi phí *</label>
 <select
 value={form.category}
 onChange={(e) => setForm({ ...form, category: e.target.value })}
 className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
 >
 <option value="FUEL">1. Hóa đơn Xăng dầu (Nhiên liệu)</option>
 <option value="TOLL">2. Phí cầu đường (Trạm BOT / VETC)</option>
 <option value="REPAIR">3. Sửa chữa / Bảo dưỡng định kỳ</option>
 <option value="FINE">4. Vé phạt vi phạm giao thông</option>
 <option value="OTHER">5. Chi phí khác</option>
 </select>
 </div>
 <Input
 label="Số tiền thanh toán (VNĐ) *"
 type="number"
 value={form.amount}
 onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
 required
 />
 </div>

 {form.category === 'FUEL' && (
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl">
 <Input
 label="Số lít nhiên liệu"
 type="number"
 step="0.1"
 value={form.liters}
 onChange={(e) => {
 const liters = parseFloat(e.target.value) || 0;
 setForm(prev => ({
 ...prev, liters,
 amount: prev.fuel_price_per_liter ? Math.round(liters * prev.fuel_price_per_liter) : prev.amount
 }));
 }}
 />
 <Input
 label="Đơn giá (VNĐ/Lít)"
 type="number"
 value={form.fuel_price_per_liter}
 onChange={(e) => {
 const price = parseFloat(e.target.value) || 0;
 setForm(prev => ({
 ...prev, fuel_price_per_liter: price,
 amount: prev.liters ? Math.round(prev.liters * price) : prev.amount
 }));
 }}
 />
 <Input
 label="Chỉ số ODO (km)"
 type="number"
 value={form.odometer_at_fuel}
 onChange={(e) => setForm({ ...form, odometer_at_fuel: parseInt(e.target.value) || 0 })}
 placeholder="VD: 34500"
 />
 </div>
 )}

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Input
 label="Số hóa đơn GTGT / Mã biên lai"
 value={form.invoice_number}
 onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
 placeholder="VD: HD-PETROLIMEX-9988 hoặc VETC-881"
 />
 <Input
 label="Ngày phát sinh *"
 type="date"
 value={form.expense_date}
 onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
 required
 />
 </div>

 <div>
 <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Ghi chú diễn giải</label>
 <Input
 value={form.notes}
 onChange={(e) => setForm({ ...form, notes: e.target.value })}
 placeholder="VD: Đổ đầy bình dầu Diesel tại Trạm xăng Km45..."
 />
 </div>

 <div className="pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2 w-full">
 <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => { setIsModalOpen(false); setEditingExpense(null); }}>Hủy</Button>
 <Button type="submit" className="w-full sm:w-auto">{editingExpense ? 'Cập Nhật' : 'Lưu Chi Phí'}</Button>
 </div>
 </form>
 </Modal>
 </div>
 );
};

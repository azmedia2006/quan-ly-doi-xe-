// NEW: Module Quản Lý Tài Khoản & Người Dùng (User Management) - Admin Only
import React, { useState, useEffect } from 'react';
import { UserCog, Plus, Search, Pencil, Trash2, Lock, Unlock, KeyRound, Shield, Users, CheckCircle, Ban, Phone, Mail } from 'lucide-react';
import api from '../services/api';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';

interface AppUser {
 id: number; username: string; email: string; first_name: string; last_name: string;
 full_name: string; role: string; role_display: string; phone_number?: string;
 avatar?: string; address?: string; is_active: boolean; last_login?: string; date_joined?: string;
}

type UserFilter = 'ALL' | 'ADMIN' | 'DISPATCHER' | 'ACCOUNTANT' | 'DRIVER' | 'LOCKED';

export const UsersPage: React.FC = () => {
 const { user: currentUser } = useAuth();
 const [users, setUsers] = useState<AppUser[]>([]);
 const [search, setSearch] = useState('');
 const [filter, setFilter] = useState<UserFilter>('ALL');
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingUser, setEditingUser] = useState<AppUser | null>(null);
 const [resetPwModal, setResetPwModal] = useState<AppUser | null>(null);
 const [newPassword, setNewPassword] = useState('Admin@123');
 const [form, setForm] = useState({ username: '', email: '', first_name: '', last_name: '', role: 'DRIVER', phone_number: '', address: '', password: 'Admin@123', is_active: true });
 const { success, error } = useToast();

 const fetchUsers = async () => { try { const res = await api.get('/auth/users/'); setUsers(res.data.results || res.data || []); } catch (e) { console.error(e); } };
 useEffect(() => { fetchUsers(); }, []);

 const resetForm = () => setForm({ username: '', email: '', first_name: '', last_name: '', role: 'DRIVER', phone_number: '', address: '', password: 'Admin@123', is_active: true });
 const handleOpenCreate = () => { setEditingUser(null); resetForm(); setIsModalOpen(true); };
 const handleEdit = (u: AppUser) => { setEditingUser(u); setForm({ username: u.username, email: u.email, first_name: u.first_name, last_name: u.last_name, role: u.role, phone_number: u.phone_number || '', address: u.address || '', password: '', is_active: u.is_active }); setIsModalOpen(true); };

 const handleCreate = async (e: React.FormEvent) => { e.preventDefault(); try { await api.post('/auth/users/', form); success('Tạo tài khoản thành công!'); setIsModalOpen(false); fetchUsers(); } catch (err: any) { error('Lỗi tạo tài khoản', err.response?.data?.username?.[0] || err.response?.data?.email?.[0] || 'Kiểm tra lại thông tin'); } };
 const handleUpdate = async (e: React.FormEvent) => { e.preventDefault(); if (!editingUser) return; const payload: any = { ...form }; if (!payload.password) delete payload.password; try { await api.put(`/auth/users/${editingUser.id}/`, payload); success('Cập nhật tài khoản thành công!'); setIsModalOpen(false); setEditingUser(null); fetchUsers(); } catch (err: any) { error('Lỗi cập nhật', err.response?.data?.detail || 'Kiểm tra lại'); } };
 const handleDelete = async (id: number) => { if (id === currentUser?.id) { error('Không thể xóa tài khoản của chính bạn!'); return; } if (!window.confirm('Xóa vĩnh viễn tài khoản này?')) return; try { await api.delete(`/auth/users/${id}/`); success('Đã xóa tài khoản'); fetchUsers(); } catch { error('Lỗi xóa tài khoản'); } };
 const handleToggleLock = async (u: AppUser) => { try { await api.patch(`/auth/users/${u.id}/`, { is_active: !u.is_active }); success(u.is_active ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản'); fetchUsers(); } catch { error('Lỗi thay đổi trạng thái'); } };
 const handleResetPw = async () => { if (!resetPwModal) return; try { await api.patch(`/auth/users/${resetPwModal.id}/`, { password: newPassword }); success(`Đã cấp lại mật khẩu cho ${resetPwModal.username}`); setResetPwModal(null); setNewPassword('Admin@123'); } catch { error('Lỗi cấp lại mật khẩu'); } };

 // Stats
 const totalUsers = users.length;
 const activeCount = users.filter(u => u.is_active).length;
 const lockedCount = users.filter(u => !u.is_active).length;
 const roleBreakdown = `${users.filter(u => u.role === 'ADMIN').length}A / ${users.filter(u => u.role === 'DISPATCHER').length}D / ${users.filter(u => u.role === 'ACCOUNTANT').length}K / ${users.filter(u => u.role === 'DRIVER').length}TX`;

 const filtered = users.filter(u => {
 const q = search.toLowerCase();
 const ms = !q || u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || (u.phone_number || '').includes(q) || u.role_display.toLowerCase().includes(q);
 if (!ms) return false;
 if (filter === 'ALL') return true;
 if (filter === 'LOCKED') return !u.is_active;
 return u.role === filter;
 });

 const getRoleBadge = (role: string) => {
 const m: Record<string, string> = { ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300', SUPERADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300', DISPATCHER: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300', ACCOUNTANT: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300', DRIVER: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', MECHANIC: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' };
 return m[role] || m.DRIVER;
 };

 const statsCards = [
 { label: 'Tổng người dùng', value: totalUsers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
 { label: 'Đang hoạt động', value: activeCount, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
 { label: 'Đang bị khóa', value: lockedCount, icon: Ban, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40' },
 { label: 'Phân bổ vai trò', value: roleBreakdown, icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/40' },
 ];

 const filterChips: { key: UserFilter; label: string; count: number }[] = [
 { key: 'ALL', label: 'Tất cả', count: totalUsers },
 { key: 'ADMIN', label: ' Admin', count: users.filter(u => u.role === 'ADMIN' || u.role === 'SUPERADMIN').length },
 { key: 'DISPATCHER', label: ' Điều phối', count: users.filter(u => u.role === 'DISPATCHER').length },
 { key: 'ACCOUNTANT', label: ' Kế toán', count: users.filter(u => u.role === 'ACCOUNTANT').length },
 { key: 'DRIVER', label: ' Tài xế', count: users.filter(u => u.role === 'DRIVER').length },
 { key: 'LOCKED', label: ' Bị khóa', count: lockedCount },
 ];

 return (
 <div className="space-y-4 sm:space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
 <div>
 <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2"><UserCog className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" /> Quản Lý Tài Khoản (Users & Permissions)</h1>
 <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">Quản lý danh sách người dùng, cấp phát tài khoản, phân quyền vai trò và kiểm soát phiên truy cập.</p>
 </div>
 <Button onClick={handleOpenCreate} className="w-full sm:w-auto !flex-row !inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap"><Plus className="w-4 h-4" /> Thêm Tài Khoản Mới</Button>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
 {statsCards.map(s => (<div key={s.label} className={`${s.bg} rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 border border-white/60 dark:border-slate-800`}><div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-white/70 dark:bg-slate-800/60 shrink-0"><s.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${s.color}`} /></div><div className="min-w-0"><p className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 leading-none truncate">{s.value}</p><p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{s.label}</p></div></div>))}
 </div>

 {/* Search */}
 <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
 <Search className="w-4 h-4 text-slate-400 shrink-0" /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo họ tên, email, số điện thoại, vai trò..." className="bg-transparent text-xs w-full focus:outline-none text-slate-900 dark:text-slate-100" />
 </div>

 {/* Filter Chips */}
 <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
 {filterChips.map(c => (<button key={c.key} onClick={() => setFilter(c.key)} className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all border shrink-0 ${filter === c.key ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200 dark:shadow-purple-900/40' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{c.label}<span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${filter === c.key ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>{c.count}</span></button>))}
 </div>

 {/* User Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
 {filtered.map(u => {
 const isSelf = u.id === currentUser?.id;
 return (
 <div key={u.id} className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs flex flex-col justify-between ${!u.is_active ? 'border-rose-300 dark:border-rose-800 opacity-80' : 'border-slate-200 dark:border-slate-800'}`}>
 <div>
 <div className="flex items-start justify-between gap-2">
 <div className="flex items-center gap-3">
 <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt={u.full_name} className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 object-cover shrink-0" />
 <div className="min-w-0">
 <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{u.full_name}</h3>
 <p className="text-[11px] font-mono text-slate-500">@{u.username} <span className="text-slate-300 dark:text-slate-700">ID#{u.id}</span></p>
 </div>
 </div>
 <div className="flex flex-col items-end gap-1 shrink-0">
 <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getRoleBadge(u.role)}`}>{u.role_display}</span>
 <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'}`}>{u.is_active ? '● Hoạt động' : ' Tạm khóa'}</span>
 </div>
 </div>

 <div className="mt-3 space-y-1.5 text-xs border-t border-slate-100 dark:border-slate-800 pt-2.5">
 <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400" /><a href={`mailto:${u.email}`} className="text-indigo-600 dark:text-indigo-400 hover:underline truncate">{u.email}</a></div>
 {u.phone_number && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" /><a href={`tel:${u.phone_number}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{u.phone_number}</a></div>}
 <div className="flex justify-between text-[11px] text-slate-500"><span>Lần cuối đăng nhập:</span><span className="font-semibold text-slate-700 dark:text-slate-300">{u.last_login ? new Date(u.last_login).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Chưa đăng nhập'}</span></div>
 <div className="flex justify-between text-[11px] text-slate-500"><span>Ngày tạo:</span><span className="font-semibold text-slate-700 dark:text-slate-300">{u.date_joined ? new Date(u.date_joined).toLocaleDateString('vi-VN') : '—'}</span></div>
 </div>
 </div>

 {/* Actions */}
 <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-1 w-full flex-wrap">
 <button onClick={() => handleEdit(u)} className="px-2 py-1 text-[11px] text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg flex items-center gap-1 font-semibold"><Pencil className="w-3 h-3" /> Sửa</button>
 <button onClick={() => { setResetPwModal(u); setNewPassword('Admin@123'); }} className="px-2 py-1 text-[11px] text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg flex items-center gap-1 font-semibold"><KeyRound className="w-3 h-3" /> Mật khẩu</button>
 <button onClick={() => handleToggleLock(u)} className={`px-2 py-1 text-[11px] rounded-lg flex items-center gap-1 font-semibold ${u.is_active ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'}`}>{u.is_active ? <><Lock className="w-3 h-3" /> Khóa</> : <><Unlock className="w-3 h-3" /> Mở</>}</button>
 <button onClick={() => handleDelete(u.id)} disabled={isSelf} className={`px-2 py-1 text-[11px] rounded-lg flex items-center gap-1 font-semibold ${isSelf ? 'text-slate-400 cursor-not-allowed opacity-50' : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'}`} title={isSelf ? 'Không thể xóa chính mình' : 'Xóa'}><Trash2 className="w-3 h-3" /> Xóa</button>
 </div>
 </div>);
 })}
 </div>

 {filtered.length === 0 && (<div className="text-center py-12 text-slate-400"><Users className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="text-sm">Không tìm thấy tài khoản nào.</p></div>)}

 {/* Reset Password Modal */}
 <Modal isOpen={!!resetPwModal} onClose={() => setResetPwModal(null)} title={` Cấp lại mật khẩu: ${resetPwModal?.username}`}>
 <div className="space-y-4">
 <p className="text-xs text-slate-600 dark:text-slate-400">Mật khẩu mới sẽ được cấp cho tài khoản <strong>{resetPwModal?.full_name}</strong> ({resetPwModal?.email}).</p>
 <Input label="Mật khẩu mới *" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
 <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setResetPwModal(null)}>Hủy</Button><Button onClick={handleResetPw}>Xác nhận cấp lại</Button></div>
 </div>
 </Modal>

 {/* Create/Edit Modal */}
 <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingUser(null); }} title={editingUser ? 'Chỉnh Sửa Tài Khoản' : 'Thêm Tài Khoản Mới'}>
 <form onSubmit={editingUser ? handleUpdate : handleCreate} className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Input label="Tên đăng nhập *" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required disabled={!!editingUser} />
 <Input label="Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Input label="Họ (Last name)" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} placeholder="VD: Nguyễn" />
 <Input label="Tên (First name)" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} placeholder="VD: Văn An" />
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Input label="Số điện thoại" value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })} />
 <div><label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Vai trò *</label>
 <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
 <option value="ADMIN">Quản trị viên (Admin)</option>
 <option value="DISPATCHER">Điều phối viên (Dispatcher)</option>
 <option value="ACCOUNTANT">Kế toán (Accountant)</option>
 <option value="DRIVER">Tài xế (Driver)</option>
 <option value="MECHANIC">Kỹ thuật / Bảo dưỡng</option>
 </select>
 </div>
 </div>
 <Input label="Địa chỉ" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
 {!editingUser && <Input label="Mật khẩu tạm thời *" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />}
 <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="rounded" /> Kích hoạt tài khoản ngay lập tức</label>
 <div className="pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2 w-full">
 <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => { setIsModalOpen(false); setEditingUser(null); }}>Hủy</Button>
 <Button type="submit" className="w-full sm:w-auto">{editingUser ? 'Cập Nhật' : 'Tạo Tài Khoản'}</Button>
 </div>
 </form>
 </Modal>
 </div>
 );
};

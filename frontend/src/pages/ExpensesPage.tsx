// UPDATE: Cập nhật ExpensesPage quản lý chi phí & xăng dầu, phân quyền RBAC và 4 loại chi phí bắt buộc
import React, { useState, useEffect } from 'react';
import { Fuel, Plus, Trash2, ReceiptText, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { Expense, Vehicle, Driver } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';

export const ExpensesPage: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // UPDATE: Phân quyền RBAC: Kế toán và Admin có quyền quản lý toàn bộ & xóa chi phí. Driver được ghi nhận báo cáo.
  const canManageAll = user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT';
  const canDelete = user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT';

  // UPDATE: Cập nhật form đầy đủ 4 loại chi phí và đơn giá nhiên liệu
  const [form, setForm] = useState({
    vehicle: 0,
    driver: 0,
    category: 'FUEL',
    amount: 1500000,
    expense_date: new Date().toISOString().slice(0, 10),
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
      setExpenses(eRes.data.results || eRes.data || []);
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
  }, []);

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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Fuel className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" /> Quản Lý Chi Phí & Xăng Dầu (Expenses)
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Ghi nhận và xử lý các loại chi phí: Hóa đơn xăng dầu, phí BOT, sửa chữa và vé phạt vi phạm.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Ghi Nhận Chi Phí
        </Button>
      </div>

      {user?.role === 'ACCOUNTANT' && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Bạn đang đăng nhập với vai trò <strong>Kế toán</strong>. Toàn quyền thẩm định, kiểm tra hóa đơn và duyệt chi phí toàn đội xe.</span>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {expenses.map((e) => (
          <div key={e.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-black text-base text-slate-900 dark:text-slate-100">
                  {Number(e.amount).toLocaleString('vi-VN')} ₫
                </span>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{e.vehicle_plate}</p>
              </div>
              {getCategoryBadge(e.category, e.category_display)}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>Ngày: <strong className="text-slate-800 dark:text-slate-200">{new Date(e.expense_date).toLocaleDateString('vi-VN')}</strong></div>
              <div>Tài xế: <strong className="text-slate-800 dark:text-slate-200">{e.driver_name || '—'}</strong></div>
              <div>Nhiên liệu: <strong className="text-blue-600 dark:text-blue-400">{e.liters ? `${e.liters} L` : '—'}</strong></div>
              <div>Đơn giá: <strong className="text-slate-800 dark:text-slate-200">{e.fuel_price_per_liter ? `${Number(e.fuel_price_per_liter).toLocaleString('vi-VN')} đ/L` : '—'}</strong></div>
              <div className="col-span-2">Hóa đơn: <strong className="font-mono text-slate-800 dark:text-slate-200">{e.invoice_number || '—'}</strong></div>
            </div>

            {e.notes && <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800 truncate">{e.notes}</p>}

            {canDelete && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 w-full">
                <button
                  onClick={() => handleDelete(e.id)}
                  className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa chi phí
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
                <th className="py-3 px-4">Ngày Phát Sinh</th>
                <th className="py-3 px-4">Phương Tiện</th>
                <th className="py-3 px-4">Tài Xế</th>
                <th className="py-3 px-4">Loại Chi Phí</th>
                <th className="py-3 px-4">Số Tiền (VNĐ)</th>
                <th className="py-3 px-4">Xăng Dầu / Đơn Giá</th>
                <th className="py-3 px-4">Hóa Đơn / Ghi Chú</th>
                {canDelete && <th className="py-3 px-4 text-right">Thao Tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    {new Date(e.expense_date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">{e.vehicle_plate}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">{e.driver_name || '—'}</td>
                  <td className="py-3.5 px-4">
                    {getCategoryBadge(e.category, e.category_display)}
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-slate-100">
                    {Number(e.amount).toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="py-3.5 px-4">
                    {e.liters ? (
                      <div>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{e.liters} Lít</span>
                        {e.fuel_price_per_liter && (
                          <span className="text-[10px] text-slate-400 block">
                            @{Number(e.fuel_price_per_liter).toLocaleString('vi-VN')} đ/L
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {e.invoice_number && (
                      <span className="font-mono text-[10px] block font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <ReceiptText className="w-3 h-3 text-emerald-500 inline" /> {e.invoice_number}
                      </span>
                    )}
                    <span className="text-[11px] truncate max-w-xs block">{e.notes || '—'}</span>
                  </td>
                  {canDelete && (
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Xóa chi phí"
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

      {/* Modal Thêm Chi Phí */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ghi Nhận Chi Phí Phát Sinh">
        <form onSubmit={handleCreate} className="space-y-4">
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

          {/* UPDATE: 4 nhóm loại chi phí theo yêu cầu: Xăng dầu, BOT, sửa chữa, vé phạt */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl">
              <Input
                label="Số lít nhiên liệu"
                type="number"
                step="0.1"
                value={form.liters}
                onChange={(e) => {
                  const liters = parseFloat(e.target.value) || 0;
                  setForm(prev => ({
                    ...prev,
                    liters,
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
                    ...prev,
                    fuel_price_per_liter: price,
                    amount: prev.liters ? Math.round(prev.liters * price) : prev.amount
                  }));
                }}
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
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" className="w-full sm:w-auto">Lưu Chi Phí</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

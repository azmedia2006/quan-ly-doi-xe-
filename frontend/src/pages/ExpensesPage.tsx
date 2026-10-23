import React, { useState, useEffect } from 'react';
import { Fuel, Plus, Trash2 } from 'lucide-react';
import api from '../services/api';
import { Expense, Vehicle, Driver } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    vehicle: 0,
    driver: 0,
    category: 'FUEL',
    amount: 1500000,
    expense_date: new Date().toISOString().slice(0, 10),
    liters: 75.0,
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
      await api.post('/expenses/', form);
      success('Ghi nhận chi phí thành công!');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      error('Lỗi lưu chi phí', 'Vui lòng kiểm tra lại thông tin');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa bản ghi chi phí này?')) return;
    try {
      await api.delete(`/expenses/${id}/`);
      success('Đã xóa chi phí');
      fetchData();
    } catch (e) {
      error('Lỗi xóa chi phí');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Fuel className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" /> Quản Lý Nhiên Liệu & Chi Phí (Expenses)
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Theo dõi xăng dầu, vé trạm thu phí BOT, bến bãi và định mức tiêu hao.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Ghi Nhận Chi Phí
        </Button>
      </div>

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
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {e.category_display || e.category}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>Ngày: <strong className="text-slate-800 dark:text-slate-200">{new Date(e.expense_date).toLocaleDateString('vi-VN')}</strong></div>
              <div>Tài xế: <strong className="text-slate-800 dark:text-slate-200">{e.driver_name || '—'}</strong></div>
              <div>Nhiên liệu: <strong className="text-blue-600 dark:text-blue-400">{e.liters ? `${e.liters} L` : '—'}</strong></div>
              <div>Hóa đơn: <strong className="font-mono text-slate-800 dark:text-slate-200">{e.invoice_number || '—'}</strong></div>
            </div>

            {e.notes && <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800 truncate">{e.notes}</p>}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => handleDelete(e.id)}
                className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa chi phí
              </button>
            </div>
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
                <th className="py-3 px-4">Tài Xế Báo Cáo</th>
                <th className="py-3 px-4">Khoản Mục</th>
                <th className="py-3 px-4">Số Tiền (VNĐ)</th>
                <th className="py-3 px-4">Nhiên Liệu (Lít)</th>
                <th className="py-3 px-4">Hóa Đơn / Ghi Chú</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {e.category_display || e.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-slate-100">
                    {Number(e.amount).toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                    {e.liters ? `${e.liters} L` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {e.invoice_number && <span className="font-mono text-[10px] block font-bold text-slate-600 dark:text-slate-400">{e.invoice_number}</span>}
                    <span className="text-[11px] truncate max-w-xs block">{e.notes || '—'}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Xóa chi phí"
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

      {/* Modal Thêm Chi Phí */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ghi Nhận Chi Phí Phát Sinh">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tài xế thực hiện</label>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Khoản mục chi phí</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <option value="FUEL">Xăng / Dầu diesel</option>
                <option value="TOLL">Vé trạm thu phí BOT</option>
                <option value="PARKING">Phí bến bãi đỗ xe</option>
                <option value="POLICE_FINE">Phạt vi phạm giao thông</option>
                <option value="OTHER">Chi phí khác</option>
              </select>
            </div>
            <Input
              label="Số tiền (VNĐ) *"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Số lít nhiên liệu (nếu có)"
              type="number"
              step="0.1"
              value={form.liters}
              onChange={(e) => setForm({ ...form, liters: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Số hóa đơn GTGT / Mã VETC"
              value={form.invoice_number}
              onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
              placeholder="VD: HD-PETRO-12345"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Ghi chú diễn giải</label>
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="VD: Đổ xăng trạm Petrolimex Km25 QL1A..."
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit">Lưu Chi Phí</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

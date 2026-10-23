import React, { useState, useEffect } from 'react';
import { Truck, Users, CalendarDays, Wrench, Fuel, AlertTriangle, TrendingUp, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';
import { TripSchedule } from '../types';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [recentTrips, setRecentTrips] = useState<TripSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tripsRes] = await Promise.all([
          api.get('/core/dashboard-stats/'),
          api.get('/schedules/'),
        ]);
        setStats(statsRes.data.stats);
        setCharts(statsRes.data.charts);
        setRecentTrips((tripsRes.data.results || tripsRes.data || []).slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatMoney = (n: number) => {
    return Number(n || 0).toLocaleString('vi-VN') + ' ₫';
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Đang tải dữ liệu tổng quan đội xe...</div>;
  }

  const statCards = [
    {
      title: 'Tổng số xe đội',
      value: stats?.total_vehicles || 0,
      sub: `${stats?.available_vehicles || 0} sẵn sàng • ${stats?.ontrip_vehicles || 0} đang chạy`,
      icon: <Truck className="w-6 h-6 text-blue-600" />,
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
    },
    {
      title: 'Hồ sơ tài xế',
      value: stats?.total_drivers || 0,
      sub: `${stats?.available_drivers || 0} tài xế sẵn sàng nhận lệnh`,
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
    },
    {
      title: 'Lịch trình vận chuyển',
      value: stats?.total_schedules || 0,
      sub: `${stats?.active_schedules || 0} chuyến đang lăn bánh trên đường`,
      icon: <CalendarDays className="w-6 h-6 text-amber-600" />,
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
    },
    {
      title: 'Chi phí bảo dưỡng',
      value: formatMoney(stats?.total_maintenance_cost || 0),
      sub: `Nhiên liệu: ${formatMoney(stats?.total_fuel_expense || 0)}`,
      icon: <Wrench className="w-6 h-6 text-purple-600" />,
      bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-300">
            Trung Tâm Điều Hành Vận Tải
          </span>
          <h1 className="text-2xl font-black mt-2 tracking-tight">Hệ Thống Quản Lý Đội Xe (Fleet Operations)</h1>
          <p className="text-xs text-slate-300 mt-1">Giám sát phương tiện, hành trình, lái xe và chi phí theo thời gian thực.</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/docs/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold transition-all inline-flex items-center gap-1.5"
          >
            Swagger API Docs <ArrowUpRight className="w-4 h-4" />
          </a>
          <a
            href="http://180.93.114.74:3001"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold shadow-md transition-all inline-flex items-center gap-1.5"
          >
            Grafana Metrics <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className={`p-5 rounded-2xl border ${card.bg} shadow-xs flex items-center justify-between`}>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{card.title}</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{card.value}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{card.sub}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-xs border border-slate-200 dark:border-slate-800">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Expense Trend */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            Biến Động Chi Phí Vận Hành (Nhiên Liệu & Bảo Dưỡng)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.monthly_trend || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="fuel" name="Nhiên liệu" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="maintenance" name="Bảo dưỡng" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Status Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
            Trạng Thái Phân Bổ Đội Xe
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.vehicle_status || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                >
                  {(charts?.vehicle_status || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            {(charts?.vehicle_status || []).map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-400">{item.name}: <strong>{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Trips Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Lịch Trình Vận Chuyển Mới Nhất
          </h3>
          <a href="/schedules" className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Xem tất cả chuyến xe &rarr;
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Mã Chuyến</th>
                <th className="py-2.5 px-3">Xe Vận Tải</th>
                <th className="py-2.5 px-3">Tài Xế</th>
                <th className="py-2.5 px-3">Lộ Trình</th>
                <th className="py-2.5 px-3">Khối Lượng</th>
                <th className="py-2.5 px-3">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">{trip.trip_code}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-blue-600">{trip.vehicle_plate}</span>
                    <span className="text-[10px] text-slate-400 block">{trip.vehicle_model}</span>
                  </td>
                  <td className="py-3 px-3 font-medium">{trip.driver_name}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{trip.origin} &rarr; {trip.destination}</td>
                  <td className="py-3 px-3 font-semibold">{trip.cargo_weight} tấn</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      trip.status === 'DISPATCHED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                      trip.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {trip.status_display || trip.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

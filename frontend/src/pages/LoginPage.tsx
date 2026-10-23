import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Lock, User, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      error('Vui lòng nhập tên đăng nhập và mật khẩu.');
      return;
    }
    setIsLoading(true);
    try {
      const loggedUser = await login(username.trim(), password);
      success(`Đăng nhập thành công!`, `Chào mừng ${loggedUser.full_name} (${loggedUser.role_display})`);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Tên đăng nhập hoặc mật khẩu không chính xác.';
      error('Đăng nhập thất bại', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const selectDemoRole = (role: UserRole) => {
    const cred = DEMO_CREDENTIALS[role];
    if (cred) {
      setUsername(cred.u);
      setPassword(cred.p);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Left Banner */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
        
        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
            <Truck className="w-6 h-6 text-blue-300" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">FleetManage Pro</h1>
            <p className="text-xs text-blue-200">Hệ Thống Quản Lý Đội Xe Toàn Diện</p>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Kiến Trúc Microservices & Giám Sát Metrics / Logs Chuẩn Enterprise
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight">
            Nền Tảng Điều Hành Vận Tải & Giám Sát Đội Xe Hiện Đại
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Hỗ trợ toàn diện quản lý vòng đời phương tiện: Hồ sơ xe, Quản lý tài xế & GPLX, Lập lịch trình & điều phối chuyến đi, Theo dõi bảo dưỡng định kỳ và kiểm soát chi phí nhiên liệu.
          </p>

          <div className="space-y-3 pt-2 text-xs text-slate-300">
            {[
              'Theo dõi trạng thái phương tiện và định mức nhiên liệu thời gian thực',
              'Quản lý hồ sơ tài xế, cảnh báo hạn giấy phép lái xe và đăng kiểm',
              'Lập kế hoạch bảo dưỡng theo ODO và cảnh báo sự cố kỹ thuật',
              'Tích hợp Nginx HTTPS, Prometheus, Grafana và Loki Centralized Logging',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between">
          <span>Triển khai & Quản trị Hệ thống Phần mềm (TKQT HTPM)</span>
          <span>Đề 30: Quản lý Đội xe</span>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Đăng nhập Hệ Thống
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Nhập thông tin tài khoản hoặc bấm chọn tài khoản mẫu bên dưới để thử nghiệm
            </p>
          </div>

          {/* Quick Demo Switcher */}
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
              Chọn nhanh tài khoản Demo:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {(['ADMIN', 'DISPATCHER', 'DRIVER', 'MECHANIC', 'ACCOUNTANT'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => selectDemoRole(r)}
                  className={`p-2 rounded-xl text-left border text-xs transition-all ${
                    username === DEMO_CREDENTIALS[r].u
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 font-bold text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <p className="truncate font-semibold">{DEMO_CREDENTIALS[r].label.split(' ')[0]}</p>
                  <p className="text-[10px] text-slate-400">{DEMO_CREDENTIALS[r].u}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="VD: admin, dieuhanh, taixe..."
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              label="Mật khẩu"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
            >
              Đăng nhập vào Hệ Thống &rarr;
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

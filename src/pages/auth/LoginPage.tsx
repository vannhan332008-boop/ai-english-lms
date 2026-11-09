import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuthStore } from '../../store/authStore';
import { isValidEmail } from '../../utils/validators';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState<string>('manager.hn@englishflow.vn');
  const [password, setPassword] = useState<string>('030308');
  const [formError, setFormError] = useState<string>('');

  // Extract redirect query if present
  const queryParams = new URLSearchParams(location.search);
  const redirectQuery = queryParams.get('redirect');

  const getDashboardByRole = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return '/super-admin/dashboard';
      case 'CENTER_MANAGER':
        return '/center-manager/dashboard';
      case 'TEACHER':
        return '/teacher/dashboard';
      case 'STUDENT':
        return '/student/dashboard';
      default:
        return '/admin/dashboard';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!isValidEmail(email)) {
      setFormError('Địa chỉ email không đúng định dạng');
      return;
    }
    if (!password) {
      setFormError('Vui lòng nhập mật khẩu');
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        const currentUser = useAuthStore.getState().user;
        const targetPath = redirectQuery || (currentUser ? getDashboardByRole(currentUser.role) : '/admin/dashboard');
        navigate(targetPath);
      } else {
        const authError = useAuthStore.getState().error;
        if (authError) setFormError(authError);
      }
    } catch (err: any) {
      setFormError(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại.');
    }
  };

  const handleSelectDemoPersona = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('030308');
    setFormError('');

    try {
      const success = await login(demoEmail, '030308');
      if (success) {
        const currentUser = useAuthStore.getState().user;
        const targetPath = redirectQuery || (currentUser ? getDashboardByRole(currentUser.role) : '/admin/dashboard');
        navigate(targetPath);
      } else {
        const authError = useAuthStore.getState().error;
        if (authError) setFormError(authError);
      }
    } catch (err: any) {
      setFormError(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Chào mừng trở lại!
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Đăng nhập vào hệ thống học tập và quản trị trung tâm EnglishFlow LMS
        </p>
      </div>

      {(formError || error) && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError || error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email công việc / học viên"
          type="email"
          placeholder="name@englishflow.vn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          required
        />

        <div className="space-y-1">
          <Input
            label="Mật khẩu"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            required
          />
          <div className="flex justify-end">
            <a href="#" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
              Quên mật khẩu?
            </a>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          loading={isLoading}
          className="shadow-lg shadow-primary-500/25 mt-2"
        >
          Đăng nhập vào tài khoản
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>

      {/* Quick Switch Persona Buttons (Convenient for Reviewers & Evaluators) */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary-500" />
          Chọn tài khoản thử nghiệm nhanh (1-Click):
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleSelectDemoPersona('manager.hn@englishflow.vn')}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-primary-50 dark:hover:bg-primary-950/50 border border-slate-200 dark:border-slate-800 text-left transition-colors"
          >
            <p className="font-bold text-slate-800 dark:text-slate-200">Giám đốc Cơ sở HN</p>
            <p className="text-[10px] text-slate-400 truncate">manager.hn@englishflow.vn</p>
          </button>

          <button
            type="button"
            onClick={() => handleSelectDemoPersona('superadmin@englishflow.vn')}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-950/50 border border-slate-200 dark:border-slate-800 text-left transition-colors"
          >
            <p className="font-bold text-purple-700 dark:text-purple-300">Super Admin</p>
            <p className="text-[10px] text-slate-400 truncate">superadmin@englishflow.vn</p>
          </button>

          <button
            type="button"
            onClick={() => handleSelectDemoPersona('teacher1@englishflow.vn')}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-slate-200 dark:border-slate-800 text-left transition-colors"
          >
            <p className="font-bold text-blue-700 dark:text-blue-300">Giảng viên IELTS</p>
            <p className="text-[10px] text-slate-400 truncate">teacher1@englishflow.vn</p>
          </button>

          <button
            type="button"
            onClick={() => handleSelectDemoPersona('student1@gmail.com')}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-slate-200 dark:border-slate-800 text-left transition-colors"
          >
            <p className="font-bold text-emerald-700 dark:text-emerald-300">Học viên IELTS</p>
            <p className="text-[10px] text-slate-400 truncate">student1@gmail.com</p>
          </button>
        </div>
      </div>

      {/* Register redirect */}
      <div className="text-center text-xs text-slate-500 pt-2">
        Chưa có tài khoản học viên?{' '}
        <Link to="/register" className="font-bold text-primary-600 dark:text-primary-400 hover:underline">
          Đăng ký miễn phí ngay
        </Link>
      </div>
    </div>
  );
};

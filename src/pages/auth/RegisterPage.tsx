import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuthStore } from '../../store/authStore';
import { isValidEmail, isValidPhoneVi, checkPasswordStrength } from '../../utils/validators';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);
  const [formError, setFormError] = useState<string>('');

  const passwordStrength = checkPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Vui lòng nhập họ và tên của bạn');
      return;
    }
    if (!isValidEmail(email)) {
      setFormError('Địa chỉ email không hợp lệ');
      return;
    }
    if (phone && !isValidPhoneVi(phone)) {
      setFormError('Số điện thoại không đúng định dạng (VD: 0912345678)');
      return;
    }
    if (password.length < 6) {
      setFormError('Mật khẩu tối thiểu phải từ 6 ký tự');
      return;
    }
    if (!agreeTerms) {
      setFormError('Bạn cần đồng ý với điều khoản sử dụng nền tảng');
      return;
    }

    try {
      await register({
        name,
        email,
        password,
        role,
        tenantId: 'tenant-hcm',
      });
      navigate('/admin/dashboard');
    } catch (err: any) {
      setFormError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Khởi tạo tài khoản mới
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Gia nhập nền tảng đào tạo tiếng Anh thông minh với trợ lý AI Co-Pilot
        </p>
      </div>

      {(formError || error) && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError || error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role toggle */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
            Bạn đăng ký với vai trò
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`p-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                role === 'STUDENT'
                  ? 'bg-primary-50 dark:bg-primary-950/60 border-primary-500 text-primary-600 dark:text-primary-300 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Học viên (Student)
            </button>
            <button
              type="button"
              onClick={() => setRole('TEACHER')}
              className={`p-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                role === 'TEACHER'
                  ? 'bg-primary-50 dark:bg-primary-950/60 border-primary-500 text-primary-600 dark:text-primary-300 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Giảng viên (Teacher)
            </button>
          </div>
        </div>

        <Input
          label="Họ và tên"
          placeholder="Nguyễn Văn A"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<User className="w-4 h-4 text-slate-400" />}
          required
        />

        <Input
          label="Email liên hệ"
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          required
        />

        <Input
          label="Số điện thoại (tùy chọn)"
          type="tel"
          placeholder="0912 345 678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
        />

        <div className="space-y-1">
          <Input
            label="Mật khẩu"
            type="password"
            placeholder="Tối thiểu 6 ký tự"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            required
          />
          {password && (
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
              <span>Độ bảo mật:</span>
              <span className={`font-bold ${
                passwordStrength.label === 'Mạnh' ? 'text-emerald-500' :
                passwordStrength.label === 'Trung bình' ? 'text-amber-500' : 'text-rose-500'
              }`}>
                {passwordStrength.label}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            id="terms"
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
          />
          <label htmlFor="terms" className="text-xs text-slate-500 dark:text-slate-400">
            Tôi đồng ý với <a href="#" className="text-primary-600 dark:text-primary-400 underline">Điều khoản dịch vụ</a> và <a href="#" className="text-primary-600 dark:text-primary-400 underline">Chính sách bảo mật</a>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          loading={isLoading}
          className="shadow-lg shadow-primary-500/25 mt-2"
        >
          Đăng ký tài khoản
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-2">
        Đã có tài khoản EnglishFlow?{' '}
        <Link to="/login" className="font-bold text-primary-600 dark:text-primary-400 hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
};

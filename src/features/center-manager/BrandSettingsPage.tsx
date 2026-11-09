import React, { useState, useEffect } from 'react'
import {
  Palette,
  Sparkles,
  Globe,
  Check,
  RefreshCw,
  Eye,
  Building,
  AlertCircle,
} from 'lucide-react'
import { useTenantTheme } from '@/context/TenantThemeContext'
import { Button } from '@/components/common/Button'
import { useToast } from '@/hooks/useToast'

interface ColorPreset {
  name: string
  primary: string
  secondary: string
  description: string
}

const COLOR_PRESETS: ColorPreset[] = [
  {
    name: 'Modern Indigo (Mặc định)',
    primary: '#4f46e5',
    secondary: '#06b6d4',
    description: 'Chuyên nghiệp, công nghệ cao và hiện đại',
  },
  {
    name: 'Ocean Sapphire',
    primary: '#0284c7',
    secondary: '#38bdf8',
    description: 'Năng động, tươi sáng và đáng tin cậy',
  },
  {
    name: 'Emerald Growth',
    primary: '#059669',
    secondary: '#10b981',
    description: 'Tập trung phát triển, bền vững và tri thức',
  },
  {
    name: 'Royal Violet',
    primary: '#7c3aed',
    secondary: '#c084fc',
    description: 'Cao cấp, sáng tạo và chuẩn học thuật quốc tế',
  },
  {
    name: 'Sunset Amber',
    primary: '#ea580c',
    secondary: '#f59e0b',
    description: 'Ấm áp, truyền cảm hứng và nhiệt huyết',
  },
  {
    name: 'Crimson Passion',
    primary: '#e11d48',
    secondary: '#f43f5e',
    description: 'Mạnh mẽ, tự tin và hướng đến mục tiêu cao',
  },
]

export const BrandSettingsPage: React.FC = () => {
  const { theme, updateTheme } = useTenantTheme()
  const { info } = useToast()

  const [name, setName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#4f46e5')
  const [secondaryColor, setSecondaryColor] = useState('#06b6d4')
  const [faviconUrl, setFaviconUrl] = useState('')
  const [customDomain, setCustomDomain] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Sync form when theme is loaded or updated
  useEffect(() => {
    if (theme) {
      setName(theme.name || '')
      setLogoUrl(theme.logoUrl || '')
      setPrimaryColor(theme.primaryColor || '#4f46e5')
      setSecondaryColor(theme.secondaryColor || '#06b6d4')
      setFaviconUrl(theme.faviconUrl || '')
      setCustomDomain(theme.customDomain || '')
    }
  }, [theme])

  const handleApplyPreset = (preset: ColorPreset) => {
    setPrimaryColor(preset.primary)
    setSecondaryColor(preset.secondary)
    info(`Đã chọn bảng màu: ${preset.name}`)
  }

  const handleResetDefault = () => {
    setPrimaryColor('#4f46e5')
    setSecondaryColor('#06b6d4')
    setLogoUrl('')
    setFaviconUrl('')
    info('Đã khôi phục giá trị mặc định hệ thống')
  }

  /**
   * Pessimistic Update:
   * 1. Validate inputs
   * 2. Send API request
   * 3. Update UI state only upon HTTP 200/201 response
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    // Basic validation
    if (!name.trim()) {
      setErrorMsg('Tên trung tâm không được để trống.')
      return
    }

    const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
    if (!hexRegex.test(primaryColor)) {
      setErrorMsg('Mã màu Primary phải là định dạng HEX hợp lệ (VD: #4f46e5)')
      return
    }
    if (!hexRegex.test(secondaryColor)) {
      setErrorMsg('Mã màu Secondary phải là định dạng HEX hợp lệ (VD: #06b6d4)')
      return
    }

    setIsSubmitting(true)

    try {
      await updateTheme({
        name: name.trim(),
        logoUrl: logoUrl.trim() || null,
        primaryColor,
        secondaryColor,
        faviconUrl: faviconUrl.trim() || null,
        customDomain: customDomain.trim() || null,
      })
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Lỗi khi lưu cấu hình thương hiệu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <Palette className="w-4 h-4" />
            White-Label & Dynamic Theming
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Cấu hình Thương hiệu Cơ sở
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tùy biến nhận diện thương hiệu học viện: Tên cơ sở, Logo, Tông màu chủ đạo và Tên miền riêng.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDefault}
            disabled={isSubmitting}
            className="gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Mặc định
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            className="gap-2 shadow-lg shadow-primary/20"
          >
            <Check className="w-4 h-4" />
            Lưu thay đổi
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Settings & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: 7 cols */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* Section 1: Thông tin thương hiệu */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Building className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Thông tin nhận diện cơ bản
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Tên trung tâm / Học viện <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: EnglishFlow Hà Nội Campus"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-slate-400 mt-1.5">
                Hiển thị trên tiêu đề hệ thống, thanh điều hướng và mẫu email tự động.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Đường dẫn Logo trung tâm (URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Đề xuất logo tỷ lệ 1:1 hoặc hình ngang có nền trong suốt (PNG/SVG).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Đường dẫn Favicon (URL)
                </label>
                <input
                  type="url"
                  value={faviconUrl}
                  onChange={(e) => setFaviconUrl(e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Tên miền riêng (Custom Domain)
                </label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="lms.trungtamcuaban.edu.vn"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Màu sắc & CSS Variables */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Bảng màu Dynamic Theming (CSS Variables)
              </h2>
            </div>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Primary Color */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Màu chủ đạo (Primary)
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-11 h-11 rounded-xl cursor-pointer border-0 bg-transparent"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#4f46e5"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm uppercase bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Áp dụng cho nút chính, thanh điều hướng, badge và liên kết active.
                </p>
              </div>

              {/* Secondary Color */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Màu phụ trợ (Secondary / Accent)
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-11 h-11 rounded-xl cursor-pointer border-0 bg-transparent"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#06b6d4"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm uppercase bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Áp dụng cho hiệu ứng gradient, điểm nhấn và thẻ bài giảng.
                </p>
              </div>
            </div>

            {/* Presets List */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                Bộ phối màu đề xuất (Quick Presets)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {COLOR_PRESETS.map((preset, idx) => {
                  const isSelected =
                    primaryColor.toLowerCase() === preset.primary.toLowerCase() &&
                    secondaryColor.toLowerCase() === preset.secondary.toLowerCase()

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex -space-x-1 shrink-0">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"
                          style={{ backgroundColor: preset.secondary }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {preset.name}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                        </div>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {preset.description}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </form>

        {/* Right Live Preview: 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Trực quan hóa Thời gian thực (Live Preview)
                </h3>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
                Active CSS Preview
              </span>
            </div>

            {/* Simulated Desktop Client Header */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-lg">
              {/* Fake Browser Toolbar */}
              <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono bg-white dark:bg-slate-900 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-800 max-w-[200px] truncate">
                  <Globe className="w-3 h-3 text-slate-400" />
                  {customDomain || 'lms.englishflow.vn'}
                </div>
                <div className="w-8" />
              </div>

              {/* Simulated Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo preview"
                      className="w-8 h-8 rounded-xl object-cover shadow-sm"
                      onError={(e) => {
                        ;(e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block leading-tight">
                      {name || 'Tên trung tâm của bạn'}
                    </span>
                    <span className="text-[9px] text-slate-400 tracking-wider uppercase font-semibold">
                      Student Workspace
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] px-2.5 py-1 rounded-full text-white font-bold shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Đăng nhập
                  </span>
                </div>
              </div>

              {/* Simulated Content Body */}
              <div className="p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
                {/* Course Card Preview */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                      style={{
                        background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
                      }}
                    >
                      IELTS Intensive B2-C1
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      4.200.000 đ
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                    Luyện thi IELTS Cấp Tốc cùng AI Examiner & Giáo viên Bản Ngữ
                  </h4>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      className="flex-1 py-1.5 rounded-lg text-white text-[11px] font-bold shadow-sm transition-transform active:scale-95"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Ghi danh ngay
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors"
                      style={{
                        borderColor: primaryColor,
                        color: primaryColor,
                      }}
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>

                {/* Email Template Preview Card */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Mẫu Email Biên lai & Chào mừng
                    </span>
                  </div>
                  <div
                    className="p-3 rounded-lg text-white text-center"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <p className="text-[11px] font-bold m-0">{name || 'EnglishFlow Academy'}</p>
                    <p className="text-[9px] opacity-80 m-0">Biên lai thanh toán điện tử & Tài khoản học tập</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips Box */}
            <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                💡 Lưu ý kỹ thuật White-label:
              </span>
              <p>
                - Sau khi lưu, hệ thống áp dụng ngay qua CSS Variables lên toàn bộ ứng dụng mà không cần khởi động lại server.
              </p>
              <p>
                - Toàn bộ email gửi đến học viên qua Nodemailer/SMTP sẽ mang tên và mã màu thương hiệu đã chọn.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrandSettingsPage

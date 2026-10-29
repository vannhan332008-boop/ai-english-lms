import React, { useState } from 'react'
import {
  Sparkles,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Save,
  RefreshCw,
  Key,
  HardDrive,
  Sliders,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/hooks/useToast'

export const AISystemStudioPage: React.FC = () => {
  const { success, info } = useToast()

  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai'>('gemini')
  const [mockMode, setMockMode] = useState(true)
  const [apiKey, setApiKey] = useState('AIzaSyD-mock-vietnam-edtech-key-2026')
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState('120')
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      success('Đã lưu cấu hình AI Engine!', 'Hệ thống đã cập nhật cài đặt API và hạn mức toàn sàn.')
    }, 600)
  }

  const handleTestConnection = () => {
    info(
      'Kiểm tra kết nối AI...',
      'Đang gửi prompt kiểm thử barem IELTS Writing tới Gemini 2.5 API...'
    )
    setTimeout(() => {
      success('Kết nối API Hoàn Hảo (Latency: 178ms)', 'Mô hình AI sẵn sàng phục vụ 35 trung tâm.')
    }, 1000)
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Giám Sát Tài Nguyên AI & Cài Đặt Toàn Cục
            </h1>
            <Badge variant="default" className="text-xs font-semibold">
              AI Engine v2.4
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Quản trị Model LLM, hạn mức Token toàn hệ thống và bảo mật dữ liệu khảo thí.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleTestConnection} className="gap-1.5 text-xs">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Test Ping AI API</span>
          </Button>
          <Button size="sm" onClick={handleSaveSettings} disabled={isSaving} className="gap-1.5 text-xs shadow-sm">
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Chế Độ Hoạt Động AI</span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-black text-foreground">
              {mockMode ? 'MOCK_MODE (An toàn)' : 'LIVE PRODUCTION'}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {mockMode
              ? 'Trả kết quả mẫu chuẩn xác, không trừ phí API của nhà phát triển.'
              : 'Kết nối trực tiếp Gemini 2.5 API sản phẩm thực.'}
          </p>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Tổng Token Đã Cấp Phát</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-black text-foreground">25.0M Tokens / tháng</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Đã sử dụng: <strong className="text-primary">14.8M (59.2%)</strong> trong tháng 10.
          </p>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Chi Phí API Ước Tính</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-black text-foreground">412.50 USD</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Tỷ lệ chi phí API / Doanh thu MRR: <strong className="text-emerald-500 font-bold">2.2%</strong> (Biên lợi nhuận cực cao)
          </p>
        </Card>
      </div>

      {/* Main Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle className="text-base font-bold">Cấu Hình Model AI & Nhà Cung Cấp</CardTitle>
            <CardDescription>
              Thiết lập kết nối với Google Gemini hoặc OpenAI cho tính năng chấm bài và trợ giảng
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Nhà cung cấp Mô hình AI Cốt Lõi"
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value as 'gemini' | 'openai')}
                  options={[
                    { value: 'gemini', label: 'Google Gemini 2.5 Flash / Pro (Khuyên dùng)' },
                    { value: 'openai', label: 'OpenAI GPT-4o Mini (Dự phòng)' },
                  ]}
                />
                <Select
                  label="Chế độ Mock Dữ Liệu (AI_MOCK_MODE)"
                  value={mockMode ? 'true' : 'false'}
                  onChange={(e) => setMockMode(e.target.value === 'true')}
                  options={[
                    { value: 'true', label: 'Bật (Mock Mode - Tiết kiệm chi phí)' },
                    { value: 'false', label: 'Tắt (Live API Key)' },
                  ]}
                />
              </div>

              <Input
                label="API Key Bí Mật (Server-side Only)"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                leftIcon={<Key className="w-4 h-4" />}
                helperText="Khóa API được lưu trữ mã hóa an toàn và chỉ sử dụng tại Backend."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Tối đa lượt gọi AI / phút / cơ sở (Rate Limit)"
                  type="number"
                  value={rateLimitPerMinute}
                  onChange={(e) => setRateLimitPerMinute(e.target.value)}
                  leftIcon={<Sliders className="w-4 h-4" />}
                  helperText="Chống spam và phòng ngừa bot gọi API quá mức."
                />
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">
                    Ngưỡng Cảnh Báo Quota Trung Tâm
                  </label>
                  <Select
                    defaultValue="85"
                    options={[
                      { value: '75', label: 'Khi đạt 75% hạn mức' },
                      { value: '85', label: 'Khi đạt 85% hạn mức (Khuyên dùng)' },
                      { value: '95', label: 'Khi đạt 95% hạn mức' },
                    ]}
                  />
                  <p className="text-[11px] text-muted-foreground">Tự động gửi email cảnh báo tới Quản lý cơ sở.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-primary" />
                  <span>Trọng Số Tiêu Chuẩn Barem Chấm Điểm (IELTS / CEFR)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-background border border-border">
                    <span className="text-[10px] text-muted-foreground">Task Achievement</span>
                    <p className="font-bold text-foreground">25% (Trọng số 1.0)</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-background border border-border">
                    <span className="text-[10px] text-muted-foreground">Coherence</span>
                    <p className="font-bold text-foreground">25% (Trọng số 1.0)</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-background border border-border">
                    <span className="text-[10px] text-muted-foreground">Lexical Resource</span>
                    <p className="font-bold text-foreground">25% (Trọng số 1.0)</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-background border border-border">
                    <span className="text-[10px] text-muted-foreground">Grammar Accuracy</span>
                    <p className="font-bold text-foreground">25% (Trọng số 1.0)</p>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* System Health & Legal Compliance */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Tuân Thủ Pháp Lý & An Toàn</CardTitle>
              <CardDescription>Quy chuẩn bảo vệ dữ liệu cá nhân</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Nghị định 13/2023/NĐ-CP (PDPD)</strong>
                  <p className="text-[11px] text-muted-foreground">
                    Toàn bộ file ghi âm và bài viết học viên lưu trữ độc quyền trên máy chủ tại Việt Nam.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Không Huấn Luyện Ngược (Zero Data Training)</strong>
                  <p className="text-[11px] text-muted-foreground">
                    Đề thi độc quyền của đối tác không bị dùng để train các mô hình AI công cộng.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Mã Hóa AES-256</strong>
                  <p className="text-[11px] text-muted-foreground">
                    Mã hóa toàn bộ cơ sở dữ liệu và token phân quyền giữa các tenant.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="text-[11px] font-medium">Bản sao lưu tự động tiếp theo: 02:00 sáng mai</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Thao Tác Bảo Trì</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <Button
                variant="outline"
                className="w-full text-xs font-semibold justify-start gap-2"
                onClick={() => success('Đã xóa Cache AI!', 'Hệ thống đã làm mới bộ đệm ngữ cảnh prompt.')}
              >
                <HardDrive className="w-3.5 h-3.5 text-primary" />
                <span>Xóa Cache Prompt AI Toàn Hệ Thống</span>
              </Button>
              <Button
                variant="outline"
                className="w-full text-xs font-semibold justify-start gap-2"
                onClick={() => success('Đã đồng bộ Quota!', 'Hạn mức token tháng mới đã được phân bổ cho 35 cơ sở.')}
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                <span>Đồng Bộ Lại Quota Đầu Tháng Cho Tất Cả Cơ Sở</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

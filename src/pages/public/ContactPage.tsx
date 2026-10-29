import React, { useState } from 'react'
import {
  Building2,
  Mail,
  PhoneCall,
  Send,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks/useToast'

export const ContactPage: React.FC = () => {
  const { success } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    centerName: '',
    contactName: '',
    email: '',
    phone: '',
    city: 'Hồ Chí Minh',
    studentRange: '100-300',
    preferredTime: 'Sáng (09:00 - 11:30)',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      success(
        'Đăng ký lịch Demo thành công!',
        'Chuyên viên của EnglishFlow sẽ liên hệ qua Zalo/Điện thoại trong vòng 30 phút.'
      )
    }, 800)
  }

  return (
    <div className="space-y-16 py-16">
      {/* Header */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <Badge variant="default" className="text-xs font-semibold">
          Đồng Hành & Đột Phá
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          Đặt Lịch Demo & Tư Vấn Giải Pháp
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Trải nghiệm trực tiếp buổi làm việc 1-1 cùng chuyên gia công nghệ giáo dục để giải quyết bài toán vận hành của trung tâm bạn.
        </p>
      </section>

      {/* Main Form & Contact Info */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Office info & Direct Hotline */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <Card className="border-border">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-foreground">Trụ sở & Văn phòng đại diện</h3>
                  <p className="text-xs text-muted-foreground">
                    Chúng tôi sẵn sàng đón tiếp quý đối tác đến thăm và trao đổi trực tiếp.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-foreground">Trụ sở TP. Hồ Chí Minh</strong>
                      <p className="text-muted-foreground mt-0.5 leading-relaxed">
                        Tầng 18, Landmark 81, 208 Nguyễn Hữu Cảnh, P.22, Q. Bình Thạnh
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-foreground">Văn phòng Hà Nội</strong>
                      <p className="text-muted-foreground mt-0.5 leading-relaxed">
                        Tòa nhà Lotte Center, 54 Liễu Giai, Q. Ba Đình, Hà Nội
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-foreground">Hotline Hỗ Trợ Đối Tác</strong>
                      <p className="text-primary font-bold mt-0.5">1900 6886 / 0901 234 567</p>
                      <p className="text-[11px] text-muted-foreground">Thứ 2 - Thứ 7 (8:00 - 21:00)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-foreground">Email Hợp Tác Doanh Nghiệp</strong>
                      <p className="text-foreground font-medium mt-0.5">partnership@englishflow.vn</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Cam kết phản hồi trong 30 phút</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Đội ngũ tư vấn am hiểu sâu sắc mô hình đào tạo IELTS & TOEIC sẽ trực tiếp demo tính năng phù hợp nhất với trung tâm của bạn.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Interactive Consultation Form */}
          <div className="lg:col-span-7">
            <Card className="border-border">
              <CardContent className="p-8">
                {isSubmitted ? (
                  <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      Cảm ơn bạn đã đăng ký Demo!
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Thông tin của trung tâm <strong className="text-foreground">{formData.centerName || 'bạn'}</strong> đã được chuyển giao tới Giám đốc giải pháp. Chúng tôi sẽ liên hệ trong khung giờ{' '}
                      <span className="text-primary font-semibold">{formData.preferredTime}</span>.
                    </p>
                    <div className="pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsSubmitted(false)
                          setFormData({
                            centerName: '',
                            contactName: '',
                            email: '',
                            phone: '',
                            city: 'Hồ Chí Minh',
                            studentRange: '100-300',
                            preferredTime: 'Sáng (09:00 - 11:30)',
                            message: '',
                          })
                        }}
                      >
                        Gửi thêm yêu cầu khác
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-foreground">
                        Điền thông tin nhận lịch Demo 1-1
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Hoàn toàn miễn phí và không ràng buộc hợp đồng.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <Input
                        label="Tên trung tâm Anh ngữ"
                        placeholder="VD: IELTS Master Academy"
                        required
                        value={formData.centerName}
                        onChange={(e) => setFormData({ ...formData, centerName: e.target.value })}
                      />
                      <Input
                        label="Họ và tên người liên hệ"
                        placeholder="VD: Nguyễn Thu Hà"
                        required
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Email công việc"
                        type="email"
                        placeholder="ha.nguyen@ieltsmaster.edu.vn"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                      <Input
                        label="Số điện thoại / Zalo"
                        placeholder="0912 345 678"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Select
                        label="Khu vực trung tâm"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        options={[
                          { value: 'Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
                          { value: 'Hà Nội', label: 'Hà Nội' },
                          { value: 'Đà Nẵng', label: 'Đà Nẵng' },
                          { value: 'Cần Thơ', label: 'Cần Thơ' },
                          { value: 'Hải Phòng', label: 'Hải Phòng' },
                          { value: 'Khác', label: 'Tỉnh thành khác' },
                        ]}
                      />
                      <Select
                        label="Quy mô học viên hiện tại"
                        value={formData.studentRange}
                        onChange={(e) => setFormData({ ...formData, studentRange: e.target.value })}
                        options={[
                          { value: 'under-100', label: 'Dưới 100 học viên' },
                          { value: '100-300', label: '100 - 300 học viên' },
                          { value: '300-600', label: '300 - 600 học viên' },
                          { value: 'over-600', label: 'Trên 600 học viên (Đa chi nhánh)' },
                        ]}
                      />
                    </div>

                    <Select
                      label="Khung giờ muốn xem Demo"
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      options={[
                        { value: 'Sáng (09:00 - 11:30)', label: 'Buổi sáng (09:00 - 11:30)' },
                        { value: 'Chiều (14:00 - 17:00)', label: 'Buổi chiều (14:00 - 17:00)' },
                        { value: 'Tối (19:00 - 20:30)', label: 'Buổi tối (19:00 - 20:30)' },
                      ]}
                    />

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-foreground">
                        Mục tiêu quan tâm nhất (Không bắt buộc)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="VD: Cần AI chấm bài Writing IELTS, quản lý điểm danh và tự động gửi tin Zalo cho phụ huynh..."
                        className="w-full rounded-lg border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-11 text-xs font-bold gap-2 shadow-md shadow-primary/25"
                      >
                        {isSubmitting ? (
                          <span>Đang gửi thông tin...</span>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Xác Nhận Đặt Lịch Demo Ngay</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

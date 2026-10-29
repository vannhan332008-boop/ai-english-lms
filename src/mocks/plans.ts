export interface PricingPlan {
  id: string
  name: string
  code: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  tagline: string
  monthlyPrice: number
  annualPricePerMonth: number
  badge?: string
  popular?: boolean
  maxStudents: number
  maxTeachers: number
  aiTokensPerMonth: string
  features: {
    name: string
    included: boolean
    tooltip?: string
  }[]
}

export const mockPricingPlans: PricingPlan[] = [
  {
    id: 'plan_starter',
    name: 'Gói Khởi Nghiệp (Starter)',
    code: 'STARTER',
    tagline: 'Dành cho các trung tâm vừa mở hoặc trung tâm độc lập quy mô nhỏ.',
    monthlyPrice: 4990000,
    annualPricePerMonth: 3990000,
    maxStudents: 150,
    maxTeachers: 10,
    aiTokensPerMonth: '250.000 tokens (~200 bài luận)',
    features: [
      { name: 'Quản lý tối đa 150 học viên & 10 giáo viên', included: true },
      { name: 'Tạo lớp học, điểm danh & phân lịch học', included: true },
      { name: 'AI Chấm bài Writing cơ bản (sửa lỗi ngữ pháp)', included: true },
      { name: 'Kho học liệu & đề thi trắc nghiệm không giới hạn', included: true },
      { name: 'AI Chấm nói Speaking (phân tích sóng âm IPA)', included: false },
      { name: 'Tự động tạo báo cáo tiến độ gửi Zalo phụ huynh', included: false },
      { name: 'Tùy biến tên miền riêng & logo trung tâm', included: false },
      { name: 'Hỗ trợ kỹ thuật 24/7 & Quản lý tài khoản riêng', included: false },
    ],
  },
  {
    id: 'plan_pro',
    name: 'Gói Chuyên Nghiệp (Professional)',
    code: 'PROFESSIONAL',
    tagline: 'Giải pháp hoàn hảo cho trung tâm phát triển nhanh cần bứt phá chất lượng.',
    monthlyPrice: 12990000,
    annualPricePerMonth: 9990000,
    popular: true,
    badge: 'Được ưa chuộng nhất',
    maxStudents: 600,
    maxTeachers: 35,
    aiTokensPerMonth: '1.200.000 tokens (~1.000 bài)',
    features: [
      { name: 'Quản lý tối đa 600 học viên & 35 giáo viên', included: true },
      { name: 'Toàn bộ tính năng vận hành của gói Starter', included: true },
      { name: 'AI Chấm bài Writing chuẩn Barem IELTS / TOEIC', included: true },
      { name: 'AI Chấm nói Speaking phát hiện lỗi IPA tức thì', included: true },
      { name: 'AI Co-pilot: Tự động soạn giáo án & đề trắc nghiệm', included: true },
      { name: 'Hệ thống thẻ ghi nhớ Spaced Repetition (SRS SM-2)', included: true },
      { name: 'Tự động xuất báo cáo PDF gửi phụ huynh hàng tháng', included: true },
      { name: 'Tùy biến tên miền trung tâm (Subdomain riêng)', included: true },
      { name: 'Hỗ trợ kỹ thuật ưu tiên qua nhóm Zalo VIP', included: true },
    ],
  },
  {
    id: 'plan_enterprise',
    name: 'Gói Doanh Nghiệp (Enterprise)',
    code: 'ENTERPRISE',
    tagline: 'Dành cho chuỗi học viện nhượng quyền, tập đoàn giáo dục nhiều chi nhánh.',
    monthlyPrice: 29990000,
    annualPricePerMonth: 23990000,
    badge: 'Quy mô chuỗi',
    maxStudents: 9999,
    maxTeachers: 999,
    aiTokensPerMonth: '5.000.000 tokens (Tùy chỉnh)',
    features: [
      { name: 'Không giới hạn số lượng học viên & giáo viên', included: true },
      { name: 'Quản lý phân cấp Multi-campus đa chi nhánh toàn quốc', included: true },
      { name: 'Toàn bộ tính năng AI Writing, Speaking & Giáo án đỉnh cao', included: true },
      { name: 'Tùy biến White-label hoàn toàn (Logo, Domain, App di động)', included: true },
      { name: 'Tích hợp cổng thanh toán MoMo, VNPay, chuyển khoản tự động', included: true },
      { name: 'Kết nối API đồng bộ dữ liệu vào hệ thống ERP / CRM có sẵn', included: true },
      { name: 'Cam kết Uptime SLA 99.9% & Sao lưu dữ liệu hàng giờ', included: true },
      { name: 'Chuyên viên kỹ thuật cấp cao đồng hành và đào tạo On-site', included: true },
    ],
  },
]


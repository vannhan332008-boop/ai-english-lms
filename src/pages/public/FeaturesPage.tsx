import React from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Volume2,
  Cpu,
  Repeat,
  Building2,
  BellRing,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'

export const FeaturesPage: React.FC = () => {
  const featureList = [
    {
      icon: FileText,
      badge: 'Công Nghệ Cốt Lõi',
      title: 'AI Chấm Bài Viết Writing Rubric 4 Tiêu Chí',
      description:
        'Hệ thống đánh giá bài luận IELTS Task 1, Task 2 và TOEIC Writing dựa trên barem chuẩn khảo thí quốc tế của IDP, British Council và ETS.',
      highlights: [
        'Chấm điểm chi tiết 4 tiêu chí: Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range',
        'Chỉ rõ từng câu sai ngữ pháp và đưa ra phương án viết lại nâng cấp band (Band Upgrade Suggestion)',
        'Giáo viên có quyền xem lại, điều chỉnh điểm số và duyệt lời phê trước khi gửi cho học viên (Co-pilot Mode)',
      ],
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
    },
    {
      icon: Volume2,
      badge: 'Đột Phá Luyện Nói',
      title: 'AI Chấm Nói Speaking & Phân Tích Âm Vị IPA',
      description:
        'Công nghệ nhận diện giọng nói phân tích chính xác từng sóng âm, phát hiện lỗi nuốt âm đuôi và nhấn sai trọng âm của người Việt.',
      highlights: [
        'Chấm điểm 4 tiêu chuẩn: Fluency, Pronunciation, Lexical Resource, Grammatical Accuracy',
        'Hiển thị trực quan từ phát âm chuẩn (màu xanh) và từ sai trọng âm (màu đỏ) kèm phiên âm IPA chuẩn',
        'Tự động tổng hợp danh sách từ phát âm kém vào bộ bài tập Shadowing hàng ngày của học viên',
      ],
      image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
    },
    {
      icon: Cpu,
      badge: 'Trợ Giảng AI Thông Minh',
      title: 'AI Co-pilot: Soạn Giáo Án & Đề Thi Trong 3 Giây',
      description:
        'Giải phóng tới 70% thời gian chuẩn bị bài giảng cho giáo viên bản ngữ và trợ giảng nhờ trí tuệ nhân tạo thế hệ mới.',
      highlights: [
        'Nhập chủ đề bất kỳ để sinh giáo án 45-90 phút với đầy đủ các bước Warm-up, Guided Practice và Debate',
        'Tự động trích xuất bộ từ vựng Academic kèm ví dụ thực tế và giải thích nghĩa tiếng Việt chuẩn xác',
        'Sinh ngân hàng câu hỏi trắc nghiệm kiểm tra bài cũ có đáp án và lời giải chi tiết',
      ],
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    },
    {
      icon: Repeat,
      badge: 'Khoa Học Trí Nhớ',
      title: 'Học Từ Vựng Spaced Repetition (SRS SM-2)',
      description:
        'Thuật toán lặp lại ngắt quãng SM-2 giúp học viên ghi nhớ từ vựng học thuật vĩnh viễn với số lần ôn tập tối ưu nhất.',
      highlights: [
        'Tự động tính toán chu kỳ ôn tập (1 ngày, 3 ngày, 7 ngày, 14 ngày, 30 ngày) dựa trên mức độ thuộc bài',
        'Theo dõi chuỗi học tập liên tục (Streak Days) tạo động lực học tập chủ động mỗi ngày',
        'Tích hợp âm thanh phát âm bản ngữ chuẩn Oxford và ví dụ ngữ cảnh sinh động',
      ],
      image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop&q=80',
    },
    {
      icon: Building2,
      badge: 'Quản Trị Tối Ưu',
      title: 'Vận Hành Trung Tâm Toàn Diện (Multi-tenant ERP)',
      description:
        'Nền tảng quản lý đồng bộ từ xếp lớp, điểm danh, phân công giảng viên đến theo dõi doanh thu học phí từng chi nhánh.',
      highlights: [
        'Cô lập dữ liệu tuyệt đối giữa các cơ sở trung tâm: Quản lý chi nhánh A không xem được dữ liệu chi nhánh B',
        'Xếp lịch học thông minh, chống trùng lịch phòng lab và trùng giáo viên',
        'Báo cáo phân tích tỷ lệ chuyên cần, tỷ lệ nộp bài tập và học lực trung bình của từng lớp',
      ],
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80',
    },
    {
      icon: BellRing,
      badge: 'Chăm Sóc Khách Hàng',
      title: 'Báo Cáo Tự Động Gửi Zalo Cho Phụ Huynh',
      description:
        'Tạo dựng niềm tin vững chắc với phụ huynh thông qua các bản tin tiến độ định kỳ được gửi tự động qua Zalo OA hoặc SMS.',
      highlights: [
        'Thông báo điểm danh ngay khi học viên check-in vào lớp học',
        'Gửi phiếu báo cáo kết quả thi thử định kỳ có nhận xét của giáo viên và biểu đồ tiến bộ',
        'Giảm tải 80% thời gian gọi điện tư vấn và trả lời thắc mắc của phụ huynh cho nhân viên tư vấn',
      ],
      image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80',
    },
  ]

  return (
    <div className="space-y-24 py-16">
      {/* Header */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <Badge variant="default" className="text-xs font-semibold">
          Tổng Quan Tính Năng Chi Tiết
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          Hệ sinh thái công nghệ toàn diện cho Trung tâm Anh ngữ
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Được thiết kế từ thực tế nhu cầu của hơn 35 trung tâm tại Việt Nam nhằm giải quyết triệt để các rào cản trong đào tạo và quản lý.
        </p>
      </section>

      {/* Feature Deep-dive list */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {featureList.map((feat, idx) => {
          const isEven = idx % 2 === 1
          const Icon = feat.icon
          return (
            <div
              key={idx}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-10 items-center ${
                isEven ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className={`lg:col-span-6 space-y-4 ${isEven ? 'lg:order-2' : ''}`}>
                <div className="inline-flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <Badge variant="default" className="text-xs font-bold">
                    {feat.badge}
                  </Badge>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {feat.title}
                </h2>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>

                <div className="space-y-3 pt-2">
                  {feat.highlights.map((item, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-2.5 text-xs text-foreground/90">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Link to="/contact">
                    <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold">
                      <span>Xem thử bản Demo tính năng này</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className={`lg:col-span-6 ${isEven ? 'lg:order-1' : ''}`}>
                <div className="rounded-2xl border border-border overflow-hidden shadow-xl bg-card">
                  <img
                    src={feat.image}
                    alt={feat.title}
                    className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </section>

      {/* Security & Reliability */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-muted/30 border-border">
          <CardContent className="p-8 sm:p-12 space-y-8 text-center">
            <div className="space-y-2 max-w-2xl mx-auto">
              <Badge variant="outline" className="text-xs">
                Cam kết Hạ Tầng & Bảo Mật
              </Badge>
              <h3 className="text-2xl font-bold text-foreground">
                Bảo vệ tài sản tri thức & đề thi của trung tâm
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h4 className="text-xs font-bold text-foreground">Dữ liệu hoàn toàn riêng biệt</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Đề thi độc quyền, ngân hàng câu hỏi và thông tin học viên của mỗi trung tâm được mã hóa và lưu trữ tách biệt.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                <Zap className="w-5 h-5 text-primary" />
                <h4 className="text-xs font-bold text-foreground">Tốc độ phản hồi dưới 300ms</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cụm máy chủ đặt tại TP.HCM và Hà Nội, đảm bảo đường truyền ổn định không phụ thuộc vào cáp quang biển.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h4 className="text-xs font-bold text-foreground">Hỗ trợ kỹ thuật 24/7</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Đội ngũ kỹ sư tại Việt Nam trực tiếp hỗ trợ qua điện thoại, nhóm Zalo và cam kết xử lý sự cố trong vòng 15 phút.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Play,
  Volume2,
  FileText,
  Star,
  Users,
  Building2,
  GraduationCap,
  TrendingUp,
  Cpu,
  ChevronRight,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { mockMetrics, mockTestimonials, mockFaqs } from '@/mocks/landing'
import { mockPricingPlans } from '@/mocks/plans'

export const HomePage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 lg:pt-24">
        {/* Ambient Gradient Light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-primary/20 via-indigo-500/15 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Top Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-semibold shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <Sparkles className="h-3.5 w-3.5 text-primary animate-spin" style={{ animationDuration: '4s' }} />
            <span>Nền tảng Quản trị & Khảo thí Tiếng Anh AI Số 1 Việt Nam</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.12] max-w-4xl mx-auto">
            Tăng tốc điểm số học viên.
            <br />
            <span className="bg-gradient-to-r from-primary via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Tự động hóa vận hành
            </span>{' '}
            trung tâm.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Hệ sinh thái SaaS tích hợp AI chấm Writing & Speaking chuẩn Barem khảo thí quốc tế, quản lý lớp học và tự động gửi báo cáo Zalo cho phụ huynh.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            <Link to="/contact">
              <Button size="lg" className="shadow-lg shadow-primary/25 gap-2 text-sm font-bold h-12 px-7">
                Đặt lịch Demo Trực tiếp
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/admin/dashboard">
              <Button variant="outline" size="lg" className="h-12 px-6 gap-2 text-sm font-semibold">
                <Play className="h-4 w-4 text-primary fill-primary/20" />
                Dùng thử Dashboard Ngay
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Không cần cài đặt phức tạp</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Chấm IELTS & TOEIC trong 5 giây</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Bảo mật dữ liệu tuyệt đối</span>
            </div>
          </div>
        </div>

        {/* 2. LIVE INTERACTIVE AI DEMO WIDGET */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <div className="rounded-2xl border border-border/80 bg-card/90 shadow-2xl backdrop-blur-md overflow-hidden">
            <div className="bg-muted/60 px-5 py-3.5 border-b border-border/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-semibold text-muted-foreground ml-2">
                  Trải nghiệm Trực tiếp: EnglishFlow AI Intelligence Suite
                </span>
              </div>
              <Badge variant="default" className="text-[10px] uppercase tracking-wider font-bold">
                Mô phỏng Trực Quan
              </Badge>
            </div>

            <div className="p-6">
              <Tabs defaultValue="writing">
                <TabsList className="grid grid-cols-3 max-w-md mx-auto mb-6">
                  <TabsTrigger value="writing" className="gap-2">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    <span>AI Writing Rubric</span>
                  </TabsTrigger>
                  <TabsTrigger value="speaking" className="gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-primary" />
                    <span>AI Speaking & IPA</span>
                  </TabsTrigger>
                  <TabsTrigger value="copilot" className="gap-2">
                    <Cpu className="w-3.5 h-3.5 text-primary" />
                    <span>AI Soạn Giáo Án</span>
                  </TabsTrigger>
                </TabsList>

                {/* WRITING DEMO TAB */}
                <TabsContent value="writing">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Essay snippet */}
                    <div className="lg:col-span-7 space-y-3 bg-muted/20 p-5 rounded-xl border border-border/70 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">Đề bài: IELTS Writing Task 2</span>
                        <Badge variant="outline" className="text-[10px]">264 Từ</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground italic">
                        "Some argue that artificial intelligence will lead to mass unemployment. Discuss both views..."
                      </p>
                      <div className="text-xs text-foreground/90 leading-relaxed font-mono bg-background p-3.5 rounded-lg border border-border/60">
                        "...While some people believe that automation causes <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold px-1 rounded underline">massive job losses</span>, others assert that it unlocks unprecedented economic frontiers. In my opinion, technological revolutions historically create more occupations than they eliminate..."
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span>AI đã phát hiện 2 điểm cần cải thiện từ vựng trang trọng (C1)</span>
                      </div>
                    </div>

                    {/* AI Scorecard */}
                    <div className="lg:col-span-5 space-y-4 bg-primary/5 p-5 rounded-xl border border-primary/20 text-left">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-muted-foreground font-medium">Điểm Tổng Barem</span>
                          <div className="text-3xl font-black text-primary">Band 7.5</div>
                        </div>
                        <Badge variant="success" className="text-xs font-bold px-2.5 py-1">
                          Đạt Target 7.0+
                        </Badge>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Task Achievement:</span>
                          <span className="font-bold text-foreground">8.0 / 9.0</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: '88%' }} />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Coherence & Cohesion:</span>
                          <span className="font-bold text-foreground">7.5 / 9.0</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: '83%' }} />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Lexical Resource:</span>
                          <span className="font-bold text-foreground">8.0 / 9.0</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: '88%' }} />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Grammar Range & Accuracy:</span>
                          <span className="font-bold text-foreground">7.0 / 9.0</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: '77%' }} />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-primary/20">
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          💡 <strong className="text-foreground">Nhận xét của AI:</strong> Lập luận logic, sử dụng linh hoạt các liên từ học thuật. Đề xuất nâng cấp từ <code className="text-primary font-semibold">"massive job losses"</code> thành <code className="text-primary font-semibold">"labor market dislocation"</code>.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* SPEAKING DEMO TAB */}
                <TabsContent value="speaking">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center text-left">
                    <div className="lg:col-span-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">Bài ghi âm: IELTS Speaking Part 2</span>
                        <Badge variant="outline" className="text-[10px]">1 phút 48 giây</Badge>
                      </div>

                      {/* Mock waveform player */}
                      <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                        <div className="flex items-center gap-3">
                          <Button
                            size="icon"
                            variant="default"
                            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                            className="h-10 w-10 shrink-0"
                          >
                            <Volume2 className="h-5 w-5" />
                          </Button>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                              <span>00:42</span>
                              <span>01:48</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden flex items-center">
                              <div className="h-full bg-primary rounded-full" style={{ width: '40%' }} />
                            </div>
                          </div>
                        </div>

                        {/* Waveform graphic */}
                        <div className="flex items-end justify-between h-8 gap-1 pt-1 opacity-80">
                          {[30, 70, 45, 90, 60, 40, 85, 95, 30, 65, 80, 50, 75, 90, 40, 60, 85, 30, 70, 95, 60].map(
                            (height, i) => (
                              <div
                                key={i}
                                className={`flex-1 rounded-full ${i < 8 ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                style={{ height: `${height}%` }}
                              />
                            )
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Transcript: "I would like to talk about the urban tree canopy project initiated in Ho Chi Minh City..."
                      </p>
                    </div>

                    <div className="lg:col-span-6 space-y-3 bg-muted/20 p-5 rounded-xl border border-border/70">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-foreground">Phân tích Phát âm & Lỗi IPA Chi tiết</h4>
                        <span className="text-xs font-bold text-emerald-500">Fluency 7.0</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-background border border-border/60 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-foreground">canopy</span>
                            <span className="text-muted-foreground ml-2">/ˈkæn.ə.pi/</span>
                          </div>
                          <Badge variant="destructive" className="text-[10px]">
                            Lệch trọng âm: /kəˈnɒ.pi/
                          </Badge>
                        </div>

                        <div className="p-2.5 rounded-lg bg-background border border-border/60 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-foreground">saplings</span>
                            <span className="text-muted-foreground ml-2">/ˈsæp.lɪŋz/</span>
                          </div>
                          <Badge variant="success" className="text-[10px]">
                            Phát âm chuẩn 94%
                          </Badge>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-[11px] text-muted-foreground">
                        🎯 <strong className="text-foreground">Lộ trình rèn luyện:</strong> Học viên có xu hướng nhấn trọng âm thứ 2 đối với danh từ 3 âm tiết. Đã tự động tạo 5 bài tập Shadowing vào Flashcard SRS.
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* COPILOT DEMO TAB */}
                <TabsContent value="copilot">
                  <div className="p-5 rounded-xl bg-muted/20 border border-border text-left space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-foreground">Chủ đề: "Renewable Energy & Climate Solutions"</span>
                        <p className="text-[11px] text-muted-foreground">Thời lượng: 60 Phút | Trình độ: IELTS B2 (Band 6.0 - 6.5)</p>
                      </div>
                      <Badge variant="default" className="text-xs">
                        Sinh tự động trong 3.2 giây
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-background rounded-lg border border-border space-y-1">
                        <div className="font-semibold text-primary">00 - 15 Phút</div>
                        <div className="font-medium text-foreground">Khởi động & Kích hoạt từ vựng</div>
                        <p className="text-[11px] text-muted-foreground">Chiếu infographic biến đổi khí hậu, thảo luận nhóm 2 người.</p>
                      </div>

                      <div className="p-3 bg-background rounded-lg border border-border space-y-1">
                        <div className="font-semibold text-primary">15 - 40 Phút</div>
                        <div className="font-medium text-foreground">Phân tích Bẫy đề & Collocations</div>
                        <p className="text-[11px] text-muted-foreground">Cung cấp 8 collocations C1 (Cataclysmic, Mitigate, Carbon offset).</p>
                      </div>

                      <div className="p-3 bg-background rounded-lg border border-border space-y-1">
                        <div className="font-semibold text-primary">40 - 60 Phút</div>
                        <div className="font-medium text-foreground">Tranh biện & Sửa lỗi tức thì</div>
                        <p className="text-[11px] text-muted-foreground">Thực hành Fishbowl Debate. Bật AI Voice Recorder để chấm điểm.</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      {/* 3. METRICS / SOCIAL PROOF */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-border/80">
            {mockMetrics.map((item, idx) => (
              <div key={idx} className={idx > 0 ? 'pt-6 lg:pt-0 lg:pl-6' : ''}>
                <div className="text-3xl sm:text-5xl font-black text-primary tracking-tight">
                  {item.value}
                </div>
                <div className="text-sm font-bold text-foreground mt-2">{item.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. THREE CORE PILLARS FOR LANGUAGE CENTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="space-y-4 max-w-3xl mx-auto">
          <Badge variant="default" className="text-xs font-semibold">
            Đột phá Vận hành 2026
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Vì sao 35+ Trung tâm Anh ngữ chọn EnglishFlow?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Giải quyết triệt để 3 bài toán lớn nhất của người làm giáo dục: Nâng cao chất lượng đào tạo, Tối ưu hóa chi phí giáo viên và Giữ chân học viên.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <Card className="hover:border-primary/50 transition-all hover:shadow-lg group">
            <CardContent className="p-7 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">AI Co-pilot: Trả bài ngay trong 5 giây</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Học viên nộp bài luận Writing hoặc bản thu âm Speaking lúc nửa đêm vẫn nhận được feedback phân tích ngữ pháp, từ vựng và chấm band chi tiết tức thì.
              </p>
              <div className="pt-2 text-xs font-semibold text-primary flex items-center gap-1">
                Xem giải pháp Writing <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-all hover:shadow-lg group">
            <CardContent className="p-7 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">Quản lý Đa cơ sở (Multi-tenant)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Bảo mật dữ liệu tuyệt đối giữa các chi nhánh. Giám đốc chuỗi dễ dàng so sánh tỷ lệ hoàn thành bài tập, điểm trung bình và hiệu suất giảng viên giữa các cơ sở.
              </p>
              <div className="pt-2 text-xs font-semibold text-emerald-500 flex items-center gap-1">
                Xem tính năng Multi-tenant <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-all hover:shadow-lg group">
            <CardContent className="p-7 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">Tự động gửi Báo cáo Zalo cho Phụ huynh</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sau mỗi buổi học hoặc bài kiểm tra định kỳ, hệ thống tự động tổng hợp biểu đồ tiến độ và gửi thông báo qua Zalo OA, giúp phụ huynh an tâm tuyệt đối.
              </p>
              <div className="pt-2 text-xs font-semibold text-amber-500 flex items-center gap-1">
                Xem mẫu báo cáo Zalo <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 5. PRICING PREVIEW TEASER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="space-y-4 max-w-2xl mx-auto">
          <Badge variant="default" className="text-xs">Bảng Giá Linh Hoạt</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Chọn gói cước phù hợp quy mô trung tâm
          </h2>
          <p className="text-sm text-muted-foreground">
            Bắt đầu với gói Starter cho trung tâm độc lập hoặc triển khai gói Professional để khai phóng toàn bộ sức mạnh AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {mockPricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col justify-between ${
                plan.popular ? 'border-primary shadow-xl ring-2 ring-primary/20' : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground font-bold px-3 py-0.5 text-[11px]">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{plan.tagline}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-foreground">
                    {(plan.monthlyPrice / 1000000).toFixed(1)}M ₫
                  </span>
                  <span className="text-xs text-muted-foreground">/ tháng</span>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-border text-xs">
                  <div className="font-semibold text-foreground">Hạn mức cơ bản:</div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4 text-primary" />
                    <span>Tối đa {plan.maxStudents} học viên</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <span>Tối đa {plan.maxTeachers} giáo viên</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>{plan.aiTokensPerMonth}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  {plan.features.slice(0, 4).map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{f.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <div className="p-6 pt-0">
                <Link to="/contact">
                  <Button
                    variant={plan.popular ? 'default' : 'outline'}
                    className="w-full text-xs font-bold"
                  >
                    Đăng Ký Gói Này
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <div className="pt-2">
          <Link to="/pricing" className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
            Xem bảng so sánh chi tiết tất cả tính năng <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center">
        <div className="space-y-3 max-w-2xl mx-auto">
          <Badge variant="default" className="text-xs">Đánh Giá Từ Nhà Sáng Lập</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Niềm tin từ các nhà quản lý giáo dục hàng đầu
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {mockTestimonials.map((item) => (
            <Card key={item.id} className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  "{item.content}"
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={item.avatar}
                    alt={item.authorName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{item.authorName}</h4>
                    <p className="text-[11px] text-muted-foreground">{item.role}</p>
                    <p className="text-[10px] text-primary font-medium">{item.centerName}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Câu Hỏi Thường Gặp (FAQ)
          </h2>
          <p className="text-xs text-muted-foreground">
            Giải đáp nhanh các thắc mắc về triển khai, bảo mật và chi phí cho trung tâm.
          </p>
        </div>

        <div className="space-y-3">
          {mockFaqs.map((faq, idx) => {
            const isOpen = activeFaq === idx
            return (
              <div
                key={idx}
                className="rounded-xl border border-border bg-card p-4 transition-all text-left"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-foreground focus:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 text-muted-foreground transition-transform ${
                      isOpen ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="mt-3 text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/60 animate-in fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* 8. FINAL CALL TO ACTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-tr from-primary via-indigo-600 to-indigo-800 p-8 sm:p-14 text-white text-center shadow-2xl overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight max-w-3xl mx-auto leading-tight">
            Sẵn sàng chuyển đổi số cho trung tâm Anh ngữ của bạn ngay hôm nay?
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto">
            Gia nhập cộng đồng hơn 35 trung tâm tiên phong tại Việt Nam, nâng tầm chất lượng giảng dạy với AI thông minh.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link to="/contact">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg text-sm font-bold h-12 px-8">
                Đặt Lịch Tư Vấn 1-1 Miễn Phí
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 px-6 text-sm font-semibold">
                Đăng Ký Tài Khoản Cơ Sở
              </Button>
            </Link>
          </div>

          <p className="text-xs text-white/60 pt-2">
            Hỗ trợ dùng thử 14 ngày không rủi ro • Không cần thẻ tín dụng
          </p>
        </div>
      </section>
    </div>
  )
}

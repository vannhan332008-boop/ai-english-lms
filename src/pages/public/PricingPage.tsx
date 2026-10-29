import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, X, ArrowRight, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { mockPricingPlans } from '@/mocks/plans'

export const PricingPage: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true)

  return (
    <div className="space-y-24 py-16">
      {/* Header */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <Badge variant="default" className="text-xs font-semibold">
          Bảng Giá Minh Bạch & Tối Ưu
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          Đầu tư thông minh cho chất lượng đào tạo
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Không phát sinh chi phí ẩn. Nâng cấp hoặc mở rộng hạn mức token AI bất kỳ lúc nào theo quy mô học viên.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="pt-6 flex items-center justify-center gap-3">
          <span
            className={`text-xs font-semibold cursor-pointer ${
              !isAnnual ? 'text-foreground' : 'text-muted-foreground'
            }`}
            onClick={() => setIsAnnual(false)}
          >
            Thanh toán theo tháng
          </span>
          <button
            type="button"
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 bg-primary rounded-full p-1 transition-colors relative flex items-center"
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                isAnnual ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setIsAnnual(true)}>
            <span
              className={`text-xs font-semibold ${
                isAnnual ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Thanh toán theo năm
            </span>
            <Badge variant="success" className="text-[10px] py-0 px-2 font-bold animate-pulse">
              Tiết kiệm 20%
            </Badge>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {mockPricingPlans.map((plan) => {
            const price = isAnnual ? plan.annualPricePerMonth : plan.monthlyPrice
            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col justify-between transition-all hover:shadow-xl ${
                  plan.popular
                    ? 'border-primary ring-2 ring-primary/20 shadow-lg'
                    : 'border-border'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground font-bold px-3 py-1 text-xs">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardContent className="p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      {plan.tagline}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-foreground tracking-tight">
                        {(price / 1000000).toFixed(1)}M ₫
                      </span>
                      <span className="text-xs text-muted-foreground">/ tháng</span>
                    </div>
                    {isAnnual ? (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Thanh toán hàng năm: {(price * 12 / 1000000).toFixed(0)} triệu ₫
                      </p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">Thanh toán từng tháng linh hoạt</p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-muted/30 border border-border/80 space-y-2 text-xs">
                    <div className="font-semibold text-foreground">Hạn mức hệ thống:</div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Số học viên tối đa:</span>
                      <strong className="text-foreground">{plan.maxStudents.toLocaleString()} học viên</strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Số giáo viên tối đa:</span>
                      <strong className="text-foreground">{plan.maxTeachers} tài khoản</strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Hạn mức Token AI:</span>
                      <strong className="text-primary font-bold">{plan.aiTokensPerMonth}</strong>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Tính năng bao gồm:
                    </div>
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs">
                        {feat.included ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                        )}
                        <span
                          className={
                            feat.included ? 'text-foreground' : 'text-muted-foreground/60 line-through'
                          }
                        >
                          {feat.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <div className="p-8 pt-0">
                  <Link to="/contact">
                    <Button
                      variant={plan.popular ? 'default' : 'outline'}
                      className="w-full h-11 text-xs font-bold shadow-sm"
                    >
                      Bắt đầu với {plan.name}
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-gradient-to-r from-card via-card to-primary/5 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">Bạn có trên 5 chi nhánh hoặc hơn 2.000 học viên?</h3>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              Chúng tôi cung cấp gói giải pháp May đo riêng (Bespoke Enterprise) với hợp đồng pháp lý, hạ tầng máy chủ riêng và đào tạo trực tiếp tại cơ sở của bạn.
            </p>
          </div>
          <Link to="/contact" className="shrink-0">
            <Button size="lg" className="text-xs font-bold gap-2">
              Liên Hệ Giám Đốc Giải Pháp
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

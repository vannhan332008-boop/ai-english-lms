import React, { useState } from 'react'
import {
  Receipt,
  Download,
  CheckCircle2,
  Clock,
  FileCheck,
  Building,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/ui/DataTable'
import { mockInvoices, type SaaSInvoice } from '@/mocks/invoices'
import { useToast } from '@/hooks/useToast'

export const SuperAdminBillingPage: React.FC = () => {
  const { success, info } = useToast()
  const [invoices] = useState<SaaSInvoice[]>(mockInvoices)

  const handleDownloadInvoice = (inv: SaaSInvoice) => {
    success(`Đã xuất hóa đơn điện tử VAT`, `Hóa đơn số ${inv.invoiceNumber} của ${inv.centerName} đã sẵn sàng.`)
  }

  const columns = [
    {
      key: 'invoiceNumber',
      header: 'Số hóa đơn & Kỳ cước',
      render: (inv: SaaSInvoice) => (
        <div>
          <span className="font-mono font-bold text-foreground text-sm block">{inv.invoiceNumber}</span>
          <span className="text-xs text-muted-foreground">{inv.billingPeriod}</span>
        </div>
      ),
    },
    {
      key: 'centerName',
      header: 'Trung tâm thụ hưởng',
      render: (inv: SaaSInvoice) => (
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="font-semibold text-foreground text-sm">{inv.centerName}</span>
        </div>
      ),
    },
    {
      key: 'planName',
      header: 'Gói cước',
      render: (inv: SaaSInvoice) => (
        <Badge variant={inv.planName.includes('Chuyên Nghiệp') ? 'primary' : 'success'}>
          {inv.planName}
        </Badge>
      ),
    },
    {
      key: 'amount',
      header: 'Số tiền thanh toán',
      render: (inv: SaaSInvoice) => (
        <span className="font-bold text-foreground text-sm">
          {inv.amountVND.toLocaleString('vi-VN')} đ
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (inv: SaaSInvoice) => {
        if (inv.status === 'PAID') {
          return (
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Đã thu
            </Badge>
          )
        }
        return (
          <Badge variant="warning" className="gap-1">
            <Clock className="w-3 h-3" />
            Chờ thanh toán
          </Badge>
        )
      },
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right' as const,
      render: (inv: SaaSInvoice) => (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-8 text-xs"
          onClick={() => handleDownloadInvoice(inv)}
        >
          <Download className="w-3.5 h-3.5" />
          Hóa đơn VAT
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Gói Cước & Quản Lý Hóa Đơn SaaS
            </h1>
            <Badge variant="primary">Thu tiền định kỳ</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi dòng tiền thuê bao hàng tháng, hóa đơn điện tử VAT và quản trị danh mục gói dịch vụ cho các trung tâm.
          </p>
        </div>

        <Button
          variant="primary"
          className="gap-2 shrink-0"
          onClick={() => info('Đã đối soát dòng tiền tháng 10/2026', 'Tất cả 37 trung tâm đã đồng bộ trạng thái.')}
        >
          <FileCheck className="w-4 h-4" />
          Đối soát hóa đơn tự động
        </Button>
      </div>

      {/* Subscription Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 relative border-border/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gói Starter</span>
              <Badge variant="outline">Cơ sở mới</Badge>
            </div>
            <div className="mt-4 mb-2">
              <span className="text-3xl font-extrabold text-foreground">2.500.000 đ</span>
              <span className="text-xs text-muted-foreground"> / tháng</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Dành cho các trung tâm quy mô dưới 200 học viên bước đầu ứng dụng công nghệ.
            </p>

            <ul className="space-y-2 text-xs text-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Hạn mức 500,000 AI Tokens / tháng
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Chấm tự động Writing Task 1 & 2
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Tối đa 15 giáo viên & trợ giảng
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Đang dùng: 8 trung tâm</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => info('Thông tin gói Starter', 'Hạn mức được thiết kế tối ưu chi phí khởi điểm.')}
            >
              Chỉnh sửa
            </Button>
          </div>
        </Card>

        <Card className="p-6 relative border-primary shadow-lg shadow-primary/5 flex flex-col justify-between bg-primary/[0.02]">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge variant="primary" className="shadow-sm">
              Phổ Biến Nhất
            </Badge>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Gói Professional</span>
              <Badge variant="success">Bán chạy</Badge>
            </div>
            <div className="mt-4 mb-2">
              <span className="text-3xl font-extrabold text-foreground">6.500.000 đ</span>
              <span className="text-xs text-muted-foreground"> / tháng</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Dành cho trung tâm chuyên ngữ 500-1500 học viên có nhu cầu luyện phát âm và viết chuyên sâu.
            </p>

            <ul className="space-y-2 text-xs text-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Hạn mức 1,500,000 AI Tokens / tháng
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                AI Speaking phát hiện ngữ điệu sóng âm IPA
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                AI Co-pilot sinh giáo án tự động
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Đang dùng: 24 trung tâm</span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => info('Thông tin gói Professional', 'Bao gồm trọn bộ AI Speaking & Writing Lab.')}
            >
              Chỉnh sửa
            </Button>
          </div>
        </Card>

        <Card className="p-6 relative border-border/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Gói Enterprise
              </span>
              <Badge variant="outline">Tập đoàn</Badge>
            </div>
            <div className="mt-4 mb-2">
              <span className="text-3xl font-extrabold text-foreground">15.000.000 đ</span>
              <span className="text-xs text-muted-foreground"> / tháng</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Dành cho chuỗi hệ thống giáo dục lớn, custom subdomain, hỗ trợ dedicated SLA 24/7.
            </p>

            <ul className="space-y-2 text-xs text-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Không giới hạn học viên & lớp học
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Hạn mức 4,000,000+ AI Tokens / tháng
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                API tích hợp riêng với CRM nội bộ
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Đang dùng: 5 tập đoàn</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => info('Thông tin gói Enterprise', 'Cung cấp SLA chuyên biệt cho chuỗi.')}
            >
              Chỉnh sửa
            </Button>
          </div>
        </Card>
      </div>

      {/* Invoices List */}
      <Card className="p-5">
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" />
              Lịch Sử Hóa Đơn & Thu Phí Thuê Bao
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Toàn bộ hóa đơn SaaS đã đối soát cùng biên lai chuyển khoản ngân hàng
            </p>
          </div>
        </div>

        <div className="mt-4">
          <DataTable
            data={invoices}
            columns={columns}
            keyExtractor={(inv) => inv.id}
            emptyMessage="Không có hóa đơn nào."
            itemsPerPage={5}
          />
        </div>
      </Card>
    </div>
  )
}
export default SuperAdminBillingPage

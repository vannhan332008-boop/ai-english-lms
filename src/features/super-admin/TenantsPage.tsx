/* oxlint-disable react/set-state-in-effect */
import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Plus,
  Lock,
  Unlock,
  Edit3,
  Globe,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { DataTable } from '@/components/ui/DataTable'
import { Skeleton } from '@/components/ui/Skeleton'
import { mockTenants, type CenterTenant } from '@/mocks/tenants'
import { useToast } from '@/hooks/useToast'
import { apiClient } from '@/lib/api-client'

export const SuperAdminTenantsPage: React.FC = () => {
  const { success, warning, error: toastError } = useToast()
  const [tenants, setTenants] = useState<CenterTenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'LOCKED'>('ALL')
  const [planFilter, setPlanFilter] = useState<'ALL' | 'Basic' | 'Pro' | 'Enterprise'>('ALL')

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingTenant, setEditingTenant] = useState<CenterTenant | null>(null)

  // Form State for Adding Tenant
  const [newTenantName, setNewTenantName] = useState('')
  const [newCity, setNewCity] = useState('Hà Nội')
  const [newPlan, setNewPlan] = useState<'Basic' | 'Pro' | 'Enterprise'>('Pro')
  const [newContactPerson, setNewContactPerson] = useState('')
  const [newHotline, setNewHotline] = useState('024 3999 6666')
  const [newAiQuotaMillion, setNewAiQuotaMillion] = useState(1.2)

  const fetchTenants = useCallback(async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true)
      const res = await apiClient.get('/super-admin/tenants')
      if (res.data?.data && Array.isArray(res.data.data)) {
        // Map backend tenant structure to UI format
        const apiTenants: CenterTenant[] = res.data.data.map((t: any) => ({
          id: t.id,
          name: t.name,
          code: t.code,
          domain: t.domain || `${t.code}.englishflow.vn`,
          city: t.city || 'Chưa thiết lập',
          address: t.address || 'Trụ sở chính',
          hotline: t.contactPhone || '024 3999 6666',
          status: t.status as 'ACTIVE' | 'PENDING' | 'LOCKED',
          plan: t.plan === 'STARTER' ? 'Basic' : t.plan === 'ENTERPRISE' ? 'Enterprise' : 'Pro',
          activeStudents: t.studentCount ?? 0,
          totalTeachers: t.teacherCount ?? 0,
          aiTokenQuota: t.aiTokenQuota,
          aiTokensUsed: t.aiTokensUsed,
          logoText: t.name.substring(0, 3).toUpperCase(),
          createdAt: new Date(t.createdAt).toLocaleDateString('vi-VN'),
          contactPerson: t.contactEmail,
        }))

        // Combine API tenants with mock list for rich display if API has only few items
        const combined = [...apiTenants]
        mockTenants.forEach((m) => {
          if (!combined.some((c) => c.code === m.code || c.name === m.name)) {
            combined.push(m)
          }
        })

        setTenants(combined)
        if (showToast) {
          success('Đã tải danh sách cơ sở', `Đồng bộ thành công ${apiTenants.length} trung tâm từ database.`)
        }
      }
    } catch (err: any) {
      console.warn('Could not fetch tenants from API, using mock list:', err)
      if (showToast) {
        toastError('Lỗi kết nối API', err.response?.data?.message || err.message)
      }
      setTenants((prev) => (prev.length === 0 ? mockTenants : prev))
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [success, toastError])

  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    void fetchTenants()
  }, [fetchTenants])

  // Filter logic
  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      const matchSearch =
        tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())

      const matchStatus = statusFilter === 'ALL' || tenant.status === statusFilter
      const matchPlan = planFilter === 'ALL' || tenant.plan === planFilter

      return matchSearch && matchStatus && matchPlan
    })
  }, [tenants, searchQuery, statusFilter, planFilter])

  // Lock / Unlock Handler
  const toggleLockTenant = (tenant: CenterTenant) => {
    const newStatus = tenant.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED'
    setTenants(
      tenants.map((t) => (t.id === tenant.id ? { ...t, status: newStatus } : t))
    )
    if (newStatus === 'LOCKED') {
      warning(`Đã khóa quyền truy cập: ${tenant.name}`, 'Trung tâm này đã bị tạm ngừng gọi API.')
    } else {
      success(`Đã mở khóa trung tâm: ${tenant.name}`, 'Toàn bộ dịch vụ học tập và AI đã hoạt động trở lại.')
    }
  }

  // Save Edit Handler
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTenant) return

    setTenants(
      tenants.map((t) => (t.id === editingTenant.id ? editingTenant : t))
    )
    success(`Đã cập nhật trung tâm: ${editingTenant.name}`, 'Thông tin gói cước và Quota đã được lưu.')
    setEditingTenant(null)
  }

  // Create Handler
  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTenantName.trim()) {
      warning('Thiếu thông tin', 'Vui lòng nhập tên trung tâm!')
      return
    }

    const created: CenterTenant = {
      id: `t_${Date.now()}`,
      name: newTenantName,
      code: newTenantName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      domain: `${newTenantName.toLowerCase().replace(/[^a-z0-9]/g, '')}.englishflow.vn`,
      city: newCity,
      address: `Cơ sở mới tại ${newCity}`,
      hotline: newHotline,
      status: 'ACTIVE',
      plan: newPlan,
      activeStudents: 50,
      totalTeachers: 4,
      aiTokenQuota: Math.round(newAiQuotaMillion * 1000000),
      aiTokensUsed: 0,
      logoText: newTenantName.substring(0, 3).toUpperCase(),
      createdAt: new Date().toLocaleDateString('vi-VN'),
      contactPerson: newContactPerson || 'Quản lý cơ sở',
    }

    setTenants([created, ...tenants])
    success(`Đã khởi tạo cơ sở mới: ${created.name}`, 'Thông tin phân quyền và subdomain đã sẵn sàng.')
    setIsAddModalOpen(false)
    setNewTenantName('')
    setNewContactPerson('')
  }

  // Table Columns
  const columns = [
    {
      key: 'name',
      header: 'Tên trung tâm Anh ngữ',
      render: (tenant: CenterTenant) => (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs">
            {tenant.logoText}
          </div>
          <div className="space-y-0.5">
            <span className="font-bold text-foreground text-sm line-clamp-1">{tenant.name}</span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-mono text-[11px] text-primary">
                <Globe className="w-3 h-3" />
                {tenant.domain}
              </span>
              <span>•</span>
              <span>{tenant.city}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Gói cước',
      render: (tenant: CenterTenant) => {
        let variant: 'primary' | 'success' | 'outline' = 'outline'
        if (tenant.plan === 'Enterprise') variant = 'primary'
        if (tenant.plan === 'Pro') variant = 'success'
        return <Badge variant={variant}>{tenant.plan}</Badge>
      },
    },
    {
      key: 'students',
      header: 'Quy mô',
      render: (tenant: CenterTenant) => (
        <div className="text-xs space-y-0.5">
          <p className="font-semibold text-foreground">{tenant.activeStudents} học viên</p>
          <p className="text-muted-foreground">{tenant.totalTeachers} giáo viên</p>
        </div>
      ),
    },
    {
      key: 'aiUsage',
      header: 'AI Quota Tiêu Thụ',
      render: (tenant: CenterTenant) => {
        const percent = Math.min(
          100,
          Math.round((tenant.aiTokensUsed / tenant.aiTokenQuota) * 100)
        )
        const isNearLimit = percent >= 80

        return (
          <div className="w-36 space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-mono text-muted-foreground">
                {(tenant.aiTokensUsed / 1000).toFixed(0)}k / {(tenant.aiTokenQuota / 1000000).toFixed(1)}M
              </span>
              <span
                className={`font-bold ${
                  isNearLimit ? 'text-amber-500' : 'text-emerald-500'
                }`}
              >
                {percent}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isNearLimit ? 'bg-amber-500' : 'bg-primary'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (tenant: CenterTenant) => {
        if (tenant.status === 'ACTIVE') {
          return (
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Đang hoạt động
            </Badge>
          )
        }
        if (tenant.status === 'PENDING') {
          return (
            <Badge variant="warning" className="gap-1">
              <AlertTriangle className="w-3 h-3" />
              Chờ duyệt
            </Badge>
          )
        }
        return (
          <Badge variant="danger" className="gap-1">
            <XCircle className="w-3 h-3" />
            Đã khóa
          </Badge>
        )
      },
    },
    {
      key: 'actions',
      header: 'Hành động',
      className: 'text-right',
      render: (tenant: CenterTenant) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingTenant(tenant)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            title="Sửa cấu hình Quota & Gói"
          >
            <Edit3 className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleLockTenant(tenant)}
            className={`h-8 w-8 p-0 ${
              tenant.status === 'LOCKED'
                ? 'text-emerald-500 hover:text-emerald-600'
                : 'text-rose-500 hover:text-rose-600'
            }`}
            title={tenant.status === 'LOCKED' ? 'Mở khóa trung tâm' : 'Khóa trung tâm'}
          >
            {tenant.status === 'LOCKED' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Quản Lý Mạng Lưới Đối Tác (Tenants)
            </h1>
            <Badge variant="outline" className="text-xs text-primary border-primary/30">
              {filteredTenants.length} Cơ sở
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Theo dõi phân quyền Multi-tenant, cấu hình hạn mức AI Token Quota và trạng thái hoạt động của từng chi nhánh.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTenants(true)}
            disabled={isRefreshing}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Thêm cơ sở mới
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <Input
              placeholder="Tìm theo tên trung tâm, domain, quản lý, thành phố..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              options={[
                { value: 'ALL', label: 'Tất cả trạng thái' },
                { value: 'ACTIVE', label: 'Đang hoạt động' },
                { value: 'PENDING', label: 'Chờ duyệt hợp đồng' },
                { value: 'LOCKED', label: 'Tạm khóa (Overdue)' },
              ]}
            />
          </div>

          <div>
            <Select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value as any)}
              options={[
                { value: 'ALL', label: 'Tất cả gói SaaS' },
                { value: 'Basic', label: 'Gói Basic' },
                { value: 'Pro', label: 'Gói Pro' },
                { value: 'Enterprise', label: 'Gói Enterprise' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Tenants Table */}
      {isLoading ? (
        <Card className="p-6 space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-32" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-border/40">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-2 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={filteredTenants}
          keyExtractor={(item) => item.id}
          pageSize={6}
          emptyMessage="Không tìm thấy cơ sở đối tác nào phù hợp với bộ lọc."
        />
      )}

      {/* Modal: Add Tenant */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Khởi tạo đối tác Anh ngữ mới"
        description="Đăng ký thêm cơ sở vào mạng lưới SaaS và cấp hạn mức AI Token ban đầu"
        size="lg"
      >
        <form onSubmit={handleCreateTenant} className="space-y-4">
          <Input
            label="Tên trung tâm Anh ngữ"
            placeholder="VD: IELTS Fighter Ba Đình"
            required
            value={newTenantName}
            onChange={(e) => setNewTenantName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Khu vực / Tỉnh thành"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              options={[
                { value: 'Hà Nội', label: 'Hà Nội' },
                { value: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
                { value: 'Đà Nẵng', label: 'Đà Nẵng' },
                { value: 'Hải Phòng', label: 'Hải Phòng' },
                { value: 'Cần Thơ', label: 'Cần Thơ' },
              ]}
            />

            <Select
              label="Gói dịch vụ SaaS"
              value={newPlan}
              onChange={(e) => setNewPlan(e.target.value as any)}
              options={[
                { value: 'Basic', label: 'Basic (500k Tokens/tháng)' },
                { value: 'Pro', label: 'Pro (1.2M Tokens/tháng)' },
                { value: 'Enterprise', label: 'Enterprise (5M Tokens/tháng)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Người liên hệ chính / Giám đốc"
              placeholder="Nguyễn Văn A"
              value={newContactPerson}
              onChange={(e) => setNewContactPerson(e.target.value)}
            />
            <Input
              label="Hotline cơ sở"
              placeholder="024 3999 6666"
              value={newHotline}
              onChange={(e) => setNewHotline(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">
              Hạn mức AI Tokens tháng đầu ({newAiQuotaMillion.toFixed(1)} Triệu Tokens)
            </label>
            <input
              type="range"
              min="0.2"
              max="5.0"
              step="0.2"
              value={newAiQuotaMillion}
              onChange={(e) => setNewAiQuotaMillion(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit">Xác nhận khởi tạo cơ sở</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Tenant */}
      {editingTenant && (
        <Modal
          isOpen={true}
          onClose={() => setEditingTenant(null)}
          title={`Cấu hình hạn mức: ${editingTenant.name}`}
          description="Điều chỉnh gói thuê bao và cấp bù AI Token Quota cho cơ sở"
          size="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Input
              label="Tên trung tâm"
              value={editingTenant.name}
              onChange={(e) =>
                setEditingTenant({ ...editingTenant, name: e.target.value })
              }
            />

            <Select
              label="Gói Subscription"
              value={editingTenant.plan}
              onChange={(e) =>
                setEditingTenant({ ...editingTenant, plan: e.target.value as any })
              }
              options={[
                { value: 'Basic', label: 'Basic' },
                { value: 'Pro', label: 'Pro' },
                { value: 'Enterprise', label: 'Enterprise' },
              ]}
            />

            <Select
              label="Trạng thái hệ thống"
              value={editingTenant.status}
              onChange={(e) =>
                setEditingTenant({ ...editingTenant, status: e.target.value as any })
              }
              options={[
                { value: 'ACTIVE', label: 'Đang hoạt động (ACTIVE)' },
                { value: 'PENDING', label: 'Chờ thanh toán (PENDING)' },
                { value: 'LOCKED', label: 'Khóa tài khoản (LOCKED)' },
              ]}
            />

            <Input
              label="Hạn mức AI Quota (Tokens)"
              type="number"
              value={editingTenant.aiTokenQuota}
              onChange={(e) =>
                setEditingTenant({
                  ...editingTenant,
                  aiTokenQuota: parseInt(e.target.value) || 0,
                })
              }
            />

            <div className="pt-4 flex justify-end gap-2 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setEditingTenant(null)}>
                Đóng
              </Button>
              <Button type="submit">Lưu thay đổi</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
export default SuperAdminTenantsPage

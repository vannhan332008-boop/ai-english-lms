/* oxlint-disable react/set-state-in-effect */
import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Plus,
  Mail,
  Clock,
  RefreshCw,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { DataTable } from '@/components/ui/DataTable'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/hooks/useToast'
import { centerService, type TeacherItem, type ClassItem } from '@/services/centerService'

export const CenterManagerTeachersPage: React.FC = () => {
  const { success, warning, error: toastError } = useToast()

  const [teachers, setTeachers] = useState<TeacherItem[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherItem | null>(null)

  // Form State
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newQualification, setNewQualification] = useState('IELTS 8.0, TESOL')
  const [newCefrLevel, setNewCefrLevel] = useState<'B1' | 'B2' | 'C1' | 'C2'>('C1')
  const [assignedClassId, setAssignedClassId] = useState('')

  // Fetch Classes
  const fetchClasses = useCallback(async () => {
    try {
      const data = await centerService.getClasses()
      setClasses(data)
    } catch (err) {
      console.error('Failed to fetch classes:', err)
    }
  }, [])

  // Fetch Teachers
  const fetchTeachers = useCallback(async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true)
      const data = await centerService.getTeachers()
      setTeachers(data)
      if (showToast) {
        success('Đã tải danh sách giáo viên', `Đồng bộ ${data.length} giảng viên từ cơ sở dữ liệu.`)
      }
    } catch (err: any) {
      console.error('Could not fetch teachers via API:', err)
      if (showToast) {
        toastError('Lỗi kết nối API', err.response?.data?.message || err.message)
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [success, toastError])

  useEffect(() => {
    void fetchClasses()
    void fetchTeachers()
  }, [fetchClasses, fetchTeachers])

  // Filter logic
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchSearch =
        t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.phone && t.phone.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && t.isActive) ||
        (statusFilter === 'INACTIVE' && !t.isActive)

      return matchSearch && matchStatus
    })
  }, [teachers, searchQuery, statusFilter])

  // Create Teacher API
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim()) {
      warning('Thiếu thông tin', 'Vui lòng điền họ tên và email giáo viên!')
      return
    }

    setIsSubmitting(true)
    try {
      await centerService.createTeacher({
        fullName: newName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim() || undefined,
        cefrLevel: newCefrLevel,
        qualification: newQualification.trim(),
        assignedClassId: assignedClassId || undefined,
      })

      success(
        'Đã thêm giảng viên mới thành công!',
        `Tài khoản cho ${newName} đã được tạo với mật khẩu khởi tạo 030308.`
      )
      setIsModalOpen(false)
      setNewName('')
      setNewEmail('')
      setNewPhone('')
      setAssignedClassId('')
      void fetchTeachers()
      void fetchClasses()
    } catch (err: any) {
      toastError(
        'Lỗi tạo giảng viên',
        err.response?.data?.message || err.message || 'Không thể tạo giảng viên'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Toggle Teacher Status API
  const handleToggleStatus = async (teacher: TeacherItem) => {
    try {
      const nextStatus = !teacher.isActive
      await centerService.toggleUserStatus(teacher.id, nextStatus)
      setTeachers((prev) =>
        prev.map((t) => (t.id === teacher.id ? { ...t, isActive: nextStatus } : t))
      )
      success(
        'Đã cập nhật trạng thái',
        `Giảng viên ${teacher.fullName} đã chuyển sang ${nextStatus ? 'HOẠT ĐỘNG' : 'ĐÃ TẠM KHÓA'}.`
      )
    } catch (err: any) {
      toastError('Lỗi cập nhật', err.response?.data?.message || err.message || 'Không thể đổi trạng thái')
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Họ và tên Giảng viên',
      render: (t: TeacherItem) => (
        <div className="flex items-center gap-3">
          <img
            src={t.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
            alt={t.fullName}
            className={`w-10 h-10 rounded-full object-cover ring-2 shrink-0 ${
              t.isActive ? 'ring-primary/20' : 'ring-rose-500/40 opacity-70'
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-sm ${t.isActive ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                {t.fullName}
              </span>
              <Badge variant="primary" className="text-[10px] px-1 py-0">
                CEFR {t.cefrLevel}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3 text-muted-foreground" />
              {t.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'classes',
      header: 'Lớp phụ trách & Học viên',
      render: (t: TeacherItem) => (
        <div>
          <span className="font-semibold text-foreground text-sm block">
            {t.activeClassesCount} lớp đang dạy ({t.totalStudentsTaught} học viên)
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" />
            Tham gia: {new Date(t.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái hoạt động',
      render: (t: TeacherItem) => (
        <button
          type="button"
          onClick={() => handleToggleStatus(t)}
          className="group flex items-center gap-1.5 text-left"
          title="Nhấn để đổi trạng thái kích hoạt tài khoản"
        >
          {t.isActive ? (
            <Badge variant="success" className="gap-1 text-[11px] cursor-pointer group-hover:bg-emerald-600 transition-colors">
              <CheckCircle2 className="w-3 h-3" />
              Đang giảng dạy
            </Badge>
          ) : (
            <Badge variant="danger" className="gap-1 text-[11px] cursor-pointer group-hover:bg-rose-600 transition-colors">
              <Lock className="w-3 h-3" />
              Đã tạm khóa
            </Badge>
          )}
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right' as const,
      render: (t: TeacherItem) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => setSelectedTeacher(t)}
        >
          Xem hồ sơ
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
              Đội Ngũ Giáo Viên & Trợ Giảng
            </h1>
            <Badge variant="primary">{teachers.length} Giảng viên</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Quản trị danh sách giảng viên trực thuộc cơ sở, cấp tài khoản và phân quyền giảng dạy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTeachers(true)}
            disabled={isRefreshing}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            Thêm giảng viên mới
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex-1">
            <Input
              placeholder="Tìm theo tên giảng viên, email, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-full md:w-56">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              options={[
                { value: 'ALL', label: 'Tất cả trạng thái' },
                { value: 'ACTIVE', label: 'Đang giảng dạy' },
                { value: 'INACTIVE', label: 'Đã tạm khóa' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Table with Skeleton */}
      {isLoading ? (
        <Card className="p-6 space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-32" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center py-2.5 border-b border-border/40">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={filteredTeachers}
          keyExtractor={(item) => item.id}
          pageSize={8}
          emptyMessage="Không tìm thấy giảng viên nào phù hợp với bộ lọc."
        />
      )}

      {/* Modal: Add Teacher */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm Giảng Viên Mới Vào Cơ Sở"
        description="Đăng ký tài khoản giáo vụ trực tiếp vào CSDL với mật khẩu mặc định là 030308."
        size="md"
      >
        <form onSubmit={handleAddTeacher} className="space-y-4">
          <Input
            label="Họ và tên giáo viên *"
            placeholder="VD: Trần Phương Linh"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email công việc *"
              type="email"
              placeholder="linh.tran@englishflow.vn"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <Input
              label="Số điện thoại / Hotline"
              placeholder="0912 345 678"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Trình độ CEFR</label>
              <Select
                value={newCefrLevel}
                onChange={(e) => setNewCefrLevel(e.target.value as any)}
                options={[
                  { value: 'B1', label: 'B1 - Intermediate' },
                  { value: 'B2', label: 'B2 - Upper Intermediate' },
                  { value: 'C1', label: 'C1 - Advanced (IELTS 7.0-8.0)' },
                  { value: 'C2', label: 'C2 - Mastery / Native-equivalent' },
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Phân công lớp phụ trách</label>
              <Select
                value={assignedClassId}
                onChange={(e) => setAssignedClassId(e.target.value)}
                options={[
                  { value: '', label: 'Chưa phân công lớp' },
                  ...classes.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            </div>
          </div>

          <Input
            label="Bằng cấp / Chứng chỉ sư phạm"
            placeholder="VD: IELTS 8.5 Overall, TESOL 120hrs"
            value={newQualification}
            onChange={(e) => setNewQualification(e.target.value)}
          />

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-muted-foreground">
            Mật khẩu khởi tạo tài khoản giáo viên là: <strong className="text-primary font-mono">030308</strong>.
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Đang tạo tài khoản...
                </>
              ) : (
                'Tạo tài khoản giảng viên'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Teacher Profile */}
      {selectedTeacher && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTeacher(null)}
          title={`Hồ Sơ Giảng Viên: ${selectedTeacher.fullName}`}
          description={`Email: ${selectedTeacher.email} • Phân quyền: GIẢNG VIÊN CHUYÊN NGỮ`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border">
              <img
                src={selectedTeacher.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                alt={selectedTeacher.fullName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
              />
              <div>
                <p className="font-bold text-foreground text-sm">{selectedTeacher.fullName}</p>
                <p className="text-muted-foreground">{selectedTeacher.email}</p>
                <p className="text-muted-foreground">Hotline: {selectedTeacher.phone || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border text-center">
                <span className="text-muted-foreground block text-[11px]">Trình độ chuẩn hóa</span>
                <span className="font-bold text-primary text-sm">CEFR {selectedTeacher.cefrLevel}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border text-center">
                <span className="text-muted-foreground block text-[11px]">Lớp đang phụ trách</span>
                <span className="font-bold text-foreground text-sm">{selectedTeacher.activeClassesCount} Lớp</span>
              </div>
            </div>

            <div className="pt-3 flex justify-between items-center border-t border-border">
              <Button
                variant={selectedTeacher.isActive ? 'outline' : 'primary'}
                size="sm"
                onClick={() => {
                  void handleToggleStatus(selectedTeacher)
                  setSelectedTeacher(null)
                }}
              >
                {selectedTeacher.isActive ? 'Tạm khóa tài khoản' : 'Mở khóa tài khoản'}
              </Button>
              <Button onClick={() => setSelectedTeacher(null)}>Đóng</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
export default CenterManagerTeachersPage

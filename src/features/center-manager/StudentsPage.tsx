/* oxlint-disable react/set-state-in-effect */
import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Plus,
  Sparkles,
  CheckCircle2,
  Mail,
  Flame,
  ArrowUpRight,
  RefreshCw,
  FileSpreadsheet,
  Download,
  ArrowRightLeft,
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
import { centerService, type StudentItem, type ClassItem } from '@/services/centerService'
import { reportService } from '@/services/reportService'
import { CsvImportModal } from './CsvImportModal'
import { ClassTransferModal } from './ClassTransferModal'

export const CenterManagerStudentsPage: React.FC = () => {
  const { success, warning, error: toastError } = useToast()

  const [students, setStudents] = useState<StudentItem[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [classFilter, setClassFilter] = useState<string>('ALL')

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null)
  const [transferringStudent, setTransferringStudent] = useState<StudentItem | null>(null)
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [isExportingCsv, setIsExportingCsv] = useState(false)

  const handleExportCsv = async () => {
    try {
      setIsExportingCsv(true)
      await reportService.downloadStudentsCsv()
      success('Xuất file thành công', 'File CSV danh sách học viên đã được tải xuống.')
    } catch (err: any) {
      toastError('Lỗi xuất file', err.response?.data?.message || err.message)
    } finally {
      setIsExportingCsv(false)
    }
  }

  // Form State for Enrolling Student
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newClassId, setNewClassId] = useState('')
  const [newCefrLevel, setNewCefrLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>('B1')

  // Fetch Classes
  const fetchClasses = useCallback(async () => {
    try {
      const data = await centerService.getClasses()
      setClasses(data)
      if (data.length > 0 && !newClassId) {
        setNewClassId(data[0].id)
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err)
    }
  }, [newClassId])

  // Fetch Students
  const fetchStudents = useCallback(async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true)
      const data = await centerService.getStudents()
      setStudents(data)
      if (showToast) {
        success('Đã tải danh sách học viên', `Đồng bộ ${data.length} học viên từ CSDL.`)
      }
    } catch (err: any) {
      console.error('Could not fetch students via API:', err)
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
    void fetchStudents()
  }, [fetchClasses, fetchStudents])

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.currentClass.toLowerCase().includes(searchQuery.toLowerCase())

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && s.isActive) ||
        (statusFilter === 'INACTIVE' && !s.isActive)

      const matchClass =
        classFilter === 'ALL' || s.currentClassId === classFilter || s.currentClass === classFilter

      return matchSearch && matchStatus && matchClass
    })
  }, [students, searchQuery, statusFilter, classFilter])

  // Handle Create Student via API
  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim()) {
      warning('Thiếu thông tin', 'Vui lòng nhập họ tên và email học viên!')
      return
    }

    setIsEnrolling(true)
    try {
      await centerService.createStudent({
        fullName: newName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim() || undefined,
        cefrLevel: newCefrLevel,
        classId: newClassId || undefined,
      })

      success('Ghi danh thành công!', `Học viên ${newName} đã được thêm vào hệ thống với mật khẩu mặc định 030308.`)
      setIsEnrollModalOpen(false)
      setNewName('')
      setNewEmail('')
      setNewPhone('')
      void fetchStudents()
    } catch (err: any) {
      toastError('Lỗi ghi danh', err.response?.data?.message || err.message || 'Không thể tạo học viên')
    } finally {
      setIsEnrolling(false)
    }
  }

  // Handle Toggle User Status via API
  const handleToggleStatus = async (student: StudentItem) => {
    try {
      const nextStatus = !student.isActive
      await centerService.toggleUserStatus(student.id, nextStatus)
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, isActive: nextStatus } : s))
      )
      success(
        'Đã cập nhật trạng thái',
        `Tài khoản ${student.fullName} đã chuyển sang ${nextStatus ? 'HOẠT ĐỘNG' : 'ĐÃ KHÓA'}.`
      )
    } catch (err: any) {
      toastError('Lỗi cập nhật', err.response?.data?.message || err.message || 'Không thể đổi trạng thái')
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Học viên',
      render: (s: StudentItem) => (
        <div className="flex items-center gap-3">
          <img
            src={s.avatar}
            alt={s.fullName}
            className={`w-10 h-10 rounded-full object-cover ring-2 shrink-0 ${
              s.isActive ? 'ring-primary/20' : 'ring-rose-500/40 opacity-70'
            }`}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`font-bold text-sm ${s.isActive ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                {s.fullName}
              </span>
              {s.streakDays >= 10 && (
                <span className="flex items-center text-[10px] text-amber-500 font-bold bg-amber-500/10 px-1 py-0.5 rounded">
                  <Flame className="w-3 h-3 text-amber-500 fill-amber-500 mr-0.5" />
                  {s.streakDays}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3" />
              {s.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'class',
      header: 'Lớp học & Khóa',
      render: (s: StudentItem) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-xs font-mono font-semibold">
              {s.currentClass}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setTransferringStudent(s)}
              className="h-6 px-1.5 text-[10px] text-primary hover:bg-primary/10 gap-0.5"
              title="Chuyển sang lớp khác"
            >
              <ArrowRightLeft className="w-3 h-3" />
              Chuyển
            </Button>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>Trình độ: CEFR {s.currentLevel}</span>
            <span>•</span>
            <span className="font-semibold text-primary">{s.courseTitle}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'attendance',
      header: 'Chuyên cần',
      render: (s: StudentItem) => {
        const isLow = s.attendanceRate < 80
        return (
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className={isLow ? 'text-rose-500' : 'text-foreground'}>
                {s.attendanceRate}%
              </span>
            </div>
            <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{ width: `${s.attendanceRate}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      key: 'status',
      header: 'Trạng thái tài khoản',
      render: (s: StudentItem) => (
        <button
          type="button"
          onClick={() => handleToggleStatus(s)}
          className="group flex items-center gap-1.5 text-left"
          title="Nhấn để đổi trạng thái kích hoạt tài khoản"
        >
          {s.isActive ? (
            <Badge variant="success" className="gap-1 text-[11px] cursor-pointer group-hover:bg-emerald-600 transition-colors">
              <CheckCircle2 className="w-3 h-3" />
              Hoạt động
            </Badge>
          ) : (
            <Badge variant="danger" className="gap-1 text-[11px] cursor-pointer group-hover:bg-rose-600 transition-colors">
              <Lock className="w-3 h-3" />
              Đã khóa
            </Badge>
          )}
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right' as const,
      render: (s: StudentItem) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1"
            onClick={() => setTransferringStudent(s)}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-primary" />
            Đổi lớp
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setSelectedStudent(s)}
          >
            Học bạ
            <ArrowUpRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
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
              Hồ Sơ Học Viên & Xếp Lớp
            </h1>
            <Badge variant="primary">{students.length} Học viên</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý danh sách học viên, phân lớp, chuyển lớp và nhập dữ liệu hàng loạt từ file CSV.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStudents(true)}
            disabled={isRefreshing}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCsvModalOpen(true)}
            className="gap-1.5 text-primary border-primary/30 hover:bg-primary/10"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Nhập CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={isExportingCsv}
            className="gap-1.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
          >
            <Download className="w-4 h-4" />
            {isExportingCsv ? 'Đang xuất...' : 'Xuất CSV'}
          </Button>
          <Button onClick={() => setIsEnrollModalOpen(true)} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            Ghi danh học viên
          </Button>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex-1">
            <Input
              placeholder="Tìm theo tên học viên, email, lớp học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-full md:w-48">
            <Select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'Tất cả lớp học' },
                ...classes.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </div>

          <div className="w-full md:w-44">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              options={[
                { value: 'ALL', label: 'Tất cả trạng thái' },
                { value: 'ACTIVE', label: 'Đang hoạt động' },
                { value: 'INACTIVE', label: 'Tài khoản đã khóa' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Table with Skeleton Loading */}
      {isLoading ? (
        <Card className="p-6 space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-32" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center py-2.5 border-b border-border/40">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={filteredStudents}
          keyExtractor={(item) => item.id}
          pageSize={8}
          emptyMessage="Không tìm thấy học viên nào phù hợp với bộ lọc."
        />
      )}

      {/* Modal: Enroll Single Student */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Ghi Danh & Xếp Lớp Học Viên Mới"
        description="Tạo tài khoản học viên trực tiếp vào cơ sở dữ liệu với mật khẩu mặc định là 030308."
        size="md"
      >
        <form onSubmit={handleEnrollStudent} className="space-y-4">
          <Input
            label="Họ và tên học viên *"
            placeholder="VD: Nguyễn Văn Hoàng"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email đăng nhập *"
              type="email"
              placeholder="hoang.nguyen@gmail.com"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <Input
              label="Số điện thoại / Zalo"
              placeholder="0978 123 456"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Lớp học xếp vào</label>
              <Select
                value={newClassId}
                onChange={(e) => setNewClassId(e.target.value)}
                options={classes.map((c) => ({
                  value: c.id,
                  label: `${c.name} (${c.studentCount} học viên)`,
                }))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Trình độ CEFR</label>
              <Select
                value={newCefrLevel}
                onChange={(e) => setNewCefrLevel(e.target.value as any)}
                options={[
                  { value: 'A1', label: 'A1 - Sơ cấp' },
                  { value: 'A2', label: 'A2 - Cơ bản' },
                  { value: 'B1', label: 'B1 - Trung cấp' },
                  { value: 'B2', label: 'B2 - Khá (IELTS 5.5-6.5)' },
                  { value: 'C1', label: 'C1 - Nâng cao (IELTS 7.0-8.0)' },
                  { value: 'C2', label: 'C2 - Thành thạo' },
                ]}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-muted-foreground">
            Mật khẩu khởi tạo mặc định cho học viên là: <strong className="text-primary font-mono">030308</strong>. Học viên có thể đổi mật khẩu sau khi đăng nhập.
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEnrollModalOpen(false)}
              disabled={isEnrolling}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" disabled={isEnrolling} className="gap-2">
              {isEnrolling ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Đang ghi danh...
                </>
              ) : (
                'Xác nhận ghi danh'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: CSV Import */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        classes={classes}
        onImportSuccess={() => {
          void fetchStudents()
          void fetchClasses()
        }}
      />

      {/* Modal: Class Transfer */}
      <ClassTransferModal
        isOpen={!!transferringStudent}
        onClose={() => setTransferringStudent(null)}
        student={transferringStudent}
        classes={classes}
        onTransferSuccess={() => {
          void fetchStudents()
          void fetchClasses()
        }}
      />

      {/* Modal: Student Detail / AI Report */}
      {selectedStudent && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedStudent(null)}
          title={`Học Bạ AI: ${selectedStudent.fullName}`}
          description={`Lớp: ${selectedStudent.currentClass} • Trình độ: CEFR ${selectedStudent.currentLevel}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border">
                <span className="text-muted-foreground block text-[11px]">Email học viên</span>
                <span className="font-bold text-foreground">{selectedStudent.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border">
                <span className="text-muted-foreground block text-[11px]">Số điện thoại / Zalo</span>
                <span className="font-bold text-foreground">{selectedStudent.phone}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                Đánh giá tổng quát từ AI Co-pilot:
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Học viên duy trì chuỗi học tập {selectedStudent.streakDays} ngày liên tiếp. Tỷ lệ chuyên cần đạt {selectedStudent.attendanceRate}%. Đã hoàn thành các bài luyện viết và luyện phát âm tại AI Practice Lab.
              </p>
            </div>

            <div className="pt-3 flex justify-between items-center border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const s = selectedStudent
                  setSelectedStudent(null)
                  setTransferringStudent(s)
                }}
                className="gap-1.5 text-primary"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Chuyển lớp học viên này
              </Button>
              <Button onClick={() => setSelectedStudent(null)}>Đóng</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
export default CenterManagerStudentsPage

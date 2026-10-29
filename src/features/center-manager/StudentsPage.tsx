/* oxlint-disable react/set-state-in-effect */
import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Plus,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Mail,
  Flame,
  ArrowUpRight,
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
import { type StudentRecord } from '@/mocks/students'
import { useToast } from '@/hooks/useToast'
import { apiClient } from '@/lib/api-client'

export const CenterManagerStudentsPage: React.FC = () => {
  const { success, warning, error: toastError } = useToast()
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'EXCELLENT' | 'GOOD' | 'AT_RISK'>('ALL')
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null)
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)

  // Form State for Enrolling Student
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newClass, setNewClass] = useState('IELTS 7.5 - K42 Evening')
  const [newPlacementScore, setNewPlacementScore] = useState('6.0 Overall')
  const [newTargetBand, setNewTargetBand] = useState('7.5+')

  const fetchStudents = useCallback(async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true)
      const res = await apiClient.get('/center/students')
      if (res.data?.data && Array.isArray(res.data.data)) {
        const apiStudents: StudentRecord[] = res.data.data.map((s: any) => ({
          id: s.id,
          name: s.fullName,
          email: s.email,
          phone: s.phone || '0978 123 456',
          avatar: s.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
          enrolledClass: s.currentClass,
          courseType: 'IELTS',
          placementScore: `CEFR ${s.currentLevel}`,
          currentBand: s.targetBand || '7.0',
          targetBand: s.targetBand,
          attendanceRate: s.attendanceRate,
          speakingScore: 7.0,
          writingScore: 7.0,
          submittedAssignments: 14,
          totalAssignments: 15,
          status: (s.attendanceRate < 80 ? 'AT_RISK' : s.attendanceRate >= 95 ? 'EXCELLENT' : 'GOOD') as 'EXCELLENT' | 'GOOD' | 'AT_RISK',
          streakDays: s.streakDays || 14,
          lastActive: 'Vừa truy cập',
        }))

        setStudents(apiStudents)
        if (showToast) {
          success('Đã tải danh sách học viên', `Đồng bộ ${apiStudents.length} học viên từ database.`)
        }
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

  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    void fetchStudents()
  }, [fetchStudents])

  // Filter
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.enrolledClass.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = statusFilter === 'ALL' || s.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [students, searchQuery, statusFilter])

  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim()) {
      warning('Thiếu thông tin', 'Vui lòng nhập tên và email học viên!')
      return
    }

    const created: StudentRecord = {
      id: `std_${Date.now()}`,
      name: newName,
      email: newEmail,
      phone: newPhone || '0901 888 999',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      enrolledClass: newClass,
      courseType: 'IELTS',
      placementScore: newPlacementScore,
      currentBand: '6.5',
      targetBand: newTargetBand,
      attendanceRate: 100,
      speakingScore: 6.5,
      writingScore: 6.0,
      submittedAssignments: 0,
      totalAssignments: 12,
      status: 'GOOD',
      streakDays: 1,
      lastActive: 'Vừa ghi danh',
    }

    setStudents([created, ...students])
    success(`Đã xếp lớp thành công: ${created.name}`, `Học viên đã được ghi danh vào lớp ${newClass}`)
    setIsEnrollModalOpen(false)
    setNewName('')
    setNewEmail('')
  }

  const columns = [
    {
      key: 'name',
      header: 'Học viên',
      render: (s: StudentRecord) => (
        <div className="flex items-center gap-3">
          <img
            src={s.avatar}
            alt={s.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-foreground text-sm">{s.name}</span>
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
      header: 'Lớp & Mục tiêu',
      render: (s: StudentRecord) => (
        <div className="space-y-1">
          <Badge variant="outline" className="text-xs font-mono font-semibold">
            {s.enrolledClass}
          </Badge>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>Đầu vào: {s.placementScore}</span>
            <span>→</span>
            <span className="font-bold text-primary">Target: {s.targetBand}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'aiScores',
      header: 'Band điểm AI Đánh Giá',
      render: (s: StudentRecord) => (
        <div className="flex items-center gap-3">
          <div className="text-xs">
            <span className="text-muted-foreground block text-[10px]">Speaking</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {(s.speakingScore ?? 7.0).toFixed(1)}
            </span>
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground block text-[10px]">Writing</span>
            <span className="font-bold text-purple-600 dark:text-purple-400">
              {(s.writingScore ?? 7.0).toFixed(1)}
            </span>
          </div>
          <Badge variant="primary" className="text-[10px] px-1 py-0.5">
            <Sparkles className="w-3 h-3 mr-0.5" />
            AI Live
          </Badge>
        </div>
      ),
    },
    {
      key: 'attendance',
      header: 'Chuyên cần',
      render: (s: StudentRecord) => {
        const isLow = s.attendanceRate < 80
        return (
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className={isLow ? 'text-rose-500' : 'text-foreground'}>
                {s.attendanceRate}%
              </span>
              <span className="text-muted-foreground text-[10px]">
                {s.submittedAssignments}/{s.totalAssignments} bài
              </span>
            </div>
            <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  isLow ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${s.attendanceRate}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      key: 'status',
      header: 'Trạng thái học vụ',
      render: (s: StudentRecord) => {
        if (s.status === 'AT_RISK') {
          return (
            <Badge variant="danger" className="gap-1 text-[11px]">
              <AlertTriangle className="w-3 h-3" />
              Nguy cơ thụt lùi
            </Badge>
          )
        }
        if (s.status === 'EXCELLENT') {
          return (
            <Badge variant="success" className="gap-1 text-[11px]">
              <CheckCircle2 className="w-3 h-3" />
              Tiến bộ vượt bậc
            </Badge>
          )
        }
        return (
          <Badge variant="outline" className="text-[11px]">
            Học tập ổn định
          </Badge>
        )
      },
    },
    {
      key: 'actions',
      header: 'Chi tiết',
      align: 'right' as const,
      render: (s: StudentRecord) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => setSelectedStudent(s)}
        >
          Học bạ AI
          <ArrowUpRight className="w-3 h-3 ml-1" />
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
              Hồ Sơ Học Viên & Xếp Lớp
            </h1>
            <Badge variant="primary">{students.length} Học viên</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi tiến độ luyện thi, kết quả Placement Test và cảnh báo học sinh cần trợ giúp học vụ.
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
          <Button onClick={() => setIsEnrollModalOpen(true)} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            Ghi danh & Xếp lớp
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

          <div className="w-full md:w-56">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              options={[
                { value: 'ALL', label: 'Tất cả trạng thái học vụ' },
                { value: 'EXCELLENT', label: 'Tiến bộ vượt bậc' },
                { value: 'GOOD', label: 'Học tập ổn định' },
                { value: 'AT_RISK', label: 'Cần can thiệp (Nguy cơ)' },
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
          pageSize={6}
          emptyMessage="Không tìm thấy học viên nào phù hợp với bộ lọc."
        />
      )}

      {/* Modal: Enroll Student */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Ghi Danh & Xếp Lớp Học Viên Mới"
        description="Nhập thông tin hồ sơ và kết quả Placement Test đầu vào"
        size="md"
      >
        <form onSubmit={handleEnrollStudent} className="space-y-4">
          <Input
            label="Họ và tên học viên"
            placeholder="VD: Lê Hoàng Nam"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="nam.le@gmail.com"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <Input
              label="Số điện thoại / Zalo phụ huynh"
              placeholder="0978 123 456"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Lớp học được xếp vào"
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              options={[
                { value: 'IELTS 7.5 - K42 Evening', label: 'IELTS 7.5 - K42 Evening' },
                { value: 'IELTS Master K24', label: 'IELTS Master K24 (Morning)' },
                { value: 'IELTS Foundation K10', label: 'IELTS Foundation K10' },
                { value: 'TOEIC 750+ Accelerated', label: 'TOEIC 750+ Accelerated' },
              ]}
            />
            <Input
              label="Target Band mong muốn"
              placeholder="VD: IELTS 7.5+"
              value={newTargetBand}
              onChange={(e) => setNewTargetBand(e.target.value)}
            />
          </div>

          <Input
            label="Kết quả Placement Test đầu vào"
            placeholder="VD: 5.5 Overall (L: 6.0, R: 6.0, W: 5.0, S: 5.0)"
            value={newPlacementScore}
            onChange={(e) => setNewPlacementScore(e.target.value)}
          />

          <div className="pt-4 flex justify-end gap-2 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsEnrollModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit">Xác nhận ghi danh</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Student AI Report Card */}
      {selectedStudent && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedStudent(null)}
          title={`Học Bạ AI: ${selectedStudent.name}`}
          description={`Lớp: ${selectedStudent.enrolledClass} • Target: ${selectedStudent.targetBand}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-muted/40 border border-border text-center">
                <span className="text-[11px] text-muted-foreground block">Điểm Test Đầu Vào</span>
                <span className="text-base font-bold text-foreground">{selectedStudent.placementScore}</span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 block font-semibold">
                  AI Speaking Hiện Tại
                </span>
                <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                  Band {(selectedStudent.speakingScore ?? 7.0).toFixed(1)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                <span className="text-[11px] text-purple-600 dark:text-purple-400 block font-semibold">
                  AI Writing Hiện Tại
                </span>
                <span className="text-base font-bold text-purple-600 dark:text-purple-400">
                  Band {(selectedStudent.writingScore ?? 7.0).toFixed(1)}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-background border border-border space-y-2">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                Đánh giá tổng quát từ AI Co-pilot:
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Học viên có khả năng phản xạ từ vựng tốt trong Speaking Part 1 và Part 2. Tuy nhiên ngữ điệu ở các âm đuôi /θ/, /s/, /z/ cần tiếp tục luyện tập tại AI Practice Lab. Điểm chuyên cần đạt {selectedStudent.attendanceRate}%.
              </p>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-border">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                Hotline liên hệ: {selectedStudent.phone}
              </span>
              <Button onClick={() => setSelectedStudent(null)}>Đóng</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
export default CenterManagerStudentsPage

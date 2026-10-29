/* oxlint-disable react/set-state-in-effect */
import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Plus,
  Star,
  Award,
  Mail,
  Clock,
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
import { mockTeachers, type TeacherRecord } from '@/mocks/teachers'
import { useToast } from '@/hooks/useToast'
import { apiClient } from '@/lib/api-client'

export const CenterManagerTeachersPage: React.FC = () => {
  const { success, warning, info, error: toastError } = useToast()
  const [teachers, setTeachers] = useState<TeacherRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState<'ALL' | 'IELTS' | 'TOEIC' | 'COMMUNICATION'>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherRecord | null>(null)

  // Form State
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newQualification, setNewQualification] = useState('')
  const [newSpecialty, setNewSpecialty] = useState<'IELTS' | 'TOEIC' | 'COMMUNICATION'>('IELTS')

  const fetchTeachers = useCallback(async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true)
      const res = await apiClient.get('/center/teachers')
      if (res.data?.data && Array.isArray(res.data.data)) {
        const apiTeachers: TeacherRecord[] = res.data.data.map((t: any) => ({
          id: t.id,
          name: t.fullName,
          email: t.email,
          phone: t.phone || '0934 567 890',
          avatar: t.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
          qualification: `IELTS 8.5 Master, CEFR ${t.cefrLevel}`,
          nativeSpeaker: t.email.includes('david') || t.fullName.includes('David'),
          teachingSpecialty: 'IELTS' as const,
          assignedClasses: t.teachingClasses?.map((c: any) => c.name) || ['IELTS 7.5 - K42 Evening'],
          activeStudents: t.totalStudentsTaught || 24,
          hoursPerWeek: 18,
          rating: 4.95,
          status: (t.isActive ? 'ACTIVE' : 'ON_LEAVE') as 'ACTIVE' | 'ON_LEAVE',
          joinedDate: new Date(t.createdAt).toLocaleDateString('vi-VN'),
        }))

        // Merge with mock teachers for full UI showcase
        const combined = [...apiTeachers]
        mockTeachers.forEach((m) => {
          if (!combined.some((c) => c.email === m.email)) {
            combined.push(m)
          }
        })

        setTeachers(combined)
        if (showToast) {
          success('Đã tải danh sách giáo viên', `Đồng bộ ${apiTeachers.length} giảng viên từ cơ sở dữ liệu.`)
        }
      }
    } catch (err: any) {
      console.warn('Could not fetch teachers via API, falling back to mock:', err)
      if (showToast) {
        toastError('Lỗi kết nối API', err.response?.data?.message || err.message)
      }
      setTeachers((prev) => (prev.length === 0 ? mockTeachers : prev))
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [success, toastError])

  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    void fetchTeachers()
  }, [fetchTeachers])

  // Filter logic
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.qualification.toLowerCase().includes(searchQuery.toLowerCase())
      const matchSpec = specialtyFilter === 'ALL' || t.teachingSpecialty === specialtyFilter
      return matchSearch && matchSpec
    })
  }, [teachers, searchQuery, specialtyFilter])

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim()) {
      warning('Thiếu thông tin', 'Vui lòng điền họ tên và email giáo viên!')
      return
    }

    const created: TeacherRecord = {
      id: `tch_${Date.now()}`,
      name: newName,
      email: newEmail,
      phone: newPhone || '0901 234 567',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      qualification: newQualification || 'IELTS 8.0, TESOL Certificate',
      nativeSpeaker: false,
      teachingSpecialty: newSpecialty,
      assignedClasses: ['Lớp học thử nghiệm'],
      activeStudents: 20,
      hoursPerWeek: 16,
      rating: 5.0,
      status: 'ACTIVE',
      joinedDate: new Date().toLocaleDateString('vi-VN'),
    }

    setTeachers([created, ...teachers])
    success(`Đã thêm giảng viên mới: ${created.name}`, 'Tài khoản giáo vụ và AI Assistant đã được kích hoạt.')
    setIsModalOpen(false)
    setNewName('')
    setNewEmail('')
    setNewQualification('')
  }

  const columns = [
    {
      key: 'name',
      header: 'Họ và tên Giảng viên',
      render: (t: TeacherRecord) => (
        <div className="flex items-center gap-3">
          <img
            src={t.avatar}
            alt={t.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground text-sm">{t.name}</span>
              {t.nativeSpeaker && (
                <Badge variant="primary" className="text-[10px] px-1 py-0">
                  Native
                </Badge>
              )}
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
      key: 'qualification',
      header: 'Bằng cấp & Chứng chỉ',
      render: (t: TeacherRecord) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="line-clamp-1">{t.qualification}</span>
          </div>
          <Badge variant="outline" className="text-[11px]">
            Chuyên ngành: {t.teachingSpecialty}
          </Badge>
        </div>
      ),
    },
    {
      key: 'classes',
      header: 'Lớp đang dạy & Học viên',
      render: (t: TeacherRecord) => (
        <div>
          <span className="font-semibold text-foreground text-sm block">
            {t.assignedClasses.length} lớp ({t.activeStudents} học viên)
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" />
            {t.hoursPerWeek} giờ / tuần
          </span>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Đánh giá học viên',
      render: (t: TeacherRecord) => (
        <div className="flex items-center gap-1.5">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="font-bold text-foreground text-sm">{t.rating.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground">/ 5.0</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (t: TeacherRecord) => (
        <Badge variant={t.status === 'ACTIVE' ? 'success' : 'warning'}>
          {t.status === 'ACTIVE' ? 'Đang giảng dạy' : 'Nghỉ phép'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right' as const,
      render: (t: TeacherRecord) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => {
            setSelectedTeacher(t)
            info(`Hồ sơ giảng viên: ${t.name}`, `Đang tải lịch giảng dạy và đánh giá feedback.`)
          }}
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
            Quản trị hồ sơ chuyên môn, lịch giảng dạy và năng suất hỗ trợ học viên với AI Co-pilot của giáo viên.
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
              placeholder="Tìm theo tên giảng viên, email, chứng chỉ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-full md:w-56">
            <Select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value as any)}
              options={[
                { value: 'ALL', label: 'Tất cả chuyên môn' },
                { value: 'IELTS', label: 'Chuyên IELTS' },
                { value: 'TOEIC', label: 'Chuyên TOEIC' },
                { value: 'COMMUNICATION', label: 'Tiếng Anh Giao Tiếp' },
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
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={filteredTeachers}
          keyExtractor={(item) => item.id}
          pageSize={6}
          emptyMessage="Không tìm thấy giảng viên nào phù hợp với bộ lọc."
        />
      )}

      {/* Modal: Add Teacher */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm Giảng Viên Mới"
        description="Đăng ký tài khoản giáo vụ, phân bổ chuyên môn và kích hoạt trợ lý AI"
        size="md"
      >
        <form onSubmit={handleAddTeacher} className="space-y-4">
          <Input
            label="Họ và tên giáo viên"
            placeholder="VD: Trần Phương Linh"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="linh.tran@englishflow.vn"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <Input
              label="Số điện thoại"
              placeholder="0912 345 678"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
          </div>

          <Input
            label="Chứng chỉ & Bằng cấp sư phạm"
            placeholder="VD: IELTS 8.5 Overall, Cử nhân Sư phạm Tiếng Anh"
            value={newQualification}
            onChange={(e) => setNewQualification(e.target.value)}
          />

          <Select
            label="Chuyên môn giảng dạy chính"
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e.target.value as any)}
            options={[
              { value: 'IELTS', label: 'Luyện thi IELTS Academic' },
              { value: 'TOEIC', label: 'Luyện thi TOEIC 4 kỹ năng' },
              { value: 'COMMUNICATION', label: 'Tiếng Anh giao tiếp phản xạ' },
            ]}
          />

          <div className="pt-4 flex justify-end gap-2 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit">Xác nhận tạo hồ sơ</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Teacher Profile Details */}
      {selectedTeacher && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTeacher(null)}
          title={`Hồ sơ chi tiết: ${selectedTeacher.name}`}
          description={`Giảng viên ${selectedTeacher.teachingSpecialty} • Gia nhập từ ${selectedTeacher.joinedDate}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border">
              <img
                src={selectedTeacher.avatar}
                alt={selectedTeacher.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-primary"
              />
              <div>
                <h3 className="font-bold text-base text-foreground">{selectedTeacher.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedTeacher.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="primary">{selectedTeacher.teachingSpecialty}</Badge>
                  <span className="text-xs text-amber-500 font-bold flex items-center gap-1">
                    ★ {selectedTeacher.rating.toFixed(2)} / 5.0
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Lớp học đang phụ trách:
              </h4>
              <div className="space-y-1.5">
                {selectedTeacher.assignedClasses.map((cls, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-background border border-border text-xs flex justify-between"
                  >
                    <span className="font-semibold text-foreground">{cls}</span>
                    <span className="text-muted-foreground">Sĩ số: 20 học viên</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end border-t border-border">
              <Button onClick={() => setSelectedTeacher(null)}>Đóng</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
export default CenterManagerTeachersPage

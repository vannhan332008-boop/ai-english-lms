/* oxlint-disable react/set-state-in-effect */
import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  GraduationCap,
  BookOpen,
  Plus,
  Clock,
  DoorOpen,
  Award,
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
import { type ClassCohort } from '@/mocks/classes'
import { mockCourses, type CourseItem } from '@/mocks/courses'
import { useToast } from '@/hooks/useToast'
import { apiClient } from '@/lib/api-client'

export const CenterManagerClassesPage: React.FC = () => {
  const { success, warning, error: toastError } = useToast()
  const [activeTab, setActiveTab] = useState<'COURSES' | 'CLASSES'>('CLASSES')

  // Classes State
  const [classesList, setClassesList] = useState<ClassCohort[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [classSearch, setClassSearch] = useState('')
  const [classStatusFilter, setClassStatusFilter] = useState<'ALL' | 'ONGOING' | 'UPCOMING' | 'COMPLETED'>('ALL')
  const [isClassModalOpen, setIsClassModalOpen] = useState(false)

  // Class Form
  const [newClassName, setNewClassName] = useState('')
  const [newCourseName, setNewCourseName] = useState('IELTS Intensive Master 7.5+')
  const [newTeacherName, setNewTeacherName] = useState('David Miller')
  const [newRoom, setNewRoom] = useState('Room 402 - Keangnam Lab')
  const [newSchedule, setNewSchedule] = useState('Thứ 2 - 4 - 6 (18:30 - 20:30)')
  const [newMaxStudents, setNewMaxStudents] = useState(24)

  // Courses State
  const [coursesList, setCoursesList] = useState<CourseItem[]>(mockCourses)
  const [courseSearch, setCourseSearch] = useState('')
  const [courseTypeFilter, setCourseTypeFilter] = useState<'ALL' | 'IELTS' | 'TOEIC' | 'BUSINESS'>('ALL')
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false)

  // Course Form
  const [newCourseTitle, setNewCourseTitle] = useState('')
  const [newCourseCode, setNewCourseCode] = useState('')
  const [newCourseType, setNewCourseType] = useState<'IELTS' | 'TOEIC' | 'COMMUNICATION' | 'BUSINESS'>('IELTS')
  const [newPriceVND, setNewPriceVND] = useState(8500000)
  const [newDurationWeeks, setNewDurationWeeks] = useState(10)

  const fetchClasses = useCallback(async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true)
      const res = await apiClient.get('/center/classes')
      if (res.data?.data && Array.isArray(res.data.data)) {
        const apiClasses: ClassCohort[] = res.data.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          courseName: c.course?.title || 'IELTS Intensive',
          courseCode: c.course?.code || 'IELTS-INT',
          teacherName: c.teacher?.fullName || 'David Miller',
          teacherAvatar:
            c.teacher?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
          room: c.roomNumber || 'Phòng Lab 402',
          schedule: c.scheduleInfo || 'Thứ 2 - 4 - 6',
          startDate: c.startDate ? new Date(c.startDate).toLocaleDateString('vi-VN') : '01/09/2026',
          endDate: c.endDate ? new Date(c.endDate).toLocaleDateString('vi-VN') : '15/12/2026',
          enrolledStudents: c.studentCount ?? 2,
          maxStudents: 24,
          status: c.status as 'ONGOING' | 'UPCOMING' | 'COMPLETED',
          attendanceAverage: 95.5,
        }))

        setClassesList(apiClasses)
        if (showToast) {
          success('Đã tải danh sách lớp học', `Đồng bộ ${apiClasses.length} lớp học từ database SQLite.`)
        }
      }
    } catch (err: any) {
      console.error('Could not fetch classes from API:', err)
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
    void fetchClasses()
  }, [fetchClasses])

  // Filtered Classes
  const filteredClasses = useMemo(() => {
    return classesList.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(classSearch.toLowerCase()) ||
        item.courseName.toLowerCase().includes(classSearch.toLowerCase()) ||
        item.teacherName.toLowerCase().includes(classSearch.toLowerCase()) ||
        item.room.toLowerCase().includes(classSearch.toLowerCase())
      const matchStatus = classStatusFilter === 'ALL' || item.status === classStatusFilter
      return matchSearch && matchStatus
    })
  }, [classesList, classSearch, classStatusFilter])

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return coursesList.filter((course) => {
      const matchSearch =
        course.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
        course.code.toLowerCase().includes(courseSearch.toLowerCase())
      const matchType = courseTypeFilter === 'ALL' || course.type === courseTypeFilter
      return matchSearch && matchType
    })
  }, [coursesList, courseSearch, courseTypeFilter])

  // Handlers
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClassName.trim()) {
      warning('Thiếu thông tin', 'Vui lòng nhập tên lớp học!')
      return
    }

    const created: ClassCohort = {
      id: `cls_${Date.now()}`,
      name: newClassName,
      courseName: newCourseName,
      courseCode: newCourseName.includes('IELTS') ? 'IELTS-ADV-2026' : 'TOEIC-PRO-2026',
      teacherName: newTeacherName,
      teacherAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      room: newRoom,
      schedule: newSchedule,
      startDate: '01/11/2026',
      endDate: '30/01/2027',
      enrolledStudents: 1,
      maxStudents: newMaxStudents,
      status: 'UPCOMING',
      attendanceAverage: 100,
    }

    setClassesList([created, ...classesList])
    success(`Đã mở lớp học mới: ${created.name}`, `Phòng học ${created.room} đã được phân bổ.`)
    setIsClassModalOpen(false)
    setNewClassName('')
  }

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCourseTitle.trim()) {
      warning('Thiếu thông tin', 'Vui lòng nhập tên khóa học!')
      return
    }

    const created: CourseItem = {
      id: `c_${Date.now()}`,
      title: newCourseTitle,
      code: newCourseCode || `ENG-${Date.now().toString().slice(-4)}`,
      type: newCourseType,
      level: 'B1 - C1',
      targetOutcome: `Đạt chuẩn đầu ra ${newCourseType} quốc tế`,
      durationWeeks: newDurationWeeks,
      lessonsCount: newDurationWeeks * 3,
      priceVND: newPriceVND,
      enrolledStudents: 0,
      thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600',
      description: 'Chương trình đào tạo tiêu chuẩn quốc tế',
    }

    setCoursesList([created, ...coursesList])
    success(`Đã thêm khóa học: ${created.title}`, 'Khung chương trình đã sẵn sàng để tạo ca học.')
    setIsCourseModalOpen(false)
    setNewCourseTitle('')
    setNewCourseCode('')
  }

  // Columns for Classes Table
  const classColumns = [
    {
      key: 'name',
      header: 'Lớp học & Khóa học',
      render: (item: ClassCohort) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-foreground text-sm block">{item.name}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {item.courseName}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'teacher',
      header: 'Giảng viên phụ trách',
      render: (item: ClassCohort) => (
        <div className="flex items-center gap-2">
          <img
            src={item.teacherAvatar}
            alt={item.teacherName}
            className="w-7 h-7 rounded-full object-cover ring-1 ring-border shrink-0"
          />
          <span className="text-xs font-semibold text-foreground">{item.teacherName}</span>
        </div>
      ),
    },
    {
      key: 'schedule',
      header: 'Lịch học & Phòng',
      render: (item: ClassCohort) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{item.schedule}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <DoorOpen className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{item.room}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'students',
      header: 'Sĩ số ghi danh',
      render: (item: ClassCohort) => {
        const percent = Math.round((item.enrolledStudents / item.maxStudents) * 100)
        return (
          <div className="w-32 space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span>{item.enrolledStudents} / {item.maxStudents} HV</span>
              <span className="text-muted-foreground text-[10px]">{percent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
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
      render: (item: ClassCohort) => {
        if (item.status === 'ONGOING') {
          return <Badge variant="success">Đang diễn ra</Badge>
        }
        if (item.status === 'UPCOMING') {
          return <Badge variant="warning">Sắp mở</Badge>
        }
        return <Badge variant="outline">Đã kết thúc</Badge>
      },
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right' as const,
      render: (item: ClassCohort) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => success(`Quản lý lớp ${item.name}`, 'Đang chuyển đến sổ điểm và điểm danh.')}
        >
          Chi tiết
        </Button>
      ),
    },
  ]

  // Columns for Courses Table
  const courseColumns = [
    {
      key: 'title',
      header: 'Khóa học',
      render: (c: CourseItem) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-foreground text-sm block">{c.title}</span>
            <span className="text-xs font-mono text-muted-foreground">{c.code}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Phân loại',
      render: (c: CourseItem) => (
        <Badge variant={c.type === 'IELTS' ? 'primary' : 'outline'}>
          {c.type}
        </Badge>
      ),
    },
    {
      key: 'duration',
      header: 'Thời lượng',
      render: (c: CourseItem) => (
        <div className="text-xs">
          <span className="font-semibold text-foreground block">{c.durationWeeks} tuần</span>
          <span className="text-muted-foreground">{c.lessonsCount} bài học</span>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Học phí niêm yết',
      render: (c: CourseItem) => (
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
          {c.priceVND.toLocaleString('vi-VN')} đ
        </span>
      ),
    },
    {
      key: 'outcome',
      header: 'Chuẩn đầu ra',
      render: (c: CourseItem) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="line-clamp-1">{c.targetOutcome}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right' as const,
      render: (c: CourseItem) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => success(`Khung chương trình: ${c.title}`, 'Đã mở giáo trình.')}
        >
          Giáo trình
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
              Quản Trị Lớp Học & Khung Đào Tạo
            </h1>
            <Badge variant="primary">{classesList.length} Lớp đang mở</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Thiết lập chương trình đào tạo IELTS/TOEIC và điều phối thời khóa biểu, sĩ số các lớp học tại cơ sở.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchClasses(true)}
            disabled={isRefreshing}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          {activeTab === 'CLASSES' ? (
            <Button onClick={() => setIsClassModalOpen(true)} className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              Mở lớp học mới
            </Button>
          ) : (
            <Button onClick={() => setIsCourseModalOpen(true)} className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              Tạo khóa học mới
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-border/80">
        <button
          type="button"
          onClick={() => setActiveTab('CLASSES')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'CLASSES'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Lớp Học Đang Mở ({classesList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('COURSES')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'COURSES'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Khóa Học (IELTS, TOEIC) ({coursesList.length})</span>
        </button>
      </div>

      {/* TAB 1: LỚP HỌC ĐANG MỞ */}
      {activeTab === 'CLASSES' && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="w-full md:w-96">
                <Input
                  placeholder="Tìm lớp học, mã khóa, giảng viên, phòng lab..."
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                {(
                  [
                    { label: 'Tất cả trạng thái', value: 'ALL' },
                    { label: 'Đang diễn ra', value: 'ONGOING' },
                    { label: 'Sắp khai giảng', value: 'UPCOMING' },
                    { label: 'Đã hoàn thành', value: 'COMPLETED' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setClassStatusFilter(f.value)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                      classStatusFilter === f.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {isLoading ? (
            <Card className="p-6 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-32" />
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-44" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-2 w-28" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </Card>
          ) : (
            <DataTable
              data={filteredClasses}
              columns={classColumns}
              keyExtractor={(item) => item.id}
              emptyMessage="Không tìm thấy lớp học nào."
              pageSize={6}
            />
          )}
        </div>
      )}

      {/* TAB 2: KHÓA HỌC (IELTS, TOEIC) */}
      {activeTab === 'COURSES' && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="w-full md:w-96">
                <Input
                  placeholder="Tìm theo tên khóa học, mã môn học..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                {(
                  [
                    { label: 'Tất cả chương trình', value: 'ALL' },
                    { label: 'Chuyên IELTS', value: 'IELTS' },
                    { label: 'Chuyên TOEIC', value: 'TOEIC' },
                    { label: 'Business English', value: 'BUSINESS' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setCourseTypeFilter(f.value)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                      courseTypeFilter === f.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <DataTable
            data={filteredCourses}
            columns={courseColumns}
            keyExtractor={(item) => item.id}
            emptyMessage="Không tìm thấy khóa học nào."
            pageSize={6}
          />
        </div>
      )}

      {/* Modal: Create Class */}
      <Modal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        title="Mở Lớp Học Mới"
        description="Phân công giảng viên, xếp phòng lab và thời khóa biểu tại cơ sở"
        size="md"
      >
        <form onSubmit={handleCreateClass} className="space-y-4">
          <Input
            label="Tên định danh lớp học"
            placeholder="VD: IELTS Master K25 - Tối 2-4-6"
            required
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
          />

          <Select
            label="Thuộc chương trình đào tạo"
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
            options={[
              { value: 'IELTS Intensive Master 7.5+', label: 'IELTS Intensive Master 7.5+' },
              { value: 'IELTS Intensive Target 7.0 - 7.5+', label: 'IELTS Intensive Target 7.0 - 7.5+' },
              { value: 'TOEIC 850+ Chinh Phục Doanh Nghiệp', label: 'TOEIC 850+ Chinh Phục Doanh Nghiệp' },
              { value: 'Tiếng Anh Giao Tiếp Phản Xạ Đột Phá', label: 'Tiếng Anh Giao Tiếp Phản Xạ Đột Phá' },
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Giảng viên đứng lớp"
              value={newTeacherName}
              onChange={(e) => setNewTeacherName(e.target.value)}
              options={[
                { value: 'David Miller', label: 'David Miller (IELTS 8.5)' },
                { value: 'Trần Phương Linh', label: 'Trần Phương Linh (IELTS 8.5)' },
                { value: 'Sarah Jenkins', label: 'Sarah Jenkins (Native)' },
                { value: 'Nguyễn Văn Minh', label: 'Nguyễn Văn Minh (TOEIC 990)' },
              ]}
            />

            <Input
              label="Sĩ số tối đa"
              type="number"
              value={newMaxStudents}
              onChange={(e) => setNewMaxStudents(parseInt(e.target.value) || 20)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phòng học / Lab AI"
              placeholder="Room 402 - Keangnam Lab"
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
            />
            <Input
              label="Lịch học tuần"
              placeholder="Thứ 2 - 4 - 6 (18:30 - 20:30)"
              value={newSchedule}
              onChange={(e) => setNewSchedule(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsClassModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit">Xác nhận mở lớp</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Course */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title="Tạo Khóa Học Mới"
        description="Đưa khung chương trình đào tạo mới vào danh mục tuyển sinh của trung tâm"
        size="md"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <Input
            label="Tên khóa học"
            placeholder="VD: IELTS Writing & Speaking Mastery 7.5+"
            required
            value={newCourseTitle}
            onChange={(e) => setNewCourseTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mã khóa học"
              placeholder="IELTS-MAS-75"
              value={newCourseCode}
              onChange={(e) => setNewCourseCode(e.target.value)}
            />

            <Select
              label="Hệ đào tạo"
              value={newCourseType}
              onChange={(e) => setNewCourseType(e.target.value as any)}
              options={[
                { value: 'IELTS', label: 'Luyện thi IELTS' },
                { value: 'TOEIC', label: 'Luyện thi TOEIC' },
                { value: 'COMMUNICATION', label: 'Giao tiếp phản xạ' },
                { value: 'BUSINESS', label: 'Tiếng Anh thương mại' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Học phí trọn khóa (VNĐ)"
              type="number"
              step="500000"
              value={newPriceVND}
              onChange={(e) => setNewPriceVND(parseInt(e.target.value) || 0)}
            />
            <Input
              label="Thời lượng (Tuần)"
              type="number"
              value={newDurationWeeks}
              onChange={(e) => setNewDurationWeeks(parseInt(e.target.value) || 8)}
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsCourseModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit">Lưu chương trình</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
export default CenterManagerClassesPage

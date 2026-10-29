import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Sparkles,
  Clock,
  FileText,
  Mic,
  CreditCard,
  ListChecks,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { DataTable } from '@/components/ui/DataTable'
import {
  mockTeacherAssignments,
  mockTeacherClasses,
  type TeacherAssignment,
} from '@/mocks/teacherPortal'
import { useToast } from '@/hooks/useToast'

export const TeacherAssignmentsPage: React.FC = () => {
  const { success, warning } = useToast()
  const [assignments, setAssignments] = useState<TeacherAssignment[]>(mockTeacherAssignments)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'ESSAY_WRITING' | 'SPEAKING_RECORDING' | 'MULTIPLE_CHOICE' | 'FLASHCARD'>('ALL')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Form State
  const [newTitle, setNewTitle] = useState('')
  const [selectedClassId, setSelectedClassId] = useState(mockTeacherClasses[0]?.id || '')
  const [newType, setNewType] = useState<'ESSAY_WRITING' | 'SPEAKING_RECORDING' | 'MULTIPLE_CHOICE' | 'FLASHCARD'>('ESSAY_WRITING')
  const [newDeadline, setNewDeadline] = useState('05/11/2026 23:59')
  const [newInstructions, setNewInstructions] = useState('')

  // Filtered List
  const filteredAssignments = useMemo(() => {
    return assignments.filter((asg) => {
      const matchSearch =
        asg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asg.className.toLowerCase().includes(searchQuery.toLowerCase())
      const matchType = typeFilter === 'ALL' || asg.type === typeFilter
      return matchSearch && matchType
    })
  }, [assignments, searchQuery, typeFilter])

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) {
      warning('Thiếu thông tin', 'Vui lòng nhập tiêu đề bài tập!')
      return
    }

    const cls = mockTeacherClasses.find((c) => c.id === selectedClassId) || mockTeacherClasses[0]

    const created: TeacherAssignment = {
      id: `asg_${Date.now()}`,
      title: newTitle,
      className: cls.name,
      classId: cls.id,
      type: newType,
      deadline: newDeadline,
      totalAssigned: cls.totalStudents,
      submittedCount: 0,
      gradedCount: 0,
      status: 'OPEN',
    }

    setAssignments([created, ...assignments])
    success(
      `Đã giao bài tập mới thành công!`,
      `Bài tập "${created.title}" đã được gửi tới toàn bộ học viên lớp ${created.className}.`
    )
    setIsCreateModalOpen(false)
    setNewTitle('')
    setNewInstructions('')
  }

  const columns = [
    {
      key: 'title',
      header: 'Tiêu đề bài tập & Lớp',
      render: (asg: TeacherAssignment) => {
        let Icon = FileText
        let iconColor = 'text-indigo-500 bg-indigo-500/10'
        if (asg.type === 'SPEAKING_RECORDING') {
          Icon = Mic
          iconColor = 'text-pink-500 bg-pink-500/10'
        } else if (asg.type === 'MULTIPLE_CHOICE') {
          Icon = ListChecks
          iconColor = 'text-emerald-500 bg-emerald-500/10'
        } else if (asg.type === 'FLASHCARD') {
          Icon = CreditCard
          iconColor = 'text-amber-500 bg-amber-500/10'
        }

        return (
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${iconColor}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <span className="font-bold text-foreground text-sm line-clamp-1">{asg.title}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px]">
                  {asg.className}
                </Badge>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-rose-500" />
                  Hạn nộp: {asg.deadline}
                </span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'type',
      header: 'Phân loại',
      render: (asg: TeacherAssignment) => {
        const labels: Record<string, string> = {
          ESSAY_WRITING: 'Writing Task',
          SPEAKING_RECORDING: 'Speaking Audio',
          MULTIPLE_CHOICE: 'Trắc nghiệm Quiz',
          FLASHCARD: 'SRS Flashcards',
        }
        return <Badge variant="secondary">{labels[asg.type] || asg.type}</Badge>
      },
    },
    {
      key: 'progress',
      header: 'Tiến độ nộp bài',
      render: (asg: TeacherAssignment) => {
        const percent = Math.round((asg.submittedCount / asg.totalAssigned) * 100)
        return (
          <div className="w-36 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-foreground">
                {asg.submittedCount}/{asg.totalAssigned} Học viên
              </span>
              <span className="text-muted-foreground font-medium">{percent}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  percent >= 90 ? 'bg-emerald-500' : percent >= 50 ? 'bg-indigo-500' : 'bg-amber-500'
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
      render: (asg: TeacherAssignment) => {
        if (asg.status === 'GRADING') {
          return (
            <Badge variant="primary" className="gap-1 animate-pulse">
              <Sparkles className="w-3 h-3" />
              Đang chấm AI
            </Badge>
          )
        }
        if (asg.status === 'OPEN') {
          return <Badge variant="success">Đang mở nộp</Badge>
        }
        return <Badge variant="outline">Đã đóng hạn</Badge>
      },
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right' as const,
      render: (asg: TeacherAssignment) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link to="/teacher/grading">
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Chấm bài ({asg.submittedCount - asg.gradedCount})
            </Button>
          </Link>
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
              Quản Lý Học Liệu & Giao Bài Tập
            </h1>
            <Badge variant="primary">{assignments.length} Bài tập</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Giao bài luyện viết Writing Task 2, ghi âm Speaking và bộ trắc nghiệm ngữ pháp tích hợp AI tự động chấm.
          </p>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Tạo bài tập mới
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="w-full md:w-96">
            <Input
              placeholder="Tìm theo tiêu đề bài tập, tên lớp học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {(
              [
                { label: 'Tất cả loại bài', value: 'ALL' },
                { label: 'Writing Essay', value: 'ESSAY_WRITING' },
                { label: 'Speaking Audio', value: 'SPEAKING_RECORDING' },
                { label: 'Quiz Trắc nghiệm', value: 'MULTIPLE_CHOICE' },
                { label: 'SRS Flashcards', value: 'FLASHCARD' },
              ] as const
            ).map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setTypeFilter(f.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                  typeFilter === f.value
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

      {/* DataTable */}
      <DataTable
        data={filteredAssignments}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyMessage="Không tìm thấy bài tập nào phù hợp."
        itemsPerPage={6}
      />

      {/* Modal: Tạo bài tập mới */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Giao Bài Tập Mới Cho Học Viên"
        description="Thiết lập đề bài và cơ chế chấm điểm tự động bằng AI Co-pilot."
        size="lg"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">
              Tiêu đề bài tập <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="VD: IELTS Writing Task 2: Renewable Energy & Climate Change"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Lớp học nhận bài</label>
              <Select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                options={mockTeacherClasses.map((c) => ({
                  value: c.id,
                  label: `${c.name} (${c.totalStudents} HV)`,
                }))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Loại hình bài tập</label>
              <Select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                options={[
                  { value: 'ESSAY_WRITING', label: 'Bài luận Writing (Tự động chấm 4 tiêu chí)' },
                  { value: 'SPEAKING_RECORDING', label: 'Thu âm Speaking (Nhận diện sóng âm IPA)' },
                  { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm Quiz (Chấm tức thì)' },
                  { value: 'FLASHCARD', label: 'Ôn tập SRS Flashcard (Thuật toán SM-2)' },
                ]}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Hạn chót nộp bài (Deadline)</label>
            <Input
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              placeholder="DD/MM/YYYY HH:mm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Nội dung đề bài / Hướng dẫn học viên</label>
            <textarea
              rows={4}
              value={newInstructions}
              onChange={(e) => setNewInstructions(e.target.value)}
              placeholder="Nhập đề bài chi tiết, yêu cầu số lượng từ tối thiểu (ví dụ 250 từ cho Task 2), hoặc tài liệu tham khảo..."
              className="w-full p-3 rounded-lg border border-input bg-background text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-start gap-2">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Bài tập sau khi giao sẽ tự động kích hoạt tính năng <strong>AI Co-pilot</strong> chấm sơ bộ và phát hiện lỗi
              ngay khi học viên bấm nộp bài.
            </span>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border/60">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              Xác nhận giao bài
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default TeacherAssignmentsPage

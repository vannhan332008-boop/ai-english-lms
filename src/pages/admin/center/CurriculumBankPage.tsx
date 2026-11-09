import { useState, useMemo, useEffect } from 'react'
import {
  FileText,
  FileCheck,
  Download,
  Upload,
  Plus,
  BookOpen,
  Music,
  Video,
  FileCode,
  Tag,
  Clock,
  Sparkles,
  BarChart2,
  Trash2,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { DataTable } from '@/components/ui/DataTable'
import { mockMaterials, mockExamBank, type MaterialItem, type ExamBankItem } from '@/mocks/materials'
import { useToast } from '@/hooks/useToast'
import { materialService } from '@/services/materialService'
import { MaterialLibraryModal } from '@/components/specific/MaterialLibraryModal'

export const CurriculumBankPage = () => {
  const { success, error, info } = useToast()
  const showToast = (msg: string, type: 'success' | 'error' | 'info') => {
    if (type === 'success') success(msg)
    else if (type === 'error') error(msg)
    else info(msg)
  }
  const [activeTab, setActiveTab] = useState<'MATERIALS' | 'EXAMS'>('MATERIALS')

  // Materials State
  const [materialsList, setMaterialsList] = useState<MaterialItem[]>(mockMaterials)
  const [materialSearch, setMaterialSearch] = useState('')
  const [materialCategory, setMaterialCategory] = useState<'ALL' | 'IELTS' | 'TOEIC' | 'GENERAL' | 'GRAMMAR'>('ALL')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  // Exam Bank State
  const [examList, setExamList] = useState<ExamBankItem[]>(mockExamBank)
  const [examSearch, setExamSearch] = useState('')
  const [examDifficulty, setExamDifficulty] = useState<'ALL' | 'MEDIUM' | 'HARD' | 'VERY_HARD'>('ALL')
  const [isExamModalOpen, setIsExamModalOpen] = useState(false)

  // Exam Form
  const [newExamTitle, setNewExamTitle] = useState('')
  const [newExamType, setNewExamType] = useState<'IELTS_MOCK' | 'TOEIC_MOCK' | 'MINI_QUIZ'>('IELTS_MOCK')
  const [newExamDuration, setNewExamDuration] = useState(60)
  const [newExamQuestions, setNewExamQuestions] = useState(40)
  const [newExamDifficulty, setNewExamDifficulty] = useState<'MEDIUM' | 'HARD' | 'VERY_HARD'>('HARD')

  // Filtered Materials
  const filteredMaterials = useMemo(() => {
    return materialsList.filter((m) => {
      const matchSearch =
        m.title.toLowerCase().includes(materialSearch.toLowerCase()) ||
        m.uploadedBy.toLowerCase().includes(materialSearch.toLowerCase()) ||
        m.tags.some((t) => t.toLowerCase().includes(materialSearch.toLowerCase()))
      const matchCat = materialCategory === 'ALL' || m.category === materialCategory
      return matchSearch && matchCat
    })
  }, [materialsList, materialSearch, materialCategory])

  // Filtered Exams
  const filteredExams = useMemo(() => {
    return examList.filter((e) => {
      const matchSearch =
        e.title.toLowerCase().includes(examSearch.toLowerCase()) ||
        e.author.toLowerCase().includes(examSearch.toLowerCase())
      const matchDiff = examDifficulty === 'ALL' || e.difficulty === examDifficulty
      return matchSearch && matchDiff
    })
  }, [examList, examSearch, examDifficulty])

  // Handlers
  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExamTitle.trim()) {
      showToast('Vui lòng nhập tiêu đề bài thi!', 'error')
      return
    }

    const created: ExamBankItem = {
      id: `ex_${Date.now()}`,
      title: newExamTitle,
      type: newExamType,
      durationMinutes: newExamDuration,
      totalQuestions: newExamQuestions,
      difficulty: newExamDifficulty,
      submissionsCount: 0,
      avgScore: '--',
      author: 'Ban Giám sát Khảo thí',
    }

    setExamList([created, ...examList])
    showToast(`Đã khởi tạo đề thi mới: ${created.title}`, 'success')
    setIsExamModalOpen(false)
    setNewExamTitle('')
  }

  const fetchMaterials = async () => {
    try {
      const data = await materialService.getTenantMaterials()
      if (data && data.length > 0) {
        const mapped: MaterialItem[] = data.map((d) => ({
          id: d.id,
          title: d.title,
          category: 'GENERAL' as any,
          fileType: (d.fileType === 'DOCUMENT' ? 'DOCX' : d.fileType) as any,
          sizeMB: d.fileSize ? parseFloat((d.fileSize / (1024 * 1024)).toFixed(1)) : 1.5,
          downloadsCount: 0,
          uploadedBy: d.course?.title || 'Ban Học vụ Trung tâm',
          uploadDate: new Date(d.createdAt).toLocaleDateString('vi-VN'),
          tags: d.course ? [d.course.code, d.fileType] : ['Tài liệu trung tâm', d.fileType],
        }))
        setMaterialsList(mapped)
      }
    } catch (err) {
      console.error('Failed to load materials from backend:', err)
    }
  }

  useEffect(() => {
    fetchMaterials()
  }, [])

  const handleDownloadMaterial = async (item: MaterialItem) => {
    showToast(`Đang kết nối tải tệp an toàn: ${item.title}...`, 'info')
    try {
      if (!item.id.startsWith('mat_')) {
        await materialService.downloadMaterial(item.id, item.title)
        showToast(`Tải tài liệu "${item.title}" thành công`, 'success')
      } else {
        showToast(`Tài liệu mẫu đã sẵn sàng trong thư viện`, 'success')
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Không thể tải tệp tin', 'error')
    }
  }

  const handleDeleteMaterial = async (id: string, title: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tài liệu "${title}"? Thao tác không thể hoàn tác.`)) return
    try {
      if (!id.startsWith('mat_')) {
        await materialService.deleteMaterial(id)
      }
      setMaterialsList((prev) => prev.filter((m) => m.id !== id))
      showToast(`Đã xóa tài liệu: ${title}`, 'success')
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Xóa tài liệu thất bại', 'error')
    }
  }

  const materialColumns = [
    {
      key: 'title',
      header: 'Tài liệu & Định dạng',
      render: (item: MaterialItem) => {
        let Icon = FileText
        let iconColor = 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
        if (item.fileType === 'AUDIO') {
          Icon = Music
          iconColor = 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
        } else if (item.fileType === 'VIDEO') {
          Icon = Video
          iconColor = 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
        } else if (item.fileType === 'DOCX') {
          Icon = FileCode
          iconColor = 'text-blue-500 bg-blue-50 dark:bg-blue-950/40'
        }

        return (
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg shrink-0 ${iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="font-semibold text-slate-900 dark:text-white line-clamp-1">{item.title}</span>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{item.sizeMB} MB</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Đăng bởi {item.uploadedBy}</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'tags',
      header: 'Nhãn (Tags)',
      render: (item: MaterialItem) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {item.tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <Tag className="w-2.5 h-2.5 text-slate-400" />
              {tag}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'downloads',
      header: 'Lượt tải',
      render: (item: MaterialItem) => (
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {item.downloadsCount.toLocaleString('vi-VN')} lượt
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Ngày đăng',
      render: (item: MaterialItem) => <span className="text-xs text-slate-500">{item.uploadDate}</span>,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right' as const,
      render: (item: MaterialItem) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
            onClick={() => handleDownloadMaterial(item)}
          >
            <Download className="w-4 h-4 mr-1" />
            Tải về
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2"
            onClick={() => handleDeleteMaterial(item.id, item.title)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  const examColumns = [
    {
      key: 'title',
      header: 'Tên bài kiểm tra / Mock Test',
      render: (item: ExamBankItem) => (
        <div className="space-y-1">
          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{item.title}</span>
            <Badge
              variant={
                item.type === 'IELTS_MOCK'
                  ? 'primary'
                  : item.type === 'TOEIC_MOCK'
                  ? 'success'
                  : 'secondary'
              }
              className="text-xs"
            >
              {item.type.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Biên soạn bởi: <span className="text-slate-700 dark:text-slate-300 font-medium">{item.author}</span>
          </p>
        </div>
      ),
    },
    {
      key: 'specs',
      header: 'Quy cách đề',
      render: (item: ExamBankItem) => (
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>Thời lượng: {item.durationMinutes} phút</span>
          </div>
          <div className="text-slate-500">Số lượng: {item.totalQuestions} câu hỏi</div>
        </div>
      ),
    },
    {
      key: 'difficulty',
      header: 'Độ khó',
      render: (item: ExamBankItem) => {
        if (item.difficulty === 'VERY_HARD') {
          return <Badge variant="danger">Cực khó (8.5+)</Badge>
        }
        if (item.difficulty === 'HARD') {
          return <Badge variant="warning">Nâng cao (7.0 - 8.0)</Badge>
        }
        return <Badge variant="info">Tiêu chuẩn (5.5 - 6.5)</Badge>
      },
    },
    {
      key: 'submissions',
      header: 'Học viên đã nộp',
      render: (item: ExamBankItem) => (
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {item.submissionsCount.toLocaleString('vi-VN')} bài
          </span>
          <p className="text-xs text-emerald-600 font-medium mt-0.5">Điểm TB: {item.avgScore}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right' as const,
      render: (item: ExamBankItem) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => showToast(`Đang mở giao diện xem trước bài thi: ${item.title}`, 'info')}
          >
            Xem trước
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => showToast(`Đã tạo liên kết giao bài thi cho lớp học`, 'success')}
          >
            Giao bài
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Kho Học Liệu & Ngân Hàng Đề Thi
            </h1>
            <Badge variant="primary">Trung tâm Landmark</Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản trị tài liệu giáo trình chuẩn hóa và kho đề thi trắc nghiệm, Writing, Speaking tích hợp AI chấm tự động.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === 'MATERIALS' ? (
            <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2 shrink-0">
              <Upload className="w-4 h-4" />
              Tải tài liệu lên
            </Button>
          ) : (
            <Button onClick={() => setIsExamModalOpen(true)} className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              Tạo đề thi mới
            </Button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng tài liệu lưu trữ</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-slate-900 dark:text-white">{materialsList.length} files</span>
              <span className="text-xs text-slate-500">12.4 GB</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng lượt tải tài liệu</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-slate-900 dark:text-white">4,890+</span>
              <span className="text-xs text-emerald-600 font-medium">+18% tháng này</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Đề thi trong ngân hàng</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-slate-900 dark:text-white">{examList.length} đề</span>
              <span className="text-xs text-purple-600 font-medium">Chuẩn ETS & BC</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Lượt nộp bài chấm AI</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-slate-900 dark:text-white">1,620</span>
              <span className="text-xs text-amber-600 font-medium">100% tự động</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('MATERIALS')}
          className={`pb-3 px-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'MATERIALS'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Kho Tài Liệu Giáo Trình ({materialsList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('EXAMS')}
          className={`pb-3 px-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'EXAMS'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Ngân Hàng Đề Thi & Quizzes ({examList.length})</span>
        </button>
      </div>

      {/* Tab 1: Kho Tài liệu */}
      {activeTab === 'MATERIALS' && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="w-full sm:w-80">
                <Input
                  placeholder="Tìm tài liệu, tác giả, thẻ tags..."
                  value={materialSearch}
                  onChange={(e) => setMaterialSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                {(
                  [
                    { label: 'Tất cả chuyên mục', value: 'ALL' },
                    { label: 'IELTS Intensive', value: 'IELTS' },
                    { label: 'TOEIC Mastery', value: 'TOEIC' },
                    { label: 'Giao tiếp & Ngữ pháp', value: 'GENERAL' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setMaterialCategory(cat.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 ${
                      materialCategory === cat.value
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <DataTable
            data={filteredMaterials}
            columns={materialColumns}
            keyExtractor={(m) => m.id}
            emptyMessage="Không tìm thấy tài liệu học phần nào."
            itemsPerPage={6}
          />
        </div>
      )}

      {/* Tab 2: Ngân hàng Đề thi */}
      {activeTab === 'EXAMS' && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="w-full sm:w-80">
                <Input
                  placeholder="Tìm đề thi mô phỏng, người tạo..."
                  value={examSearch}
                  onChange={(e) => setExamSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                {(
                  [
                    { label: 'Tất cả độ khó', value: 'ALL' },
                    { label: 'Tiêu chuẩn', value: 'MEDIUM' },
                    { label: 'Nâng cao (7.0+)', value: 'HARD' },
                    { label: 'Cực khó (8.5+)', value: 'VERY_HARD' },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setExamDifficulty(d.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 ${
                      examDifficulty === d.value
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <DataTable
            data={filteredExams}
            columns={examColumns}
            keyExtractor={(e) => e.id}
            emptyMessage="Không tìm thấy đề thi phù hợp."
            itemsPerPage={6}
          />
        </div>
      )}

      {/* Modal Tải lên Tài liệu An Toàn */}
      <MaterialLibraryModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false)
          fetchMaterials()
        }}
      />

      {/* Modal Khởi tạo Đề thi mới */}
      <Modal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        title="Tạo Đề Thi Mới Trong Ngân Hàng"
        description="Đề thi sau khi tạo có thể gắn cơ chế tự động chấm bởi AI Speaking/Writing."
        size="md"
      >
        <form onSubmit={handleCreateExam} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Tên đề kiểm tra <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="VD: Mock Test IELTS Listening & Reading Cam 19 Test 3"
              value={newExamTitle}
              onChange={(e) => setNewExamTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Loại hình đề thi</label>
              <Select
                value={newExamType}
                onChange={(e) => setNewExamType(e.target.value as any)}
                options={[
                  { value: 'IELTS_MOCK', label: 'IELTS Full Mock Test' },
                  { value: 'TOEIC_MOCK', label: 'TOEIC Full Test 2h' },
                  { value: 'MINI_QUIZ', label: 'Mini Quiz 15-30 phút' },
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mức độ phân hóa</label>
              <Select
                value={newExamDifficulty}
                onChange={(e) => setNewExamDifficulty(e.target.value as any)}
                options={[
                  { value: 'MEDIUM', label: 'Tiêu chuẩn (5.5 - 6.5)' },
                  { value: 'HARD', label: 'Nâng cao (7.0 - 8.0)' },
                  { value: 'VERY_HARD', label: 'Cực khó (8.5+)' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Thời lượng (phút)</label>
              <Input
                type="number"
                value={newExamDuration}
                onChange={(e) => setNewExamDuration(Number(e.target.value))}
                min={10}
                max={240}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Số lượng câu hỏi</label>
              <Input
                type="number"
                value={newExamQuestions}
                onChange={(e) => setNewExamQuestions(Number(e.target.value))}
                min={1}
                max={200}
              />
            </div>
          </div>

          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg text-xs text-indigo-800 dark:text-indigo-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600" />
            <span>
              Hệ thống hỗ trợ tự động sinh câu hỏi và đáp án mẫu IELTS bằng AI Co-pilot chỉ với 1 click sau khi khởi tạo đề.
            </span>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsExamModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              Tạo đề thi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

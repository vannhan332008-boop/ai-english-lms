import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  FileText,
  FileCheck,
  Download,
  Upload,
  Plus,
  Trash2,
  Music,
  Video,
  Image as ImageIcon,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  X,
  FolderOpen,
} from 'lucide-react'
import { materialService, type MaterialItem } from '../../services/materialService'
import { useToast } from '../../hooks/useToast'
import { useRole } from '../../hooks/useRole'

interface MaterialLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  courseId?: string
  courseTitle?: string
  lessonId?: string
  lessonTitle?: string
}

export const MaterialLibraryModal: React.FC<MaterialLibraryModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  lessonId,
  lessonTitle,
}) => {
  const { success, error, info } = useToast()
  const { role } = useRole()
  const isStaff = role === 'SUPER_ADMIN' || role === 'CENTER_MANAGER' || role === 'TEACHER'

  const [activeTab, setActiveTab] = useState<'list' | 'upload'>('list')
  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Upload Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [uploading, setUploading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch materials
  const fetchMaterials = useCallback(async () => {
    setLoading(true)
    try {
      if (courseId) {
        const data = await materialService.getCourseMaterials(courseId)
        // If lessonId is specified, we can filter or show all
        if (lessonId) {
          setMaterials(data.filter((m) => !m.lessonId || m.lessonId === lessonId))
        } else {
          setMaterials(data)
        }
      } else {
        const data = await materialService.getTenantMaterials()
        setMaterials(data)
      }
    } catch (err: any) {
      console.error('Failed to load materials:', err)
      error(err.response?.data?.message || 'Không thể tải danh sách tài liệu học tập')
    } finally {
      setLoading(false)
    }
  }, [courseId, lessonId, error])

  useEffect(() => {
    if (isOpen) {
      fetchMaterials()
      setActiveTab('list')
      setTitle('')
      setDescription('')
      setSelectedFile(null)
      setUploadProgress(0)
    }
  }, [isOpen, fetchMaterials])

  if (!isOpen) return null

  // Format bytes to KB/MB
  const formatSize = (bytes?: number | null) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Get matching icon by file type
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-rose-500" />
      case 'AUDIO':
        return <Music className="w-5 h-5 text-amber-500" />
      case 'VIDEO':
        return <Video className="w-5 h-5 text-indigo-500" />
      case 'IMAGE':
        return <ImageIcon className="w-5 h-5 text-emerald-500" />
      case 'DOCUMENT':
        return <FileCheck className="w-5 h-5 text-blue-500" />
      default:
        return <FileSpreadsheet className="w-5 h-5 text-slate-400" />
    }
  }

  // Handle file select & client-side validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    const isVideo = file.type.startsWith('video/') || ['.mp4', '.webm', '.mov'].includes(ext)

    const MAX_DOC = 25 * 1024 * 1024
    const MAX_VID = 50 * 1024 * 1024

    if (isVideo && file.size > MAX_VID) {
      error(`Tệp video "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) vượt quá giới hạn tối đa 50MB!`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (!isVideo && file.size > MAX_DOC) {
      error(`Tệp "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) vượt quá giới hạn tối đa 25MB!`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setSelectedFile(file)
    if (!title.trim()) {
      // Auto fill title from filename without extension
      const base = file.name.replace(/\.[^/.]+$/, '')
      setTitle(base)
    }
  }

  // Handle Upload (Pessimistic Update)
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      error('Vui lòng chọn tệp tin cần tải lên')
      return
    }
    if (!title.trim()) {
      error('Vui lòng nhập tiêu đề cho tài liệu')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const created = await materialService.uploadMaterial(
        {
          title: title.trim(),
          description: description.trim() || undefined,
          courseId: courseId || null,
          lessonId: lessonId || null,
          file: selectedFile,
        },
        (progress) => setUploadProgress(progress)
      )

      // Pessimistic Update: Only update state when API 201 succeeds
      setMaterials((prev) => [created, ...prev])
      success('Tải lên tài liệu và lưu trữ an toàn thành công!')
      setActiveTab('list')
      setTitle('')
      setDescription('')
      setSelectedFile(null)
      setUploadProgress(0)
    } catch (err: any) {
      console.error('Upload failed:', err)
      error(err.response?.data?.message || 'Tải lên tài liệu thất bại. Vui lòng thử lại.')
    } finally {
      setUploading(false)
    }
  }

  // Handle Download
  const handleDownload = async (item: MaterialItem) => {
    setDownloadingId(item.id)
    info(`Đang tạo liên kết an toàn để tải: ${item.title}...`)
    try {
      await materialService.downloadMaterial(item.id, item.title)
      success(`Tải tệp "${item.title}" thành công`)
    } catch (err: any) {
      console.error('Download error:', err)
      error(err.response?.data?.message || 'Không thể tải tệp tin. Bạn có thể không có quyền truy cập.')
    } finally {
      setDownloadingId(null)
    }
  }

  // Handle Delete (Pessimistic Update)
  const handleDelete = async (item: MaterialItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài liệu "${item.title}"? Thao tác này không thể hoàn tác.`)) {
      return
    }

    setDeletingId(item.id)
    try {
      await materialService.deleteMaterial(item.id)
      setMaterials((prev) => prev.filter((m) => m.id !== item.id))
      success(`Đã xóa tài liệu "${item.title}"`)
    } catch (err: any) {
      console.error('Delete failed:', err)
      error(err.response?.data?.message || 'Xóa tài liệu thất bại')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Tài liệu & Học liệu An toàn
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-md">
                {courseTitle ? `Khóa: ${courseTitle}` : 'Thư viện học liệu trung tâm'}
                {lessonTitle && ` • Bài: ${lessonTitle}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-3 px-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'list'
                ? 'text-primary-400 border-primary-500'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Danh sách tài liệu ({materials.length})
          </button>

          {isStaff && (
            <button
              onClick={() => setActiveTab('upload')}
              className={`pb-3 px-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'text-primary-400 border-primary-500'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              Tải lên tài liệu mới
            </button>
          )}
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'list' && (
            <>
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                  <p className="text-sm">Đang tải danh sách tài liệu...</p>
                </div>
              ) : materials.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-medium text-white">Chưa có tài liệu nào</h3>
                  <p className="text-sm text-slate-400 max-w-sm">
                    {isStaff
                      ? 'Khóa học này hiện chưa có tài liệu đính kèm. Bạn có thể nhấn nút "Tải lên tài liệu mới" để bổ sung giáo trình hoặc bài tập.'
                      : 'Giảng viên chưa tải lên tài liệu bổ trợ cho khóa học này.'}
                  </p>
                  {isStaff && (
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition"
                    >
                      <Plus className="w-4 h-4" />
                      Tải lên ngay
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {materials.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 transition"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700/60 shrink-0">
                          {getFileIcon(item.fileType)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate">{item.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                            <span className="px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300 font-mono text-[10px]">
                              {item.fileType}
                            </span>
                            <span>{formatSize(item.fileSize)}</span>
                            <span>•</span>
                            <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                            {item.lesson && (
                              <>
                                <span>•</span>
                                <span className="text-primary-400 truncate max-w-[120px]">
                                  {item.lesson.title}
                                </span>
                              </>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-slate-400 mt-1 truncate">{item.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <button
                          onClick={() => handleDownload(item)}
                          disabled={downloadingId === item.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600/20 hover:bg-primary-600 text-primary-300 hover:text-white border border-primary-500/30 text-xs font-medium transition disabled:opacity-50"
                        >
                          {downloadingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          <span>Tải về</span>
                        </button>

                        {isStaff && (
                          <button
                            onClick={() => handleDelete(item)}
                            disabled={deletingId === item.id}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition disabled:opacity-50"
                            title="Xóa tài liệu"
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'upload' && isStaff && (
            <form onSubmit={handleUploadSubmit} className="space-y-5">
              {/* Security info alert */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                <div>
                  <p className="font-semibold text-blue-200">Quy chuẩn lưu trữ an toàn & kiểm soát quyền</p>
                  <p className="mt-0.5 text-blue-300/80">
                    Tài liệu được bảo vệ cách ly theo tenant ({courseTitle ? `Khóa: ${courseTitle}` : 'Toàn trung tâm'}).
                    Chỉ học viên đã ghi danh mới có thể tải về. Hỗ trợ định dạng PDF, DOCX, XLSX, PPTX, MP3 (tối đa 25MB) và MP4 (tối đa 50MB).
                  </p>
                </div>
              </div>

              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Tệp đính kèm <span className="text-rose-500">*</span>
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-primary-500/60 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-800/30 hover:bg-slate-800/60"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.docx,.doc,.xlsx,.pptx,.txt,.mp3,.wav,.m4a,.mp4,.webm,.jpg,.png"
                  />
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-semibold text-white truncate max-w-sm">
                        {selectedFile.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatSize(selectedFile.size)} • Nhấn để chọn tệp khác
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-medium text-slate-300">
                        Kéo thả tệp vào đây hoặc nhấn để chọn
                      </span>
                      <span className="text-xs text-slate-500">
                        PDF, DOCX, MP3 (tối đa 25MB) • Video MP4 (tối đa 50MB)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Tiêu đề hiển thị <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: IELTS Writing Task 2 - Template & Sample Answers"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Mô tả / Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Ghi chú thêm về nội dung tài liệu hoặc hướng dẫn làm bài..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              {/* Progress bar during upload */}
              {uploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Đang tải lên và mã hóa bảo mật...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  disabled={uploading}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm font-medium hover:bg-slate-800 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile || !title.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-sm font-semibold transition shadow-lg shadow-primary-500/20"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang lưu trữ...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Tải lên và Lưu trữ</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}


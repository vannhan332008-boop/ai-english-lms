import React, { useState, useEffect } from 'react'
import {
  Video,
  Calendar,
  Clock,
  Link as LinkIcon,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  liveSessionService,
  type LiveSessionItem,
  type MeetingPlatform,
} from '@/services/liveSessionService'
import { courseService, type Course } from '@/services/courseService'
import { useToast } from '@/hooks/useToast'

export interface LiveSessionModalProps {
  isOpen: boolean
  onClose: () => void
  initialCourseId?: string
  initialClassId?: string
  sessionToEdit?: LiveSessionItem | null
  onSaved: (session: LiveSessionItem) => void
}

export const LiveSessionModal: React.FC<LiveSessionModalProps> = ({
  isOpen,
  onClose,
  initialCourseId,
  initialClassId,
  sessionToEdit,
  onSaved,
}) => {
  const { success, error: toastError } = useToast()

  const [courses, setCourses] = useState<Course[]>([])

  const [courseId, setCourseId] = useState(initialCourseId || '')
  const [classId, setClassId] = useState(initialClassId || '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [meetingPlatform, setMeetingPlatform] = useState<MeetingPlatform>('GOOGLE_MEET')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [autoGenerateUrl, setAutoGenerateUrl] = useState(true)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Default times: next available hour
  useEffect(() => {
    if (sessionToEdit) {
      setTitle(sessionToEdit.title)
      setDescription(sessionToEdit.description || '')
      setCourseId(sessionToEdit.courseId)
      setClassId(sessionToEdit.classId || '')
      setMeetingPlatform(sessionToEdit.meetingPlatform)
      setMeetingUrl(sessionToEdit.meetingUrl)
      setAutoGenerateUrl(false)

      // format to YYYY-MM-DDTHH:mm for datetime-local
      const toLocalISO = (d: string) => {
        const date = new Date(d)
        const offset = date.getTimezoneOffset() * 60000
        return new Date(date.getTime() - offset).toISOString().slice(0, 16)
      }
      setStartTime(toLocalISO(sessionToEdit.startTime))
      setEndTime(toLocalISO(sessionToEdit.endTime))
    } else {
      if (initialCourseId) setCourseId(initialCourseId)
      if (initialClassId) setClassId(initialClassId)

      const start = new Date()
      start.setHours(start.getHours() + 1, 0, 0, 0)
      const end = new Date(start)
      end.setHours(end.getHours() + 1, 30, 0, 0)

      const toLocalISO = (d: Date) => {
        const offset = d.getTimezoneOffset() * 60000
        return new Date(d.getTime() - offset).toISOString().slice(0, 16)
      }

      setStartTime(toLocalISO(start))
      setEndTime(toLocalISO(end))
      setTitle('')
      setDescription('')
      setMeetingUrl('')
      setAutoGenerateUrl(true)
      setMeetingPlatform('GOOGLE_MEET')
    }
    setFormError(null)
  }, [sessionToEdit, initialCourseId, initialClassId, isOpen])

  // Fetch available courses
  useEffect(() => {
    if (isOpen) {
      courseService
        .getAllCourses()
        .then((res: Course[]) => setCourses(res))
        .catch(() => {})
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!title.trim() || title.trim().length < 3) {
      setFormError('Tiêu đề buổi học phải có ít nhất 3 ký tự')
      return
    }

    if (!courseId) {
      setFormError('Vui lòng chọn khóa học tương ứng')
      return
    }

    if (!startTime || !endTime) {
      setFormError('Vui lòng chọn thời gian bắt đầu và kết thúc')
      return
    }

    const startObj = new Date(startTime)
    const endObj = new Date(endTime)

    if (endObj <= startObj) {
      setFormError('Thời gian kết thúc phải diễn ra sau thời gian bắt đầu')
      return
    }

    setIsSubmitting(true)
    try {
      if (sessionToEdit) {
        // Pessimistic Update: update existing
        const updated = await liveSessionService.updateLiveSession(sessionToEdit.id, {
          title: title.trim(),
          description: description.trim() || null,
          startTime: startObj.toISOString(),
          endTime: endObj.toISOString(),
          meetingPlatform,
          meetingUrl: autoGenerateUrl ? '' : meetingUrl.trim(),
          classId: classId || null,
        })
        success('Cập nhật thành công', `Đã lưu thay đổi cho buổi học "${updated.title}"`)
        onSaved(updated)
        onClose()
      } else {
        // Pessimistic Update: create new
        const created = await liveSessionService.createLiveSession({
          courseId,
          classId: classId || null,
          title: title.trim(),
          description: description.trim() || null,
          startTime: startObj.toISOString(),
          endTime: endObj.toISOString(),
          meetingPlatform,
          meetingUrl: autoGenerateUrl ? '' : meetingUrl.trim(),
        })
        success('Lên lịch thành công', `Đã tạo buổi học trực tuyến "${created.title}"`)
        onSaved(created)
        onClose()
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể lưu lịch học trực tuyến'
      setFormError(msg)
      toastError('Thao tác thất bại', msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const platformLabels: Record<MeetingPlatform, { name: string; desc: string; icon: string; badge: string }> = {
    GOOGLE_MEET: {
      name: 'Google Meet',
      desc: 'Tự động tạo link phòng họp meet.google.com an toàn',
      icon: '🟢',
      badge: 'Phổ biến nhất',
    },
    ZOOM: {
      name: 'Zoom Meeting',
      desc: 'Sinh phòng học Zoom ID 10 số kèm mật khẩu',
      icon: '🔵',
      badge: 'Khuyên dùng',
    },
    MICROSOFT_TEAMS: {
      name: 'Microsoft Teams',
      desc: 'Tích hợp lớp học trực tuyến qua Teams Enterprise',
      icon: '🟣',
      badge: 'DN & Trường học',
    },
    INTERNAL_ROOM: {
      name: 'Phòng học EnglishFlow',
      desc: 'Phòng học trực tuyến tích hợp trực tiếp trên LMS',
      icon: '🟠',
      badge: 'Bản beta',
    },
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sessionToEdit ? 'Chỉnh Sửa Buổi Học Trực Tuyến' : 'Lên Lịch Buổi Học Trực Tuyến'}
      description="Tạo phòng học ảo qua Google Meet, Zoom hoặc Teams. Hệ thống sẽ tự động gửi thông báo lịch học đến các học viên đã ghi danh."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-destructive/10 text-destructive border border-destructive/20 animate-in fade-in-50">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Tiêu đề buổi học <span className="text-destructive">*</span></span>
          </label>
          <input
            type="text"
            required
            placeholder="VD: IELTS Speaking Masterclass - Task 2 Fluency & Coherence"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Course selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Khóa học liên kết <span className="text-destructive">*</span>
          </label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
            disabled={Boolean(initialCourseId && !sessionToEdit)}
            className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-60"
          >
            <option value="">-- Chọn khóa học --</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.code || 'IELTS'})
              </option>
            ))}
          </select>
        </div>

        {/* Schedule: Start Time & End Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              Thời gian bắt đầu <span className="text-destructive">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              Thời gian kết thúc <span className="text-destructive">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Platform Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Nền tảng phòng học trực tuyến
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(['GOOGLE_MEET', 'ZOOM', 'MICROSOFT_TEAMS', 'INTERNAL_ROOM'] as MeetingPlatform[]).map((p) => {
              const info = platformLabels[p]
              const isSelected = meetingPlatform === p
              return (
                <div
                  key={p}
                  onClick={() => setMeetingPlatform(p)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-border/80 hover:bg-muted/30'
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{info.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-foreground">{info.name}</p>
                      {isSelected && <Badge variant="primary" className="text-[10px] px-1.5 py-0">Đã chọn</Badge>}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug truncate">
                      {info.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Meeting URL Configuration */}
        <div className="space-y-2 p-3.5 rounded-xl border border-border/80 bg-muted/20">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-primary" />
              Đường link phòng học
            </label>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={autoGenerateUrl}
                onChange={(e) => setAutoGenerateUrl(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <Sparkles className="w-3 h-3 text-amber-500" />
              Tự động sinh link phòng học
            </label>
          </div>

          {autoGenerateUrl ? (
            <div className="text-xs text-muted-foreground bg-background/80 p-2.5 rounded-lg border border-dashed border-border flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                Hệ thống sẽ tự động tạo URL chuẩn {platformLabels[meetingPlatform].name} và hiển thị cho học viên trước buổi học 15 phút.
              </span>
            </div>
          ) : (
            <input
              type="url"
              placeholder={`Nhập URL phòng học thủ công (ví dụ https://meet.google.com/xxx-yyyy-zzz)`}
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono text-xs"
            />
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ghi chú / Chuẩn bị trước buổi học (Tùy chọn)
          </label>
          <textarea
            rows={2}
            placeholder="Học viên vui lòng chuẩn bị tài liệu Unit 3, kiểm tra tai nghe và camera trước khi vào lớp..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang lưu lịch học...
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                {sessionToEdit ? 'Lưu thay đổi' : 'Xác nhận tạo phòng học'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

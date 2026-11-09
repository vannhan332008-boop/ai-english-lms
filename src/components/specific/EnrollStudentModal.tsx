import React, { useState, useEffect, useMemo } from 'react'
import { Search, UserCheck, GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Loader } from '@/components/common/Loader'
import { centerService, type StudentItem } from '@/services/centerService'
import { courseService } from '@/services/courseService'
import { useMutation } from '@/hooks/useMutation'

interface EnrollStudentModalProps {
  isOpen: boolean
  onClose: () => void
  courseId: string
  courseTitle: string
  onSuccess?: (enrollmentData: any) => void
}

export const EnrollStudentModal: React.FC<EnrollStudentModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  onSuccess,
}) => {
  const [students, setStudents] = useState<StudentItem[]>([])
  const [loadingStudents, setLoadingStudents] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')

  // Load students for this center when modal opens
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    const loadStudents = async () => {
      setLoadingStudents(true)
      try {
        const data = await centerService.getStudents()
        if (isMounted) {
          setStudents(data)
        }
      } catch (err) {
        console.error('Failed to load students for enrollment modal:', err)
      } finally {
        if (isMounted) {
          setLoadingStudents(false)
        }
      }
    }

    void loadStudents()
    return () => {
      isMounted = false
    }
  }, [isOpen])

  // Filter students based on search input
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return students
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q))
    )
  }, [students, searchQuery])

  // Pessimistic Enrollment Mutation
  const enrollMutation = useMutation(courseService.enrollStudent, {
    successTitle: 'Ghi danh thành công!',
    successMessage: (data) =>
      `Học viên ${data.student?.fullName || 'học viên'} đã được ghi danh thành công vào ${courseTitle}.`,
    errorTitle: 'Không thể ghi danh',
    onSuccess: (data) => {
      onSuccess?.(data)
      setSelectedStudentId('')
      setSearchQuery('')
      onClose()
    },
  })

  const handleConfirmEnroll = async () => {
    if (!selectedStudentId || !courseId) return

    await enrollMutation.mutate({
      studentId: selectedStudentId,
      courseId,
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ghi Danh Học Viên Vào Khóa Học"
      size="lg"
    >
      <div className="space-y-5">
        {/* Course Target Header Banner */}
        <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-cyan-400">
              Khóa học mục tiêu
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
              {courseTitle}
            </h4>
          </div>
        </div>

        {/* Search Student */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên học viên, email hoặc số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Student Selection List */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            Chọn học viên từ danh sách cơ sở ({filteredStudents.length} học viên)
          </label>

          {loadingStudents ? (
            <div className="py-12 flex justify-center">
              <Loader text="Đang tải danh sách học viên..." />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Không tìm thấy học viên nào phù hợp
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Hãy thử tìm kiếm với từ khóa khác hoặc thêm học viên mới vào hệ thống.
              </p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredStudents.map((student) => {
                const isSelected = selectedStudentId === student.id
                return (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-500 ring-2 ring-primary-500/20'
                        : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={student.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={student.fullName}
                        className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {student.fullName}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {student.currentLevel || 'B1'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate block">
                          {student.email}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 ml-3">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-700" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={onClose} disabled={enrollMutation.isLoading}>
            Hủy
          </Button>
          <Button
            variant="primary"
            type="button"
            disabled={!selectedStudentId || enrollMutation.isLoading}
            loading={enrollMutation.isLoading}
            onClick={handleConfirmEnroll}
            className="gap-2"
          >
            <UserCheck className="w-4 h-4" />
            Xác nhận Ghi danh
          </Button>
        </div>
      </div>
    </Modal>
  )
}


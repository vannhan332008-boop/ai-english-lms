import React, { useState, useEffect } from 'react'
import { ArrowRightLeft, AlertCircle, RefreshCw } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/hooks/useToast'
import { centerService, type StudentItem, type ClassItem } from '@/services/centerService'

interface ClassTransferModalProps {
  isOpen: boolean
  onClose: () => void
  student: StudentItem | null
  classes: ClassItem[]
  onTransferSuccess: () => void
}

export const ClassTransferModal: React.FC<ClassTransferModalProps> = ({
  isOpen,
  onClose,
  student,
  classes,
  onTransferSuccess,
}) => {
  const { success, error: toastError, warning } = useToast()
  const [targetClassId, setTargetClassId] = useState<string>('')
  const [reason, setReason] = useState<string>('Thay đổi lịch học theo nguyện vọng học viên')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter out current class from target options
  const targetClasses = classes.filter((c) => c.id !== student?.currentClassId)

  useEffect(() => {
    const available = classes.filter((c) => c.id !== student?.currentClassId)
    if (available.length > 0) {
      setTargetClassId(available[0].id)
    }
  }, [student?.currentClassId, classes])

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!student) return

    if (!targetClassId) {
      warning('Chưa chọn lớp', 'Vui lòng chọn lớp học mới cho học viên.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await centerService.transferStudentClass(student.id, {
        targetClassId,
        currentClassId: student.currentClassId || undefined,
        reason,
      })

      success(
        'Chuyển lớp thành công!',
        `Học viên ${student.fullName} đã được chuyển sang lớp ${res.newClassName}.`
      )
      onTransferSuccess()
      onClose()
    } catch (err: any) {
      toastError(
        'Lỗi chuyển lớp',
        err.response?.data?.message || err.message || 'Không thể chuyển lớp vào lúc này'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!student) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Điều Chuyển Lớp Học Viên"
      description="Chuyển học viên sang lớp học khác trong cùng cơ sở trung tâm, tự động cập nhật học vụ và lưu vết Audit Log."
      size="md"
    >
      <form onSubmit={handleTransfer} className="space-y-4">
        {/* Student Info Box */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Họ và tên:</span>
            <span className="font-bold text-foreground">{student.fullName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span className="text-foreground">{student.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Lớp hiện tại:</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400">
              {student.currentClass}
            </span>
          </div>
        </div>

        {/* Target Class Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Lớp học đích chuyển đến <span className="text-rose-500">*</span>
          </label>
          {targetClasses.length === 0 ? (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Chưa có lớp học khác khả dụng trong cơ sở để chuyển.</span>
            </div>
          ) : (
            <Select
              value={targetClassId}
              onChange={(e) => setTargetClassId(e.target.value)}
              options={targetClasses.map((c) => ({
                value: c.id,
                label: `${c.name} (${c.studentCount} học viên - ${c.scheduleInfo})`,
              }))}
            />
          )}
        </div>

        {/* Reason for Transfer */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Lý do chuyển lớp (Audit Log)</label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="VD: Trùng lịch học trường, nâng band mục tiêu..."
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!targetClassId || targetClasses.length === 0 || isSubmitting}
            className="gap-1.5"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-4 h-4" />
                Xác nhận Chuyển Lớp
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
export default ClassTransferModal

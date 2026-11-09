import React, { useState } from 'react'
import { Star, MessageSquare, Loader2, Sparkles } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { reviewService, type ReviewItem } from '@/services/reviewService'
import { useToast } from '@/hooks/useToast'

export interface CourseReviewModalProps {
  isOpen: boolean
  onClose: () => void
  courseId: string
  courseTitle: string
  existingReview?: ReviewItem | null
  onSuccess?: (review: ReviewItem) => void
}

export const CourseReviewModal: React.FC<CourseReviewModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  existingReview,
  onSuccess,
}) => {
  const { success, error: toastError } = useToast()
  const [rating, setRating] = useState<number>(existingReview?.rating || 5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [comment, setComment] = useState<string>(existingReview?.comment || '')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const ratingDescriptions: Record<number, string> = {
    5: 'Tuyệt vời - Khóa học vượt ngoài mong đợi! Giảng viên tận tâm.',
    4: 'Rất tốt - Nội dung hữu ích, kiến thức thực tế.',
    3: 'Hài lòng - Đúng như kỳ vọng và mô tả.',
    2: 'Cần cải thiện - Chưa thực sự phù hợp với mục tiêu.',
    1: 'Chưa hài lòng - Nội dung còn sơ sài.',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const review = await reviewService.addReview(courseId, {
        rating,
        comment: comment.trim() || null,
      })
      success('Gửi đánh giá thành công', 'Cảm ơn bạn đã đóng góp phản hồi để nâng cao chất lượng khóa học!')
      if (onSuccess) onSuccess(review)
      onClose()
    } catch (err: any) {
      toastError('Không thể gửi đánh giá', err.response?.data?.message || err.message || 'Vui lòng thử lại sau')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Đánh Giá Khóa Học"
      description={`Chia sẻ cảm nhận chân thực của bạn về "${courseTitle}" để giúp các học viên khác có thêm thông tin tham khảo.`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating Selector */}
        <div className="flex flex-col items-center justify-center p-5 bg-muted/30 rounded-2xl border border-border/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Mức độ hài lòng của bạn
          </span>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= (hoverRating || rating)
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      active
                        ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                        : 'text-muted-foreground/40 hover:text-amber-300'
                    }`}
                  />
                </button>
              )
            })}
          </div>

          <div className="mt-3 text-center">
            <span className="text-sm font-bold text-foreground">
              {rating} / 5 Sao
            </span>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">
              {ratingDescriptions[hoverRating || rating]}
            </p>
          </div>
        </div>

        {/* Comment Textarea */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
              Nhận xét chi tiết (Tùy chọn)
            </span>
            <span className="text-[11px] text-muted-foreground font-normal">
              {comment.length} / 1000 ký tự
            </span>
          </label>
          <textarea
            rows={4}
            maxLength={1000}
            placeholder="Bạn ấn tượng nhất về phần nào trong bài giảng? Giảng viên hỗ trợ ra sao? Kỹ năng nào của bạn đã tiến bộ rõ rệt nhất?..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
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
            Để sau
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-md shadow-amber-500/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang gửi đánh giá...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Gửi đánh giá
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

import React, { useState, useEffect } from 'react'
import {
  X,
  Clock,
  CheckCircle2,
  FileText,
  Save,
  Send,
  HelpCircle,
  Award,
  Loader2,
} from 'lucide-react'
import { assignmentService, type AssignmentItem, type SubmissionItem } from '../../services/assignmentService'
import { useToast } from '../../hooks/useToast'

interface StudentAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  assignmentId: string
  onSubmitted?: () => void
}

export const StudentAssignmentModal: React.FC<StudentAssignmentModalProps> = ({
  isOpen,
  onClose,
  assignmentId,
  onSubmitted,
}) => {
  const { success, error, warning } = useToast()

  const [assignment, setAssignment] = useState<AssignmentItem | null>(null)
  const [submission, setSubmission] = useState<SubmissionItem | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)

  // Student inputs
  const [essayContent, setEssayContent] = useState<string>('')
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({})

  // Fetch assignment & submission details
  useEffect(() => {
    if (!isOpen || !assignmentId) return

    let isMounted = true
    const loadDetails = async () => {
      setLoading(true)
      try {
        const data = await assignmentService.getAssignmentById(assignmentId)
        if (isMounted) {
          setAssignment(data)
          if (data.mySubmission) {
            setSubmission(data.mySubmission)
            setEssayContent(data.mySubmission.content || '')
            if (data.mySubmission.answers) {
              try {
                const parsed =
                  typeof data.mySubmission.answers === 'string'
                    ? JSON.parse(data.mySubmission.answers)
                    : data.mySubmission.answers
                setQuizAnswers(parsed || {})
              } catch {
                setQuizAnswers({})
              }
            }
          } else {
            setSubmission(null)
            setEssayContent('')
            setQuizAnswers({})
          }
        }
      } catch (err: any) {
        console.error('Failed to load assignment:', err)
        error(err.response?.data?.message || 'Không thể tải thông tin bài tập')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void loadDetails()
    return () => {
      isMounted = false
    }
  }, [isOpen, assignmentId, error])

  if (!isOpen) return null

  const isCompleted = Boolean(submission && !submission.isDraft)
  const isLate = assignment?.dueDate ? new Date() > new Date(assignment.dueDate) : false

  // Handle quiz option select
  const handleSelectQuizOption = (questionId: string, optionIndex: number) => {
    if (isCompleted) return
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }))
  }

  // Handle Submit or Draft Save (Pessimistic Update)
  const handleSubmit = async (isDraft: boolean) => {
    if (!assignment) return

    if (!isDraft && assignment.type === 'QUIZ') {
      const answeredCount = Object.keys(quizAnswers).length
      const totalQ = assignment.questions?.length || 0
      if (answeredCount < totalQ) {
        if (!window.confirm(`Bạn mới trả lời ${answeredCount}/${totalQ} câu hỏi. Bạn có chắc muốn nộp bài ngay?`)) {
          return
        }
      }
    }

    if (!isDraft && (assignment.type === 'WRITING' || assignment.type === 'HOMEWORK')) {
      if (!essayContent.trim()) {
        warning('Vui lòng nhập nội dung bài làm trước khi nộp')
        return
      }
    }

    setSubmitting(true)
    try {
      const res = await assignmentService.submitAssignment(assignment.id, {
        content: essayContent,
        answers: quizAnswers,
        isDraft,
      })

      // Pessimistic Update: Only update local state after API responds
      setSubmission(res)
      if (isDraft) {
        success('Đã lưu bản nháp bài làm thành công!')
      } else {
        if (assignment.type === 'QUIZ' && res.score !== null && res.score !== undefined) {
          success(`Đã nộp bài trắc nghiệm! Điểm tự động: ${res.score}/${assignment.maxScore}`)
        } else {
          success('Đã nộp bài tập chính thức thành công!')
        }
        if (onSubmitted) onSubmitted()
      }
    } catch (err: any) {
      console.error('Submission failed:', err)
      error(err.response?.data?.message || 'Không thể nộp bài tập. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate word count
  const wordCount = essayContent.trim() ? essayContent.trim().split(/\s+/).length : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white truncate max-w-md">
                  {assignment?.title || 'Chi tiết bài tập'}
                </h2>
                {assignment && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary-500/20 text-primary-300 border border-primary-500/30">
                    {assignment.type}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {assignment?.class?.name} • Thang điểm: {assignment?.maxScore || 10.0}
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

        {/* Status / Deadline bar */}
        {assignment && (
          <div className="px-6 py-2.5 bg-slate-800/40 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">
                Hạn nộp:{' '}
                {assignment.dueDate
                  ? new Date(assignment.dueDate).toLocaleString('vi-VN')
                  : 'Không giới hạn thời gian'}
              </span>
              {isLate && (
                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                  Đã quá hạn nộp
                </span>
              )}
            </div>

            <div>
              {submission ? (
                submission.isDraft ? (
                  <span className="text-amber-400 font-medium">Bản nháp chưa nộp</span>
                ) : (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã nộp bài ({new Date(submission.submittedAt).toLocaleDateString('vi-VN')})
                    {submission.isLate && ' • Nộp muộn'}
                  </span>
                )
              ) : (
                <span className="text-slate-400">Chưa bắt đầu làm bài</span>
              )}
            </div>
          </div>
        )}

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              <p className="text-sm">Đang tải đề bài tập và dữ liệu nộp...</p>
            </div>
          ) : !assignment ? (
            <div className="py-12 text-center text-slate-400">Không tìm thấy thông tin bài tập</div>
          ) : (
            <>
              {/* Instructions / Prompt */}
              {assignment.description && (
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <h4 className="text-xs font-bold text-primary-400 uppercase tracking-wider">
                    Yêu cầu đề bài / Hướng dẫn:
                  </h4>
                  <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                    {assignment.description}
                  </p>
                </div>
              )}

              {/* Graded Evaluation Card (if already graded by teacher or auto-graded) */}
              {isCompleted && submission && submission.score !== null && submission.score !== undefined && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-400" />
                      <h4 className="text-sm font-bold text-white">Kết quả đánh giá & Điểm số</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-400">
                        {submission.score}
                      </span>
                      <span className="text-xs text-slate-400"> / {assignment.maxScore}</span>
                    </div>
                  </div>

                  {submission.aiFeedback && (
                    <p className="text-xs text-emerald-300/90 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                      {submission.aiFeedback}
                    </p>
                  )}

                  {submission.teacherFeedback && (
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                      <p className="text-xs font-semibold text-slate-300">Nhận xét của Giảng viên:</p>
                      <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed italic">
                        "{submission.teacherFeedback}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Case 1: QUIZ questions */}
              {assignment.type === 'QUIZ' && assignment.questions && (
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primary-400" />
                    Bộ câu hỏi trắc nghiệm ({assignment.questions.length} câu)
                  </h3>

                  {assignment.questions.map((q, qIdx) => {
                    let parsedOptions: string[] = []
                    try {
                      parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options || []
                    } catch {
                      parsedOptions = []
                    }

                    const selectedOption = quizAnswers[q.id || `q_${qIdx}`]

                    return (
                      <div
                        key={q.id || qIdx}
                        className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="px-2 py-0.5 rounded bg-primary-500/20 text-primary-300 font-bold text-xs shrink-0 mt-0.5">
                            Câu {qIdx + 1}
                          </span>
                          <p className="text-sm font-medium text-white leading-relaxed">{q.prompt}</p>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {parsedOptions.map((opt, optIdx) => {
                            const isSelected = selectedOption === optIdx || selectedOption === opt
                            const isCorrect = isCompleted && q.correctAnswer !== null && (String(q.correctAnswer) === String(optIdx) || String(q.correctAnswer) === String(opt))

                            let borderStyle = 'border-slate-700 hover:border-slate-600 bg-slate-900/60'
                            if (isSelected) borderStyle = 'border-primary-500 bg-primary-500/10 text-white'
                            if (isCompleted && isCorrect) borderStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-300'

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                disabled={isCompleted}
                                onClick={() => handleSelectQuizOption(q.id || `q_${qIdx}`, optIdx)}
                                className={`text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${borderStyle} disabled:cursor-not-allowed`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-300 shrink-0">
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span className="text-slate-200">{opt}</span>
                                </div>
                                {isCompleted && isCorrect && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                )}
                              </button>
                            )
                          })}
                        </div>

                        {/* Show explanation if completed */}
                        {isCompleted && q.explanation && (
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-400 mt-2">
                            <span className="font-semibold text-primary-400">Giải thích: </span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Case 2: WRITING / HOMEWORK textarea */}
              {(assignment.type === 'WRITING' || assignment.type === 'HOMEWORK') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary-400" />
                      Bài làm của bạn:
                    </label>
                    <span className="text-xs text-slate-400">
                      Số từ: <span className="text-primary-400 font-mono font-bold">{wordCount}</span> từ
                    </span>
                  </div>

                  <textarea
                    rows={12}
                    disabled={isCompleted}
                    value={essayContent}
                    onChange={(e) => setEssayContent(e.target.value)}
                    placeholder="Bắt đầu gõ bài làm hoặc bài luận của bạn tại đây... Hệ thống hỗ trợ lưu nháp để bạn có thể tiếp tục hoàn thiện sau."
                    className="w-full p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500 leading-relaxed font-sans resize-none disabled:bg-slate-900 disabled:text-slate-400"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {assignment && !isCompleted && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/50">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm font-medium hover:bg-slate-800 transition"
            >
              Đóng
            </button>

            <div className="flex items-center gap-3">
              {(assignment.type === 'WRITING' || assignment.type === 'HOMEWORK') && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmit(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Lưu bản nháp</span>
                </button>
              )}

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit(false)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold shadow-lg shadow-primary-500/20 transition disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Nộp bài chính thức</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

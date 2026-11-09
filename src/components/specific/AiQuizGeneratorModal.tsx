import React, { useState } from 'react'
import {
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  Loader2,
  Check,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { aiService, type QuizQuestionGenerated } from '@/services/aiService'
import { assignmentService } from '@/services/assignmentService'
import { useToast } from '@/hooks/useToast'

export interface AiQuizGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  classesList?: { id: string; name: string }[]
  onSuccess?: () => void
}

export const AiQuizGeneratorModal: React.FC<AiQuizGeneratorModalProps> = ({
  isOpen,
  onClose,
  classesList = [],
  onSuccess,
}) => {
  const { success, error: toastError, info } = useToast()

  // Generation parameters
  const [passage, setPassage] = useState('')
  const [numQuestions, setNumQuestions] = useState(4)
  const [difficulty, setDifficulty] = useState('B2 / IELTS 6.5')
  const [title, setTitle] = useState('IELTS Reading Comprehension Quiz #1')
  const [selectedClassId, setSelectedClassId] = useState(classesList[0]?.id || '')
  const [dueDate, setDueDate] = useState('2026-11-25T23:59')

  // State
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [questions, setQuestions] = useState<QuizQuestionGenerated[]>([])
  const [step, setStep] = useState<'INPUT' | 'REVIEW'>('INPUT')

  const handleGenerate = async () => {
    if (!passage.trim() || passage.trim().length < 15) {
      toastError('Lỗi', 'Vui lòng nhập đoạn văn bản tối thiểu 15 ký tự.')
      return
    }

    setIsGenerating(true)
    info('AI Co-pilot đang phân tích đoạn văn và tạo câu hỏi...')

    try {
      const result = await aiService.generateQuiz({
        passage: passage.trim(),
        numQuestions,
        difficulty,
      })

      if (result && result.questions && result.questions.length > 0) {
        setQuestions(result.questions)
        setStep('REVIEW')
        success(
          'Đã tạo câu hỏi thành công!',
          `AI đã sinh ${result.questions.length} câu hỏi trắc nghiệm kèm giải thích chi tiết (${result.tokensUsed} tokens).`
        )
      } else {
        toastError('Lỗi', 'Không thể tạo câu hỏi từ đoạn văn bản này. Vui lòng thử lại.')
      }
    } catch (err: any) {
      console.error('Quiz generation error:', err)
      toastError('Lỗi AI', err.response?.data?.message || 'Không thể kết nối đến máy chủ AI.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Update question text
  const handleUpdatePrompt = (index: number, newPrompt: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === index ? { ...q, prompt: newPrompt } : q))
    )
  }

  // Update question option
  const handleUpdateOption = (qIndex: number, optIndex: number, newOptionVal: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q
        const oldVal = q.options[optIndex]
        const newOptions = [...q.options]
        newOptions[optIndex] = newOptionVal
        const isCurrentCorrect = q.correctAnswer === oldVal
        return {
          ...q,
          options: newOptions,
          correctAnswer: isCurrentCorrect ? newOptionVal : q.correctAnswer,
        }
      })
    )
  }

  // Set correct answer
  const handleSetCorrectAnswer = (qIndex: number, answerVal: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, correctAnswer: answerVal } : q))
    )
  }

  // Update explanation
  const handleUpdateExplanation = (qIndex: number, newExplanation: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, explanation: newExplanation } : q))
    )
  }

  // Delete question
  const handleDeleteQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== index))
  }

  // Add blank question
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        prompt: 'Câu hỏi mới:',
        options: ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D'],
        correctAnswer: 'Lựa chọn A',
        explanation: 'Giải thích vì sao lựa chọn này đúng.',
        points: 1.0,
      },
    ])
  }

  // Save as Assignment (Human-in-the-loop approved)
  const handleSaveAsAssignment = async () => {
    if (!selectedClassId && classesList.length > 0) {
      toastError('Lỗi', 'Vui lòng chọn lớp học để giao bài tập.')
      return
    }
    if (questions.length === 0) {
      toastError('Lỗi', 'Cần tối thiểu 1 câu hỏi để tạo bài tập.')
      return
    }

    setIsSaving(true)
    try {
      const classIdToUse = selectedClassId || classesList[0]?.id
      if (!classIdToUse) {
        throw new Error('Chưa có lớp học nào được chọn')
      }

      const formattedQuestions = questions.map((q, idx) => ({
        prompt: q.prompt,
        questionType: 'MULTIPLE_CHOICE' as const,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: q.points || 1.0,
        orderIndex: idx + 1,
      }))

      await assignmentService.createAssignment({
        classId: classIdToUse,
        title,
        type: 'QUIZ',
        description: `Đọc đoạn văn sau và trả lời các câu hỏi trắc nghiệm:\n\n${passage}`,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        maxScore: questions.length * 1.0,
        questions: formattedQuestions,
      })

      success(
        'Đã tạo bài tập thành công!',
        `Bài tập trắc nghiệm "${title}" gồm ${questions.length} câu hỏi đã được tạo cho học viên.`
      )
      onSuccess?.()
      onClose()
    } catch (err: any) {
      console.error('Failed to save assignment:', err)
      toastError('Không thể tạo bài tập', err.response?.data?.message || err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Co-pilot: Tạo Bộ Câu Hỏi Trắc Nghiệm Từ Văn Bản"
      description="Dán đoạn văn bản bài đọc, tài liệu hoặc chủ đề để AI tự động trích xuất câu hỏi đọc hiểu và từ vựng."
      size="xl"
    >
      {step === 'INPUT' ? (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>Đoạn văn bản nguồn / Bài đọc (Passage) <span className="text-rose-500">*</span></span>
              <span className="text-[11px] text-muted-foreground font-normal">
                {passage.length} ký tự
              </span>
            </label>
            <textarea
              rows={8}
              value={passage}
              onChange={(e) => setPassage(e.target.value)}
              placeholder="Dán đoạn văn bản (ví dụ bài đọc Reading IELTS, bài báo BBC/The Guardian, hoặc tài liệu học vụ) vào đây..."
              className="w-full p-3.5 rounded-xl border border-input bg-background text-xs leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Số lượng câu hỏi</label>
              <Select
                value={String(numQuestions)}
                onChange={(e) => setNumQuestions(parseInt(e.target.value, 10))}
                options={[
                  { value: '3', label: '3 câu hỏi' },
                  { value: '4', label: '4 câu hỏi (Tiêu chuẩn)' },
                  { value: '5', label: '5 câu hỏi' },
                  { value: '8', label: '8 câu hỏi (Mini Test)' },
                  { value: '10', label: '10 câu hỏi (Full Quiz)' },
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Độ khó mục tiêu</label>
              <Select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                options={[
                  { value: 'B1 / IELTS 5.0 - 5.5', label: 'B1 / IELTS 5.0 - 5.5 (Trung cấp)' },
                  { value: 'B2 / IELTS 6.0 - 6.5', label: 'B2 / IELTS 6.0 - 6.5 (Mục tiêu chuẩn)' },
                  { value: 'C1 / IELTS 7.0 - 7.5', label: 'C1 / IELTS 7.0 - 7.5 (Nâng cao)' },
                  { value: 'C2 / IELTS 8.0+', label: 'C2 / IELTS 8.0+ (Chuyên sâu)' },
                ]}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Cơ chế Human-in-the-loop an toàn:</p>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Sau khi AI sinh câu hỏi, thầy/cô sẽ được xem trước, chỉnh sửa đáp án, câu từ và giải thích trước khi lưu chính thức vào ngân hàng đề thi.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border/60">
            <Button variant="outline" onClick={onClose} disabled={isGenerating}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleGenerate}
              disabled={isGenerating || !passage.trim()}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang phân tích & tạo câu hỏi...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Tạo câu hỏi bằng AI
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        /* STEP 2: REVIEW & EDIT QUESTIONS (Human-in-the-loop) */
        <div className="space-y-5">
          {/* Top Config */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/60">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-foreground">Tiêu đề bài tập</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tiêu đề quiz..."
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-foreground">Lớp học tiếp nhận</label>
              <Select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                options={classesList.map((c) => ({ value: c.id, label: c.name }))}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-foreground">Hạn chót nộp</label>
              <Input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          {/* List of Questions with Editable Fields */}
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {questions.map((q, qIdx) => (
              <div
                key={qIdx}
                className="p-4 rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-colors space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" className="text-xs font-mono">
                      Câu {qIdx + 1}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium">Trắc nghiệm 4 lựa chọn</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteQuestion(qIdx)}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-rose-500"
                    title="Xóa câu hỏi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Prompt Input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Câu hỏi:</label>
                  <Input
                    value={q.prompt}
                    onChange={(e) => handleUpdatePrompt(qIdx, e.target.value)}
                    className="text-xs font-semibold"
                  />
                </div>

                {/* Options with Radio Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground">
                    Các lựa chọn (Click nút tròn để chỉ định Đáp án đúng):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = q.correctAnswer === opt
                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs transition-colors ${
                            isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-semibold'
                              : 'bg-muted/30 border-border/60'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSetCorrectAnswer(qIdx, opt)}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                              isCorrect
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                            }`}
                            title={isCorrect ? 'Đáp án đúng' : 'Chọn làm đáp án đúng'}
                          >
                            {isCorrect && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                            className="w-full bg-transparent border-0 p-0 text-xs focus:outline-none"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Pedagogical Explanation */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">
                    Giải thích sư phạm (Hiển thị cho học viên sau khi nộp bài):
                  </label>
                  <textarea
                    rows={2}
                    value={q.explanation}
                    onChange={(e) => handleUpdateExplanation(qIdx, e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-input bg-muted/20 text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/60">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddQuestion}
                className="gap-1.5 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm câu hỏi thủ công
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep('INPUT')}
                className="text-xs text-muted-foreground"
              >
                ← Nhập lại văn bản
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
                Đóng
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveAsAssignment}
                disabled={isSaving || questions.length === 0}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang lưu bài tập...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Phê duyệt & Giao bài tập ({questions.length} câu)
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default AiQuizGeneratorModal

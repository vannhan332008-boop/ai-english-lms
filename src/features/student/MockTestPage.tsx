import React, { useState, useEffect } from 'react'
import {
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Award,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { mockReadingTestPassage } from '@/mocks/studentPortal'
import { useToast } from '@/hooks/useToast'

export const StudentMockTestPage: React.FC = () => {
  const { success } = useToast()
  const passage = mockReadingTestPassage

  // Test Countdown Timer: 60 minutes
  const [secondsLeft, setSecondsLeft] = useState(passage.timeLimitMinutes * 60)
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({})
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [testResult, setTestResult] = useState<{ score: number; total: number; band: number } | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const remaining = sec % 60
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`
  }

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }))
  }

  const answeredCount = Object.keys(userAnswers).length

  const handleConfirmSubmit = () => {
    let correct = 0
    passage.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correct += 1
      }
    })

    const calculatedBand = correct === 4 ? 8.5 : correct === 3 ? 7.5 : correct === 2 ? 6.5 : 5.5

    setTestResult({
      score: correct,
      total: passage.questions.length,
      band: calculatedBand,
    })
    setIsSubmitModalOpen(false)
    success(`Nộp bài thi thành công!`, `Bạn đã trả lời đúng ${correct}/${passage.questions.length} câu.`)
  }

  return (
    <div className="space-y-4">
      {/* Intense Examination Topbar */}
      <div className="p-4 rounded-2xl bg-card border-2 border-primary/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">IELTS Academic Reading</span>
            <Badge variant="destructive" className="animate-pulse">
              Official Simulation
            </Badge>
          </div>
          <h1 className="text-base font-bold text-foreground mt-0.5">{passage.title}</h1>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* Countdown Clock */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-mono font-bold text-lg">
            <Clock className="w-5 h-5 animate-spin" />
            <span>{formatTimer(secondsLeft)}</span>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsSubmitModalOpen(true)}
            className="gap-1.5 text-xs font-bold shadow-md shadow-primary/20"
          >
            <Send className="w-3.5 h-3.5" />
            Nộp bài thi ({answeredCount}/{passage.questions.length})
          </Button>
        </div>
      </div>

      {/* Split-Screen Exam Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Reading Passage (6 cols) */}
        <Card className="lg:col-span-6 p-6 space-y-4 border-border/80 shadow-sm h-[680px] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary" />
              Đoạn văn đọc hiểu (Reading Passage)
            </span>
            <span className="text-xs text-muted-foreground font-mono">Passage 1 of 3</span>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-foreground font-serif">
            {passage.paragraphs.map((p) => (
              <div key={p.label} className="space-y-1">
                <span className="font-bold text-primary font-sans text-xs inline-block mr-2 px-1.5 py-0.5 rounded bg-primary/10">
                  [{p.label}]
                </span>
                <span className="text-foreground/90">{p.content}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Right: Question Sheet (6 cols) */}
        <Card className="lg:col-span-6 p-6 space-y-5 border-border/80 shadow-sm h-[680px] overflow-y-auto flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-500" />
                Câu hỏi trắc nghiệm (Questions 1 - {passage.questions.length})
              </span>
              <span className="text-xs font-semibold text-primary">
                Đã chọn: {answeredCount}/{passage.questions.length} câu
              </span>
            </div>

            {/* Questions list */}
            <div className="space-y-6">
              {passage.questions.map((q) => {
                const selected = userAnswers[q.id]
                return (
                  <div key={q.id} id={`q_${q.id}`} className="space-y-3 p-4 rounded-xl bg-muted/20 border border-border/60">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-foreground text-sm">
                        <span className="text-primary mr-1">Question {q.id}:</span> {q.question}
                      </p>
                      <Badge variant="outline" className="text-[10px] shrink-0 font-mono">
                        {q.paragraphRef}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-xs">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selected === optIdx
                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                              isChosen
                                ? 'bg-primary/15 border-primary text-foreground font-semibold shadow-sm'
                                : 'bg-card border-border/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                            }`}
                          >
                            <span>
                              <strong className="mr-2">{String.fromCharCode(65 + optIdx)}.</strong>
                              {opt}
                            </span>
                            {isChosen && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom Question Palette */}
          <div className="pt-4 border-t border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground mr-1">Bảng câu hỏi:</span>
              {passage.questions.map((q) => {
                const isAnswered = userAnswers[q.id] !== undefined
                return (
                  <a
                    key={q.id}
                    href={`#q_${q.id}`}
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                      isAnswered
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {q.id}
                  </a>
                )
              })}
            </div>

            <Button size="sm" variant="primary" onClick={() => setIsSubmitModalOpen(true)} className="text-xs">
              Nộp bài
            </Button>
          </div>
        </Card>
      </div>

      {/* Modal: Confirm Submit */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Xác Nhận Nộp Bài Thi Thử"
        description="Kiểm tra lại số lượng câu hỏi trước khi hệ thống đóng bài thi."
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <span>Bạn đã hoàn thành </span>
              <strong>
                {answeredCount} / {passage.questions.length} câu hỏi
              </strong>
              . Bạn có chắc chắn muốn nộp bài sớm hơn thời gian quy định?
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
            <Button variant="outline" onClick={() => setIsSubmitModalOpen(false)}>
              Quay lại làm tiếp
            </Button>
            <Button variant="primary" onClick={handleConfirmSubmit}>
              Xác nhận nộp bài
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Test Score Result */}
      {testResult && (
        <Modal
          isOpen={!!testResult}
          onClose={() => setTestResult(null)}
          title="Kết Quả Thi Thử Academic Reading"
          size="md"
        >
          <div className="space-y-5 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-500/20">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Điểm Khảo Thí Tương Đương
              </span>
              <div className="text-4xl font-black text-foreground mt-1">
                {testResult.band.toFixed(1)} Band
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                Trả lời đúng {testResult.score}/{testResult.total} câu ({Math.round((testResult.score / testResult.total) * 100)}%)
              </p>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground text-left space-y-1">
              <span className="font-bold text-foreground block">Đánh giá từ AI:</span>
              <p>
                Kỹ năng Skimming và Scanning của bạn rất tốt. Bạn đã nắm bắt chính xác ý chính các đoạn phân tích về Transit-Oriented Development và rào cản ODA.
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <Button variant="outline" onClick={() => setTestResult(null)}>
                Đóng
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  success('Đã lưu kết quả vào học bạ', 'Điểm thi thử đã được cộng vào biểu đồ tiến trình học tập.')
                  setTestResult(null)
                }}
              >
                Lưu vào học bạ
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default StudentMockTestPage

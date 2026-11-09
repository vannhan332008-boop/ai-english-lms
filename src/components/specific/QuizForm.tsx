import React, { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Award,
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { cn } from '@/lib/utils'

export interface QuizQuestion {
  id: string | number
  question: string
  options: string[]
  correctAnswer: string
  explanation?: string
}

export interface QuizFormProps {
  title?: string
  questions?: QuizQuestion[]
  onFinish?: (score: number, total: number) => void
  onComplete?: (score: number) => void
  className?: string
}

export const QuizForm: React.FC<QuizFormProps> = ({
  title = 'Bài Kiểm Tra Nhanh Củng Cố Kiến Thức (AI Quiz)',
  questions,
  onFinish,
  onComplete,
  className,
}) => {
  const defaultQuestions: QuizQuestion[] = [
    {
      id: 1,
      question:
        'Which academic linking word is most appropriate to introduce a contrasting counter-argument in IELTS Writing Task 2?',
      options: [
        'Furthermore',
        'Paradoxically, however',
        'In addition to',
        'As a direct result of',
      ],
      correctAnswer: 'Paradoxically, however',
      explanation:
        '"Paradoxically, however" là cụm liên từ Band 8.0+ thể hiện sự đối lập sâu sắc, ghi điểm tiêu chí Coherence & Cohesion.',
    },
    {
      id: 2,
      question:
        'What is the correct IPA stress mark placement for the academic noun "Infrastructure"?',
      options: [
        '/ɪnˈfræstrʌktʃər/',
        '/ˈɪn.frəˌstrʌk.tʃər/',
        '/ɪnfrəstrʌkˈtʃɜːr/',
        '/ɪnˈfrɑːstrʌktʃər/',
      ],
      correctAnswer: '/ˈɪn.frəˌstrʌk.tʃər/',
      explanation:
        'Trọng âm chính rơi vào âm tiết đầu tiên /ˈɪn/, theo sau là schwa /ə/ và trọng âm phụ ở /strʌk/.',
    },
    {
      id: 3,
      question:
        'Identify the sentence demonstrating an inverted conditional structure (Inversion):',
      options: [
        'If governments invest in green energy, carbon emissions will drop.',
        'Should governments invest in green energy, carbon emissions will drop.',
        'Governments must invest in green energy to drop emissions.',
        'When governments are investing in green energy, emissions drop.',
      ],
      correctAnswer: 'Should governments invest in green energy, carbon emissions will drop.',
      explanation:
        '"Should + S + V" là cấu trúc đảo ngữ câu điều kiện loại 1, tạo phong cách trang trọng (Grammatical Range).',
    },
  ]

  const quizData = questions && questions.length > 0 ? questions : defaultQuestions

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const currentQ = quizData[currentIndex]
  const selectedOption = selectedAnswers[currentIndex]

  const handleSelectOption = (option: string) => {
    if (isSubmitted) return
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIndex]: option,
    })
  }

  const handleNext = () => {
    if (currentIndex < quizData.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setIsSubmitted(true)
      const correctCount = quizData.filter(
        (q, idx) => selectedAnswers[idx] === q.correctAnswer
      ).length
      onFinish?.(correctCount, quizData.length)
      onComplete?.(correctCount)
    }
  }

  const handleReset = () => {
    setSelectedAnswers({})
    setCurrentIndex(0)
    setIsSubmitted(false)
  }

  const score = quizData.filter((q, idx) => selectedAnswers[idx] === q.correctAnswer).length

  return (
    <div
      className={cn(
        'rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xl space-y-6',
        className
      )}
    >
      {/* Header with Title & Progress */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-[11px] font-bold text-indigo-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {title}
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
            Câu hỏi {currentIndex + 1} / {quizData.length}
          </h3>
        </div>

        {/* Progress Bar pill */}
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / quizData.length) * 100}%`,
              }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {Math.round(((currentIndex + 1) / quizData.length) * 100)}%
          </span>
        </div>
      </div>

      {/* Quiz Screen or Result Screen */}
      {!isSubmitted ? (
        <div className="space-y-5">
          {/* Question Text */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/50 border border-indigo-100 dark:border-slate-700/60">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
              {currentQ.question}
            </p>
          </div>

          {/* Options List */}
          <div className="space-y-2.5">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === option
              return (
                <button
                  key={`${currentQ.id || currentIndex}-${idx}-${option.slice(0, 15)}`}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className={cn(
                    'w-full flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold text-left transition-all duration-150',
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-sm ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'w-6 h-6 rounded-lg text-xs flex items-center justify-center font-bold',
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      )}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Action Row */}
          <div className="flex justify-end pt-3">
            <Button
              variant="primary"
              size="md"
              disabled={!selectedOption}
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {currentIndex < quizData.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành bài tập'}
            </Button>
          </div>
        </div>
      ) : (
        /* Result Screen */
        <div className="space-y-6 py-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">
              Kết Quả Bài Tập Củng Cố
            </h4>
            <p className="text-3xl font-black text-indigo-600 dark:text-cyan-400 mt-2">
              {score} / {quizData.length} Đúng
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {score === quizData.length
                ? 'Xuất sắc! Bạn đã nắm vững toàn bộ kiến thức bài học.'
                : 'Bạn đã hoàn thành tốt, hãy xem lại các giải thích chi tiết bên dưới.'}
            </p>
          </div>

          {/* Detailed Explanations */}
          <div className="space-y-3 text-left">
            {quizData.map((q, idx) => {
              const isCorrect = selectedAnswers[idx] === q.correctAnswer
              return (
                <div
                  key={q.id || `quiz-question-${idx}`}
                  className={cn(
                    'p-4 rounded-2xl border text-xs space-y-1.5',
                    isCorrect
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-rose-500/5 border-rose-500/20'
                  )}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <span className="text-slate-800 dark:text-slate-200">
                      Câu {idx + 1}: {q.question}
                    </span>
                  </div>
                  <p className="text-slate-500 pl-6">
                    <span className="font-semibold">Đáp án đúng:</span> {q.correctAnswer}
                  </p>
                  {q.explanation && (
                    <p className="text-slate-600 dark:text-slate-400 italic pl-6 pt-0.5">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={handleReset}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Làm lại bài kiểm tra
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuizForm

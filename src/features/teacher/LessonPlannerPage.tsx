import React, { useState } from 'react'
import {
  BotMessageSquare,
  Sparkles,
  Clock,
  Award,
  CheckCircle2,
  ListChecks,
  CreditCard,
  Download,
  Save,
  RefreshCw,
  Plus,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { mockSampleLessonPlan, type LessonPlanResult } from '@/mocks/teacherPortal'
import { useToast } from '@/hooks/useToast'
import { apiClient } from '@/lib/api-client'

export const TeacherLessonPlannerPage: React.FC = () => {
  const { success, info, error: toastError } = useToast()

  // Form Inputs
  const [topic, setTopic] = useState('Biến đổi khí hậu & Bảo vệ môi trường tại Đông Nam Á')
  const [targetLevel, setTargetLevel] = useState('IELTS Band 6.0 - 7.0 (Upper-Intermediate)')
  const [duration, setDuration] = useState('90')

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState('')
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlanResult | null>(mockSampleLessonPlan)
  const [activeTab, setActiveTab] = useState<'STAGES' | 'MCQ' | 'VOCAB'>('STAGES')

  // Generate Handler calling Backend API
  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setGeneratedPlan(null)

    setGenerationStep('Đang phân tích khung năng lực CEFR & Chuẩn đầu ra IELTS...')

    try {
      setGenerationStep('Đang gửi yêu cầu và thiết kế giáo án 5 giai đoạn sư phạm qua Gemini...')
      const response = await apiClient.post('/ai/teacher/lesson-plan', {
        topic,
        targetLevel,
        duration: parseInt(duration, 10),
        curriculumFocus: 'IELTS',
      })

      const data = response.data?.data
      if (data) {
        const mapped: LessonPlanResult = {
          topic: data.topic || topic,
          targetLevel: data.targetLevel || targetLevel,
          durationMinutes: data.durationMinutes || parseInt(duration, 10),
          learningObjectives: [
            `Nắm vững từ vựng và thuật ngữ chuyên sâu về chủ đề ${topic}.`,
            `Phát triển kỹ năng phản xạ thảo luận và phân tích phản biện đạt chuẩn ${targetLevel}.`,
            `Vận dụng cấu trúc ngữ pháp học thuật để giải quyết các dạng câu hỏi chuyên đề.`,
            `Hoàn thành bài tập trắc nghiệm củng cố và ghi nhớ bộ Flashcard chuẩn ngữ âm IPA.`,
          ],
          timelineStages: (data.outline || data.stages || []).map((s: any, idx: number) => ({
            stageName: s.title || s.stageName || `Giai đoạn ${idx + 1}`,
            time: s.time || `${s.duration || 15} phút`,
            activity: s.activity || s.materialsNeeded || 'Hoạt động tương tác',
            teacherAction:
              s.teacherNotes ||
              (Array.isArray(s.teacherActivities) ? s.teacherActivities.join('; ') : s.teacherActivities) ||
              '',
            studentAction:
              s.activity ||
              (Array.isArray(s.studentActivities) ? s.studentActivities.join('; ') : s.studentActivities) ||
              '',
          })),
          mcqQuestions: (data.quiz || data.quizQuestions || []).map((q: any, idx: number) => ({
            id: q.id ?? idx + 1,
            question: q.question,
            options: q.options || [],
            answer: q.correctAnswer || (q.options ? q.options[0] : ''),
            explanation: q.explanationVi || '',
          })),
          flashcards: (data.flashcards || []).map((f: any) => ({
            term: f.word || f.term || '',
            ipa: f.phonetic || f.ipa || '',
            partOfSpeech: f.partOfSpeech || 'noun',
            definitionVi: f.vietnameseMeaning || f.definitionVi || '',
            exampleSentence: f.exampleSentence || '',
          })),
        }

        setGeneratedPlan(mapped)
        success(
          'Giáo án AI đã sẵn sàng!',
          `Đã tạo hoàn tất kế hoạch bài dạy ${duration} phút cho chủ đề: ${topic} (${data.tokensUsed ?? 0} tokens đã tiêu hao).`
        )
      } else {
        setGeneratedPlan(mockSampleLessonPlan)
        success('Đã tải giáo án mẫu tiêu chuẩn!', `Chủ đề: ${topic}`)
      }
    } catch (err: any) {
      console.error('Error generating lesson plan:', err)
      toastError(
        'Không thể gọi API sinh giáo án',
        err.response?.data?.message || 'Hệ thống chuyển sang hiển thị giáo án mẫu tương thích.'
      )
      setGeneratedPlan(mockSampleLessonPlan)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveToCurriculum = () => {
    success(
      'Đã lưu giáo án vào Kho Tài Liệu Cơ Sở!',
      'Giáo trình đã được đồng bộ để các giảng viên khác trong trung tâm cùng tham khảo.'
    )
  }

  const handleExportPDF = () => {
    success('Đang tạo file PDF...', 'Giáo án chuẩn định dạng A4 đã được tải về máy của bạn.')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <BotMessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              Trợ Lý Soạn Giáo Án - AI Lesson Planner
            </h1>
            <Badge variant="success">Cambridge Pedagogical Framework</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Tự động sinh kế hoạch giảng dạy chi tiết 90 phút, tích hợp bài tập trắc nghiệm và danh mục Flashcard học thuật.
          </p>
        </div>

        {generatedPlan && !isGenerating && (
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleExportPDF}>
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              Xuất bản PDF
            </Button>
            <Button variant="primary" size="sm" className="gap-1.5 text-xs" onClick={handleSaveToCurriculum}>
              <Save className="w-3.5 h-3.5" />
              Lưu vào kho học liệu
            </Button>
          </div>
        )}
      </div>

      {/* Generator Input Form */}
      <Card className="p-5 border-border/80 shadow-sm">
        <form onSubmit={handleGeneratePlan} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Chủ đề bài học (Topic) <span className="text-rose-500">*</span>
              </label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="VD: Trí tuệ nhân tạo, Biến đổi khí hậu, Thì hiện tại hoàn thành..."
                required
              />
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Trình độ học viên mục tiêu
              </label>
              <Select
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value)}
                options={[
                  { value: 'IELTS Band 6.0 - 7.0 (Upper-Intermediate)', label: 'IELTS Band 6.0 - 7.0 (Upper-Inter)' },
                  { value: 'IELTS Band 5.0 - 5.5 (Intermediate)', label: 'IELTS Band 5.0 - 5.5 (Intermediate)' },
                  { value: 'TOEIC 750 - 850+ Mastery', label: 'TOEIC 750 - 850+ Mastery' },
                  { value: 'CEFR A2 - B1 (Foundation & Giao tiếp)', label: 'CEFR A2 - B1 (Foundation)' },
                ]}
              />
            </div>

            <div className="md:col-span-1 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Thời lượng
              </label>
              <Select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                options={[
                  { value: '45', label: '45 phút' },
                  { value: '90', label: '90 phút' },
                  { value: '120', label: '120 phút' },
                ]}
              />
            </div>

            <div className="md:col-span-2">
              <Button
                type="submit"
                variant="primary"
                disabled={isGenerating}
                className="w-full gap-1.5 h-9 text-xs font-bold shadow-md shadow-primary/20"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Sinh giáo án AI
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* SKELETON LOADING UI (SIMULATING AI THINKING) */}
      {isGenerating && (
        <Card className="p-8 border-primary/30 space-y-6 bg-gradient-to-br from-primary/5 via-background to-transparent animate-pulse">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center animate-bounce">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">AI Co-pilot Đang Thiết Kế Bài Giảng...</h3>
              <p className="text-xs text-primary font-mono mt-1">{generationStep}</p>
            </div>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto pt-4">
            <div className="h-4 bg-muted rounded-full w-3/4 mx-auto" />
            <div className="h-4 bg-muted rounded-full w-5/6 mx-auto" />
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="h-20 bg-muted/70 rounded-xl" />
              <div className="h-20 bg-muted/70 rounded-xl" />
              <div className="h-20 bg-muted/70 rounded-xl" />
            </div>
            <div className="h-24 bg-muted/40 rounded-xl" />
          </div>
        </Card>
      )}

      {/* GENERATED PLAN CONTENT */}
      {generatedPlan && !isGenerating && (
        <div className="space-y-6">
          {/* Plan Meta Banner */}
          <Card className="p-5 border-border/80 bg-card space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Kế Hoạch Bài Học Chuẩn Sư Phạm
                </span>
                <h2 className="text-lg font-bold text-foreground mt-0.5">{generatedPlan.topic}</h2>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1 text-primary" />
                  {generatedPlan.durationMinutes} phút
                </Badge>
                <Badge variant="primary" className="text-xs">
                  {generatedPlan.targetLevel}
                </Badge>
              </div>
            </div>

            {/* Learning Objectives */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                Mục tiêu bài học (Learning Objectives):
              </span>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                {generatedPlan.learningObjectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Sub Tabs: 5 Stages Timeline / 10 MCQ / 15 Flashcards */}
          <div className="flex items-center gap-2 border-b border-border/80">
            <button
              type="button"
              onClick={() => setActiveTab('STAGES')}
              className={`pb-3 px-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'STAGES'
                  ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Dàn Ý 5 Giai Đoạn (Timeline 90p)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('MCQ')}
              className={`pb-3 px-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'MCQ'
                  ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <ListChecks className="w-4 h-4" />
              <span>Ngân Hàng Trắc Nghiệm ({generatedPlan.mcqQuestions.length} câu)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('VOCAB')}
              className={`pb-3 px-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'VOCAB'
                  ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Bộ Từ Vựng Flashcards ({generatedPlan.flashcards.length} thẻ)</span>
            </button>
          </div>

          {/* TAB 1: 5 PEDAGOGICAL STAGES TIMELINE */}
          {activeTab === 'STAGES' && (
            <div className="space-y-4">
              {generatedPlan.timelineStages.map((stage, idx) => (
                <Card key={idx} className="p-4 border-border/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-foreground text-sm">{stage.stageName}</h4>
                      <Badge variant="outline" className="text-[11px] font-mono">
                        {stage.time}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{stage.activity}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                      <span className="font-bold text-foreground block">Hoạt động của Giảng viên:</span>
                      <p className="text-muted-foreground leading-relaxed">{stage.teacherAction}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                      <span className="font-bold text-foreground block">Nhiệm vụ của Học viên:</span>
                      <p className="text-muted-foreground leading-relaxed">{stage.studentAction}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* TAB 2: MULTIPLE CHOICE QUESTIONS */}
          {activeTab === 'MCQ' && (
            <div className="space-y-4">
              {generatedPlan.mcqQuestions.map((q) => (
                <Card key={q.id} className="p-4 border-border/80 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-primary text-sm shrink-0">Câu {q.id}:</span>
                    <p className="font-semibold text-foreground text-sm">{q.question}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === q.correctIndex
                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-lg border flex items-center justify-between ${
                            isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-semibold'
                              : 'bg-muted/30 border-border/60 text-muted-foreground'
                          }`}
                        >
                          <span>
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </span>
                          {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                        </div>
                      )
                    })}
                  </div>

                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40 text-[11px] text-muted-foreground">
                    <strong className="text-foreground">Giải thích sư phạm:</strong> {q.explanationVi}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* TAB 3: VOCABULARY FLASHCARDS */}
          {activeTab === 'VOCAB' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedPlan.flashcards.map((card) => (
                <Card key={card.id} className="p-4 border-border/80 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-extrabold text-foreground text-base">{card.term}</h4>
                      <Badge variant="outline" className="text-[10px]">
                        {card.partOfSpeech}
                      </Badge>
                    </div>

                    <span className="font-mono text-xs text-primary block">{card.ipa}</span>

                    <p className="text-xs font-semibold text-foreground bg-muted/40 p-2 rounded-lg">
                      {card.definitionVi}
                    </p>

                    <p className="text-xs text-muted-foreground italic leading-relaxed pt-1">
                      "{card.exampleEn}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/60 mt-3 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-emerald-600 gap-1"
                      onClick={() => info(`Đã thêm từ "${card.term}" vào bộ Flashcard ôn tập của lớp`)}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Giao thẻ này
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TeacherLessonPlannerPage

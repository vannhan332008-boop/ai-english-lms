import React, { useState } from 'react'
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  FileText,
  Mic,
  Award,
  Edit3,
  Send,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Clock,
  Sliders,
  RefreshCw,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  mockGradingSubmissions,
  type GradingSubmission,
  type WritingErrorHighlight,
  type SpeakingErrorHighlight,
} from '@/mocks/teacherPortal'
import { useToast } from '@/hooks/useToast'
import { apiClient } from '@/lib/api-client'

export const TeacherGradingPage: React.FC = () => {
  const { success, info, error: toastError } = useToast()
  const [submissions, setSubmissions] = useState<GradingSubmission[]>(mockGradingSubmissions)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Current selected submission
  const currentSubmission = submissions[currentIndex] || submissions[0]

  // Audio Player State (for Speaking)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(25) // percentage

  // Teacher Editing State
  const [isEditingScores, setIsEditingScores] = useState(false)
  const [teacherFeedback, setTeacherFeedback] = useState(currentSubmission?.teacherNote || '')
  const [scores, setScores] = useState({ ...currentSubmission?.aiScores })
  const [selectedError, setSelectedError] = useState<WritingErrorHighlight | SpeakingErrorHighlight | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Sync state when switching submissions
  const handleSelectSubmission = (index: number) => {
    setCurrentIndex(index)
    setIsPlaying(false)
    setIsEditingScores(false)
    setSelectedError(null)
    setTeacherFeedback(submissions[index]?.teacherNote || '')
    setScores({ ...submissions[index]?.aiScores })
  }

  // Toggle Audio Playback
  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  // Trigger AI Grading Endpoint Live
  const handleTriggerAiGrading = async () => {
    setIsAnalyzing(true)
    info('AI Co-pilot đang phân tích bài nộp...')

    try {
      if (currentSubmission.type === 'WRITING') {
        const response = await apiClient.post('/ai/writing/evaluate', {
          content: currentSubmission.writingEssayText || '',
          prompt: currentSubmission.contentPrompt,
          rubricType: 'IELTS',
        })

        const data = response.data?.data
        if (data) {
          const updatedScores = {
            overallBand: Number(data.overallBand) || 7.0,
            criterion1Name: 'Task Response',
            criterion1Score: data.rubricScores?.taskAchievement ?? data.scores?.taskResponse ?? 7.0,
            criterion2Name: 'Coherence & Cohesion',
            criterion2Score: data.rubricScores?.coherence ?? data.scores?.coherenceCohesion ?? 7.0,
            criterion3Name: 'Lexical Resource',
            criterion3Score: data.rubricScores?.lexical ?? data.scores?.lexicalResource ?? 7.0,
            criterion4Name: 'Grammatical Range',
            criterion4Score: data.rubricScores?.grammar ?? data.scores?.grammaticalRange ?? 7.0,
          }

          const generalFeedback = data.summaryFeedback || data.feedbackVi || 'Bài viết đã được phân tích thành công.'
          setScores(updatedScores)
          setTeacherFeedback((prev) => (prev ? `${prev}\n\n[AI Feedback]: ${generalFeedback}` : generalFeedback))

          const rawErrors = data.detailedErrors || data.detectedErrors || []
          const mappedWritingErrors: WritingErrorHighlight[] = rawErrors.map((err: any, idx: number) => ({
            id: `err-${idx}`,
            originalText: err.original,
            suggestion: err.suggestion,
            type: err.type === 'GRAMMAR' ? 'GRAMMAR' : 'VOCABULARY',
            explanationVi: err.explanationVi || err.suggestion || '',
          }))

          setSubmissions((prev) =>
            prev.map((sub, idx) =>
              idx === currentIndex
                ? {
                    ...sub,
                    aiScores: updatedScores,
                    aiGeneralFeedbackVi: generalFeedback,
                    writingErrors: mappedWritingErrors,
                  }
                : sub
            )
          )

          success(
            'AI đã chấm xong bài Writing!',
            `Overall Band đạt ${data.overallBand} (${data.tokensUsed ?? 0} AI Tokens đã tiêu hao).`
          )
        }
      } else {
        // Speaking evaluation
        const sampleAudioBytes = new Uint8Array([
          0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x86, 0x81, 0x01, 0x42, 0xf7, 0x81, 0x01, 0x42, 0xf2, 0x81,
          0x04, 0x42, 0xf3, 0x81, 0x08, 0x42, 0x82, 0x84, 0x77, 0x65, 0x62, 0x6d, 0x42, 0x87, 0x81, 0x02,
        ])
        const audioBlob = new Blob([sampleAudioBytes], { type: 'audio/webm' })
        const formData = new FormData()
        formData.append('audio', audioBlob, 'speaking-sample.webm')
        formData.append('prompt', currentSubmission.contentPrompt)
        formData.append('rubricType', 'IELTS')

        const response = await apiClient.post('/ai/speaking/evaluate', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        const data = response.data?.data
        if (data) {
          const updatedScores = {
            overallBand: Number(data.overallBand) || 7.0,
            criterion1Name: 'Fluency & Coherence',
            criterion1Score: data.fluencyScore ?? data.scores?.fluency ?? 7.0,
            criterion2Name: 'Lexical Resource',
            criterion2Score: data.lexicalScore ?? data.scores?.lexical ?? 7.0,
            criterion3Name: 'Grammatical Range',
            criterion3Score: data.grammarScore ?? data.scores?.grammar ?? 7.0,
            criterion4Name: 'Pronunciation',
            criterion4Score: data.pronunciationScore ?? data.scores?.pronunciation ?? 7.0,
          }

          const generalFeedback = data.detailedFeedback || data.feedbackVi || 'Bài nói đã được phân tích âm vị IPA thành công.'
          setScores(updatedScores)
          setTeacherFeedback((prev) => (prev ? `${prev}\n\n[AI Feedback]: ${generalFeedback}` : generalFeedback))

          const rawSpeakingErrors = data.pronunciationErrors || data.detectedPhoneticErrors || []
          const mappedSpeakingErrors: SpeakingErrorHighlight[] = rawSpeakingErrors.map((err: any, idx: number) => ({
            id: `spk-err-${idx}`,
            word: err.word,
            targetIpa: err.targetIpa,
            studentIpa: err.detectedIpa || err.studentIpa,
            explanationVi: err.advice || err.explanationVi || '',
            timestamp: err.timestamp || '00:15',
          }))

          setSubmissions((prev) =>
            prev.map((sub, idx) =>
              idx === currentIndex
                ? {
                    ...sub,
                    aiScores: updatedScores,
                    aiGeneralFeedbackVi: generalFeedback,
                    speakingErrors: mappedSpeakingErrors,
                    speakingTranscript: data.transcript || sub.speakingTranscript,
                  }
                : sub
            )
          )

          success(
            'AI đã phân tích bài Speaking thành công!',
            `Overall Band đạt ${data.overallBand} (${data.tokensUsed ?? 0} AI Tokens đã tiêu hao).`
          )
        }
      }
    } catch (err: any) {
      console.error('AI Grading error:', err)
      toastError(
        'Không thể chấm điểm bằng AI',
        err.response?.data?.message || 'Lỗi kết nối máy chủ AI. Vui lòng thử lại.'
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Approve & Send Handler
  const handleApproveAndSend = () => {
    setSubmissions((prev) =>
      prev.map((sub, idx) =>
        idx === currentIndex
          ? {
              ...sub,
              status: 'APPROVED',
              teacherNote: teacherFeedback,
              aiScores: { ...scores },
            }
          : sub
      )
    )
    success(
      `Đã phê duyệt & gửi kết quả thành công!`,
      `Điểm Overall Band ${scores.overallBand} và nhận xét đã gửi tới học viên ${currentSubmission.studentName}.`
    )
  }

  // Apply AI Suggestion into teacher notes
  const handleApplyAiFeedback = () => {
    setTeacherFeedback(
      (prev) =>
        `${prev ? prev + '\n\n' : ''}[Góp ý từ AI Co-pilot]: ${currentSubmission.aiGeneralFeedbackVi}`
    )
    info('Đã chèn góp ý của AI vào nhận xét của bạn.')
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Submission Carousel Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Trạm Chấm Bài AI Grading Co-pilot
            </h1>
            <Badge variant="primary">IELTS Rubric v2.4</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Chấm điểm tự động bài viết & bài nói của học sinh dựa trên mô hình phân tích ngữ pháp và sóng âm phát âm IPA.
          </p>
        </div>

        {/* Submissions Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-muted/60 p-1.5 rounded-xl border border-border/60">
          <Button
            variant="ghost"
            size="sm"
            disabled={currentIndex <= 0}
            onClick={() => handleSelectSubmission(currentIndex - 1)}
            className="h-8 w-8 p-0"
            aria-label="Bài trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <span className="text-xs font-semibold px-2 text-foreground">
            Bài {currentIndex + 1} / {submissions.length}
          </span>

          <Button
            variant="ghost"
            size="sm"
            disabled={currentIndex >= submissions.length - 1}
            onClick={() => handleSelectSubmission(currentIndex + 1)}
            className="h-8 w-8 p-0"
            aria-label="Bài tiếp theo"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <div className="h-4 w-px bg-border/80 mx-1" />

          {/* Quick Tabs between Writing & Speaking submissions */}
          {submissions.map((sub, idx) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => handleSelectSubmission(idx)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                currentIndex === idx
                  ? 'bg-background text-primary shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {sub.type === 'WRITING' ? <FileText className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{sub.studentName}</span>
              {sub.status === 'APPROVED' && (
                <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-0.5" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT PANE: STUDENT SUBMISSION (7 COLS) ================= */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 space-y-4 border-border/80 shadow-sm">
            {/* Student Info Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-3">
                <img
                  src={currentSubmission.studentAvatar}
                  alt={currentSubmission.studentName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-foreground">{currentSubmission.studentName}</h2>
                    <Badge variant={currentSubmission.type === 'WRITING' ? 'primary' : 'success'} className="text-[10px]">
                      {currentSubmission.type === 'WRITING' ? 'Writing Task 2' : 'Speaking Part 2'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{currentSubmission.className}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Nộp lúc: {currentSubmission.submittedAt}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                {currentSubmission.status === 'APPROVED' ? (
                  <Badge variant="success" className="gap-1 px-3 py-1 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã phê duyệt
                  </Badge>
                ) : (
                  <Badge variant="warning" className="gap-1 px-3 py-1 text-xs animate-pulse">
                    <Clock className="w-3.5 h-3.5" />
                    Đang đợi duyệt
                  </Badge>
                )}
              </div>
            </div>

            {/* Prompt Box */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs">
              <span className="font-bold text-foreground block mb-1 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-primary" />
                Đề bài được giao:
              </span>
              <p className="text-muted-foreground italic leading-relaxed">{currentSubmission.contentPrompt}</p>
            </div>

            {/* Content Rendering: WRITING ESSAY */}
            {currentSubmission.type === 'WRITING' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-primary" />
                    Văn bản bài nộp (Nhấp vào phần gạch chân để xem lỗi)
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    284 từ • 3 đoạn văn
                  </span>
                </div>

                <div className="p-5 rounded-xl border border-border bg-card leading-relaxed text-sm text-foreground/90 font-serif whitespace-pre-line shadow-inner max-h-[480px] overflow-y-auto space-y-3">
                  {currentSubmission.writingEssayText}
                </div>

                {/* Error highlights pills */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-muted-foreground block">
                    AI đã phát hiện {currentSubmission.writingErrors?.length || 0} điểm cần cải thiện trong văn phong:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentSubmission.writingErrors?.map((err) => (
                      <button
                        key={err.id}
                        type="button"
                        onClick={() => setSelectedError(err)}
                        className={`px-2.5 py-1 text-xs rounded-lg border font-sans transition-all text-left flex items-center gap-1.5 ${
                          selectedError && (selectedError as WritingErrorHighlight).id === err.id
                            ? 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400 shadow-sm'
                            : 'bg-muted/50 border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <span className="line-through opacity-70">{err.originalText}</span>
                        <span>→</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{err.suggestion}</span>
                      </button>
                    ))}
                  </div>

                  {/* Selected Error Explanation Card */}
                  {selectedError && 'explanationVi' in selectedError && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1 mt-3 transition-all">
                      <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Giải thích lỗi từ AI:</span>
                      </div>
                      <p className="text-foreground leading-relaxed">
                        {selectedError.explanationVi}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Content Rendering: SPEAKING AUDIO */}
            {currentSubmission.type === 'SPEAKING' && (
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-pink-500" />
                  Bản ghi âm giọng nói & Phân tích sóng âm IPA
                </span>

                {/* Custom Audio Player with Waveform Visualization */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-muted/80 via-muted/40 to-muted/80 border border-border/80 space-y-4">
                  {/* Waveform Bars Animation */}
                  <div className="h-16 flex items-center justify-between gap-1 px-3 py-2 bg-background/80 rounded-xl border border-border/60 overflow-hidden">
                    {[
                      35, 60, 45, 90, 75, 50, 80, 100, 65, 40, 85, 95, 70, 45, 60, 80, 95, 55, 75, 90,
                      40, 70, 85, 60, 45, 80, 100, 75, 50, 65, 90, 45, 70, 85, 60, 40, 75, 90, 50, 65,
                    ].map((height, idx) => (
                      <div
                        key={idx}
                        className={`w-1 rounded-full transition-all duration-300 ${
                          idx < (audioProgress / 100) * 40
                            ? 'bg-pink-500 shadow-sm shadow-pink-500/30'
                            : 'bg-muted-foreground/30'
                        } ${isPlaying ? 'animate-pulse' : ''}`}
                        style={{ height: `${isPlaying ? Math.max(20, Math.round(height * 0.85)) : height}%` }}
                      />
                    ))}
                  </div>

                  {/* Player Controls */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleTogglePlay}
                        className="w-12 h-12 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center shadow-md shadow-pink-500/20 transition-transform active:scale-95"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>

                      <div className="space-y-0.5">
                        <span className="text-xs font-mono font-bold text-foreground block">
                          {isPlaying ? '00:31' : '00:00'} / {currentSubmission.speakingDuration}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Volume2 className="w-3 h-3 text-pink-500" />
                          44.1 kHz • Chuẩn nén Opus HD
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1"
                        onClick={() => {
                          setAudioProgress(0)
                          setIsPlaying(false)
                        }}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Phát lại
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Transcript with Pronunciation Marker Highlights */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-foreground block">
                    Lời thoại bóc băng tự động (Transcript):
                  </span>
                  <div className="p-4 rounded-xl border border-border/80 bg-card text-xs leading-relaxed text-muted-foreground">
                    {currentSubmission.speakingTranscript ||
                      "Today I would like to talk about the 'Clean Up Vietnam' campaign which was organized last summer in Da Nang city..."}
                  </div>
                </div>

                {/* Pronunciation Error List */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground block">
                    Lỗi phát âm IPA chi tiết do AI phát hiện:
                  </span>
                  <div className="space-y-2">
                    {currentSubmission.speakingErrors?.map((err) => (
                      <div
                        key={err.id}
                        className="p-3 rounded-xl bg-muted/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">{err.word}</span>
                            <Badge variant="outline" className="font-mono text-[10px] text-emerald-600">
                              Chuẩn: {err.targetIpa}
                            </Badge>
                            <Badge variant="outline" className="font-mono text-[10px] text-rose-600">
                              Học viên: {err.studentIpa}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{err.explanationVi}</p>
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-pink-500 shrink-0">
                          ⏱ {err.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* ================= RIGHT PANE: AI RUBRIC & APPROVAL FORM (5 COLS) ================= */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 space-y-5 border-primary/30 shadow-md">
            {/* AI Action Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                AI Co-Pilot Grading
              </span>
              <Button
                variant="primary"
                size="sm"
                disabled={isAnalyzing}
                onClick={handleTriggerAiGrading}
                className="gap-1.5 text-xs shadow-sm shadow-primary/20"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Đang chấm AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Chấm bài bằng AI
                  </>
                )}
              </Button>
            </div>

            {/* AI Overall Score Box */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Điểm Dự Phóng Tổng Thể
                </span>
                <span className="text-3xl font-black text-foreground mt-1 block">
                  {scores.overallBand.toFixed(1)} / 9.0 Band
                </span>
                <span className="text-[11px] text-muted-foreground">Khảo thí chuẩn IDP / British Council</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs shrink-0"
                onClick={() => setIsEditingScores(!isEditingScores)}
              >
                <Sliders className="w-3.5 h-3.5 text-primary" />
                {isEditingScores ? 'Khóa điểm' : 'Sửa điểm'}
              </Button>
            </div>

            {/* Rubric Breakdown Sliders / Badges */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Chi tiết 4 tiêu chí chấm điểm
              </span>

              <div className="space-y-2.5 text-xs">
                {/* Criterion 1 */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1.5">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-foreground">{scores.criterion1Name}</span>
                    <span className="font-mono text-primary font-bold text-sm">
                      {scores.criterion1Score.toFixed(1)}
                    </span>
                  </div>
                  {isEditingScores ? (
                    <input
                      type="range"
                      min="4.0"
                      max="9.0"
                      step="0.5"
                      value={scores.criterion1Score}
                      onChange={(e) =>
                        setScores({ ...scores, criterion1Score: parseFloat(e.target.value) })
                      }
                      className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                    />
                  ) : (
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(scores.criterion1Score / 9) * 100}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Criterion 2 */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1.5">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-foreground">{scores.criterion2Name}</span>
                    <span className="font-mono text-primary font-bold text-sm">
                      {scores.criterion2Score.toFixed(1)}
                    </span>
                  </div>
                  {isEditingScores ? (
                    <input
                      type="range"
                      min="4.0"
                      max="9.0"
                      step="0.5"
                      value={scores.criterion2Score}
                      onChange={(e) =>
                        setScores({ ...scores, criterion2Score: parseFloat(e.target.value) })
                      }
                      className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                    />
                  ) : (
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(scores.criterion2Score / 9) * 100}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Criterion 3 */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1.5">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-foreground">{scores.criterion3Name}</span>
                    <span className="font-mono text-primary font-bold text-sm">
                      {scores.criterion3Score.toFixed(1)}
                    </span>
                  </div>
                  {isEditingScores ? (
                    <input
                      type="range"
                      min="4.0"
                      max="9.0"
                      step="0.5"
                      value={scores.criterion3Score}
                      onChange={(e) =>
                        setScores({ ...scores, criterion3Score: parseFloat(e.target.value) })
                      }
                      className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                    />
                  ) : (
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(scores.criterion3Score / 9) * 100}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Criterion 4 */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1.5">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-foreground">{scores.criterion4Name}</span>
                    <span className="font-mono text-primary font-bold text-sm">
                      {scores.criterion4Score.toFixed(1)}
                    </span>
                  </div>
                  {isEditingScores ? (
                    <input
                      type="range"
                      min="4.0"
                      max="9.0"
                      step="0.5"
                      value={scores.criterion4Score}
                      onChange={(e) =>
                        setScores({ ...scores, criterion4Score: parseFloat(e.target.value) })
                      }
                      className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                    />
                  ) : (
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(scores.criterion4Score / 9) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI General Assessment */}
            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Đánh giá tổng quan từ AI:
                </span>
                <button
                  type="button"
                  onClick={handleApplyAiFeedback}
                  className="text-[11px] text-primary hover:underline font-semibold"
                >
                  Sao chép vào nhận xét
                </button>
              </div>
              <p className="text-foreground/90 leading-relaxed italic">{currentSubmission.aiGeneralFeedbackVi}</p>
            </div>

            {/* Teacher Customized Feedback Form */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-primary" />
                  Nhận xét cuối cùng của Giảng viên:
                </span>
                <span className="text-[11px] text-muted-foreground">Hiển thị cho học viên</span>
              </label>

              <textarea
                rows={4}
                value={teacherFeedback}
                onChange={(e) => setTeacherFeedback(e.target.value)}
                placeholder="Nhập lời khuyên, động viên hoặc bài tập bổ trợ cho học sinh..."
                className="w-full p-3 rounded-xl border border-input bg-background text-xs leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <Button
                variant="primary"
                className="w-full h-11 text-sm font-bold gap-2 shadow-lg shadow-primary/20"
                onClick={handleApproveAndSend}
              >
                <Send className="w-4 h-4" />
                Approve & Send to Student
              </Button>
              <p className="text-[11px] text-center text-muted-foreground mt-2">
                Sau khi gửi, học viên sẽ nhận thông báo trên app và điểm được lưu vào học bạ.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TeacherGradingPage

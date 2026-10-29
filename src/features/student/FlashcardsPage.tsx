import React, { useState } from 'react'
import {
  CreditCard,
  Volume2,
  RotateCw,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Award,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { mockFlashcardsList, type SRSFlashcard } from '@/mocks/studentPortal'
import { useToast } from '@/hooks/useToast'

export const StudentFlashcardsPage: React.FC = () => {
  const { success, info } = useToast()
  const [cards] = useState<SRSFlashcard[]>(mockFlashcardsList)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [isSessionComplete, setIsSessionComplete] = useState(false)

  const currentCard = cards[currentIndex] || cards[0]

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation()
    info(`Phát âm chuẩn IPA: ${currentCard.term}`, currentCard.ipa)
  }

  const handleSRSReview = (_grade: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY') => {
    const nextReviewed = reviewedCount + 1
    setReviewedCount(nextReviewed)
    setIsFlipped(false)

    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setIsSessionComplete(true)
      success('Tuyệt vời!', `Bạn đã hoàn thành phiên ôn tập ${cards.length} thẻ từ vựng hôm nay.`)
    }
  }

  const handleRestartSession = () => {
    setCurrentIndex(0)
    setReviewedCount(0)
    setIsFlipped(false)
    setIsSessionComplete(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-amber-500" />
              Ôn Tập Từ Vựng Thông Minh (SRS SM-2)
            </h1>
            <Badge variant="warning">Thuật Toán Ghi Nhớ Ngắt Quãng</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Học từ vựng học thuật IELTS bằng kỹ thuật Spaced Repetition (SuperMemo-2), tối ưu khả năng lưu trữ vào trí nhớ dài hạn.
          </p>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-2 shrink-0 bg-muted/60 px-3.5 py-1.5 rounded-xl border border-border/60">
          <span className="text-xs font-semibold text-muted-foreground">Tiến độ hôm nay:</span>
          <span className="text-sm font-bold text-foreground">
            {currentIndex + 1} / {cards.length} Thẻ
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* Session Complete View */}
      {isSessionComplete ? (
        <Card className="p-10 text-center space-y-5 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-background to-transparent shadow-lg">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/20">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-foreground">Hoàn Thành Xuất Sắc! 🎉</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Bạn đã ôn tập toàn bộ <strong className="text-foreground">{cards.length} thẻ từ vựng</strong> theo thuật
              toán lặp lại ngắt quãng. Lịch ôn tập tiếp theo sẽ tự động nhắc nhở trong 3 ngày tới!
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            +150 XP Điểm Thưởng Trí Nhớ Vừa Được Cộng
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <Button variant="outline" onClick={handleRestartSession} className="gap-2 text-xs">
              <RotateCcw className="w-4 h-4" />
              Ôn lại một lần nữa
            </Button>
            <Button
              variant="primary"
              onClick={() => success('Đã lưu tiến độ vào hồ sơ học viên')}
              className="gap-2 text-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              Hoàn thành buổi học
            </Button>
          </div>
        </Card>
      ) : (
        /* FLIP CARD CENTERPIECE */
        <div className="space-y-6">
          <div
            onClick={handleFlip}
            className="cursor-pointer select-none perspective min-h-[380px] flex items-center justify-center"
          >
            <Card
              className={`w-full max-w-xl p-8 rounded-3xl border-2 transition-all duration-300 transform flex flex-col justify-between shadow-xl text-center relative overflow-hidden ${
                isFlipped
                  ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-500/5 via-card to-card'
                  : 'border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card hover:border-primary/60 hover:shadow-2xl'
              }`}
            >
              {/* Card Top Indicator */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pb-2">
                <Badge variant="outline" className="font-mono text-[10px]">
                  Card {currentIndex + 1} / {cards.length}
                </Badge>
                <span className="flex items-center gap-1 text-[11px] text-primary font-medium">
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  {isFlipped ? 'Mặt sau (Nghĩa tiếng Việt)' : 'Nhấp vào thẻ để lật'}
                </span>
              </div>

              {/* CARD FRONT (English & IPA) */}
              {!isFlipped ? (
                <div className="py-12 space-y-4">
                  <Badge variant="secondary" className="text-xs uppercase tracking-wider font-semibold">
                    {currentCard.partOfSpeech}
                  </Badge>

                  <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground">
                    {currentCard.term}
                  </h2>

                  <div className="flex items-center justify-center gap-2 pt-1">
                    <span className="font-mono text-base text-primary font-bold">{currentCard.ipa}</span>
                    <button
                      type="button"
                      onClick={handlePlayAudio}
                      className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-transform active:scale-95"
                      title="Phát âm mẫu"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground pt-4">
                    Nhấp vào khoảng trống để xem nghĩa và câu ví dụ học thuật...
                  </p>
                </div>
              ) : (
                /* CARD BACK (Vietnamese Definition & Examples) */
                <div className="py-6 space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-foreground">{currentCard.term}</span>
                      <span className="font-mono text-xs text-primary font-semibold">{currentCard.ipa}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {currentCard.partOfSpeech}
                    </Badge>
                  </div>

                  {/* Vietnamese Definition */}
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-foreground font-semibold text-sm">
                    {currentCard.definitionVi}
                  </div>

                  {/* Academic Context Example */}
                  <div className="space-y-1.5 p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Ví dụ ngữ cảnh IELTS:
                    </span>
                    <p className="font-medium text-foreground italic">"{currentCard.exampleEn}"</p>
                    <p className="text-muted-foreground text-[11px] pt-1 border-t border-border/40">
                      → {currentCard.exampleVi}
                    </p>
                  </div>
                </div>
              )}

              {/* Card Footer */}
              <div className="pt-3 border-t border-border/60 text-center">
                <span className="text-[11px] text-muted-foreground">
                  {isFlipped
                    ? 'Hãy tự đánh giá mức độ ghi nhớ bên dưới'
                    : 'Kỹ thuật lặp lại ngắt quãng SuperMemo-2'}
                </span>
              </div>
            </Card>
          </div>

          {/* 4 SRS EVALUATION BUTTONS (SuperMemo-2) */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center block">
              Đánh giá mức độ ghi nhớ (Thuật toán SRS)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
              {/* 1: AGAIN (Red) */}
              <button
                type="button"
                onClick={() => handleSRSReview('AGAIN')}
                className="p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 group"
              >
                <span className="group-hover:text-white">Lại (Again)</span>
                <span className="text-[10px] font-normal text-muted-foreground group-hover:text-white/80">
                  Ôn lại ngay (&lt; 1p)
                </span>
              </button>

              {/* 2: HARD (Amber) */}
              <button
                type="button"
                onClick={() => handleSRSReview('HARD')}
                className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500 hover:text-white border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 group"
              >
                <span className="group-hover:text-white">Khó (Hard)</span>
                <span className="text-[10px] font-normal text-muted-foreground group-hover:text-white/80">
                  1 ngày sau
                </span>
              </button>

              {/* 3: GOOD (Blue/Primary) */}
              <button
                type="button"
                onClick={() => handleSRSReview('GOOD')}
                className="p-3 rounded-2xl bg-primary/10 hover:bg-primary hover:text-primary-foreground border border-primary/30 text-primary font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 group"
              >
                <span className="group-hover:text-primary-foreground">Tốt (Good)</span>
                <span className="text-[10px] font-normal text-muted-foreground group-hover:text-primary-foreground/80">
                  3 ngày sau
                </span>
              </button>

              {/* 4: EASY (Emerald) */}
              <button
                type="button"
                onClick={() => handleSRSReview('EASY')}
                className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 group"
              >
                <span className="group-hover:text-white">Dễ (Easy)</span>
                <span className="text-[10px] font-normal text-muted-foreground group-hover:text-white/80">
                  7 ngày sau
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentFlashcardsPage

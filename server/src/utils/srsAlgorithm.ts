/**
 * SuperMemo-2 (SM-2) Spaced Repetition Algorithm Implementation
 * Quality rating:
 * 5 - perfect response
 * 4 - correct response after hesitation
 * 3 - correct response recalled with serious difficulty
 * 2 - incorrect response; where the correct one seemed easy to recall
 * 1 - incorrect response; the correct one remembered
 * 0 - complete blackout.
 */

export interface SrsCalculationInput {
  quality: number // 0 to 5
  repetition: number
  easeFactor: number
  interval: number
}

export interface SrsCalculationOutput {
  repetition: number
  easeFactor: number
  interval: number
  nextReviewDate: Date
}

export function calculateNextReview({
  quality,
  repetition,
  easeFactor,
  interval,
}: SrsCalculationInput): SrsCalculationOutput {
  let nextRepetition = repetition
  let nextInterval = interval
  let nextEaseFactor = easeFactor

  // Calculation of Ease Factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  nextEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (nextEaseFactor < 1.3) {
    nextEaseFactor = 1.3
  }

  if (quality < 3) {
    // Failed recall: reset repetitions
    nextRepetition = 0
    nextInterval = 1
  } else {
    // Successful recall
    if (repetition === 0) {
      nextInterval = 1
    } else if (repetition === 1) {
      nextInterval = 6
    } else {
      nextInterval = Math.round(interval * nextEaseFactor)
    }
    nextRepetition = repetition + 1
  }

  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval)

  return {
    repetition: nextRepetition,
    easeFactor: Number(nextEaseFactor.toFixed(2)),
    interval: nextInterval,
    nextReviewDate,
  }
}


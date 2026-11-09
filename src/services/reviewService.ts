import api from './api'

export interface ReviewItem {
  id: string
  courseId: string
  studentId: string
  tenantId: string
  rating: number
  comment?: string | null
  createdAt: string
  updatedAt: string
  student?: {
    id: string
    fullName: string
    avatar?: string | null
    cefrLevel?: string | null
  } | null
}

export interface CourseReviewsResponse {
  reviews: ReviewItem[]
  summary: {
    averageRating: number
    reviewCount: number
    distribution: Record<number, number>
  }
}

export const reviewService = {
  /**
   * Get reviews and rating breakdown for a course
   */
  getCourseReviews: async (courseId: string): Promise<CourseReviewsResponse> => {
    const res = await api.get(`/reviews/course/${courseId}`)
    return res.data?.data || { reviews: [], summary: { averageRating: 5.0, reviewCount: 0, distribution: {} } }
  },

  /**
   * Submit or update course review (Enrolled students only) - Pessimistic Update
   */
  addReview: async (
    courseId: string,
    payload: { rating: number; comment?: string | null }
  ): Promise<ReviewItem> => {
    const res = await api.post(`/reviews/course/${courseId}`, payload)
    return res.data?.data
  },

  /**
   * Delete a review
   */
  deleteReview: async (reviewId: string): Promise<void> => {
    await api.delete(`/reviews/${reviewId}`)
  },
}


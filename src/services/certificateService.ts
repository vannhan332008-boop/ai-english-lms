import api from './api'

export interface CertificateItem {
  id: string
  code: string
  tenantId: string
  courseId: string
  studentId: string
  certificateUrl?: string | null
  issueDate: string
  grade?: string | null
  score?: number | null
  metadata?: string | null
  createdAt: string
  course?: {
    id: string
    title: string
    code: string
    targetLevel?: string | null
    thumbnailUrl?: string | null
  } | null
  student?: {
    id: string
    fullName: string
    email: string
    avatar?: string | null
  } | null
}

export interface CourseProgressResponse {
  enrolled: boolean
  isEligible: boolean
  progressPercent: number
  totalLessons?: number
  certificate?: CertificateItem | null
  message?: string
}

export const certificateService = {
  /**
   * Check course progress and certificate eligibility
   */
  checkProgress: async (courseId: string): Promise<CourseProgressResponse> => {
    const res = await api.get(`/certificates/progress/${courseId}`)
    return res.data?.data
  },

  /**
   * Claim Certificate (Backend verifies progress and generates PDF)
   */
  claimCertificate: async (courseId: string): Promise<CertificateItem> => {
    const res = await api.post(`/certificates/claim/${courseId}`)
    return res.data?.data
  },

  /**
   * Get all claimed certificates of current student
   */
  getMyCertificates: async (): Promise<CertificateItem[]> => {
    const res = await api.get('/certificates/my-certificates')
    return res.data?.data || []
  },

  /**
   * Get direct PDF download link
   */
  getDownloadUrl: (code: string): string => {
    const baseUrl = (api.defaults.baseURL || '/api/v1').replace(/\/$/, '')
    return `${baseUrl}/certificates/download/${code}`
  },
}


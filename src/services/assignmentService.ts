import api from './api'

export interface QuestionItem {
  id?: string
  prompt: string
  questionType: 'MULTIPLE_CHOICE' | 'FILL_BLANK' | 'ESSAY' | 'AUDIO_RECORDING'
  mediaUrl?: string | null
  options?: string[] | null
  correctAnswer?: string | null
  explanation?: string | null
  points?: number
  orderIndex?: number
}

export interface SubmissionItem {
  id: string
  tenantId: string
  assignmentId?: string | null
  studentId: string
  content?: string | null
  answers?: string | Record<string, any> | null
  score?: number | null
  aiScore?: number | null
  aiFeedback?: string | null
  rubricScores?: string | Record<string, any> | null
  isDraft: boolean
  isLate: boolean
  status: 'SUBMITTED' | 'AI_EVALUATED' | 'TEACHER_APPROVED' | 'RETURNED'
  teacherFeedback?: string | null
  submittedAt: string
  evaluatedAt?: string | null
  student?: {
    id: string
    fullName: string
    email: string
    avatar?: string | null
  }
  assignment?: {
    id: string
    title: string
    type: string
    maxScore: number
    rubricConfig?: string | null
    class?: { id: string; name: string }
  }
}

export interface AssignmentItem {
  id: string
  tenantId: string
  classId: string
  title: string
  description?: string | null
  type: 'WRITING' | 'SPEAKING' | 'QUIZ' | 'HOMEWORK'
  dueDate?: string | null
  maxScore: number
  rubricConfig?: string | null
  createdAt: string
  class: {
    id: string
    name: string
    course?: { id: string; title: string; code?: string }
  }
  questions?: QuestionItem[]
  submissions?: SubmissionItem[]
  totalAssigned?: number
  submittedCount?: number
  gradedCount?: number
  mySubmission?: SubmissionItem | null
}

export interface CreateAssignmentPayload {
  classId: string
  title: string
  description?: string | null
  type: 'WRITING' | 'SPEAKING' | 'QUIZ' | 'HOMEWORK'
  dueDate?: string | null
  maxScore?: number
  rubricConfig?: any
  questions?: QuestionItem[]
}

export interface SubmitAssignmentPayload {
  content?: string | null
  answers?: Record<string, any> | null
  isDraft?: boolean
  audioDurationSeconds?: number | null
}

export interface GradeSubmissionPayload {
  score: number
  teacherFeedback?: string | null
  rubricScores?: any
  status?: 'TEACHER_APPROVED' | 'RETURNED'
}

export const assignmentService = {
  /**
   * Get assignments list (Student sees enrolled classes; Staff sees assigned)
   */
  getAssignments: async (params?: {
    classId?: string
    type?: string
    search?: string
  }): Promise<AssignmentItem[]> => {
    const res = await api.get('/assignments', { params })
    return res.data?.data || []
  },

  /**
   * Get assignment detail with questions and user submission
   */
  getAssignmentById: async (id: string): Promise<AssignmentItem> => {
    const res = await api.get(`/assignments/${id}`)
    return res.data?.data
  },

  /**
   * Create assignment (Staff)
   */
  createAssignment: async (payload: CreateAssignmentPayload): Promise<AssignmentItem> => {
    const res = await api.post('/assignments', payload)
    return res.data?.data
  },

  /**
   * Submit or save draft (Student)
   */
  submitAssignment: async (
    id: string,
    payload: SubmitAssignmentPayload
  ): Promise<SubmissionItem> => {
    const res = await api.post(`/assignments/${id}/submit`, payload)
    return res.data?.data
  },

  /**
   * Get submissions queue for grading (Staff)
   */
  getSubmissionsForGrading: async (assignmentId?: string): Promise<SubmissionItem[]> => {
    const res = await api.get('/assignments/submissions/grading', {
      params: assignmentId ? { assignmentId } : undefined,
    })
    return res.data?.data || []
  },

  /**
   * Grade submission with rubric (Staff)
   */
  gradeSubmission: async (
    submissionId: string,
    payload: GradeSubmissionPayload
  ): Promise<SubmissionItem> => {
    const res = await api.post(`/assignments/submissions/${submissionId}/grade`, payload)
    return res.data?.data
  },

  /**
   * Get student's completed grade history (Student)
   */
  getMyGrades: async (): Promise<SubmissionItem[]> => {
    const res = await api.get('/assignments/my-grades')
    return res.data?.data || []
  },
}


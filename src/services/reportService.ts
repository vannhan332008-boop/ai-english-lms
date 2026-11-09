import api from './api'

export interface StudentDashboardReport {
  enrolledCourses: {
    id: string
    title: string
    level?: string | null
    thumbnail?: string | null
    className: string
    progress: number
    status: string
  }[]
  stats: {
    enrolledCount: number
    completedCoursesCount: number
    pendingAssignmentsCount: number
    completedAssignmentsCount: number
    averagePercentage: number
    streakDays: number
    cefrLevel: string
  }
  weeklyProgress: {
    day: string
    score: number
    submissions: number
  }[]
  recentSubmissions: {
    id: string
    assignmentTitle: string
    score?: number | null
    maxScore: number
    status: string
    isLate: boolean
    submittedAt: string
    teacherFeedback?: string | null
  }[]
}

export interface CenterDashboardReport {
  totalStudents: number
  totalTeachers: number
  totalCourses: number
  totalClasses: number
  totalAssignments: number
  totalSubmissions: number
  averageScore: number
  lateSubmissionsCount: number
  recentAuditLogs: {
    id: string
    action: string
    resource: string
    userName: string
    userRole: string
    createdAt: string
  }[]
}

export interface AuditLogItem {
  id: string
  action: string
  resource: string
  resourceId?: string | null
  details?: any
  ipAddress?: string | null
  createdAt: string
  user?: {
    id: string
    fullName: string
    email: string
    role: string
  } | null
  tenant?: {
    id: string
    name: string
    code: string
  } | null
}

export interface AuditLogsResponse {
  logs: AuditLogItem[]
  total: number
  page: number
  totalPages: number
}

export const reportService = {
  /**
   * Get student's dashboard metrics
   */
  async getStudentReport(): Promise<StudentDashboardReport> {
    const res = await api.get('/reports/student')
    return res.data.data
  },

  /**
   * Get center manager dashboard metrics
   */
  async getCenterReport(tenantId?: string): Promise<CenterDashboardReport> {
    const res = await api.get('/reports/center', { params: { tenantId } })
    return res.data.data
  },

  /**
   * Download students CSV
   */
  async downloadStudentsCsv(tenantId?: string): Promise<void> {
    const res = await api.get('/reports/export/students', {
      params: { tenantId },
      responseType: 'blob',
    })

    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    link.setAttribute('download', `danh_sach_hoc_vien_${dateStr}.csv`)
    document.body.appendChild(link)
    link.click()
    link.parentNode?.removeChild(link)
    window.URL.revokeObjectURL(url)
  },

  /**
   * Download grades CSV
   */
  async downloadGradesCsv(classId?: string, tenantId?: string): Promise<void> {
    const res = await api.get('/reports/export/grades', {
      params: { classId, tenantId },
      responseType: 'blob',
    })

    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    link.setAttribute('download', `bang_diem_hoc_vien_${dateStr}.csv`)
    document.body.appendChild(link)
    link.click()
    link.parentNode?.removeChild(link)
    window.URL.revokeObjectURL(url)
  },

  /**
   * Query audit logs
   */
  async getAuditLogs(params?: {
    action?: string
    resource?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
    tenantId?: string
  }): Promise<AuditLogsResponse> {
    const res = await api.get('/reports/audit-logs', { params })
    return res.data.data
  },
}

export default reportService


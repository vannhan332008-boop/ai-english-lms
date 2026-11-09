import api from './api'

export interface CenterProfile {
  id: string
  name: string
  code: string
  domain?: string | null
  plan: string
  status: string
  contactEmail: string
  contactPhone?: string | null
  address?: string | null
  city?: string | null
  aiTokenQuota: number
  aiTokensUsed: number
  planDetails?: {
    name: string
    code: string
    priceMonthly: number
    maxStudents: number
    maxTeachers: number
  } | null
  createdAt: string
  updatedAt: string
}

export interface UpdateCenterProfilePayload {
  name?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  city?: string
}

export interface TeacherItem {
  id: string
  fullName: string
  email: string
  phone?: string | null
  avatar?: string | null
  cefrLevel: string
  isActive: boolean
  createdAt: string
  activeClassesCount: number
  totalStudentsTaught: number
  teachingClasses?: Array<{
    id: string
    name: string
    status: string
  }>
}

export interface CreateTeacherPayload {
  fullName: string
  email: string
  phone?: string
  cefrLevel?: 'B1' | 'B2' | 'C1' | 'C2'
  qualification?: string
  assignedClassId?: string
}

export interface StudentItem {
  id: string
  fullName: string
  email: string
  phone: string
  avatar: string
  targetBand: string
  currentLevel: string
  streakDays: number
  isActive: boolean
  attendanceRate: number
  currentClassId?: string | null
  currentClass: string
  courseTitle: string
  createdAt: string
}

export interface CreateStudentPayload {
  fullName: string
  email: string
  phone?: string
  cefrLevel?: string
  classId?: string
}

export interface CsvStudentInput {
  fullName: string
  email: string
  phone?: string
  className?: string
  classId?: string
  cefrLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
}

export interface CsvImportResult {
  totalRows: number
  successCount: number
  failedCount: number
  errors: Array<{
    row: number
    email: string
    error: string
  }>
}

export interface ClassItem {
  id: string
  name: string
  roomNumber: string
  scheduleInfo: string
  status: string
  startDate?: string | null
  endDate?: string | null
  studentCount: number
  assignmentCount: number
  teacher?: {
    id: string
    fullName: string
    email: string
  } | null
  course?: {
    id: string
    title: string
    code: string
    type: string
  } | null
}

export interface AuditLogItem {
  id: string
  action: string
  resource: string
  resourceId?: string | null
  details?: string | null
  ipAddress?: string | null
  createdAt: string
  user?: {
    id: string
    fullName: string
    email: string
    role: string
  } | null
}

export const centerService = {
  getStats: async () => {
    const res = await api.get('/center/stats')
    return res.data?.data
  },

  getProfile: async (): Promise<CenterProfile> => {
    const res = await api.get('/center/profile')
    return res.data?.data
  },

  updateProfile: async (data: UpdateCenterProfilePayload): Promise<CenterProfile> => {
    const res = await api.put('/center/profile', data)
    return res.data?.data
  },

  getTeachers: async (params?: { search?: string; status?: string }): Promise<TeacherItem[]> => {
    const res = await api.get('/center/teachers', { params })
    return res.data?.data || []
  },

  createTeacher: async (data: CreateTeacherPayload): Promise<TeacherItem> => {
    const res = await api.post('/center/teachers', data)
    return res.data?.data
  },

  getStudents: async (params?: { search?: string; status?: string; classId?: string }): Promise<StudentItem[]> => {
    const res = await api.get('/center/students', { params })
    return res.data?.data || []
  },

  createStudent: async (data: CreateStudentPayload): Promise<StudentItem> => {
    const res = await api.post('/center/students', data)
    return res.data?.data
  },

  importStudentsCsv: async (students: CsvStudentInput[]): Promise<CsvImportResult> => {
    const res = await api.post('/center/students/import-csv', { students })
    return res.data?.data
  },

  transferStudentClass: async (
    studentId: string,
    payload: { targetClassId: string; currentClassId?: string; reason?: string }
  ) => {
    const res = await api.post(`/center/students/${studentId}/transfer-class`, payload)
    return res.data?.data
  },

  toggleUserStatus: async (userId: string, isActive?: boolean) => {
    const res = await api.patch(`/center/users/${userId}/status`, { isActive })
    return res.data?.data
  },

  getClasses: async (): Promise<ClassItem[]> => {
    const res = await api.get('/center/classes')
    return res.data?.data || []
  },

  getAuditLogs: async (limit = 50): Promise<AuditLogItem[]> => {
    const res = await api.get('/center/audit-logs', { params: { limit } })
    return res.data?.data || []
  },
}

export default centerService


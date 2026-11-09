import api from './api'

export type MeetingPlatform = 'GOOGLE_MEET' | 'ZOOM' | 'MICROSOFT_TEAMS' | 'INTERNAL_ROOM'

export interface LiveSessionItem {
  id: string
  tenantId: string
  courseId: string
  classId?: string | null
  teacherId?: string | null
  title: string
  description?: string | null
  startTime: string
  endTime: string
  meetingUrl: string
  meetingPlatform: MeetingPlatform
  isCancelled: boolean
  createdAt: string
  course?: { id: string; title: string; code: string } | null
  class?: { id: string; name: string; roomNumber?: string | null } | null
  teacher?: { id: string; fullName: string; email: string; avatar?: string | null } | null
}

export interface CreateLiveSessionPayload {
  courseId: string
  classId?: string | null
  teacherId?: string | null
  title: string
  description?: string | null
  startTime: string
  endTime: string
  meetingUrl?: string | null
  meetingPlatform?: MeetingPlatform
}

export interface UpdateLiveSessionPayload {
  title?: string
  description?: string | null
  startTime?: string
  endTime?: string
  meetingUrl?: string | null
  meetingPlatform?: MeetingPlatform
  isCancelled?: boolean
  classId?: string | null
  teacherId?: string | null
}

export interface LiveSessionJoinStatus {
  status: 'UPCOMING' | 'ACTIVE' | 'ENDED' | 'CANCELLED'
  canJoin: boolean
  label: string
  countdownText?: string
  badgeVariant: 'warning' | 'success' | 'destructive' | 'secondary' | 'primary'
}

/**
 * 15-Minute Rule helper:
 * - Active / Joinable only from 15 minutes before startTime until endTime
 * - Outside this window: Disabled with informative countdown badge
 */
export function checkLiveSessionJoinStatus(session: LiveSessionItem): LiveSessionJoinStatus {
  if (session.isCancelled) {
    return {
      status: 'CANCELLED',
      canJoin: false,
      label: 'Buổi học đã hủy',
      badgeVariant: 'destructive',
    }
  }

  const now = new Date()
  const start = new Date(session.startTime)
  const end = new Date(session.endTime)

  if (now > end) {
    return {
      status: 'ENDED',
      canJoin: false,
      label: 'Buổi học đã kết thúc',
      badgeVariant: 'secondary',
    }
  }

  const diffMs = start.getTime() - now.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  // 15-minute rule: within 15 minutes of start OR currently running
  if (diffMinutes <= 15 && now <= end) {
    return {
      status: 'ACTIVE',
      canJoin: true,
      label: now >= start ? 'Đang diễn ra (Vào lớp ngay)' : 'Phòng học đã mở (Vào lớp)',
      countdownText: now < start ? `Bắt đầu sau ${diffMinutes} phút` : undefined,
      badgeVariant: 'success',
    }
  }

  // Not yet open
  let countdownText = ''
  if (diffMinutes < 60) {
    countdownText = `Mở sau ${diffMinutes - 15} phút`
  } else if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60)
    const mins = diffMinutes % 60
    countdownText = `Còn ${hours}h ${mins}p`
  } else {
    const days = Math.floor(diffMinutes / 1440)
    countdownText = `Còn ${days} ngày`
  }

  return {
    status: 'UPCOMING',
    canJoin: false,
    label: 'Chưa mở (Mở trước 15p)',
    countdownText,
    badgeVariant: 'warning',
  }
}

export const liveSessionService = {
  /**
   * Get all live sessions matching query
   */
  getLiveSessions: async (params?: {
    courseId?: string
    classId?: string
    upcomingOnly?: boolean
  }): Promise<LiveSessionItem[]> => {
    const res = await api.get('/live-sessions', { params })
    return res.data?.data || []
  },

  /**
   * Get single live session by ID
   */
  getLiveSessionById: async (id: string): Promise<LiveSessionItem> => {
    const res = await api.get(`/live-sessions/${id}`)
    return res.data?.data
  },

  /**
   * Create live session (Pessimistic Update pattern)
   */
  createLiveSession: async (payload: CreateLiveSessionPayload): Promise<LiveSessionItem> => {
    const res = await api.post('/live-sessions', payload)
    return res.data?.data
  },

  /**
   * Update live session
   */
  updateLiveSession: async (id: string, payload: UpdateLiveSessionPayload): Promise<LiveSessionItem> => {
    const res = await api.patch(`/live-sessions/${id}`, payload)
    return res.data?.data
  },

  /**
   * Delete live session
   */
  deleteLiveSession: async (id: string): Promise<void> => {
    await api.delete(`/live-sessions/${id}`)
  },
}


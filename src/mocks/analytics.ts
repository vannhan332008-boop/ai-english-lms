export interface RevenuePoint {
  month: string
  mrrMillion: number
  newTenants: number
  activeCenters: number
}

export interface CenterAiUsage {
  center: string
  writingTokens: number // Triệu tokens
  speakingTokens: number // Triệu tokens
  totalTokens: number // Triệu tokens
  quotaUsagePercent: number
}

export const mockMonthlyRevenue: RevenuePoint[] = [
  { month: 'T05/26', mrrMillion: 285.5, newTenants: 2, activeCenters: 22 },
  { month: 'T06/26', mrrMillion: 320.0, newTenants: 3, activeCenters: 25 },
  { month: 'T07/26', mrrMillion: 368.2, newTenants: 4, activeCenters: 29 },
  { month: 'T08/26', mrrMillion: 410.0, newTenants: 3, activeCenters: 32 },
  { month: 'T09/26', mrrMillion: 442.8, newTenants: 2, activeCenters: 34 },
  { month: 'T10/26', mrrMillion: 486.5, newTenants: 3, activeCenters: 37 },
]

export const mockCenterAiUsageData: CenterAiUsage[] = [
  { center: 'EnglishFlow IELTS', writingTokens: 520, speakingTokens: 760, totalTokens: 1280, quotaUsagePercent: 64 },
  { center: 'Z-English Master', writingTokens: 260, speakingTokens: 360, totalTokens: 620, quotaUsagePercent: 62 },
  { center: 'Global Talk Hub', writingTokens: 170, speakingTokens: 240, totalTokens: 410, quotaUsagePercent: 41 },
  { center: 'Ocean Edu Mekong', writingTokens: 110, speakingTokens: 180, totalTokens: 290, quotaUsagePercent: 29 },
  { center: 'Apollo Elite VN', writingTokens: 15, speakingTokens: 30, totalTokens: 45, quotaUsagePercent: 9 },
  { center: 'Summit IELTS Club', writingTokens: 210, speakingTokens: 290, totalTokens: 500, quotaUsagePercent: 100 },
]

export const mockCenterPerformance = [
  { name: 'EnglishFlow IELTS', active: 1420, attendance: 96.5, avgBand: 7.0, quotaPercent: 64 },
  { name: 'Z-English Master', active: 780, attendance: 94.2, avgBand: 6.8, quotaPercent: 62 },
  { name: 'Global Talk Hub', active: 540, attendance: 95.8, avgBand: 6.6, quotaPercent: 41 },
  { name: 'Ocean Edu Mekong', active: 380, attendance: 93.0, avgBand: 6.4, quotaPercent: 29 },
]

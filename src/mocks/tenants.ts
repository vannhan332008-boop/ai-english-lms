export interface CenterTenant {
  id: string
  name: string
  code: string
  domain: string
  city: string
  address: string
  hotline: string
  status: 'ACTIVE' | 'PENDING' | 'LOCKED'
  plan: 'Basic' | 'Pro' | 'Enterprise'
  activeStudents: number
  totalTeachers: number
  aiTokenQuota: number
  aiTokensUsed: number
  logoText: string
  createdAt: string
  contactPerson: string
}

export const mockTenants: CenterTenant[] = [
  {
    id: 't_01',
    name: 'EnglishFlow IELTS Academy',
    code: 'ef-ielts-hcm',
    domain: 'ielts.englishflow.vn',
    city: 'TP. Hồ Chí Minh',
    address: '208 Nguyễn Hữu Cảnh, Phường 22, Quận Bình Thạnh',
    hotline: '028 7300 8888',
    status: 'ACTIVE',
    plan: 'Enterprise',
    activeStudents: 1420,
    totalTeachers: 45,
    aiTokenQuota: 2000000,
    aiTokensUsed: 1280000,
    logoText: 'EFI',
    createdAt: '15/03/2025',
    contactPerson: 'Nguyễn Văn A',
  },
  {
    id: 't_02',
    name: 'Z-English Master Campus',
    code: 'z-english-hn',
    domain: 'z-english.englishflow.vn',
    city: 'Hà Nội',
    address: '45 Kim Mã, Quận Ba Đình',
    hotline: '024 3999 6666',
    status: 'ACTIVE',
    plan: 'Pro',
    activeStudents: 780,
    totalTeachers: 26,
    aiTokenQuota: 1000000,
    aiTokensUsed: 620000,
    logoText: 'ZE',
    createdAt: '10/06/2025',
    contactPerson: 'Trần Thị B',
  },
  {
    id: 't_03',
    name: 'Global Talk Language Hub',
    code: 'global-talk-dn',
    domain: 'globaltalk.englishflow.vn',
    city: 'Đà Nẵng',
    address: '128 Bạch Đằng, Quận Hải Châu',
    hotline: '0236 388 9999',
    status: 'ACTIVE',
    plan: 'Pro',
    activeStudents: 540,
    totalTeachers: 19,
    aiTokenQuota: 1000000,
    aiTokensUsed: 410000,
    logoText: 'GT',
    createdAt: '22/09/2025',
    contactPerson: 'Lê Hoàng Cường',
  },
  {
    id: 't_04',
    name: 'Apollo Elite Vietnam',
    code: 'apollo-elite-hcm',
    domain: 'apollo.englishflow.vn',
    city: 'TP. Hồ Chí Minh',
    address: '58 Phạm Ngọc Thạch, Quận 3',
    hotline: '028 3822 5588',
    status: 'PENDING',
    plan: 'Basic',
    activeStudents: 220,
    totalTeachers: 12,
    aiTokenQuota: 500000,
    aiTokensUsed: 45000,
    logoText: 'AE',
    createdAt: '20/10/2026',
    contactPerson: 'Phạm Thanh Thảo',
  },
  {
    id: 't_05',
    name: 'Summit IELTS Prep Club',
    code: 'summit-ielts-hn',
    domain: 'summit.englishflow.vn',
    city: 'Hà Nội',
    address: '101 Láng Hạ, Quận Đống Đa',
    hotline: '024 3562 8888',
    status: 'LOCKED',
    plan: 'Basic',
    activeStudents: 95,
    totalTeachers: 5,
    aiTokenQuota: 500000,
    aiTokensUsed: 500000,
    logoText: 'SI',
    createdAt: '05/01/2026',
    contactPerson: 'Vũ Quốc Toàn',
  },
  {
    id: 't_06',
    name: 'Ocean Edu Mekong',
    code: 'ocean-edu-ct',
    domain: 'ocean.englishflow.vn',
    city: 'Cần Thơ',
    address: '88 Đại Lộ Hòa Bình, Quận Ninh Kiều',
    hotline: '0292 388 7766',
    status: 'ACTIVE',
    plan: 'Pro',
    activeStudents: 380,
    totalTeachers: 16,
    aiTokenQuota: 1000000,
    aiTokensUsed: 290000,
    logoText: 'OE',
    createdAt: '18/02/2026',
    contactPerson: 'Hoàng Minh Tuấn',
  },
]

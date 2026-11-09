import api from './api'

export interface MaterialItem {
  id: string
  courseId?: string | null
  lessonId?: string | null
  tenantId: string
  title: string
  description?: string | null
  fileType: 'PDF' | 'AUDIO' | 'VIDEO' | 'DOCUMENT' | 'IMAGE' | 'OTHER'
  mimeType?: string | null
  fileUrl: string
  fileSize?: number | null
  createdAt: string
  course?: { id: string; title: string; code: string } | null
  lesson?: { id: string; title: string } | null
}

export interface UploadMaterialPayload {
  title: string
  courseId?: string | null
  lessonId?: string | null
  description?: string | null
  file: File
}

export interface SignedDownloadTokenResponse {
  token: string
  downloadUrl: string
  expiresIn: number
  fileName: string
}

export const materialService = {
  /**
   * Get materials for a specific course (accessible by enrolled students or staff)
   */
  getCourseMaterials: async (courseId: string): Promise<MaterialItem[]> => {
    const res = await api.get(`/materials/course/${courseId}`)
    return res.data?.data || []
  },

  /**
   * Get all materials in the tenant library (Curriculum Bank for staff)
   */
  getTenantMaterials: async (params?: {
    search?: string
    fileType?: string
    courseId?: string
  }): Promise<MaterialItem[]> => {
    const res = await api.get('/materials', { params })
    return res.data?.data || []
  },

  /**
   * Upload a new material (multipart/form-data)
   */
  uploadMaterial: async (
    payload: UploadMaterialPayload,
    onProgress?: (percent: number) => void
  ): Promise<MaterialItem> => {
    const formData = new FormData()
    formData.append('title', payload.title)
    if (payload.courseId) formData.append('courseId', payload.courseId)
    if (payload.lessonId) formData.append('lessonId', payload.lessonId)
    if (payload.description) formData.append('description', payload.description)
    formData.append('file', payload.file)

    const res = await api.post('/materials/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percent)
        }
      },
    })
    return res.data?.data
  },

  /**
   * Generate short-lived signed download token
   */
  getDownloadToken: async (materialId: string): Promise<SignedDownloadTokenResponse> => {
    const res = await api.get(`/materials/${materialId}/download-token`)
    return res.data?.data
  },

  /**
   * Download a material safely using blob streaming and trigger browser download
   */
  downloadMaterial: async (materialId: string, filename: string): Promise<void> => {
    const res = await api.get(`/materials/${materialId}/download`, {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  /**
   * Delete a material
   */
  deleteMaterial: async (materialId: string): Promise<{ success: boolean; id: string }> => {
    const res = await api.delete(`/materials/${materialId}`)
    return res.data?.data
  },
}


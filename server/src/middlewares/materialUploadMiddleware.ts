import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { AppError } from '../utils/errors.js'

// Directory for secure materials vault
const materialsDir = path.resolve('uploads/materials')
if (!fs.existsSync(materialsDir)) {
  fs.mkdirSync(materialsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, materialsDir)
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now()
    const randomHex = crypto.randomBytes(6).toString('hex')
    const ext = path.extname(file.originalname).toLowerCase()
    const cleanBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 50)
    cb(null, `${timestamp}-${randomHex}-${cleanBase}${ext}`)
  },
})

const ALLOWED_MIME_TYPES = new Set([
  // Documents
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  // Audio
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'audio/ogg',
  'audio/m4a',
  'audio/x-m4a',
  // Video
  'video/mp4',
  'video/webm',
  'video/quicktime',
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.docx',
  '.doc',
  '.xlsx',
  '.pptx',
  '.txt',
  '.mp3',
  '.wav',
  '.m4a',
  '.ogg',
  '.mp4',
  '.webm',
  '.mov',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
])

export const uploadMaterial = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB maximum (checked for video, 25MB for others in controller/service)
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const mime = file.mimetype.toLowerCase()

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(
        new AppError(
          `Định dạng tệp "${ext}" không được hỗ trợ. Chỉ chấp nhận PDF, DOCX, XLSX, PPTX, MP3, MP4, PNG, JPG...`,
          400,
          'INVALID_FILE_TYPE'
        )
      )
    }

    if (!ALLOWED_MIME_TYPES.has(mime) && !mime.startsWith('audio/') && !mime.startsWith('video/') && !mime.startsWith('image/')) {
      return cb(
        new AppError(
          `Loại tệp "${mime}" không hợp lệ hoặc bị chặn vì lý do bảo mật`,
          400,
          'INVALID_FILE_MIME'
        )
      )
    }

    cb(null, true)
  },
})

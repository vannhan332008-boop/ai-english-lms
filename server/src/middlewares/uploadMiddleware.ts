import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Ensure upload directory exists strictly on Drive D within server folder
const audioDir = path.resolve('uploads/audio')
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, audioDir)
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now()
    const safeExt = path.extname(file.originalname) || '.webm'
    const cleanName = path.basename(file.originalname, safeExt).replace(/[^a-zA-Z0-9_-]/g, '_')
    cb(null, `${timestamp}-${cleanName}${safeExt}`)
  },
})

export const uploadAudio = multer({
  storage,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30 MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'audio/webm',
      'audio/wav',
      'audio/x-wav',
      'audio/wave',
      'audio/mp3',
      'audio/mpeg',
      'audio/ogg',
      'audio/mp4',
      'audio/m4a',
      'audio/x-m4a',
      'application/octet-stream',
    ]

    const allowedExts = ['.webm', '.wav', '.mp3', '.ogg', '.m4a']
    const ext = path.extname(file.originalname).toLowerCase()

    if (
      allowedMimes.includes(file.mimetype) ||
      file.mimetype.startsWith('audio/') ||
      allowedExts.includes(ext)
    ) {
      cb(null, true)
    } else {
      cb(new Error(`Định dạng audio không được hỗ trợ (${file.mimetype}). Vui lòng tải file WebM, WAV, MP3.`))
    }
  },
})

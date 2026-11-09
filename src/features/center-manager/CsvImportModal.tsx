import React, { useState, useRef } from 'react'
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Trash2,
  RefreshCw,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks/useToast'
import { centerService, type CsvStudentInput, type ClassItem } from '@/services/centerService'

interface CsvImportModalProps {
  isOpen: boolean
  onClose: () => void
  classes: ClassItem[]
  onImportSuccess: () => void
}

interface ParsedRow {
  rowNum: number
  fullName: string
  email: string
  phone: string
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  className: string
  classId?: string
  isValid: boolean
  errorReason?: string
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  classes,
  onImportSuccess,
}) => {
  const { success, error: toastError, warning } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [fileName, setFileName] = useState<string>('')
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverErrors, setServerErrors] = useState<Array<{ row: number; email: string; error: string }>>([])

  // Download sample CSV template
  const handleDownloadTemplate = () => {
    const defaultClassName = classes[0]?.name || 'IELTS 7.5 - K42 Evening'
    const csvContent =
      'fullName,email,phone,cefrLevel,className\n' +
      `Nguyen Van A,nguyenvana@gmail.com,0912345678,B1,${defaultClassName}\n` +
      `Tran Thi B,tranthib@gmail.com,0987654321,B2,${defaultClassName}\n` +
      `Le Hoang C,lehoangc@gmail.com,0901234567,A2,Chưa xếp lớp\n`

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'mau_danh_sach_hoc_vien_englishflow.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Parse CSV file content
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setServerErrors([])

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (!text) {
        toastError('Lỗi đọc file', 'File rỗng hoặc không đọc được nội dung.')
        return
      }

      parseCsvText(text)
    }
    reader.readAsText(file, 'utf-8')
  }

  const parseCsvText = (csvText: string) => {
    const lines = csvText.split(/\r\n|\n/).filter((l) => l.trim().length > 0)
    if (lines.length <= 1) {
      warning('File trống', 'File CSV cần có ít nhất 1 dòng tiêu đề và 1 dòng dữ liệu.')
      setParsedRows([])
      return
    }

    // Determine delimiter (comma or semicolon)
    const headerLine = lines[0]
    const delimiter = headerLine.includes(';') ? ';' : ','

    const seenEmails = new Set<string>()
    const rows: ParsedRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Simple CSV split taking care of trimmed whitespace
      const cols = line.split(delimiter).map((c) => c.replace(/^["']|["']$/g, '').trim())

      const fullName = cols[0] || ''
      const email = (cols[1] || '').toLowerCase()
      const phone = cols[2] || ''
      const cefrRaw = (cols[3] || 'B1').toUpperCase()
      const cefrLevel = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(cefrRaw)
        ? (cefrRaw as any)
        : 'B1'
      const className = cols[4] || ''

      // Check class match
      const matchedClass = classes.find(
        (c) => c.name.toLowerCase().trim() === className.toLowerCase().trim()
      )

      let isValid = true
      let errorReason = ''

      if (!fullName || fullName.length < 2) {
        isValid = false
        errorReason = 'Họ tên thiếu hoặc dưới 2 ký tự'
      } else if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        isValid = false
        errorReason = 'Email không đúng định dạng'
      } else if (seenEmails.has(email)) {
        isValid = false
        errorReason = 'Email bị trùng lặp trong file'
      }

      if (email) seenEmails.add(email)

      rows.push({
        rowNum: i,
        fullName,
        email,
        phone,
        cefrLevel,
        className: matchedClass ? matchedClass.name : className || 'Chưa xếp lớp',
        classId: matchedClass?.id,
        isValid,
        errorReason,
      })
    }

    setParsedRows(rows)
  }

  const handleClear = () => {
    setFileName('')
    setParsedRows([])
    setServerErrors([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validRows = parsedRows.filter((r) => r.isValid)
  const invalidRows = parsedRows.filter((r) => !r.isValid)

  const handleSubmitImport = async () => {
    if (validRows.length === 0) {
      warning('Không có dòng hợp lệ', 'Vui lòng kiểm tra và sửa các lỗi trước khi nhập.')
      return
    }

    setIsSubmitting(true)
    setServerErrors([])

    try {
      const payload: CsvStudentInput[] = validRows.map((r) => ({
        fullName: r.fullName,
        email: r.email,
        phone: r.phone || undefined,
        cefrLevel: r.cefrLevel,
        className: r.className,
        classId: r.classId,
      }))

      const result = await centerService.importStudentsCsv(payload)

      if (result.errors && result.errors.length > 0) {
        setServerErrors(result.errors)
        toastError(
          'Một số dòng bị lỗi khi lưu',
          `Đã tạo ${result.successCount} học viên, có ${result.failedCount} dòng bị từ chối do trùng lặp hoặc lỗi hệ thống.`
        )
      } else {
        success('Nhập dữ liệu thành công!', `Đã tạo mới và ghi danh ${result.successCount} học viên vào hệ thống.`)
        handleClear()
        onImportSuccess()
        onClose()
      }
    } catch (err: any) {
      toastError('Lỗi import', err.response?.data?.message || err.message || 'Không thể nhập file CSV')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nhập Danh Sách Học Viên từ File CSV"
      description="Hệ thống hỗ trợ tải file CSV có kiểm tra định dạng và báo lỗi từng dòng trước khi lưu vào CSDL."
      size="xl"
    >
      <div className="space-y-5">
        {/* Step 1: Upload or Download Template */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">File mẫu chuẩn Excel / CSV</p>
              <p className="text-xs text-muted-foreground">
                Tải file mẫu định dạng UTF-8 bao gồm các cột: fullName, email, phone, cefrLevel, className
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            className="gap-1.5 shrink-0"
          >
            <Download className="w-4 h-4" />
            Tải File Mẫu (.csv)
          </Button>
        </div>

        {/* Upload Zone */}
        {parsedRows.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-950/40"
          >
            <Upload className="w-10 h-10 text-slate-400 mb-3" />
            <p className="text-sm font-bold text-foreground">
              Nhấn để chọn file CSV danh sách học viên
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Hỗ trợ file .csv mã hóa UTF-8, dung lượng tối đa 5MB (tối đa 500 dòng/lần)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Summary Header */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-primary" />
                <span className="font-bold text-foreground truncate max-w-xs">{fileName}</span>
                <span className="text-muted-foreground">({parsedRows.length} dòng)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">{validRows.length} Hợp lệ</Badge>
                {invalidRows.length > 0 && (
                  <Badge variant="danger">{invalidRows.length} Có lỗi</Badge>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-7 text-xs text-rose-500 hover:text-rose-600 gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa chọn lại
                </Button>
              </div>
            </div>

            {/* Server Errors Notification if any */}
            {serverErrors.length > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs space-y-1.5 text-rose-600 dark:text-rose-400">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Báo cáo các dòng bị từ chối từ Server:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] max-h-24 overflow-y-auto">
                  {serverErrors.map((err, idx) => (
                    <li key={idx}>
                      Dòng {err.row} ({err.email}): {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview Table */}
            <div className="max-h-72 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-900 text-muted-foreground font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="p-2.5 w-12">#</th>
                    <th className="p-2.5">Họ và Tên</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5">Số điện thoại</th>
                    <th className="p-2.5">CEFR</th>
                    <th className="p-2.5">Lớp xếp</th>
                    <th className="p-2.5 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedRows.map((row) => (
                    <tr
                      key={row.rowNum}
                      className={
                        row.isValid
                          ? 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                          : 'bg-rose-50/50 dark:bg-rose-950/20'
                      }
                    >
                      <td className="p-2.5 text-muted-foreground font-mono">{row.rowNum}</td>
                      <td className="p-2.5 font-bold text-foreground">{row.fullName}</td>
                      <td className="p-2.5 text-muted-foreground">{row.email}</td>
                      <td className="p-2.5 text-muted-foreground">{row.phone || '—'}</td>
                      <td className="p-2.5">
                        <Badge variant="outline" className="text-[10px]">
                          {row.cefrLevel}
                        </Badge>
                      </td>
                      <td className="p-2.5 text-primary font-medium">{row.className}</td>
                      <td className="p-2.5 text-right">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Hợp lệ
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] text-rose-500 font-medium cursor-help"
                            title={row.errorReason}
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            {row.errorReason}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Đóng
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={validRows.length === 0 || isSubmitting}
            onClick={handleSubmitImport}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Đang nạp {validRows.length} học viên...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Xác nhận Nhập ({validRows.length} Học viên)
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
export default CsvImportModal


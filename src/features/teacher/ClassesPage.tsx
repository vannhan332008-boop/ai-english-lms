import React, { useState } from 'react'
import {
  Users,
  Clock,
  DoorOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  ChevronRight,
  Save,
  Check,
  FileSpreadsheet,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { mockTeacherClasses, type TeacherClassDetail, type StudentAttendance } from '@/mocks/teacherPortal'
import { useToast } from '@/hooks/useToast'

export const TeacherClassesPage: React.FC = () => {
  const { success } = useToast()
  const [classesList] = useState<TeacherClassDetail[]>(mockTeacherClasses)
  const [selectedClass, setSelectedClass] = useState<TeacherClassDetail | null>(null)
  const [attendanceData, setAttendanceData] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'EXCUSED'>>({})

  const handleOpenClassDetail = (cls: TeacherClassDetail) => {
    setSelectedClass(cls)
    // Initialize attendance map
    const initialMap: Record<string, 'PRESENT' | 'ABSENT' | 'EXCUSED'> = {}
    cls.students.forEach((s) => {
      initialMap[s.studentId] = s.status
    })
    setAttendanceData(initialMap)
  }

  const handleToggleAttendance = (studentId: string, newStatus: 'PRESENT' | 'ABSENT' | 'EXCUSED') => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: newStatus,
    }))
  }

  const handleSaveAttendance = () => {
    if (!selectedClass) return
    const presentCount = Object.values(attendanceData).filter((s) => s === 'PRESENT').length
    success(
      `Đã lưu điểm danh lớp ${selectedClass.name}`,
      `Có ${presentCount}/${selectedClass.students.length} học viên có mặt. Dữ liệu đã đồng bộ về sổ học vụ cơ sở.`
    )
    setSelectedClass(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Lớp Học Phụ Trách & Điểm Danh
            </h1>
            <Badge variant="primary">{classesList.length} Lớp đang mở</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý sĩ số, thực hiện điểm danh nhanh theo ca học và theo dõi bảng điểm năng lực học viên.
          </p>
        </div>

        <Button
          variant="outline"
          className="gap-2 shrink-0 text-xs"
          onClick={() => success('Đã tải xuất sổ điểm', 'Báo cáo điểm số toàn bộ 3 lớp đã được xuất file Excel.')}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          Xuất bảng điểm Excel
        </Button>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classesList.map((cls) => (
          <Card
            key={cls.id}
            className="p-5 flex flex-col justify-between hover:shadow-lg transition-all border-border/80 group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors">
                    {cls.name}
                  </h3>
                  <Badge variant="outline" className="font-mono text-[10px] mt-1">
                    {cls.courseCode}
                  </Badge>
                </div>
                <Badge variant="success" className="text-xs">
                  {cls.attendanceRate}% Chuyên cần
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{cls.courseName}</p>

              <div className="space-y-2 mt-4 text-xs">
                <div className="flex items-center gap-2 text-foreground">
                  <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{cls.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DoorOpen className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{cls.room}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Sĩ số: <strong className="text-foreground">{cls.totalStudents}</strong> học viên</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 mt-4 text-xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Điểm Band trung bình lớp:</span>
                  <span className="font-bold text-primary text-sm flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    {cls.avgScore} IELTS
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/40 line-clamp-1">
                  Kế hoạch: {cls.nextLesson}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border/60">
              <Button
                variant="primary"
                className="w-full text-xs gap-1.5"
                onClick={() => handleOpenClassDetail(cls)}
              >
                <span>Xem chi tiết & Điểm danh</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal: Class Detail with Quick Attendance & Gradebook */}
      {selectedClass && (
        <Modal
          isOpen={!!selectedClass}
          onClose={() => setSelectedClass(null)}
          title={`Học Vụ Lớp: ${selectedClass.name} (${selectedClass.courseCode})`}
          description="Thực hiện điểm danh nhanh ca học hôm nay và xem năng lực học viên do AI đánh giá."
          size="lg"
        >
          <div className="space-y-6">
            {/* Class Quick Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-muted/40 rounded-xl border border-border/60">
                <span className="text-muted-foreground block">Phòng học</span>
                <span className="font-bold text-foreground text-sm mt-0.5 block">{selectedClass.room}</span>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl border border-border/60">
                <span className="text-muted-foreground block">Lịch giảng</span>
                <span className="font-bold text-foreground text-sm mt-0.5 block">{selectedClass.schedule.split(' ')[0]}</span>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl border border-border/60">
                <span className="text-muted-foreground block">Sĩ số danh sách</span>
                <span className="font-bold text-foreground text-sm mt-0.5 block">{selectedClass.students.length} bạn</span>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl border border-border/60">
                <span className="text-muted-foreground block">Band điểm TB</span>
                <span className="font-bold text-primary text-sm mt-0.5 block">{selectedClass.avgScore} Overall</span>
              </div>
            </div>

            {/* Quick Attendance Table */}
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/60">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Điểm Danh Nhanh Buổi Học Hôm Nay
                </h4>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Có mặt:</span>
                  <Badge variant="success">
                    {Object.values(attendanceData).filter((v) => v === 'PRESENT').length} / {selectedClass.students.length}
                  </Badge>
                </div>
              </div>

              <div className="rounded-xl border border-border/80 overflow-hidden divide-y divide-border/60">
                {selectedClass.students.map((student: StudentAttendance) => {
                  const currentStatus = attendanceData[student.studentId] || student.status

                  return (
                    <div
                      key={student.studentId}
                      className="p-3 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.studentName}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-border shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-sm">{student.studentName}</span>
                            {student.note && (
                              <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                                {student.note}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                            <span>Speaking: <strong className="text-foreground">{student.speakingAvg}</strong></span>
                            <span>•</span>
                            <span>Writing: <strong className="text-foreground">{student.writingAvg}</strong></span>
                            <span>•</span>
                            <span>Overall: <strong className="text-primary font-bold">{student.overallBand}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* 3-way Attendance Switcher Buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(student.studentId, 'PRESENT')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                            currentStatus === 'PRESENT'
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          Có mặt
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(student.studentId, 'EXCUSED')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                            currentStatus === 'EXCUSED'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          Có phép
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(student.studentId, 'ABSENT')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                            currentStatus === 'ABSENT'
                              ? 'bg-rose-500 text-white shadow-sm'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Vắng mặt
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border/60">
              <span className="text-xs text-muted-foreground">
                Tự động gửi thông báo vắng học về ứng dụng phụ huynh sau khi lưu.
              </span>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setSelectedClass(null)}>
                  Hủy bỏ
                </Button>
                <Button variant="primary" className="gap-1.5" onClick={handleSaveAttendance}>
                  <Save className="w-4 h-4" />
                  Lưu sổ điểm danh
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default TeacherClassesPage

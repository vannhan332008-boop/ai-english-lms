import React from 'react'
import { Link } from 'react-router-dom'
import {
  Star,
  Clock,
  BookOpen,
  ArrowRight,
  Users,
} from 'lucide-react'
import { formatVND } from '@/utils/formatters'
import type { Course } from '@/services/courseService'
import { cn } from '@/lib/utils'

export interface CourseCardProps {
  course: Course
  className?: string
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, className }) => {
  const badgeColors: Record<string, string> = {
    IELTS: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    TOEIC: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    COMMUNICATION: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    BUSINESS: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  }

  const courseType = course.type || course.category || 'IELTS'

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-[1.75rem] bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-4 transition-all duration-300 hover:-translate-y-1.5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_50px_-12px_rgba(79,70,229,0.15)] overflow-hidden',
        className
      )}
    >
      <div>
        {/* Course Thumbnail Container with aspect ratio */}
        <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-4">
          <img
            src={
              course.thumbnailUrl ||
              'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'
            }
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Floating Pill Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                'px-3 py-1 text-[11px] font-bold rounded-full backdrop-blur-md border shadow-sm',
                badgeColors[courseType] || 'bg-white/80 text-slate-800 border-slate-200'
              )}
            >
              {courseType} • {course.targetLevel || course.level || 'Intermediate'}
            </span>
          </div>

          {/* Rating tag */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-md text-amber-400 text-xs font-bold border border-white/10 shadow-sm">
            <Star className="w-3 h-3 fill-current text-amber-400" />
            <span>{course.rating ? course.rating.toFixed(1) : (course as any).averageRating ? (course as any).averageRating.toFixed(1) : '5.0'}</span>
            <span className="text-[10px] text-slate-300 font-medium">
              ({(course as any).reviewCount ?? (course as any).reviewsCount ?? (course as any).totalReviews ?? 0})
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-2.5 px-1">
          {/* Instructor snippet */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <img
              src={
                course.instructorAvatar ||
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'
              }
              alt={course.instructorName || 'Giảng viên'}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
            />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {course.instructorName || 'Chuyên gia IDP / BC'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {course.enrolledStudents || 120} học viên
            </span>
          </div>

          {/* Title */}
          <Link to={`/courses/${course.id}`}>
            <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">
              {course.title}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {course.description}
          </p>

          {/* Meta Info Pills */}
          <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              {course.lessonsCount} bài học
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-500" />
              {course.durationWeeks} tuần lộ trình
            </span>
          </div>
        </div>
      </div>

      {/* Footer Price & Action */}
      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 px-1">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Học phí trọn gói
          </span>
          <span className="text-base font-black text-indigo-600 dark:text-cyan-400 tracking-tight">
            {formatVND(course.priceVND || course.price || 0)}
          </span>
        </div>

        <Link
          to={`/courses/${course.id}`}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-700 hover:text-white dark:text-slate-200 dark:hover:text-white transition-all duration-200 shadow-sm"
        >
          <span>Chi tiết</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  )
}

export default CourseCard

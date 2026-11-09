import React, { useState, useEffect, useMemo } from 'react'
import {
  Search,
  BookOpen,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { CourseCard } from '@/components/specific/CourseCard'
import { useCourseStore } from '@/store/courseStore'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuthStore } from '@/store/authStore'
import { courseService } from '@/services/courseService'

export const CourseList: React.FC = () => {
  const { courses, fetchCourses, isLoading } = useCourseStore()
  const { isAuthenticated } = useAuthStore()
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [myCourses, setMyCourses] = useState<any[]>([])
  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    void fetchCourses()
  }, [fetchCourses])

  useEffect(() => {
    if (isAuthenticated) {
      courseService.getMyEnrolledCourses().then(setMyCourses).catch(() => {})
    }
  }, [isAuthenticated])

  const categories = [
    { id: 'ALL', label: 'Tất cả chương trình' },
    ...(isAuthenticated && myCourses.length > 0
      ? [{ id: 'MY_COURSES', label: `Khóa học của tôi (${myCourses.length})` }]
      : []),
    { id: 'IELTS', label: 'Luyện thi IELTS' },
    { id: 'TOEIC', label: 'Luyện thi TOEIC' },
    { id: 'COMMUNICATION', label: 'Tiếng Anh Giao Tiếp' },
    { id: 'BUSINESS', label: 'Tiếng Anh Doanh Nghiệp' },
  ]

  const filteredCourses = useMemo(() => {
    if (selectedCategory === 'MY_COURSES') {
      const myCourseIds = new Set(myCourses.map((mc) => mc.id))
      return courses.filter((c) => myCourseIds.has(c.id))
    }

    return courses.filter((c) => {
      const matchCat = selectedCategory === 'ALL' || c.type === selectedCategory
      const matchQuery =
        !debouncedSearch ||
        c.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (c.code ? c.code.toLowerCase().includes(debouncedSearch.toLowerCase()) : false)
      return matchCat && matchQuery
    })
  }, [courses, selectedCategory, debouncedSearch, myCourses])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Header */}
      <div className="space-y-4 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-400 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Danh Mục Khóa Học & Lộ Trình</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Chương Trình Đào Tạo Chuẩn Quốc Tế
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Được thiết kế bởi đội ngũ chuyên gia khảo thí IDP & British Council, tích hợp 100% công nghệ AI Co-pilot chấm bài tương tác.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên khóa, mã..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-80 rounded-[1.75rem] bg-slate-100 dark:bg-slate-800/50 animate-pulse"
            />
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 space-y-3 p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
          <BookOpen className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Không tìm thấy khóa học phù hợp
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Vui lòng thử lại với từ khóa khác hoặc xóa bộ lọc danh mục.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCategory('ALL')
              setSearchQuery('')
            }}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      )}
    </div>
  )
}

export default CourseList

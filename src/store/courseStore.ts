import { create } from 'zustand'
import { courseService, type Course, type Lesson } from '@/services/courseService'

interface CourseState {
  courses: Course[]
  activeCourse: Course | null
  lessons: Lesson[]
  activeLesson: Lesson | null
  completedLessonIds: string[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchCourses: (category?: string) => Promise<void>
  fetchCourseDetail: (id: string) => Promise<void>
  setActiveLesson: (lesson: Lesson) => void
  markLessonComplete: (lessonId: string) => void
  getProgressPercent: () => number
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  activeCourse: null,
  lessons: [],
  activeLesson: null,
  completedLessonIds: ['les-1', 'les-2'],
  isLoading: false,
  error: null,

  fetchCourses: async (category?: string) => {
    set({ isLoading: true, error: null })
    try {
      const data = await courseService.getAllCourses(category ? { category } : undefined)
      set({ courses: data, isLoading: false })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  fetchCourseDetail: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const course = await courseService.getCourseById(id)
      const lessons = await courseService.getCourseLessons(id)
      set({
        activeCourse: course,
        lessons,
        activeLesson: lessons[0] || null,
        isLoading: false,
      })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  setActiveLesson: (lesson: Lesson) => {
    set({ activeLesson: lesson })
  },

  markLessonComplete: (lessonId: string) => {
    const { completedLessonIds } = get()
    if (!completedLessonIds.includes(lessonId)) {
      set({ completedLessonIds: [...completedLessonIds, lessonId] })
    }
  },

  getProgressPercent: () => {
    const { lessons, completedLessonIds } = get()
    if (lessons.length === 0) return 0
    return Math.round((completedLessonIds.length / lessons.length) * 100)
  },
}))

export default useCourseStore


import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Clock, 
  BookOpen, 
  Users, 
  Star, 
  CheckCircle2, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Share2,
  BookmarkCheck,
  Calendar,
  FolderOpen
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { courseService } from '../../services/courseService';
import type { Course, Lesson } from '../../services/courseService';
import { formatVND } from '../../utils/formatters';
import { useAuthStore } from '../../store/authStore';
import { MaterialLibraryModal } from '../../components/specific/MaterialLibraryModal';
import { CoursePaymentModal } from '../../components/specific/CoursePaymentModal';
import { CourseReviewModal } from '../../components/specific/CourseReviewModal';
import { reviewService, type CourseReviewsResponse } from '../../services/reviewService';

export const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [reviewsData, setReviewsData] = useState<CourseReviewsResponse | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [openChapter, setOpenChapter] = useState<number | null>(0);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [courseData, lessonsData, reviews] = await Promise.all([
          courseService.getCourseById(id),
          courseService.getCourseLessons(id),
          reviewService.getCourseReviews(id).catch(() => null),
        ]);
        setCourse(courseData);
        setLessons(lessonsData);
        if (reviews) {
          setReviewsData(reviews);
        }
      } catch (err) {
        console.error('Failed to load course details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/courses/' + id);
      return;
    }
    if (!id || !course) return;

    // Open Payment Modal for purchase or free enrollment
    setIsPaymentModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader text="Đang tải thông tin chi tiết khóa học..." />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Không tìm thấy khóa học</h2>
        <p className="text-slate-500 mb-6">Khóa học bạn đang tìm kiếm có thể đã tạm đóng hoặc không tồn tại.</p>
        <Link to="/courses">
          <Button variant="primary">Khám phá các khóa học khác</Button>
        </Link>
      </div>
    );
  }

  // Chapters grouping preview
  const syllabus = [
    {
      title: 'Module 1: Tổng quan chiến lược & Phát triển Tư duy Phản biện',
      duration: '4 bài học • 95 phút',
      lessons: lessons.slice(0, 2),
    },
    {
      title: 'Module 2: Kỹ năng nâng cao & Phân tích cấu trúc Task 1 / Task 2',
      duration: '3 bài học • 75 phút',
      lessons: lessons.slice(2, 4),
    },
    {
      title: 'Module 3: Luyện đề mô phỏng & Đánh giá phân tích AI Co-Pilot',
      duration: '3 bài học • 110 phút',
      lessons: lessons.slice(4),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors">
      {/* Course Hero Banner */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Details */}
            <div className="lg:col-span-8 space-y-6">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30">
                  {course.category || course.type || 'IELTS'}
                </span>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Co-Pilot Enabled
                </span>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Cấp độ: {course.level || course.targetLevel || 'Intermediate'}
                </span>
              </div>

              {/* Title & Description */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white font-serif">
                {course.title}
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed max-w-3xl font-light">
                {course.description}
              </p>

              {/* Meta information row */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-slate-300 border-t border-slate-800">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{(reviewsData?.summary.averageRating || course.rating || 5.0).toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">
                    ({reviewsData?.summary.reviewCount ?? course.totalReviews ?? (course as any).reviewCount ?? 0} đánh giá)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary-400" />
                  <span>{(course.enrolledCount || course.enrolledStudents || 100).toLocaleString('vi-VN')} học viên đã tham gia</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Thời lượng: {course.duration || `${course.durationWeeks || 8} tuần`}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-sky-400" />
                  <span>Cập nhật gần nhất: 11/2026</span>
                </div>
              </div>

              {/* Instructor info chip */}
              <div className="flex items-center gap-4 pt-4">
                <img 
                  src={course.instructor?.avatar || course.instructorAvatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'} 
                  alt={course.instructor?.name || course.instructorName || 'Instructor'}
                  className="w-13 h-13 rounded-full object-cover ring-2 ring-primary-500/50 shadow-md"
                />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Giảng viên phụ trách</p>
                  <p className="text-base font-bold text-white hover:text-primary-300 transition-colors">
                    {course.instructor?.name || course.instructorName || 'Chuyên gia Ngôn ngữ'}
                  </p>
                  <p className="text-xs text-slate-300">{course.instructor?.title || 'Master Examiner'}</p>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Pricing Card */}
            <div className="lg:col-span-4 w-full">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sticky top-28 transition-all">
                {/* Thumbnail Preview */}
                <div className="relative rounded-2xl overflow-hidden aspect-video mb-6 group cursor-pointer shadow-inner">
                  <img 
                    src={course.thumbnail || course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center group-hover:bg-slate-950/20 transition-all">
                    <div className="w-14 h-14 rounded-full bg-white/90 text-primary-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-8 h-8 fill-primary-600 text-white" />
                    </div>
                  </div>
                  <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-md font-medium">
                    Xem trước khóa học
                  </span>
                </div>

                {/* Pricing section */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {formatVND(course.price || course.priceVND || 0)}
                    </span>
                    {(course.originalPrice || course.priceVND) && (
                      <span className="text-base text-slate-400 line-through">
                        {formatVND(course.originalPrice || Math.round((course.price || course.priceVND || 0) * 1.35))}
                      </span>
                    )}
                  </div>
                  {course.originalPrice && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                      Tiết kiệm {Math.round((1 - (course.price || course.priceVND || 0) / course.originalPrice) * 100)}% trong học kỳ này
                    </p>
                  )}
                </div>

                {/* Primary Action Button */}
                <div className="space-y-3">
                  <Button 
                    variant="primary" 
                    fullWidth 
                    size="lg"
                    onClick={handleEnroll}
                    className="shadow-xl shadow-primary-500/25"
                  >
                    Vào học ngay
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      fullWidth 
                      size="sm"
                      onClick={() => setIsSaved(!isSaved)}
                      className="border-slate-300 dark:border-slate-700"
                    >
                      <BookmarkCheck className={`w-4 h-4 mr-2 ${isSaved ? 'text-primary-600 fill-primary-600' : ''}`} />
                      {isSaved ? 'Đã lưu khóa học' : 'Lưu vào yêu thích'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => alert('Đã sao chép liên kết khóa học!')}
                      className="border-slate-300 dark:border-slate-700 px-3"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button 
                    variant="outline" 
                    fullWidth 
                    size="sm"
                    onClick={() => setIsMaterialModalOpen(true)}
                    className="border-slate-300 dark:border-slate-700 mt-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30"
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Tài liệu & Học liệu khóa học
                  </Button>
                </div>

                {/* Features included list */}
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs sm:text-sm">
                  <p className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs">
                    Khóa học bao gồm:
                  </p>
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{course.lessonsCount} bài giảng chất lượng cao full HD</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                    <Sparkles className="w-4 h-4 text-primary-500 shrink-0" />
                    <span>AI chấm điểm Writing & Speaking không giới hạn</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Truy cập trọn đời & cập nhật đề thi mới nhất</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Chứng chỉ hoàn thành được quốc tế công nhận</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 space-y-12">
            
            {/* What you'll learn */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <Award className="w-6 h-6 text-primary-500" />
                Bạn sẽ đạt được gì sau khóa học này?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Nắm vững toàn bộ 12 chủ điểm ngữ pháp và từ vựng trọng tâm',
                  'Chiến thuật tối ưu hóa thời gian làm bài phòng thi thực tế',
                  'Khả năng tự phân tích lỗi phát âm và ngữ pháp qua hệ thống AI Co-Pilot',
                  'Phương pháp lập dàn ý bài luận Task 2 đạt band điểm 7.0+ nhanh chóng',
                  'Phản xạ phát âm chuẩn theo chuẩn ngữ điệu người bản xứ Anh - Mỹ',
                  'Bộ tài liệu 50+ đề mẫu kèm lời giải chi tiết và audio transcript',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Syllabus / Curriculum */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-primary-500" />
                    Nội dung khóa học (Giáo trình chi tiết)
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    3 modules • {course.lessonsCount} bài học • {course.duration || `${course.durationWeeks || 8} tuần`} tổng thời lượng
                  </p>
                </div>
                <button 
                  onClick={() => setOpenChapter(openChapter === null ? 0 : null)}
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  {openChapter === null ? 'Mở rộng tất cả' : 'Thu gọn'}
                </button>
              </div>

              {/* Accordion modules */}
              <div className="space-y-4">
                {syllabus.map((chapter, cIdx) => {
                  const isOpen = openChapter === cIdx || openChapter === -1;
                  return (
                    <div 
                      key={cIdx} 
                      className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setOpenChapter(isOpen ? null : cIdx)}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
                            {chapter.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {chapter.duration}
                          </p>
                        </div>
                        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                      </button>

                      {isOpen && (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800/70 bg-white dark:bg-slate-900 px-6 py-2">
                          {chapter.lessons.length > 0 ? (
                            chapter.lessons.map((lesson) => (
                              <div key={lesson.id} className="py-3 flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3">
                                  <PlayCircle className="w-4 h-4 text-primary-500" />
                                  <span className="font-medium text-slate-700 dark:text-slate-200">
                                    {lesson.title}
                                  </span>
                                  {(lesson.orderIndex === 1 || lesson.order === 1) && (
                                    <span className="text-[10px] bg-primary-100 text-primary-700 dark:bg-primary-950/80 dark:text-primary-300 font-semibold px-2 py-0.5 rounded">
                                      Học thử miễn phí
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-slate-400">{lesson.duration}</span>
                              </div>
                            ))
                          ) : (
                            <div className="py-3 text-xs text-slate-400 italic">
                              Nội dung đang được hệ thống đồng bộ...
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instructor Bio detailed */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Về Giảng viên
              </h2>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <img 
                  src={course.instructor?.avatar || course.instructorAvatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'} 
                  alt={course.instructor?.name || course.instructorName || 'Instructor'}
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-primary-500/20 shadow-md shrink-0"
                />
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {course.instructor?.name || course.instructorName || 'Chuyên gia Ngôn ngữ'}
                    </h3>
                    <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                      {course.instructor?.title || 'Academic Director'}
                    </p>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                    Hơn 10 năm kinh nghiệm luyện thi chứng chỉ quốc tế và đào tạo hơn 15,000 học viên đạt mục tiêu band điểm từ 6.5 đến 8.5. Tác giả của nhiều bộ giáo trình luyện phản xạ Speaking & Writing được áp dụng rộng rãi tại các hệ thống trung tâm Anh ngữ hàng đầu.
                  </p>
                </div>
              </div>
            </div>

            {/* Student Reviews & Ratings Section (P16) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                    Đánh Giá Từ Học Viên
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Đánh giá chân thực từ các học viên đã ghi danh và hoàn thành lộ trình học tập.
                  </p>
                </div>

                {isAuthenticated && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="gap-2 shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold"
                  >
                    <Star className="w-4 h-4 fill-current" />
                    Viết đánh giá của bạn
                  </Button>
                )}
              </div>

              {/* Rating Summary Card */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 items-center">
                <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-2 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
                  <span className="text-5xl font-extrabold text-slate-900 dark:text-white">
                    {(reviewsData?.summary.averageRating || course.rating || 5.0).toFixed(1)}
                  </span>
                  <div className="flex items-center gap-1 my-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Dựa trên {reviewsData?.summary.reviewCount || (course as any).reviewCount || 0} lượt đánh giá thực tế
                  </span>
                </div>

                {/* Rating Distribution Bars */}
                <div className="md:col-span-8 space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviewsData?.summary.distribution?.[stars] || 0;
                    const total = reviewsData?.summary.reviewCount || 1;
                    const percent = Math.round((count / total) * 100);

                    return (
                      <div key={stars} className="flex items-center gap-3 text-xs">
                        <span className="w-12 font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </span>
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              {reviewsData && reviewsData.reviews.length > 0 ? (
                <div className="space-y-4 pt-2">
                  {reviewsData.reviews.map((r) => (
                    <div
                      key={r.id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-xs overflow-hidden border border-primary-500/20">
                            {r.student?.avatar ? (
                              <img src={r.student.avatar} alt={r.student.fullName} className="w-full h-full object-cover" />
                            ) : (
                              r.student?.fullName?.slice(0, 2).toUpperCase() || 'HV'
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {r.student?.fullName || 'Học viên'}
                            </h4>
                            <span className="text-[10px] text-slate-400">
                              {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= r.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300 dark:text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {r.comment && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-light pl-12">
                          "{r.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400 italic">
                  Chưa có nhận xét nào từ học viên cho khóa học này. Hãy hoàn thành khóa học để trở thành người đánh giá đầu tiên!
                </div>
              )}
            </div>

          </div>

          {/* Right column placeholder for layout stability on desktop */}
          <div className="hidden lg:block lg:col-span-4" />

        </div>
      </div>

      {/* Material Library Modal */}
      {course && (
        <MaterialLibraryModal
          isOpen={isMaterialModalOpen}
          onClose={() => setIsMaterialModalOpen(false)}
          courseId={course.id}
          courseTitle={course.title}
        />
      )}

      {/* Course Payment & Enrollment Modal (P14) */}
      {course && (
        <CoursePaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          course={course}
          onSuccess={() => {
            navigate(`/learn/${course.id}`);
          }}
        />
      )}

      {/* Course Review Modal (P16) */}
      {course && (
        <CourseReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          courseId={course.id}
          courseTitle={course.title}
          onSuccess={(newReview) => {
            setReviewsData((prev) => {
              const reviews = prev?.reviews || [];
              const exists = reviews.some((r) => r.id === newReview.id);
              const nextReviews = exists
                ? reviews.map((r) => (r.id === newReview.id ? newReview : r))
                : [newReview, ...reviews];
              const total = nextReviews.reduce((sum, r) => sum + r.rating, 0);
              const avg = nextReviews.length > 0 ? Number((total / nextReviews.length).toFixed(1)) : 5.0;
              return {
                reviews: nextReviews,
                summary: {
                  averageRating: avg,
                  reviewCount: nextReviews.length,
                  distribution: prev?.summary.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                },
              };
            });
          }}
        />
      )}
    </div>
  );
};

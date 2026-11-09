import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  FileText,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Award,
  Send,
  Menu,
  X,
  FolderOpen,
  Download,
  Music,
  Video as VideoIcon,
  FileCheck,
  Loader2,
  Calendar,
  ExternalLink,
  Trash2,
  Edit3,
  Radio,
  Clock,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VideoPlayer } from '../../components/specific/VideoPlayer';
import { QuizForm } from '../../components/specific/QuizForm';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { courseService } from '../../services/courseService';
import type { Course, Lesson } from '../../services/courseService';
import { materialService, type MaterialItem } from '../../services/materialService';
import { MaterialLibraryModal } from '../../components/specific/MaterialLibraryModal';
import {
  liveSessionService,
  type LiveSessionItem,
  checkLiveSessionJoinStatus
} from '../../services/liveSessionService';
import { LiveSessionModal } from '../../components/specific/LiveSessionModal';
import {
  certificateService,
  type CertificateItem
} from '../../services/certificateService';
import { CourseReviewModal } from '../../components/specific/CourseReviewModal';
import { useRole } from '../../hooks/useRole';
import { useToast } from '../../hooks/useToast';

export const LearningRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'video' | 'notes' | 'quiz' | 'ai-practice' | 'materials' | 'live-sessions'>('video');
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Materials & Storage State
  const [courseMaterials, setCourseMaterials] = useState<MaterialItem[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState<boolean>(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState<boolean>(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Live Sessions (P15) State
  const [liveSessions, setLiveSessions] = useState<LiveSessionItem[]>([]);
  const [liveSessionsLoading, setLiveSessionsLoading] = useState<boolean>(false);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState<boolean>(false);
  const [sessionToEdit, setSessionToEdit] = useState<LiveSessionItem | null>(null);

  // Certificate & Review (P16) State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [claimedCertificate, setClaimedCertificate] = useState<CertificateItem | null>(null);
  const [claimingCertificate, setClaimingCertificate] = useState<boolean>(false);
  const [celebrated, setCelebrated] = useState<boolean>(false);

  const { role } = useRole();
  const { success, error, info } = useToast();
  const isStaff = role === 'SUPER_ADMIN' || role === 'CENTER_MANAGER' || role === 'TEACHER';

  // AI Practice state
  const [aiPrompt] = useState<string>('Describe a memorable experience when you spoke English with a foreigner.');
  const [aiUserResponse, setAiUserResponse] = useState<string>('');
  const [aiEvaluating, setAiEvaluating] = useState<boolean>(false);
  const [aiFeedback, setAiFeedback] = useState<any | null>(null);

  useEffect(() => {
    const loadClassroom = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [courseData, lessonsData, materialsData, liveSessionsData, progressData] = await Promise.all([
          courseService.getCourseById(id),
          courseService.getCourseLessons(id),
          materialService.getCourseMaterials(id).catch(() => []),
          liveSessionService.getLiveSessions({ courseId: id }).catch(() => []),
          certificateService.checkProgress(id).catch(() => null),
        ]);
        setCourse(courseData);
        setLessons(lessonsData);
        setCourseMaterials(materialsData);
        setLiveSessions(liveSessionsData);
        if (progressData?.certificate) {
          setClaimedCertificate(progressData.certificate);
        }
        if (lessonsData.length > 0) {
          // If already has certificate or completed, mark all
          if (progressData?.certificate) {
            setCompletedLessonIds(new Set(lessonsData.map((l) => l.id)));
          } else {
            // Mark first lesson completed as sample progress
            setCompletedLessonIds(new Set([lessonsData[0].id]));
          }
        }
      } catch (err) {
        console.error('Error loading classroom:', err);
      } finally {
        setLoading(false);
      }
    };

    loadClassroom();
  }, [id]);

  const currentLesson = lessons[currentLessonIndex] || null;

  const handleTriggerCelebration = () => {
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#eab308', '#3b82f6', '#ec4899', '#a855f7'],
    });
  };

  const handleLessonEnded = () => {
    if (currentLesson) {
      const updated = new Set([...completedLessonIds, currentLesson.id]);
      setCompletedLessonIds(updated);
      if (lessons.length > 0 && updated.size === lessons.length && !celebrated) {
        setCelebrated(true);
        handleTriggerCelebration();
        success('Xuất sắc! 🎉', 'Bạn đã hoàn thành 100% khóa học. Chứng chỉ tốt nghiệp đã sẵn sàng!');
      }
    }
  };

  const handleClaimCertificate = async () => {
    if (!id) return;
    setClaimingCertificate(true);
    try {
      const cert = await certificateService.claimCertificate(id);
      setClaimedCertificate(cert);
      handleTriggerCelebration();
      success('Cấp chứng chỉ thành công!', `Chứng chỉ tốt nghiệp chính thức số ${cert.code} đã sẵn sàng.`);
      if (cert.certificateUrl) {
        window.open(cert.certificateUrl, '_blank');
      }
    } catch (err: any) {
      error('Không thể cấp chứng chỉ', err.response?.data?.message || err.message || 'Vui lòng hoàn thành đầy đủ bài học');
    } finally {
      setClaimingCertificate(false);
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex((prev) => prev + 1);
      setActiveTab('video');
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex((prev) => prev - 1);
      setActiveTab('video');
    }
  };

  const refreshMaterials = async () => {
    if (!id) return;
    setMaterialsLoading(true);
    try {
      const data = await materialService.getCourseMaterials(id);
      setCourseMaterials(data);
    } catch (err) {
      console.error('Failed to refresh materials:', err);
    } finally {
      setMaterialsLoading(false);
    }
  };

  const refreshLiveSessions = async () => {
    if (!id) return;
    setLiveSessionsLoading(true);
    try {
      const data = await liveSessionService.getLiveSessions({ courseId: id });
      setLiveSessions(data);
    } catch (err) {
      console.error('Failed to refresh live sessions:', err);
    } finally {
      setLiveSessionsLoading(false);
    }
  };

  const handleDeleteLiveSession = async (sessionId: string, sessionTitle: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa buổi học trực tuyến "${sessionTitle}"?`)) return;
    try {
      await liveSessionService.deleteLiveSession(sessionId);
      success('Đã xóa buổi học', `Lịch học trực tuyến "${sessionTitle}" đã được gỡ bỏ khỏi hệ thống.`);
      setLiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err: any) {
      error('Xóa thất bại', err.response?.data?.message || err.message || 'Không thể xóa buổi học');
    }
  };

  const handleDownloadMaterial = async (item: MaterialItem) => {
    setDownloadingId(item.id);
    info(`Đang tải tệp an toàn: ${item.title}...`);
    try {
      await materialService.downloadMaterial(item.id, item.title);
      success(`Tải tài liệu "${item.title}" thành công`);
    } catch (err: any) {
      console.error('Download error:', err);
      error(err.response?.data?.message || 'Không thể tải tệp tin');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleAiEvaluation = async () => {
    if (!aiUserResponse.trim()) return;
    setAiEvaluating(true);
    setAiFeedback(null);
    try {
      // Simulate quick intelligent AI response or call backend API
      await new Promise((r) => setTimeout(r, 1800));
      setAiFeedback({
        overallScore: '7.5 / 9.0',
        grammarScore: '8.0',
        vocabularyScore: '7.5',
        fluencyScore: '7.0',
        strengths: [
          'Sử dụng cấu trúc câu phức (Complex Sentences) rất tự nhiên.',
          'Vốn từ vựng chuyên đề (Collocations) chính xác: "break the ice", "cultural nuances".',
        ],
        improvements: [
          'Cần lưu ý lỗi chia thì quá khứ ở câu: "When we meet each other" -> "When we met each other".',
          'Nên đa dạng hóa liên từ nối câu như "Furthermore", "In retrospective".',
        ],
        modelAnswer:
          'A truly unforgettable encounter occurred during my trip to Da Nang last summer. While exploring the night market, I happened across a solo backpacker from London who was struggling to navigate the local street food stalls. Seizing the opportunity, I offered to interpret for him, which effortlessly broke the ice and led to an engaging two-hour conversation about our respective cultural traditions.',
      });
    } finally {
      setAiEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <Loader text="Đang chuẩn bị phòng học trực tuyến của bạn..." />
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy phòng học</h2>
        <Link to="/courses">
          <Button variant="primary">Quay lại danh sách khóa học</Button>
        </Link>
      </div>
    );
  }

  const progressPercent = Math.round((completedLessonIds.size / Math.max(lessons.length, 1)) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Learning Bar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <Link
            to={`/courses/${id}`}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Trang khóa học</span>
          </Link>
          <div className="h-4 w-[1px] bg-slate-700 hidden sm:block" />
          <div className="truncate max-w-[220px] sm:max-w-md">
            <h1 className="text-sm font-semibold text-white truncate">{course.title}</h1>
            <p className="text-xs text-slate-400 truncate">Bài {currentLessonIndex + 1}: {currentLesson.title}</p>
          </div>
        </div>

        {/* Progress & Sidebar Trigger */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-300">Tiến độ bài học</p>
              <p className="text-[11px] text-slate-400">{completedLessonIds.size}/{lessons.length} bài đã học ({progressPercent}%)</p>
            </div>
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

        {/* Left / Center: Interactive Classroom Stage */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Main Video Screen */}
          <div className="w-full bg-black max-w-5xl mx-auto shadow-2xl">
            <VideoPlayer
              videoUrl={currentLesson.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
              title={currentLesson.title}
              onEnded={handleLessonEnded}
            />
          </div>

          {/* Interactive Lesson Panel (Tabs & Content) */}
          <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
            {/* 100% Course Completion Celebration Banner (P16) */}
            {progressPercent === 100 && (
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-primary-500/15 border border-amber-500/35 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in-50 duration-500">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl animate-bounce">🎓</span>
                    <h3 className="text-base sm:text-lg font-extrabold text-white">
                      Chúc mừng bạn đã hoàn thành 100% khóa học!
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300">
                    Bạn đã xuất sắc vượt qua toàn bộ lộ trình bài học. Hãy tải Chứng chỉ tốt nghiệp chuẩn quốc tế và gửi đánh giá khóa học nhé!
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleClaimCertificate}
                    disabled={claimingCertificate}
                    className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg shadow-amber-500/25"
                  >
                    {claimingCertificate ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang tạo chứng chỉ...
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4" />
                        {claimedCertificate ? 'Tải Chứng Chỉ PDF' : 'Nhận & Tải Chứng Chỉ'}
                      </>
                    )}
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="gap-1.5 text-amber-300 border-amber-500/40 hover:bg-amber-500/10"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    Đánh giá khóa học
                  </Button>
                </div>
              </div>
            )}

            {/* Tab navigation */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('video')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'video'
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
              >
                <FileText className="w-4 h-4" />
                Tổng quan & Ghi chú
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'quiz'
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
              >
                <HelpCircle className="w-4 h-4" />
                Kiểm tra nhanh (Quiz)
              </button>

              <button
                onClick={() => setActiveTab('ai-practice')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'ai-practice'
                    ? 'bg-gradient-to-r from-primary-600 to-emerald-600 text-white shadow-lg shadow-primary-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Luyện viết cùng AI Co-Pilot
              </button>

              <button
                onClick={() => setActiveTab('materials')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'materials'
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
              >
                <FolderOpen className="w-4 h-4 text-primary-400" />
                Tài liệu & Đính kèm ({courseMaterials.length})
              </button>

              <button
                onClick={() => setActiveTab('live-sessions')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'live-sessions'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
              >
                <Radio className="w-4 h-4 text-rose-400" />
                Lớp học trực tuyến ({liveSessions.length})
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'video' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    {currentLesson.title}
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Trong bài học này, bạn sẽ nắm bắt các chiến lược cốt lõi để nâng cao band điểm một cách bài bản.
                    Hãy ghi chú các điểm quan trọng và thực hành ngay trên trình chấm điểm AI ở tab bên cạnh.
                  </p>
                </div>

                {/* Key takeaways card */}
                <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800">
                  <h3 className="text-sm font-semibold text-primary-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Mục tiêu trọng tâm của bài
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Xác định nhanh yêu cầu đề bài và phát hiện các bẫy thường gặp trong bài thi thật.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Cấu trúc bài nói/bài viết theo mô hình P.E.E.L (Point - Explanation - Evidence - Link).</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Ứng dụng 5 mẫu câu đảo ngữ và mệnh đề quan hệ rút gọn để ghi điểm ngữ pháp phức tạp.</span>
                    </li>
                  </ul>
                </div>

                {/* Action buttons footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevLesson}
                    disabled={currentLessonIndex === 0}
                    className="border-slate-700 text-slate-300"
                  >
                    Bài trước
                  </Button>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleLessonEnded}
                      className={completedLessonIds.has(currentLesson.id) ? 'text-emerald-400' : ''}
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      {completedLessonIds.has(currentLesson.id) ? 'Đã hoàn thành bài' : 'Đánh dấu đã học'}
                    </Button>
                    {currentLessonIndex === lessons.length - 1 ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleClaimCertificate}
                        disabled={claimingCertificate}
                        className="gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-md shadow-amber-500/20"
                      >
                        <Award className="w-4 h-4" />
                        Tải Chứng Chỉ
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleNextLesson}
                      >
                        Bài tiếp theo
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="py-2">
                <QuizForm
                  title={`Bài kiểm tra ôn tập: ${currentLesson.title}`}
                  questions={currentLesson.quizQuestions || []}
                  onComplete={(score: number) => {
                    handleLessonEnded();
                    console.log('Quiz completed with score:', score);
                  }}
                />
              </div>
            )}

            {activeTab === 'ai-practice' && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-white text-base">Chủ đề luyện viết phản xạ</h3>
                  </div>
                  <p className="text-slate-300 text-sm font-serif italic bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    "{aiPrompt}"
                  </p>

                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Bài làm của bạn (Viết bằng tiếng Anh từ 50 - 150 từ):
                    </label>
                    <textarea
                      value={aiUserResponse}
                      onChange={(e) => setAiUserResponse(e.target.value)}
                      placeholder="Type your response here in English..."
                      rows={5}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-sans"
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Số từ: {aiUserResponse.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      loading={aiEvaluating}
                      onClick={handleAiEvaluation}
                      disabled={!aiUserResponse.trim() || aiEvaluating}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Gửi AI Co-Pilot phân tích
                    </Button>
                  </div>
                </div>

                {/* AI Evaluation Result Card */}
                {aiFeedback && (
                  <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-primary-950/40 border border-primary-500/30 rounded-2xl p-6 space-y-6 shadow-xl animate-in fade-in-50 duration-500">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                          Kết quả phân tích chi tiết
                        </span>
                        <h4 className="text-xl font-extrabold text-white">Điểm ước lượng: {aiFeedback.overallScore}</h4>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-md text-slate-300">
                          Ngữ pháp: <strong className="text-emerald-400">{aiFeedback.grammarScore}</strong>
                        </span>
                        <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-md text-slate-300">
                          Từ vựng: <strong className="text-primary-400">{aiFeedback.vocabularyScore}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-950/70 p-4 rounded-xl border border-emerald-500/20">
                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                          Điểm sáng (Strengths):
                        </p>
                        <ul className="text-xs text-slate-300 space-y-2">
                          {aiFeedback.strengths.map((s: string, idx: number) => (
                            <li key={`strength-${idx}-${s.slice(0, 20)}`} className="flex items-start gap-2">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-slate-950/70 p-4 rounded-xl border border-amber-500/20">
                        <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                          Cần cải thiện (Improvements):
                        </p>
                        <ul className="text-xs text-slate-300 space-y-2">
                          {aiFeedback.improvements.map((s: string, idx: number) => (
                            <li key={`improve-${idx}-${s.slice(0, 20)}`} className="flex items-start gap-2">
                              <span className="text-amber-400 font-bold">•</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800">
                      <p className="text-xs font-bold text-primary-400 uppercase tracking-wider mb-1">
                        Bài mẫu đề xuất nâng cao (AI Band 8.5 Model):
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed font-serif italic">
                        "{aiFeedback.modelAnswer}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab Materials Content */}
            {activeTab === 'materials' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                      Tài liệu & Học liệu đính kèm
                    </h2>
                    <p className="text-sm text-slate-400">
                      Tài liệu bài giảng, giáo trình PDF, bài tập thực hành và audio luyện nghe được mã hóa an toàn.
                    </p>
                  </div>
                  {isStaff && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsMaterialModalOpen(true)}
                      className="shrink-0"
                    >
                      <FolderOpen className="w-4 h-4 mr-1.5" />
                      Quản lý & Tải lên tài liệu
                    </Button>
                  )}
                </div>

                {materialsLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                    <p className="text-sm">Đang tải danh sách tài liệu...</p>
                  </div>
                ) : courseMaterials.length === 0 ? (
                  <div className="bg-slate-900/60 rounded-2xl p-8 border border-slate-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Chưa có tài liệu đính kèm</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      {isStaff
                        ? 'Khóa học này chưa có tài liệu. Bấm nút "Quản lý & Tải lên tài liệu" để thêm tài liệu mới.'
                        : 'Giảng viên chưa tải lên tài liệu đính kèm cho bài học này.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courseMaterials.map((mat) => (
                      <div
                        key={mat.id}
                        className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between gap-4 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-3 rounded-xl bg-slate-800 border border-slate-700/60 text-primary-400 shrink-0">
                            {mat.fileType === 'AUDIO' ? (
                              <Music className="w-5 h-5 text-amber-400" />
                            ) : mat.fileType === 'VIDEO' ? (
                              <VideoIcon className="w-5 h-5 text-indigo-400" />
                            ) : mat.fileType === 'PDF' ? (
                              <FileText className="w-5 h-5 text-rose-400" />
                            ) : (
                              <FileCheck className="w-5 h-5 text-blue-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-white truncate" title={mat.title}>
                              {mat.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                              <span className="font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                                {mat.fileType}
                              </span>
                              {mat.fileSize && (
                                <span>{(mat.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
                              )}
                              <span>•</span>
                              <span>{new Date(mat.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            {mat.description && (
                              <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                                {mat.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                            <FileCheck className="w-3.5 h-3.5" />
                            Lưu trữ an toàn
                          </span>
                          <button
                            onClick={() => handleDownloadMaterial(mat)}
                            disabled={downloadingId === mat.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold transition disabled:opacity-50 shadow-md shadow-primary-500/20"
                          >
                            {downloadingId === mat.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            Tải về máy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'live-sessions' && (
              <div className="space-y-6 animate-in fade-in-50 duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
                      Lớp học trực tuyến & Phòng học ảo
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Tham gia các buổi học tương tác trực tiếp cùng giảng viên qua Google Meet / Zoom.
                      Link phòng học tự động kích hoạt trước giờ học 15 phút.
                    </p>
                  </div>

                  {isStaff && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSessionToEdit(null);
                        setIsLiveModalOpen(true);
                      }}
                      className="gap-2 bg-rose-600 hover:bg-rose-500 text-white shrink-0 shadow-lg shadow-rose-600/25"
                    >
                      <VideoIcon className="w-4 h-4" />
                      Lên lịch buổi học mới
                    </Button>
                  )}
                </div>

                {liveSessionsLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
                    <p className="text-sm">Đang tải lịch học trực tuyến...</p>
                  </div>
                ) : liveSessions.length === 0 ? (
                  <div className="bg-slate-900/60 rounded-2xl p-8 border border-slate-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-800 text-rose-400 flex items-center justify-center mx-auto">
                      <Radio className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Chưa có lịch học trực tuyến</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      {isStaff
                        ? 'Chưa có buổi học nào được tạo cho khóa này. Bấm nút "Lên lịch buổi học mới" để tạo phòng học ảo cho học viên.'
                        : 'Giảng viên chưa lên lịch buổi học trực tuyến mới. Thông báo sẽ xuất hiện tại đây và hòm thư khi có lịch học.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {liveSessions.map((session) => {
                      const joinInfo = checkLiveSessionJoinStatus(session);
                      const startDate = new Date(session.startTime);
                      const endDate = new Date(session.endTime);

                      return (
                        <div
                          key={session.id}
                          className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-lg"
                        >
                          <div className="space-y-3 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Platform Badge */}
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                                <span>{session.meetingPlatform === 'ZOOM' ? '🔵 Zoom' : session.meetingPlatform === 'MICROSOFT_TEAMS' ? '🟣 Teams' : '🟢 Google Meet'}</span>
                              </span>

                              {/* Class Badge */}
                              {session.class && (
                                <span className="px-2.5 py-1 rounded-md bg-primary-950/60 text-primary-400 text-xs font-medium border border-primary-800/40">
                                  {session.class.name}
                                </span>
                              )}

                              {/* Join Status Badge */}
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                                  joinInfo.status === 'ACTIVE'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : joinInfo.status === 'UPCOMING'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {joinInfo.status === 'ACTIVE' && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                )}
                                {joinInfo.status === 'UPCOMING' && <Clock className="w-3.5 h-3.5" />}
                                {joinInfo.label}
                                {joinInfo.countdownText ? ` (${joinInfo.countdownText})` : ''}
                              </span>
                            </div>

                            <div>
                              <h4 className="text-base font-bold text-white tracking-tight">
                                {session.title}
                              </h4>
                              {session.description && (
                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                  {session.description}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                              <div className="flex items-center gap-1.5 text-slate-300">
                                <Calendar className="w-3.5 h-3.5 text-primary-400" />
                                <span>
                                  {startDate.toLocaleDateString('vi-VN', {
                                    weekday: 'long',
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 text-slate-300">
                                <Clock className="w-3.5 h-3.5 text-primary-400" />
                                <span>
                                  {startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} -{' '}
                                  {endDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              {session.teacher && (
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full bg-slate-800 text-primary-400 border border-slate-700 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                                    {session.teacher.avatar ? (
                                      <img src={session.teacher.avatar} alt={session.teacher.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                      session.teacher.fullName.slice(0, 2).toUpperCase()
                                    )}
                                  </div>
                                  <span>GV: <strong className="text-slate-200">{session.teacher.fullName}</strong></span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Section */}
                          <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-center gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                            {joinInfo.canJoin ? (
                              <a
                                href={session.meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
                              >
                                <VideoIcon className="w-4 h-4" />
                                Vào lớp ngay
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <div className="w-full sm:w-auto text-right">
                                <button
                                  disabled
                                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-500 cursor-not-allowed text-xs font-semibold border border-slate-700/60"
                                >
                                  <VideoIcon className="w-4 h-4" />
                                  Vào lớp
                                </button>
                                <p className="text-[10px] text-slate-500 mt-1">
                                  {joinInfo.status === 'ENDED' ? 'Buổi học đã kết thúc' : 'Mở link trước giờ học 15 phút'}
                                </p>
                              </div>
                            )}

                            {isStaff && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSessionToEdit(session);
                                    setIsLiveModalOpen(true);
                                  }}
                                  className="p-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                                  title="Chỉnh sửa buổi học"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLiveSession(session.id, session.title)}
                                  className="p-1.5 text-xs text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                                  title="Xóa buổi học"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Lessons Curriculum Sidebar */}
        <aside
          className={`fixed inset-y-0 right-0 w-80 bg-slate-900 border-l border-slate-800 transform lg:transform-none transition-transform duration-300 z-30 lg:static flex flex-col ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
            }`}
        >
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-400" />
              Nội dung bài học
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2">
            {lessons.map((lesson, idx) => {
              const isActive = idx === currentLessonIndex;
              const isCompleted = completedLessonIds.has(lesson.id);

              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setCurrentLessonIndex(idx);
                    setActiveTab('video');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 my-1 ${isActive
                      ? 'bg-primary-600 text-white font-medium shadow-md shadow-primary-500/20'
                      : 'hover:bg-slate-800/80 text-slate-300'
                    }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                    ) : (
                      <Circle className={`w-4 h-4 ${isActive ? 'text-primary-200' : 'text-slate-600'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                      {idx + 1}. {lesson.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[11px] ${isActive ? 'text-primary-100' : 'text-slate-400'}`}>
                        {lesson.duration}
                      </span>
                      {lesson.quizQuestions && lesson.quizQuestions.length > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${isActive ? 'bg-primary-700 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                          Quiz
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-20 lg:hidden"
          />
        )}
      </div>

      {/* Material Library & Upload Modal for Classroom */}
      <MaterialLibraryModal
        isOpen={isMaterialModalOpen}
        onClose={() => {
          setIsMaterialModalOpen(false);
          refreshMaterials();
        }}
        courseId={course?.id}
        courseTitle={course?.title}
        lessonId={currentLesson?.id}
        lessonTitle={currentLesson?.title}
      />

      {/* Live Session Management Modal */}
      <LiveSessionModal
        isOpen={isLiveModalOpen}
        onClose={() => {
          setIsLiveModalOpen(false);
          void refreshLiveSessions();
        }}
        initialCourseId={course?.id}
        sessionToEdit={sessionToEdit}
        onSaved={(savedSession) => {
          setLiveSessions((prev) => {
            const exists = prev.some((s) => s.id === savedSession.id);
            if (exists) {
              return prev.map((s) => (s.id === savedSession.id ? savedSession : s));
            }
            return [savedSession, ...prev];
          });
        }}
      />

      {/* Course Review Modal (P16) */}
      <CourseReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        courseId={course?.id || id || ''}
        courseTitle={course?.title || 'Khóa học tiếng Anh'}
      />
    </div>
  );
};

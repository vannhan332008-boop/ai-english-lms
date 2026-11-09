import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  BookOpen, 
  Users, 
  Star,
  Eye,
  UserPlus
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import { courseService } from '../../services/courseService';
import type { Course } from '../../services/courseService';
import { adminService } from '../../services/adminService';
import type { CreateCourseInput } from '../../services/adminService';
import { formatVND } from '../../utils/formatters';
import { Link } from 'react-router-dom';
import { useMutation } from '../../hooks/useMutation';
import { EnrollStudentModal } from '../../components/specific/EnrollStudentModal';

export const CourseManage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [enrollCourseTarget, setEnrollCourseTarget] = useState<Course | null>(null);

  // Modal create course state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<CreateCourseInput>({
    title: '',
    description: '',
    category: 'IELTS',
    price: 1500000,
    originalPrice: 2000000,
    duration: '24 giờ học',
    level: 'Intermediate (5.0 - 6.5)',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    instructorId: 'inst-1',
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Standard Pessimistic Create Course Mutation
  const createCourseMutation = useMutation(adminService.createCourse, {
    successTitle: 'Khởi tạo thành công',
    successMessage: (course) => `Khóa học "${course.title}" đã được lưu trữ an toàn vào cơ sở dữ liệu!`,
    errorTitle: 'Không thể tạo khóa học',
    onSuccess: (newCourse) => {
      // Pessimistic update: only updates UI state with real DB object after server returns 201
      setCourses((prev) => [newCourse, ...prev]);
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'IELTS',
        price: 1500000,
        originalPrice: 2000000,
        duration: '24 giờ học',
        level: 'Intermediate (5.0 - 6.5)',
        thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
        instructorId: 'inst-1',
      });
    },
  });

  // Standard Pessimistic Delete Course Mutation
  const deleteCourseMutation = useMutation(adminService.deleteCourse, {
    successTitle: 'Đã xóa khóa học',
    successMessage: 'Khóa học đã được gỡ bỏ khỏi cơ sở dữ liệu thành công.',
    errorTitle: 'Không thể xóa khóa học',
    onSuccess: (_, courseId) => {
      // Pessimistic update: only removes from UI after DB confirms deletion
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    },
  });

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    await createCourseMutation.mutate(formData);
  };

  const handleDeleteCourse = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khóa học này khỏi hệ thống?')) {
      await deleteCourseMutation.mutate(id);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || c.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Quản trị Khóa học
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý giáo trình, bài giảng video, biểu phí đào tạo và cấu hình lộ trình AI
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo khóa học mới
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Tìm kiếm theo tiêu đề hoặc mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'IELTS', 'TOEIC', 'GIAO TIẾP', 'BUSINESS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'Tất cả' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses List / Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader text="Đang tải danh sách khóa học..." />
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Không tìm thấy khóa học nào</h3>
          <p className="text-sm text-slate-500 mb-6">Thử thay đổi bộ lọc tìm kiếm hoặc tạo khóa học mới.</p>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Tạo khóa học ngay
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-6">Khóa học</th>
                  <th className="py-3 px-6">Phân loại</th>
                  <th className="py-3 px-6">Học phí</th>
                  <th className="py-3 px-6">Học viên</th>
                  <th className="py-3 px-6">Đánh giá</th>
                  <th className="py-3 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.thumbnail}
                          alt={c.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                        <div className="min-w-0 max-w-xs sm:max-w-sm">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">
                            {c.title}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {c.lessonsCount} bài học • {c.duration}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-300 border border-primary-500/20">
                        {c.category}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {formatVND(c.price || c.priceVND || 0)}
                      </p>
                      {c.originalPrice && (
                        <p className="text-xs text-slate-400 line-through">
                          {formatVND(c.originalPrice)}
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>{(c.enrolledCount || c.enrolledStudents || 0).toLocaleString('vi-VN')}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{(c.rating || 5.0).toFixed(1)}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEnrollCourseTarget(c)}
                          title="Ghi danh học viên vào khóa học"
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                        <Link to={`/courses/${c.id}`} target="_blank">
                          <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => alert(`Chỉnh sửa khóa học: ${c.title}`)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo Khóa Học Mới"
        size="lg"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <Input
            label="Tiêu đề khóa học"
            placeholder="VD: Khóa Luyện Thi IELTS 7.0+ Chuyên Sâu"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Danh mục
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="IELTS">IELTS</option>
                <option value="TOEIC">TOEIC</option>
                <option value="GIAO TIẾP">Giao tiếp</option>
                <option value="BUSINESS">Business English</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Cấp độ mục tiêu
              </label>
              <input
                type="text"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                placeholder="VD: Intermediate (5.0 - 6.5)"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Học phí (VND)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              required
            />
            <Input
              label="Học phí gốc (VND - để hiển thị giảm giá)"
              type="number"
              value={formData.originalPrice || 0}
              onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Mô tả chi tiết khóa học
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Giới thiệu mục tiêu, phương pháp giảng dạy..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <Input
            label="URL Hình ảnh Thumbnail"
            value={formData.thumbnail}
            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} disabled={createCourseMutation.isLoading}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" loading={createCourseMutation.isLoading} disabled={createCourseMutation.isLoading}>
              Lưu & Xuất bản khóa học
            </Button>
          </div>
        </form>
      </Modal>

      {/* Enroll Student Modal */}
      {enrollCourseTarget && (
        <EnrollStudentModal
          isOpen={Boolean(enrollCourseTarget)}
          onClose={() => setEnrollCourseTarget(null)}
          courseId={enrollCourseTarget.id}
          courseTitle={enrollCourseTarget.title}
          onSuccess={() => {
            setCourses((prev) =>
              prev.map((c) =>
                c.id === enrollCourseTarget.id
                  ? {
                      ...c,
                      enrolledStudents: (c.enrolledStudents || 0) + 1,
                      enrolledCount: (c.enrolledCount || 0) + 1,
                    }
                  : c
              )
            )
          }}
        />
      )}
    </div>
  );
};

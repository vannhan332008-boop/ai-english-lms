import React, { Suspense } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/public/PublicLayout';
import { MainLayout } from '../layouts/MainLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { AuthLayout } from '../layouts/AuthLayout';

// Route Guards
import { PrivateRoute } from './PrivateRoute';
import { AdminRoute } from './AdminRoute';

// Common Page Fallback Loader
import { PageLoader } from '../components/common/PageLoader';

// ----------------------------------------------------------------------
// Code Splitting / Lazy Loading for Performance Optimization
// ----------------------------------------------------------------------

// Public Marketing SaaS Pages
const PublicHomePage = React.lazy(() =>
  import('../pages/public/HomePage').then((m) => ({ default: m.HomePage }))
);
const FeaturesPage = React.lazy(() =>
  import('../pages/public/FeaturesPage').then((m) => ({ default: m.FeaturesPage }))
);
const PricingPage = React.lazy(() =>
  import('../pages/public/PricingPage').then((m) => ({ default: m.PricingPage }))
);
const ContactPage = React.lazy(() =>
  import('../pages/public/ContactPage').then((m) => ({ default: m.ContactPage }))
);
const B2BRegisterPage = React.lazy(() =>
  import('../pages/public/B2BRegisterPage').then((m) => ({ default: m.B2BRegisterPage }))
);

// Client & Course Pages
const ClientHomePage = React.lazy(() =>
  import('../pages/client/HomePage').then((m) => ({ default: m.HomePage }))
);
const CourseList = React.lazy(() =>
  import('../pages/client/CourseList').then((m) => ({ default: m.CourseList }))
);
const CourseDetail = React.lazy(() =>
  import('../pages/client/CourseDetail').then((m) => ({ default: m.CourseDetail }))
);
const LearningRoom = React.lazy(() =>
  import('../pages/client/LearningRoom').then((m) => ({ default: m.LearningRoom }))
);

// Admin Pages
const AdminDashboard = React.lazy(() =>
  import('../pages/admin/Dashboard').then((m) => ({ default: m.Dashboard }))
);
const CourseManage = React.lazy(() =>
  import('../pages/admin/CourseManage').then((m) => ({ default: m.CourseManage }))
);
const UserManage = React.lazy(() =>
  import('../pages/admin/UserManage').then((m) => ({ default: m.UserManage }))
);

// Auth Pages
const LoginPage = React.lazy(() =>
  import('../pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = React.lazy(() =>
  import('../pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);

// Portal Features (Multi-portal workspace support)
const SuperAdminDashboard = React.lazy(() =>
  import('../features/super-admin/DashboardPage').then((m) => ({ default: m.SuperAdminDashboard }))
);
const SuperAdminTenantsPage = React.lazy(() =>
  import('../features/super-admin/TenantsPage').then((m) => ({ default: m.SuperAdminTenantsPage }))
);
const SuperAdminBillingPage = React.lazy(() =>
  import('../features/super-admin/BillingPage').then((m) => ({ default: m.SuperAdminBillingPage }))
);
const CenterManagerDashboard = React.lazy(() =>
  import('../features/center-manager/DashboardPage').then((m) => ({ default: m.CenterManagerDashboard }))
);
const CenterManagerTeachersPage = React.lazy(() =>
  import('../features/center-manager/TeachersPage').then((m) => ({ default: m.CenterManagerTeachersPage }))
);
const CenterManagerStudentsPage = React.lazy(() =>
  import('../features/center-manager/StudentsPage').then((m) => ({ default: m.CenterManagerStudentsPage }))
);
const CenterManagerClassesPage = React.lazy(() =>
  import('../features/center-manager/ClassesPage').then((m) => ({ default: m.CenterManagerClassesPage }))
);
const BrandSettingsPage = React.lazy(() =>
  import('../features/center-manager/BrandSettingsPage').then((m) => ({ default: m.BrandSettingsPage }))
);
const TeacherDashboard = React.lazy(() =>
  import('../features/teacher/DashboardPage').then((m) => ({ default: m.TeacherDashboard }))
);
const TeacherClassesPage = React.lazy(() =>
  import('../features/teacher/ClassesPage').then((m) => ({ default: m.TeacherClassesPage }))
);
const TeacherAssignmentsPage = React.lazy(() =>
  import('../features/teacher/AssignmentsPage').then((m) => ({ default: m.TeacherAssignmentsPage }))
);
const TeacherGradingPage = React.lazy(() =>
  import('../features/teacher/GradingStationPage').then((m) => ({ default: m.TeacherGradingPage }))
);
const TeacherLessonPlannerPage = React.lazy(() =>
  import('../features/teacher/LessonPlannerPage').then((m) => ({ default: m.TeacherLessonPlannerPage }))
);
const StudentDashboard = React.lazy(() =>
  import('../features/student/DashboardPage').then((m) => ({ default: m.StudentDashboard }))
);
const StudentPracticeLabPage = React.lazy(() =>
  import('../features/student/PracticeLabPage').then((m) => ({ default: m.StudentPracticeLabPage }))
);
const StudentMockTestPage = React.lazy(() =>
  import('../features/student/MockTestPage').then((m) => ({ default: m.StudentMockTestPage }))
);
const StudentFlashcardsPage = React.lazy(() =>
  import('../features/student/FlashcardsPage').then((m) => ({ default: m.StudentFlashcardsPage }))
);
const AISystemStudioPage = React.lazy(() =>
  import('../pages/admin/super/AISystemStudioPage').then((m) => ({ default: m.AISystemStudioPage }))
);

// 404 Not Found Page Component
const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
    <div className="w-20 h-20 rounded-3xl bg-primary-500/10 border border-primary-500/20 text-primary-400 flex items-center justify-center mb-6 text-3xl font-black">
      404
    </div>
    <h1 className="text-3xl font-black tracking-tight mb-2">Trang không tồn tại</h1>
    <p className="text-sm text-slate-400 max-w-md mb-8">
      Địa chỉ bạn truy cập có thể đã được thay đổi hoặc không khả dụng trên hệ thống EnglishFlow LMS.
    </p>
    <div className="flex gap-4">
      <Link
        to="/"
        className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl text-sm font-semibold transition-colors"
      >
        Trang chủ SaaS
      </Link>
      <Link
        to="/courses"
        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-semibold transition-colors"
      >
        Khám phá khóa học
      </Link>
    </div>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* 1. Public Marketing SaaS Website (PublicLayout: Dedicated, Fast, SEO-optimized) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PublicHomePage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/register-center" element={<B2BRegisterPage />} />
          <Route path="/onboarding" element={<Navigate to="/register-center" replace />} />
        </Route>

        {/* 2. Client & Course Catalog Portal (MainLayout) */}
        <Route element={<MainLayout />}>
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/explore" element={<CourseList />} />
          <Route path="/client/home" element={<ClientHomePage />} />
        </Route>

        {/* 3. Interactive Learning Room (Protected by PrivateRoute) */}
        <Route
          path="/learn/:id"
          element={
            <PrivateRoute>
              <LearningRoom />
            </PrivateRoute>
          }
        />

        {/* 4. Authentication Routes (AuthLayout) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
        </Route>

        {/* 5. Unified Admin Workspace Routes (/admin) */}
        <Route
          path="/admin"
          element={
            <AdminRoute allowedRoles={['SUPER_ADMIN', 'CENTER_MANAGER', 'TEACHER']}>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="courses" element={<CourseManage />} />
          <Route path="users" element={<UserManage />} />
          <Route path="brand" element={<BrandSettingsPage />} />
          <Route path="settings" element={<AISystemStudioPage />} />
        </Route>

        {/* 6. Direct Super Admin Workspace (/super-admin) */}
        <Route
          path="/super-admin"
          element={
            <AdminRoute allowedRoles={['SUPER_ADMIN']}>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="tenants" element={<SuperAdminTenantsPage />} />
          <Route path="billing" element={<SuperAdminBillingPage />} />
          <Route path="ai-studio" element={<AISystemStudioPage />} />
        </Route>

        {/* 7. Center Manager Workspace (/center-manager) */}
        <Route
          path="/center-manager"
          element={
            <AdminRoute allowedRoles={['SUPER_ADMIN', 'CENTER_MANAGER']}>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="/center-manager/dashboard" replace />} />
          <Route path="dashboard" element={<CenterManagerDashboard />} />
          <Route path="teachers" element={<CenterManagerTeachersPage />} />
          <Route path="students" element={<CenterManagerStudentsPage />} />
          <Route path="classes" element={<CenterManagerClassesPage />} />
          <Route path="courses" element={<CourseManage />} />
          <Route path="brand" element={<BrandSettingsPage />} />
        </Route>

        {/* 8. Teacher Portal (/teacher) */}
        <Route
          path="/teacher"
          element={
            <AdminRoute allowedRoles={['SUPER_ADMIN', 'CENTER_MANAGER', 'TEACHER']}>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="classes" element={<TeacherClassesPage />} />
          <Route path="assignments" element={<TeacherAssignmentsPage />} />
          <Route path="grading" element={<TeacherGradingPage />} />
          <Route path="lesson-planner" element={<TeacherLessonPlannerPage />} />
        </Route>

        {/* 9. Student Portal (/student) */}
        <Route
          path="/student"
          element={
            <AdminRoute allowedRoles={['SUPER_ADMIN', 'CENTER_MANAGER', 'TEACHER', 'STUDENT']}>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="practice" element={<StudentPracticeLabPage />} />
          <Route path="mock-test" element={<StudentMockTestPage />} />
          <Route path="flashcards" element={<StudentFlashcardsPage />} />
        </Route>

        {/* Convenient Redirect Shortcuts */}
        <Route path="/center" element={<Navigate to="/center-manager/dashboard" replace />} />
        <Route path="/center/dashboard" element={<Navigate to="/center-manager/dashboard" replace />} />
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

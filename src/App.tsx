import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { ToastProvider } from '@/components/ui/Toast'
import { RoleProvider } from '@/context/RoleContext'
import { PublicLayout } from '@/layouts/public/PublicLayout'
import { AdminLayout } from '@/layouts/admin/AdminLayout'
import { useRole } from '@/hooks/useRole'

// Public Pages
import { HomePage } from '@/pages/public/HomePage'
import { FeaturesPage } from '@/pages/public/FeaturesPage'
import { PricingPage } from '@/pages/public/PricingPage'
import { ContactPage } from '@/pages/public/ContactPage'

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterTenantPage } from '@/pages/auth/RegisterTenantPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'

// Super Admin Feature Pages
import { SuperAdminDashboard } from '@/features/super-admin/DashboardPage'
import { SuperAdminTenantsPage } from '@/features/super-admin/TenantsPage'
import { SuperAdminBillingPage } from '@/features/super-admin/BillingPage'

// Center Manager Feature Pages
import { CenterManagerDashboard } from '@/features/center-manager/DashboardPage'
import { CenterManagerTeachersPage } from '@/features/center-manager/TeachersPage'
import { CenterManagerStudentsPage } from '@/features/center-manager/StudentsPage'
import { CenterManagerClassesPage } from '@/features/center-manager/ClassesPage'

// Teacher Feature Pages
import { TeacherDashboard } from '@/features/teacher/DashboardPage'
import { TeacherClassesPage } from '@/features/teacher/ClassesPage'
import { TeacherAssignmentsPage } from '@/features/teacher/AssignmentsPage'
import { TeacherGradingPage } from '@/features/teacher/GradingStationPage'
import { TeacherLessonPlannerPage } from '@/features/teacher/LessonPlannerPage'

// Student Feature Pages
import { StudentDashboard } from '@/features/student/DashboardPage'
import { StudentPracticeLabPage } from '@/features/student/PracticeLabPage'
import { StudentMockTestPage } from '@/features/student/MockTestPage'
import { StudentFlashcardsPage } from '@/features/student/FlashcardsPage'

// Center Shared Pages
import { CurriculumBankPage } from '@/pages/admin/center/CurriculumBankPage'
import { AISystemStudioPage } from '@/pages/admin/super/AISystemStudioPage'

// Dynamic Dashboard Redirect based on Role
const DynamicAdminRedirect: React.FC = () => {
  const { role } = useRole()
  if (role === 'SUPER_ADMIN') {
    return <Navigate to="/super-admin/dashboard" replace />
  }
  if (role === 'TEACHER') {
    return <Navigate to="/teacher/dashboard" replace />
  }
  if (role === 'STUDENT') {
    return <Navigate to="/student/dashboard" replace />
  }
  return <Navigate to="/center-manager/dashboard" replace />
}

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <RoleProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Marketing Website */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Authentication Routes */}
                <Route path="/login" element={<Navigate to="/auth/login" replace />} />
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterTenantPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              </Route>

              {/* Direct alias for /center to /center-manager */}
              <Route path="/center" element={<Navigate to="/center-manager/dashboard" replace />} />
              <Route path="/center/dashboard" element={<Navigate to="/center-manager/dashboard" replace />} />
              <Route path="/center/teachers" element={<Navigate to="/center-manager/teachers" replace />} />
              <Route path="/center/students" element={<Navigate to="/center-manager/students" replace />} />
              <Route path="/center/classes" element={<Navigate to="/center-manager/classes" replace />} />

              {/* Super Admin Workspace (/super-admin) */}
              <Route path="/super-admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
                <Route path="dashboard" element={<SuperAdminDashboard />} />
                <Route path="tenants" element={<SuperAdminTenantsPage />} />
                <Route path="billing" element={<SuperAdminBillingPage />} />
                <Route path="ai-studio" element={<AISystemStudioPage />} />
                <Route path="settings" element={<AISystemStudioPage />} />
              </Route>

              {/* Center Manager Workspace (/center-manager) */}
              <Route path="/center-manager" element={<AdminLayout />}>
                <Route index element={<Navigate to="/center-manager/dashboard" replace />} />
                <Route path="dashboard" element={<CenterManagerDashboard />} />
                <Route path="classes" element={<CenterManagerClassesPage />} />
                <Route path="teachers" element={<CenterManagerTeachersPage />} />
                <Route path="students" element={<CenterManagerStudentsPage />} />
                <Route path="curriculum" element={<CurriculumBankPage />} />
                <Route path="ai-studio" element={<AISystemStudioPage />} />
              </Route>

              {/* Teacher Workspace (/teacher) */}
              <Route path="/teacher" element={<AdminLayout />}>
                <Route index element={<Navigate to="/teacher/dashboard" replace />} />
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="classes" element={<TeacherClassesPage />} />
                <Route path="assignments" element={<TeacherAssignmentsPage />} />
                <Route path="grading" element={<TeacherGradingPage />} />
                <Route path="lesson-planner" element={<TeacherLessonPlannerPage />} />
              </Route>

              {/* Student Workspace (/student) */}
              <Route path="/student" element={<AdminLayout />}>
                <Route index element={<Navigate to="/student/dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="practice" element={<StudentPracticeLabPage />} />
                <Route path="mock-test" element={<StudentMockTestPage />} />
                <Route path="flashcards" element={<StudentFlashcardsPage />} />
              </Route>

              {/* Legacy /admin Fallback & Role-aware Routing */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DynamicAdminRedirect />} />
                <Route path="dashboard" element={<DynamicAdminRedirect />} />
                <Route path="centers" element={<SuperAdminTenantsPage />} />
                <Route path="subscriptions" element={<SuperAdminBillingPage />} />
                <Route path="billing" element={<SuperAdminBillingPage />} />
                <Route path="teachers" element={<CenterManagerTeachersPage />} />
                <Route path="students" element={<CenterManagerStudentsPage />} />
                <Route path="classes" element={<CenterManagerClassesPage />} />
                <Route path="courses" element={<CurriculumBankPage />} />
                <Route path="ai-studio" element={<AISystemStudioPage />} />
                <Route path="*" element={<DynamicAdminRedirect />} />
              </Route>

              {/* Default Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </RoleProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App

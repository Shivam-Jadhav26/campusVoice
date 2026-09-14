import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import StudentComplaints from './pages/student/StudentComplaints';
import CreateComplaint from './pages/student/CreateComplaint';
import ComplaintDetail from './pages/student/ComplaintDetail';
import AcademicReview from './pages/student/AcademicReview';

// Teacher
import AssignedFeedback from './pages/student/AssignedFeedback';
import AssignFeedback from './pages/teacher/AssignFeedback';
import FacultyFeedbackResults from './pages/teacher/FacultyFeedbackResults';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherComplaints from './pages/teacher/TeacherComplaints';

// TG
import TGDashboard from './pages/tg/TGDashboard';
import TGComplaints from './pages/tg/TGComplaints';

// Class Incharge
import ClassInchargeDashboard from './pages/class_incharge/ClassInchargeDashboard';
import ClassInchargeComplaints from './pages/class_incharge/ClassInchargeComplaints';

// HOD
import HODDashboard from './pages/hod/HODDashboard';
import HODComplaints from './pages/hod/HODComplaints';
import HODAnalytics from './pages/hod/HODAnalytics';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import DepartmentsPage from './pages/admin/DepartmentsPage';
import SettingsPage from './pages/admin/SettingsPage';
import AuditLogs from './pages/admin/AuditLogs';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminComplaints from './pages/admin/AdminComplaints';

// Shared
import NotificationsPage from './pages/shared/NotificationsPage';
import ProfilePage from './pages/shared/ProfilePage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const RoleBasedRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  switch (user?.role) {
    case 'student': return <Navigate to="/student/dashboard" replace />;
    case 'teacher': return <Navigate to="/teacher/dashboard" replace />;
    case 'tg': return <Navigate to="/tg/dashboard" replace />;
    case 'class_incharge': return <Navigate to="/class-incharge/dashboard" replace />;
    case 'hod': return <Navigate to="/hod/dashboard" replace />;
    case 'admin': return <Navigate to="/admin/dashboard" replace />;
    default: return <Navigate to="/login" replace />;
  }
};

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { fontSize: '14px', maxWidth: '400px' },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<RoleBasedRedirect />} />

            {/* Student Routes */}
            <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/complaints" element={<ProtectedRoute allowedRoles={['student']}><StudentComplaints /></ProtectedRoute>} />
            <Route path="/student/complaints/create" element={<ProtectedRoute allowedRoles={['student']}><CreateComplaint /></ProtectedRoute>} />
            <Route path="/student/complaints/new" element={<ProtectedRoute allowedRoles={['student']}><CreateComplaint /></ProtectedRoute>} />
            <Route path="/student/complaints/:id" element={<ProtectedRoute allowedRoles={['student']}><ComplaintDetail /></ProtectedRoute>} />
            <Route path="/student/assigned-feedback" element={<ProtectedRoute allowedRoles={['student']}><AssignedFeedback /></ProtectedRoute>} />
            <Route path="/student/academic-review" element={<ProtectedRoute allowedRoles={['student']}><AcademicReview /></ProtectedRoute>} />
            <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student']}><NotificationsPage /></ProtectedRoute>} />
            <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><ProfilePage /></ProtectedRoute>} />

            {/* Teacher Routes */}
            <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher/assign-feedback" element={<ProtectedRoute allowedRoles={['teacher', 'tg', 'class_incharge', 'hod', 'admin']}><AssignFeedback /></ProtectedRoute>} />
            <Route path="/teacher/feedback-results" element={<ProtectedRoute allowedRoles={['teacher', 'tg', 'class_incharge', 'hod', 'admin']}><FacultyFeedbackResults /></ProtectedRoute>} />
            <Route path="/teacher/complaints" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherComplaints /></ProtectedRoute>} />
            <Route path="/teacher/complaints/:id" element={<ProtectedRoute allowedRoles={['teacher', 'tg', 'class_incharge', 'hod', 'admin']}><ComplaintDetail /></ProtectedRoute>} />
            <Route path="/teacher/notifications" element={<ProtectedRoute allowedRoles={['teacher']}><NotificationsPage /></ProtectedRoute>} />
            <Route path="/teacher/profile" element={<ProtectedRoute allowedRoles={['teacher']}><ProfilePage /></ProtectedRoute>} />

            {/* TG Routes */}
            <Route path="/tg/dashboard" element={<ProtectedRoute allowedRoles={['tg']}><TGDashboard /></ProtectedRoute>} />
            <Route path="/tg/complaints" element={<ProtectedRoute allowedRoles={['tg']}><TGComplaints /></ProtectedRoute>} />
            <Route path="/tg/complaints/:id" element={<ProtectedRoute allowedRoles={['tg', 'teacher', 'class_incharge', 'hod', 'admin']}><ComplaintDetail /></ProtectedRoute>} />
            <Route path="/tg/notifications" element={<ProtectedRoute allowedRoles={['tg']}><NotificationsPage /></ProtectedRoute>} />
            <Route path="/tg/profile" element={<ProtectedRoute allowedRoles={['tg']}><ProfilePage /></ProtectedRoute>} />

            {/* Class Incharge Routes */}
            <Route path="/class-incharge/dashboard" element={<ProtectedRoute allowedRoles={['class_incharge']}><ClassInchargeDashboard /></ProtectedRoute>} />
            <Route path="/class-incharge/complaints" element={<ProtectedRoute allowedRoles={['class_incharge']}><ClassInchargeComplaints /></ProtectedRoute>} />
            <Route path="/class-incharge/complaints/:id" element={<ProtectedRoute allowedRoles={['class_incharge']}><ComplaintDetail /></ProtectedRoute>} />
            <Route path="/class-incharge/notifications" element={<ProtectedRoute allowedRoles={['class_incharge']}><NotificationsPage /></ProtectedRoute>} />
            <Route path="/class-incharge/profile" element={<ProtectedRoute allowedRoles={['class_incharge']}><ProfilePage /></ProtectedRoute>} />

            {/* HOD Routes */}
            <Route path="/hod/dashboard" element={<ProtectedRoute allowedRoles={['hod']}><HODDashboard /></ProtectedRoute>} />
            <Route path="/hod/complaints" element={<ProtectedRoute allowedRoles={['hod']}><HODComplaints /></ProtectedRoute>} />
            <Route path="/hod/complaints/:id" element={<ProtectedRoute allowedRoles={['hod']}><ComplaintDetail /></ProtectedRoute>} />
            <Route path="/hod/analytics" element={<ProtectedRoute allowedRoles={['hod']}><HODAnalytics /></ProtectedRoute>} />
            <Route path="/hod/notifications" element={<ProtectedRoute allowedRoles={['hod']}><NotificationsPage /></ProtectedRoute>} />
            <Route path="/hod/profile" element={<ProtectedRoute allowedRoles={['hod']}><ProfilePage /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/complaints" element={<ProtectedRoute allowedRoles={['admin']}><AdminComplaints /></ProtectedRoute>} />
            <Route path="/admin/complaints/:id" element={<ProtectedRoute allowedRoles={['admin']}><ComplaintDetail /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
            <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={['admin']}><DepartmentsPage /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><SettingsPage /></ProtectedRoute>} />
            <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={['admin']}><AuditLogs /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['admin']}><NotificationsPage /></ProtectedRoute>} />
            <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><ProfilePage /></ProtectedRoute>} />

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;

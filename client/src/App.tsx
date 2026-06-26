import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { Login } from '@/components/auth/Login';
import { Register } from '@/components/auth/Register';
import { SetupPassword } from '@/components/auth/SetupPassword';
import { CourseDashboard } from '@/pages/student/CourseDashboard';
import { LessonView } from '@/pages/student/LessonView';
import { QuizView } from '@/pages/student/QuizView';
import { LessonManagement } from '@/pages/admin/LessonManagement';
import { Gradebook } from '@/pages/admin/Gradebook';
import { CourseManagement } from '@/pages/admin/CourseManagement';
import { UserManagement } from '@/pages/admin/UserManagement';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/setup-password" element={<SetupPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {/* Routes Étudiant */}
              <Route path="/student/courses" element={<CourseDashboard />} />
              <Route path="/student/lessons/:lessonId" element={<LessonView />} />
              <Route path="/student/quiz/:lessonId" element={<QuizView />} />
              <Route path="/student/quiz/result/:quizId" element={<QuizView />} />

              {/* Routes Admin */}
              <Route path="/admin/gradebook" element={<Gradebook />} />
              <Route path="/admin/courses" element={<CourseManagement />} />
              <Route path="/admin/lessons" element={<LessonManagement />} />
              <Route path="/admin/users" element={<UserManagement />} />

              <Route path="/" element={<Navigate to="/student/courses" replace />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

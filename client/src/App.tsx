import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { Login } from '@/components/auth/Login';
import { CourseDashboard } from '@/pages/student/CourseDashboard';
import { LessonView } from '@/pages/student/LessonView';
import { QuizView } from '@/pages/student/QuizView';

import { LessonManagement } from '@/pages/admin/LessonManagement';
import { Gradebook } from '@/pages/admin/Gradebook';

// Placeholder page
const SetupPassword = () => <div className="p-4">SetupPassword - À implémenter</div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/setup-password" element={<SetupPassword />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {/* Routes Étudiant */}
              <Route path="/student/courses" element={<CourseDashboard />} />
              <Route path="/student/lessons/:lessonId" element={<LessonView />} />
              
              {/* Route du Quiz pour y répondre */}
              <Route path="/student/quiz/:lessonId" element={<QuizView />} />
              
              {/* CORRECTION : Route d'affichage des résultats après soumission */}
              <Route path="/student/quiz/result/:quizId" element={<QuizView />} />
              
              {/* Routes Administrateur */}
              <Route path="/admin/gradebook" element={<Gradebook />} />
              <Route path="/admin/lessons" element={<LessonManagement />} />
              
              {/* Redirection par défaut */}
              <Route path="/" element={<Navigate to="/student/courses" replace />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, BarChart3, UploadCloud, GraduationCap, LogOut } from 'lucide-react';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-white">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-gray-900 tracking-tight text-lg">
              CORE<span className="text-blue-600">LAB</span>
            </span>
            <span className="hidden sm:block text-gray-600 text-sm font-medium ml-2 pl-2 border-l border-gray-200">
              Quiz &amp; Notes
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
        {/* Sidebar */}
        <nav className="w-52 flex-shrink-0 hidden lg:block">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-20">
            <div className="px-3 py-2.5 border-b border-gray-200">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">
                {user?.role === 'student' ? 'Espace Étudiant' : 'Espace Admin'}
              </p>
            </div>
            <ul className="p-2 flex flex-col gap-0.5">
              {user?.role === 'student' ? (
                <li>
                  <Link
                    to="/student/courses"
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                      ${isActive('/student') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                  >
                    <BookOpen className="w-4 h-4 flex-shrink-0" />
                    Mes Cours
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link
                      to="/admin/gradebook"
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                        ${isActive('/admin/gradebook') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                    >
                      <BarChart3 className="w-4 h-4 flex-shrink-0" />
                      Carnet de Notes
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/lessons"
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                        ${isActive('/admin/lessons') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                    >
                      <UploadCloud className="w-4 h-4 flex-shrink-0" />
                      Gestion des Leçons
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

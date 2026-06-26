import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { BookOpen, BarChart3, UploadCloud, GraduationCap, LogOut, Users, Bell } from 'lucide-react';

export const MainLayout = () => {
  const { user, token, logout } = useAuth();
  const location = useLocation();
  const [notifCount, setNotifCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<{ _id: string; message: string; isRead: boolean }[]>([]);

  const isActive = (path: string) => location.pathname.startsWith(path);
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) return;
    axios.get('/api/notifications', { headers })
      .then(r => {
        setNotifs(r.data);
        setNotifCount(r.data.filter((n: any) => !n.isRead).length);
      })
      .catch(() => {});
  }, [location.pathname]);

  const handleOpenNotif = async () => {
    setNotifOpen(o => !o);
    if (!notifOpen && notifCount > 0) {
      await axios.put('/api/notifications/read-all', {}, { headers }).catch(() => {});
      setNotifCount(0);
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  return (
    <div className="min-h-screen bg-white">
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

          <div className="flex items-center gap-2 relative">
            <div className="relative">
              <button onClick={handleOpenNotif}
                className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition">
                <Bell className="w-4 h-4" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-10 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-gray-100 text-xs font-semibold text-gray-600 uppercase">Notifications</div>
                  {notifs.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-6">Aucune notification</p>
                  ) : notifs.map(n => (
                    <div key={n._id} className={`px-4 py-3 text-sm border-b border-gray-50 last:border-0 ${n.isRead ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
                      {n.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Déconnexion">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
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
                  <Link to="/student/courses"
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                      ${isActive('/student') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                    <BookOpen className="w-4 h-4 flex-shrink-0" />
                    Mes Cours
                  </Link>
                </li>
              ) : (
                <>
                  {[
                    { to: '/admin/gradebook', icon: <BarChart3 className="w-4 h-4" />, label: 'Carnet de Notes' },
                    { to: '/admin/courses', icon: <BookOpen className="w-4 h-4" />, label: 'Cours' },
                    { to: '/admin/lessons', icon: <UploadCloud className="w-4 h-4" />, label: 'Leçons' },
                    { to: '/admin/users', icon: <Users className="w-4 h-4" />, label: 'Utilisateurs' },
                  ].map(({ to, icon, label }) => (
                    <li key={to}>
                      <Link to={to}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                          ${isActive(to) ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                        {icon}
                        {label}
                      </Link>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>
        </nav>

        <main className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

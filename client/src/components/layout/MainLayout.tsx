import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import { BookOpen, BarChart3, UploadCloud, GraduationCap, LogOut, Users, Bell, TrendingUp } from 'lucide-react';

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

  const studentLinks = [
    { to: '/student/courses', icon: <BookOpen className="w-4 h-4 flex-shrink-0" />, label: 'Mes Cours' },
    { to: '/student/progress', icon: <TrendingUp className="w-4 h-4 flex-shrink-0" />, label: 'Ma Progression' },
  ];

  const adminLinks = [
    { to: '/admin/suivi', icon: <TrendingUp className="w-4 h-4" />, label: 'Tableau de Suivi' },
    { to: '/admin/gradebook', icon: <BarChart3 className="w-4 h-4" />, label: 'Carnet de Notes' },
    { to: '/admin/courses', icon: <BookOpen className="w-4 h-4" />, label: 'Cours' },
    { to: '/admin/lessons', icon: <UploadCloud className="w-4 h-4" />, label: 'Leçons' },
    { to: '/admin/users', icon: <Users className="w-4 h-4" />, label: 'Utilisateurs' },
  ];

  const links = user?.role === 'student' ? studentLinks : adminLinks;

  return (
    <div className="min-h-screen bg-[#F1F7F6]">
      {/* ── Header dark brand ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#021B1A] shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#00DF81] flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-[#021B1A]" />
            </div>
            <span className="font-black text-white tracking-tight text-lg">
              CORE<span className="text-[#00DF81]">LAB</span>
            </span>
            <span className="hidden sm:block text-[#AACBC4] text-sm font-medium ml-2 pl-2 border-l border-[#03624C]">
              Quiz &amp; Notes
            </span>
          </div>

          <div className="flex items-center gap-2 relative">
            <div className="relative">
              <button onClick={handleOpenNotif}
                className="relative p-2 rounded-lg text-[#AACBC4] hover:bg-[#032221] hover:text-[#00DF81] transition">
                <Bell className="w-4 h-4" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#00DF81] text-[#021B1A] text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-10 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-gray-100 text-xs font-semibold text-[#03624C] uppercase tracking-wider">
                    Notifications
                  </div>
                  {notifs.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">Aucune notification</p>
                  ) : notifs.map(n => (
                    <div key={n._id} className={`px-4 py-3 text-sm border-b border-gray-50 last:border-0 ${n.isRead ? 'text-gray-400' : 'text-gray-900 font-medium'}`}>
                      {n.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#AACBC4] hover:text-red-400 hover:bg-[#032221] transition-colors"
              title="Déconnexion">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <nav className="w-52 flex-shrink-0 hidden lg:block">
          <div className="bg-white border border-[#AACBC4]/30 rounded-xl overflow-hidden sticky top-20 shadow-sm">
            <div className="px-3 py-3 bg-[#032221]">
              <p className="text-xs font-bold uppercase tracking-widest text-[#00DF81]">
                {user?.role === 'student' ? 'Espace Étudiant' : 'Espace Admin'}
              </p>
            </div>
            <ul className="p-2 flex flex-col gap-0.5">
              {links.map(({ to, icon, label }) => (
                <li key={to}>
                  <Link to={to}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                      ${isActive(to)
                        ? 'bg-[#00DF81]/15 text-[#03624C] font-semibold border border-[#00DF81]/30'
                        : 'text-gray-600 hover:bg-[#F1F7F6] hover:text-[#032221]'}`}>
                    {icon}
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* ── Contenu principal ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          <div className="bg-white border border-[#AACBC4]/30 rounded-xl p-5 sm:p-6 shadow-sm">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

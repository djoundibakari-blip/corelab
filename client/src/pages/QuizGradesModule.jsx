import React, { useState, useEffect } from 'react';
import { BookOpen, BarChart3, UploadCloud, GraduationCap, LogOut } from 'lucide-react';
import QuizViewV0 from './QuizViewV0';
import QuizImportV0 from './QuizImportV0';
import GradebookV0 from './GradebookV0';
import Login from './Login';

export default function QuizGradesModule() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('student');
  const [activeTab, setActiveTab] = useState('quiz');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setRole(JSON.parse(storedUser).role);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setRole(userData.role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setRole('student');
    setActiveTab('quiz');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setActiveTab(newRole === 'student' ? 'quiz' : 'gradebook');
  };

  const studentTabs = [
    { id: 'quiz', label: 'Passer le Quiz', icon: BookOpen },
  ];

  const adminTabs = [
    { id: 'gradebook', label: 'Carnet de Notes', icon: BarChart3 },
    { id: 'import', label: 'Importer un Quiz', icon: UploadCloud },
  ];

  const tabs = role === 'student' ? studentTabs : adminTabs;

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

          {/* Role switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg p-0.5 text-sm">
              <button
                onClick={() => handleRoleSwitch('student')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all duration-150 text-xs
                  ${role === 'student'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Vue Étudiant
              </button>
              <button
                onClick={() => handleRoleSwitch('admin')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all duration-150 text-xs
                  ${role === 'admin'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Vue Admin
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Role badge */}
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase border
              ${role === 'student'
                ? 'bg-blue-100 text-blue-600 border-blue-300'
                : 'bg-orange-100 text-orange-600 border-orange-300'
              }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${role === 'student' ? 'bg-blue-600' : 'bg-orange-600'}`} />
            {role === 'student' ? 'Étudiant' : 'Administrateur'}
          </span>
          <span className="text-xs text-gray-600">
            {role === 'student'
              ? 'Connecté en tant que Jane Doe · Parcours JavaScript'
              : 'Connecté en tant que Prof. Leclerc · Admin Module'}
          </span>
        </div>

        <div className="flex gap-6 flex-col lg:flex-row items-start">
          {/* Sidebar nav */}
          <nav className="w-full lg:w-52 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-3 py-2.5 border-b border-gray-200">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">
                  {role === 'student' ? 'Apprentissage' : 'Gestion'}
                </p>
              </div>
              <ul className="p-2 flex flex-col gap-0.5">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <li key={id}>
                    <button
                      onClick={() => setActiveTab(id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                        ${activeTab === id
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${activeTab === id ? 'text-blue-600' : ''}`} />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Info card */}
            {role === 'student' && (
              <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">
                  Module Actuel
                </p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    Fondamentaux JavaScript
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    5 questions · 70% pour réussir
                  </p>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progression du module</span>
                    <span className="text-blue-600 font-semibold">60%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="h-1.5 rounded-full bg-blue-600" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            )}
          </nav>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
              {activeTab === 'quiz' && <QuizViewV0 />}
              {activeTab === 'import' && <QuizImportV0 />}
              {activeTab === 'gradebook' && <GradebookV0 />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

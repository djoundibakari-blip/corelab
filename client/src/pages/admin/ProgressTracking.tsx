import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, CheckCircle2, XCircle, Minus, Users, BookOpen, Trophy, Search } from 'lucide-react';

interface CourseRow {
  courseId: string;
  courseTitle: string;
  quizzesTotal: number;
  quizzesAttempted: number;
  avgScore: number | null;
  passed: boolean;
  results: { quizTitle: string; score: number; passed: boolean }[];
}

interface StudentRow {
  student: { _id: string; firstName: string; lastName: string; email: string };
  courses: CourseRow[];
}

const StatCard = ({
  icon, label, value, sub, color, bar,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  bar?: number;
}) => (
  <div className="bg-[#021B1A] border border-[#03624C]/50 rounded-xl p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold text-[#707D7D] uppercase tracking-wider">{label}</p>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} bg-opacity-15`}>
        {icon}
      </div>
    </div>
    <div>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      {sub && <p className="text-xs text-[#707D7D] mt-0.5">{sub}</p>}
    </div>
    {bar !== undefined && (
      <div className="w-full bg-[#032221] rounded-full h-1.5 overflow-hidden">
        <div className={`h-1.5 rounded-full transition-all duration-500 ${bar >= 70 ? 'bg-[#00DF81]' : bar >= 40 ? 'bg-amber-400' : 'bg-red-500'}`}
          style={{ width: `${Math.min(bar, 100)}%` }} />
      </div>
    )}
  </div>
);

export const ProgressTracking = () => {
  const { token } = useAuth();
  const [data, setData] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios
      .get('/api/quiz-results/progress/admin', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setData(r.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [token]);

  const allCourses = Array.from(
    new Map(data.flatMap((row) => row.courses.map((c) => [c.courseId, c.courseTitle]))).entries()
  );

  const totalAttempted = data.reduce((acc, row) => acc + row.courses.reduce((a, c) => a + c.quizzesAttempted, 0), 0);
  const totalPassed = data.reduce((acc, row) => acc + row.courses.filter((c) => c.passed).length, 0);
  const totalCourseSlots = data.reduce((acc, row) => acc + row.courses.length, 0);
  const passRate = totalCourseSlots > 0 ? Math.round((totalPassed / totalCourseSlots) * 100) : 0;

  const filtered = data.filter((row) =>
    `${row.student.firstName} ${row.student.lastName} ${row.student.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 border-2 border-[#00DF81] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#707D7D]">Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-[#707D7D] mb-1">Espace Admin</p>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#00DF81]" />
          Tableau de Suivi
        </h2>
        <p className="text-sm text-[#AACBC4] mt-1">Progression des étudiants par cours et par quiz.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          icon={<Users className="w-4 h-4 text-[#AACBC4]" />}
          label="Étudiants inscrits"
          value={data.length}
          sub={data.length === 0 ? 'Aucun étudiant' : `${data.length} compte${data.length > 1 ? 's' : ''} actif${data.length > 1 ? 's' : ''}`}
          color="text-white"
        />
        <StatCard
          icon={<BookOpen className="w-4 h-4 text-[#00DF81]" />}
          label="Cours actifs"
          value={allCourses.length}
          sub={`${totalAttempted} quiz soumis au total`}
          color="text-[#00DF81]"
        />
        <StatCard
          icon={<Trophy className="w-4 h-4 text-[#00DF81]" />}
          label="Taux de réussite"
          value={`${passRate}%`}
          sub={`${totalPassed} cours validé${totalPassed > 1 ? 's' : ''} sur ${totalCourseSlots}`}
          color={passRate >= 70 ? 'text-[#00DF81]' : passRate >= 40 ? 'text-amber-400' : 'text-red-400'}
          bar={passRate}
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707D7D]" />
        <input type="text" placeholder="Rechercher un étudiant par nom ou email..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-[#021B1A] border border-[#03624C]/50 rounded-lg text-sm text-white placeholder:text-[#707D7D] focus:outline-none focus:ring-2 focus:ring-[#00DF81]" />
      </div>

      {/* Empty state */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 border border-dashed border-[#03624C]/50 rounded-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#00DF81]/10 flex items-center justify-center">
            <Users className="w-7 h-7 text-[#00DF81]" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-white mb-1">Aucun étudiant inscrit</p>
            <p className="text-sm text-[#707D7D]">Les données de progression apparaîtront ici dès que des étudiants passeront des quiz.</p>
          </div>
          <Link to="/admin/users"
            className="px-4 py-2 bg-[#00DF81] hover:bg-[#2CC295] text-[#021B1A] text-sm font-bold rounded-lg transition">
            Gérer les utilisateurs →
          </Link>
        </div>
      ) : allCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 border border-dashed border-[#03624C]/50 rounded-xl">
          <BookOpen className="w-10 h-10 text-[#00DF81]/40" />
          <p className="text-sm text-[#707D7D]">Aucune donnée de progression — les étudiants n'ont pas encore tenté de quiz.</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="border border-[#03624C]/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#021B1A] border-b border-[#03624C]/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#707D7D] uppercase sticky left-0 bg-[#021B1A]">
                      Étudiant
                    </th>
                    {allCourses.map(([id, title]) => (
                      <th key={id} className="text-center px-4 py-3 text-xs font-semibold text-[#707D7D] uppercase whitespace-nowrap">
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={allCourses.length + 1} className="text-center py-10 text-[#707D7D]">
                        Aucun résultat pour « {search} »
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row, i) => (
                      <tr key={row.student._id}
                        className={`border-b border-[#03624C]/30 last:border-0 transition ${i % 2 === 0 ? 'bg-[#032221]' : 'bg-[#021B1A]'}`}>
                        <td className="px-4 py-3.5 sticky left-0 bg-inherit">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#00DF81]/20 text-[#00DF81] text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {row.student.firstName[0]}{row.student.lastName[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-white leading-tight">{row.student.firstName} {row.student.lastName}</p>
                              <p className="text-xs text-[#707D7D]">{row.student.email}</p>
                            </div>
                          </div>
                        </td>
                        {allCourses.map(([courseId]) => {
                          const courseData = row.courses.find((c) => c.courseId.toString() === courseId);
                          if (!courseData || courseData.avgScore === null) {
                            return (
                              <td key={courseId} className="px-4 py-3 text-center">
                                <span className="inline-flex items-center gap-1 text-[#707D7D] text-xs">
                                  <Minus className="w-3.5 h-3.5" />
                                  Non tenté
                                </span>
                              </td>
                            );
                          }
                          const score = courseData.avgScore;
                          return (
                            <td key={courseId} className="px-4 py-3 text-center">
                              <div className="flex flex-col items-center gap-1.5">
                                <span className={`text-xl font-black ${score >= 70 ? 'text-[#00DF81]' : 'text-red-400'}`}>
                                  {score}%
                                </span>
                                <div className="w-16 bg-[#021B1A] rounded-full h-1 overflow-hidden">
                                  <div className={`h-1 rounded-full ${score >= 70 ? 'bg-[#00DF81]' : 'bg-red-500'}`}
                                    style={{ width: `${score}%` }} />
                                </div>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                                  courseData.passed
                                    ? 'bg-[#00DF81]/15 text-[#00DF81] border-[#00DF81]/30'
                                    : 'bg-red-900/30 text-red-400 border-red-700/50'
                                }`}>
                                  {courseData.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                  {courseData.passed ? 'Réussi' : 'Échoué'}
                                </span>
                                <p className="text-[10px] text-[#707D7D]">
                                  {courseData.quizzesAttempted}/{courseData.quizzesTotal} quiz
                                </p>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail per student */}
          {filtered.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-[#AACBC4] uppercase tracking-wide">Détail par étudiant</h3>
              {filtered.map((row) => (
                <div key={row.student._id} className="border border-[#03624C]/50 rounded-xl overflow-hidden">
                  <div className="bg-[#021B1A] px-4 py-3 border-b border-[#03624C]/50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#00DF81]/20 text-[#00DF81] text-sm font-bold flex items-center justify-center">
                      {row.student.firstName[0]}{row.student.lastName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{row.student.firstName} {row.student.lastName}</p>
                      <p className="text-xs text-[#707D7D]">{row.student.email}</p>
                    </div>
                  </div>
                  {row.courses.length === 0 ? (
                    <div className="px-4 py-4 flex items-center gap-2 text-sm text-[#707D7D]">
                      <BookOpen className="w-4 h-4" />
                      Non assigné à un cours.
                      <Link to="/admin/users" className="text-[#00DF81] hover:underline ml-1">Assigner →</Link>
                    </div>
                  ) : (
                    row.courses.map((course) => (
                      <div key={course.courseId} className="px-4 py-3 border-b border-[#03624C]/30 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-white text-sm">{course.courseTitle}</p>
                          {course.avgScore !== null && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${course.passed ? 'bg-[#00DF81]/15 text-[#00DF81]' : 'bg-red-900/30 text-red-400'}`}>
                              {course.avgScore}%
                            </span>
                          )}
                        </div>
                        {course.results.length === 0 ? (
                          <p className="text-xs text-[#707D7D]">Aucun quiz tenté.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {course.results.map((r, idx) => (
                              <span key={idx}
                                className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                                  r.passed
                                    ? 'bg-[#00DF81]/15 text-[#00DF81] border-[#00DF81]/30'
                                    : 'bg-red-900/30 text-red-400 border-red-700/50'
                                }`}>
                                {r.quizTitle} — {r.score}%
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

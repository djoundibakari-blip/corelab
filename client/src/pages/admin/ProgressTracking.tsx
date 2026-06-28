import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, CheckCircle2, XCircle, Minus } from 'lucide-react';

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

  const filtered = data.filter((row) =>
    `${row.student.firstName} ${row.student.lastName} ${row.student.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-8 text-sm text-[#707D7D]">Chargement...</div>;

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

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#021B1A] border border-[#03624C]/50 rounded-xl p-4">
          <p className="text-xs text-[#707D7D] font-medium uppercase tracking-wider">Étudiants</p>
          <p className="text-2xl font-black text-white mt-1">{data.length}</p>
        </div>
        <div className="bg-[#021B1A] border border-[#03624C]/50 rounded-xl p-4">
          <p className="text-xs text-[#707D7D] font-medium uppercase tracking-wider">Cours actifs</p>
          <p className="text-2xl font-black text-[#00DF81] mt-1">{allCourses.length}</p>
        </div>
        <div className="bg-[#021B1A] border border-[#03624C]/50 rounded-xl p-4">
          <p className="text-xs text-[#707D7D] font-medium uppercase tracking-wider">Quiz complétés</p>
          <p className="text-2xl font-black text-[#00DF81] mt-1">
            {data.reduce((acc, row) => acc + row.courses.reduce((a, c) => a + c.quizzesAttempted, 0), 0)}
          </p>
        </div>
      </div>

      <input type="text" placeholder="Rechercher un étudiant..." value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 bg-[#021B1A] border border-[#03624C]/50 rounded-lg text-sm text-white placeholder:text-[#707D7D] focus:outline-none focus:ring-2 focus:ring-[#00DF81]" />

      {allCourses.length === 0 ? (
        <p className="text-center py-12 text-[#707D7D] text-sm">Aucune donnée de progression disponible.</p>
      ) : (
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
                      Aucun résultat
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, i) => (
                    <tr key={row.student._id}
                      className={`border-b border-[#03624C]/30 last:border-0 transition ${i % 2 === 0 ? 'bg-[#032221]' : 'bg-[#021B1A]'}`}>
                      <td className="px-4 py-3 sticky left-0 bg-inherit">
                        <p className="font-semibold text-white">{row.student.firstName} {row.student.lastName}</p>
                        <p className="text-xs text-[#707D7D]">{row.student.email}</p>
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
                        return (
                          <td key={courseId} className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`text-lg font-black ${courseData.avgScore >= 70 ? 'text-[#00DF81]' : 'text-red-400'}`}>
                                {courseData.avgScore}%
                              </span>
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
      )}

      {filtered.length > 0 && (
        <div className="flex flex-col gap-4 mt-2">
          <h3 className="text-sm font-semibold text-[#AACBC4] uppercase tracking-wide">Détail par étudiant</h3>
          {filtered.map((row) => (
            <div key={row.student._id} className="border border-[#03624C]/50 rounded-xl overflow-hidden">
              <div className="bg-[#021B1A] px-4 py-3 border-b border-[#03624C]/50 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#00DF81]/20 text-[#00DF81] text-xs font-bold flex items-center justify-center">
                  {row.student.firstName[0]}{row.student.lastName[0]}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{row.student.firstName} {row.student.lastName}</p>
                  <p className="text-xs text-[#707D7D]">{row.student.email}</p>
                </div>
              </div>
              {row.courses.length === 0 ? (
                <p className="px-4 py-3 text-sm text-[#707D7D]">Non assigné à un cours.</p>
              ) : (
                row.courses.map((course) => (
                  <div key={course.courseId} className="px-4 py-3 border-b border-[#03624C]/30 last:border-0">
                    <p className="font-medium text-white text-sm mb-2">{course.courseTitle}</p>
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
    </div>
  );
};

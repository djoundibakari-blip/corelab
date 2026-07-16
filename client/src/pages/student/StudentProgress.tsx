import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import {
  TrendingUp, CheckCircle2, XCircle, Clock, BookOpen, ChevronDown, ChevronUp,
  Trophy, Target,
} from 'lucide-react';

interface Lesson { _id: string; title: string; order: number; }
interface Course { _id: string; title: string; description: string; category: string; lessons: Lesson[]; }
interface QuizResult {
  _id: string;
  quizId: { _id: string; lessonId: string; passingScore?: number };
  score: number;
  passed: boolean;
  submittedAt: string;
}
interface Quiz { _id: string; title: string; course: string; passingScore: number; }

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
      <div className="w-8 h-8 rounded-lg bg-[#00DF81]/10 flex items-center justify-center">
        {icon}
      </div>
    </div>
    <div>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      {sub && <p className="text-xs text-[#707D7D] mt-0.5">{sub}</p>}
    </div>
    {bar !== undefined && (
      <div className="w-full bg-[#032221] rounded-full h-1.5 overflow-hidden">
        <div className={`h-1.5 rounded-full transition-all duration-700 ${bar >= 70 ? 'bg-[#00DF81]' : bar >= 40 ? 'bg-amber-400' : 'bg-red-500'}`}
          style={{ width: `${Math.min(bar, 100)}%` }} />
      </div>
    )}
  </div>
);

export const StudentProgress = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    Promise.all([
      axios.get('/api/courses', { headers }).then((r) => setCourses(r.data)),
      axios.get('/api/quiz-results', { headers }).then((r) => setResults(r.data)),
      axios.get('/api/quizzes').then((r) => setQuizzes(r.data)),
    ])
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false));
  }, []);

  const toggleCourse = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const getResultsForCourse = (courseId: string) => {
    const courseQuizzes = quizzes.filter((q) => q.course?.toString() === courseId);
    return results.filter((r) =>
      courseQuizzes.some((q) => q._id.toString() === r.quizId?._id?.toString())
    );
  };

  const totalQuizzes = quizzes.length;
  const totalAttempted = results.length;
  const totalPassed = results.filter((r) => r.passed).length;
  const avgScore =
    results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length)
      : 0;
  const passRate = totalAttempted > 0 ? Math.round((totalPassed / totalAttempted) * 100) : 0;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 border-2 border-[#00DF81] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#707D7D]">Chargement de votre progression...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-[#707D7D] mb-1">Espace Étudiant</p>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#00DF81]" />
          Mon Tableau de Suivi
        </h2>
        <p className="text-sm text-[#AACBC4] mt-1">Votre progression sur tous vos cours et quiz.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<BookOpen className="w-4 h-4 text-[#AACBC4]" />}
          label="Cours inscrits"
          value={courses.length}
          sub={courses.length === 0 ? 'Aucun cours' : `${courses.length} cours actif${courses.length > 1 ? 's' : ''}`}
          color="text-white"
        />
        <StatCard
          icon={<Target className="w-4 h-4 text-[#00DF81]" />}
          label="Quiz tentés"
          value={`${totalAttempted} / ${totalQuizzes}`}
          sub={totalQuizzes === 0 ? 'Pas encore de quiz' : `${totalQuizzes - totalAttempted} restant${totalQuizzes - totalAttempted > 1 ? 's' : ''}`}
          color="text-[#00DF81]"
        />
        <StatCard
          icon={<Trophy className="w-4 h-4 text-[#00DF81]" />}
          label="Quiz réussis"
          value={totalPassed}
          sub={`Taux : ${passRate}%`}
          color={totalPassed > 0 ? 'text-[#00DF81]' : 'text-[#707D7D]'}
          bar={passRate}
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4 text-[#2CC295]" />}
          label="Score moyen"
          value={results.length > 0 ? `${avgScore}%` : '—'}
          sub={results.length > 0 ? (avgScore >= 70 ? 'Au-dessus du seuil' : 'En dessous du seuil') : 'Aucun quiz tenté'}
          color={avgScore >= 70 ? 'text-[#00DF81]' : results.length > 0 ? 'text-amber-400' : 'text-[#707D7D]'}
          bar={results.length > 0 ? avgScore : undefined}
        />
      </div>

      {/* Empty state: no courses */}
      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 border border-dashed border-[#03624C]/50 rounded-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#00DF81]/10 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-[#00DF81]" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-white mb-1">Aucun cours disponible</p>
            <p className="text-sm text-[#707D7D]">Votre administrateur doit vous assigner des cours pour démarrer.</p>
          </div>
          <Link to="/student/courses"
            className="px-4 py-2 bg-[#00DF81] hover:bg-[#2CC295] text-[#021B1A] text-sm font-bold rounded-lg transition">
            Voir mes cours →
          </Link>
        </div>
      ) : (
        <>
          {/* Summary table */}
          <div className="border border-[#03624C]/50 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-[#021B1A] border-b border-[#03624C]/50 flex items-center justify-between">
              <p className="text-xs font-semibold text-[#707D7D] uppercase tracking-wide">Vue synthétique</p>
              <span className="text-xs text-[#707D7D]">{courses.length} cours</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#03624C]/30 bg-[#021B1A]">
                    {['Cours', 'Leçons', 'Quiz tenté', 'Score', 'Statut', 'Action'].map((h, i) => (
                      <th key={h} className={`${i === 0 ? 'text-left' : 'text-center'} px-4 py-3 text-xs font-semibold text-[#707D7D] uppercase`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, i) => {
                    const courseResults = getResultsForCourse(course._id);
                    const best = courseResults.length > 0
                      ? courseResults.reduce((a, b) => (b.score > a.score ? b : a))
                      : null;
                    const courseQuizCount = quizzes.filter((q) => q.course?.toString() === course._id).length;

                    return (
                      <tr key={course._id}
                        className={`border-b border-[#03624C]/30 last:border-0 transition ${i % 2 === 0 ? 'bg-[#032221]' : 'bg-[#021B1A]'}`}>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-white">{course.title}</p>
                          <span className="text-xs text-[#00DF81] font-medium">{course.category}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="flex items-center justify-center gap-1 text-[#AACBC4]">
                            <BookOpen className="w-3.5 h-3.5" />
                            {course.lessons.length}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center text-[#AACBC4]">
                          {courseResults.length} / {courseQuizCount}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {best ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className={`font-black text-base ${best.passed ? 'text-[#00DF81]' : 'text-red-400'}`}>
                                {best.score}%
                              </span>
                              <div className="w-16 bg-[#021B1A] rounded-full h-1.5 overflow-hidden">
                                <div className={`h-1.5 rounded-full ${best.passed ? 'bg-[#00DF81]' : 'bg-red-500'}`}
                                  style={{ width: `${best.score}%` }} />
                              </div>
                            </div>
                          ) : (
                            <span className="text-[#707D7D]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {best ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              best.passed
                                ? 'bg-[#00DF81]/15 text-[#00DF81] border-[#00DF81]/30'
                                : 'bg-red-900/30 text-red-400 border-red-700/50'
                            }`}>
                              {best.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {best.passed ? 'Réussi' : 'Échoué'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border bg-[#021B1A] text-[#707D7D] border-[#03624C]/50">
                              <Clock className="w-3 h-3" />
                              Non tenté
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {course.lessons[0] && (
                            <Link to={`/student/lessons/${course.lessons[0]._id}`}
                              className="text-xs font-bold text-[#021B1A] bg-[#00DF81] hover:bg-[#2CC295] px-3 py-1.5 rounded-lg transition">
                              {best ? 'Continuer' : 'Commencer'}
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail accordion */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-[#707D7D] uppercase tracking-wide">Détail par cours</p>
            {courses.map((course) => {
              const courseResults = getResultsForCourse(course._id);
              const courseQuizzes = quizzes.filter((q) => q.course?.toString() === course._id);
              const isOpen = expanded[course._id] ?? false;
              const passedCount = courseResults.filter(r => r.passed).length;

              return (
                <div key={course._id} className="border border-[#03624C]/50 rounded-xl overflow-hidden">
                  <button onClick={() => toggleCourse(course._id)}
                    className="w-full flex items-center justify-between px-5 py-4 bg-[#021B1A] hover:bg-[#032221] transition text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#00DF81]/15 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-[#00DF81]" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{course.title}</p>
                        <p className="text-xs text-[#707D7D]">
                          {course.lessons.length} leçon{course.lessons.length > 1 ? 's' : ''} ·{' '}
                          {courseResults.length}/{courseQuizzes.length} quiz ·{' '}
                          {passedCount > 0 && <span className="text-[#00DF81]">{passedCount} réussi{passedCount > 1 ? 's' : ''}</span>}
                          {passedCount === 0 && 'aucun réussi'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {courseResults.length > 0 && (
                        <div className="w-24 bg-[#032221] rounded-full h-1.5 overflow-hidden">
                          <div className={`h-1.5 rounded-full ${passedCount / Math.max(courseResults.length, 1) >= 0.7 ? 'bg-[#00DF81]' : 'bg-amber-400'}`}
                            style={{ width: `${(passedCount / Math.max(courseResults.length, 1)) * 100}%` }} />
                        </div>
                      )}
                      {isOpen ? <ChevronUp className="w-4 h-4 text-[#707D7D]" /> : <ChevronDown className="w-4 h-4 text-[#707D7D]" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-[#03624C]/50 divide-y divide-[#03624C]/30">
                      <div className="px-5 py-4">
                        <p className="text-xs font-semibold text-[#707D7D] uppercase mb-3">Leçons disponibles</p>
                        <div className="flex flex-col gap-1.5">
                          {course.lessons.length === 0 ? (
                            <p className="text-sm text-[#707D7D]">Aucune leçon disponible.</p>
                          ) : (
                            course.lessons.map((lesson) => (
                              <Link key={lesson._id} to={`/student/lessons/${lesson._id}`}
                                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#00DF81]/10 group transition">
                                <div className="w-6 h-6 rounded-full bg-[#03624C]/40 group-hover:bg-[#00DF81]/20 flex items-center justify-center text-xs font-bold text-[#707D7D] group-hover:text-[#00DF81] flex-shrink-0">
                                  {lesson.order}
                                </div>
                                <span className="text-sm text-[#AACBC4] group-hover:text-white font-medium">{lesson.title}</span>
                              </Link>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="px-5 py-4">
                        <p className="text-xs font-semibold text-[#707D7D] uppercase mb-3">Résultats Quiz</p>
                        {courseResults.length === 0 ? (
                          <div className="flex flex-col gap-3 items-start">
                            <div className="flex items-center gap-2 text-sm text-[#707D7D]">
                              <Clock className="w-4 h-4" />
                              Aucun quiz tenté pour ce cours.
                            </div>
                            {courseQuizzes.length > 0 && course.lessons[0] && (
                              <Link to={`/student/quiz/${course.lessons[0]._id}`}
                                className="text-xs font-bold text-[#021B1A] bg-[#00DF81] hover:bg-[#2CC295] px-3 py-1.5 rounded-lg transition">
                                Passer le quiz →
                              </Link>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {courseResults.map((r) => (
                              <div key={r._id}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  r.passed ? 'bg-[#00DF81]/10 border-[#00DF81]/30' : 'bg-red-900/20 border-red-700/30'
                                }`}>
                                <div className="flex items-center gap-2">
                                  {r.passed
                                    ? <CheckCircle2 className="w-4 h-4 text-[#00DF81]" />
                                    : <XCircle className="w-4 h-4 text-red-400" />}
                                  <span className="text-sm font-medium text-white">{r.quizId?.lessonId ?? 'Quiz'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-20 bg-[#021B1A] rounded-full h-1.5 overflow-hidden">
                                    <div className={`h-1.5 rounded-full ${r.passed ? 'bg-[#00DF81]' : 'bg-red-500'}`}
                                      style={{ width: `${r.score}%` }} />
                                  </div>
                                  <span className={`text-sm font-black ${r.passed ? 'text-[#00DF81]' : 'text-red-400'}`}>
                                    {r.score}%
                                  </span>
                                  <span className="text-xs text-[#707D7D]">{formatDate(r.submittedAt)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

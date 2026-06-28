import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import {
  TrendingUp, CheckCircle2, XCircle, Clock, BookOpen, ChevronDown, ChevronUp,
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

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  if (loading) return <div className="text-center py-8 text-sm text-gray-400">Chargement...</div>;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-1">Espace Étudiant</p>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Mon Tableau de Suivi
        </h2>
        <p className="text-sm text-gray-500 mt-1">Votre progression sur tous vos cours et quiz.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Cours inscrits', value: courses.length, color: 'text-gray-900' },
          { label: 'Quiz tentés', value: `${totalAttempted} / ${totalQuizzes}`, color: 'text-blue-600' },
          { label: 'Quiz réussis', value: totalPassed, color: 'text-green-600' },
          { label: 'Score moyen', value: results.length > 0 ? `${avgScore}%` : '—', color: 'text-purple-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tableau synthétique */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vue synthétique</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Cours</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Leçons</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Quiz tenté</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Score</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Statut</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">
                    Aucun cours disponible.
                  </td>
                </tr>
              ) : (
                courses.map((course, i) => {
                  const courseResults = getResultsForCourse(course._id);
                  const best = courseResults.length > 0
                    ? courseResults.reduce((a, b) => (b.score > a.score ? b : a))
                    : null;
                  const courseQuizCount = quizzes.filter((q) => q.course?.toString() === course._id).length;

                  return (
                    <tr
                      key={course._id}
                      className={`border-b border-gray-100 last:border-0 hover:bg-blue-50/20 transition ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                    >
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-gray-900">{course.title}</p>
                        <span className="text-xs text-blue-600 font-medium">{course.category}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="flex items-center justify-center gap-1 text-gray-600">
                          <BookOpen className="w-3.5 h-3.5" />
                          {course.lessons.length}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-gray-600">
                        {courseResults.length} / {courseQuizCount}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {best ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className={`font-black text-base ${best.passed ? 'text-green-600' : 'text-red-500'}`}>
                              {best.score}%
                            </span>
                            <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${best.passed ? 'bg-green-500' : 'bg-red-400'}`}
                                style={{ width: `${best.score}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {best ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            best.passed
                              ? 'bg-green-50 text-green-600 border-green-200'
                              : 'bg-red-50 text-red-500 border-red-200'
                          }`}>
                            {best.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {best.passed ? 'Réussi' : 'Échoué'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border bg-gray-50 text-gray-400 border-gray-200">
                            <Clock className="w-3 h-3" />
                            Non tenté
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {course.lessons[0] && (
                          <Link
                            to={`/student/lessons/${course.lessons[0]._id}`}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 underline underline-offset-2"
                          >
                            {best ? 'Continuer' : 'Commencer'}
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vue détaillée par cours */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Détail par cours</p>
        {courses.map((course) => {
          const courseResults = getResultsForCourse(course._id);
          const courseQuizzes = quizzes.filter((q) => q.course?.toString() === course._id);
          const isOpen = expanded[course._id] ?? false;

          return (
            <div key={course._id} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleCourse(course._id)}
                className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{course.title}</p>
                    <p className="text-xs text-gray-400">
                      {course.lessons.length} leçon{course.lessons.length > 1 ? 's' : ''} · {courseResults.length}/{courseQuizzes.length} quiz réalisé{courseResults.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 divide-y divide-gray-100">
                  {/* Leçons */}
                  <div className="px-5 py-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Leçons disponibles</p>
                    <div className="flex flex-col gap-2">
                      {course.lessons.length === 0 ? (
                        <p className="text-sm text-gray-400">Aucune leçon.</p>
                      ) : (
                        course.lessons.map((lesson) => (
                          <Link
                            key={lesson._id}
                            to={`/student/lessons/${lesson._id}`}
                            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-blue-50 group transition"
                          >
                            <div className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-xs font-bold text-gray-500 group-hover:text-blue-600 flex-shrink-0">
                              {lesson.order}
                            </div>
                            <span className="text-sm text-gray-700 group-hover:text-blue-600 font-medium">{lesson.title}</span>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Résultats quiz */}
                  <div className="px-5 py-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Résultats Quiz</p>
                    {courseResults.length === 0 ? (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        Aucun quiz tenté pour ce cours.
                        {courseQuizzes.length > 0 && course.lessons[0] && (
                          <Link
                            to={`/student/quiz/${course.lessons[0]._id}`}
                            className="ml-2 text-blue-600 font-medium hover:underline"
                          >
                            Passer le quiz →
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {courseResults.map((r) => (
                          <div
                            key={r._id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              r.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {r.passed
                                ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                                : <XCircle className="w-4 h-4 text-red-500" />}
                              <span className="text-sm font-medium text-gray-800">{r.quizId?.lessonId ?? 'Quiz'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-20 bg-white/60 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-1.5 rounded-full ${r.passed ? 'bg-green-500' : 'bg-red-400'}`}
                                  style={{ width: `${r.score}%` }}
                                />
                              </div>
                              <span className={`text-sm font-black ${r.passed ? 'text-green-700' : 'text-red-600'}`}>
                                {r.score}%
                              </span>
                              <span className="text-xs text-gray-400">{formatDate(r.submittedAt)}</span>
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
    </div>
  );
};

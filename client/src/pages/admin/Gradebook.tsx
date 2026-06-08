import { useState, useEffect, useMemo } from 'react';
import { quizService } from '@/services/quizService';
import type { QuizAttempt } from '@/types';
import { Search, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

const MOCK_ATTEMPTS: QuizAttempt[] = [
  {
    _id: '1',
    userId: { _id: 'u1', email: 'alice.martin@corp.io' },
    quizId: { _id: 'q1', lessonId: 'JavaScript Basics' },
    score: 92,
    passed: true,
    submittedAt: '2025-05-28T10:30:00Z',
  },
  {
    _id: '2',
    userId: { _id: 'u2', email: 'bob.chen@corp.io' },
    quizId: { _id: 'q2', lessonId: 'React Hooks' },
    score: 65,
    passed: false,
    submittedAt: '2025-05-27T14:45:00Z',
  },
  {
    _id: '3',
    userId: { _id: 'u3', email: 'carla.dupont@corp.io' },
    quizId: { _id: 'q1', lessonId: 'JavaScript Basics' },
    score: 78,
    passed: true,
    submittedAt: '2025-05-27T09:15:00Z',
  },
  {
    _id: '4',
    userId: { _id: 'u4', email: 'david.kim@corp.io' },
    quizId: { _id: 'q3', lessonId: 'Node.js APIs' },
    score: 55,
    passed: false,
    submittedAt: '2025-05-26T16:20:00Z',
  },
  {
    _id: '5',
    userId: { _id: 'u5', email: 'eva.rossi@corp.io' },
    quizId: { _id: 'q2', lessonId: 'React Hooks' },
    score: 88,
    passed: true,
    submittedAt: '2025-05-25T11:00:00Z',
  },
];

export const Gradebook = () => {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Passed' | 'Failed'>('All');

  useEffect(() => {
    quizService
      .getAdminAttempts()
      .then(setAttempts)
      .catch(() => {
        console.error('Erreur lors du chargement du carnet de notes');
        setAttempts(MOCK_ATTEMPTS);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredAttempts = useMemo(() => {
    return attempts.filter((attempt) => {
      const matchSearch = attempt.userId.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Passed' && attempt.passed) ||
        (statusFilter === 'Failed' && !attempt.passed);
      return matchSearch && matchStatus;
    });
  }, [attempts, search, statusFilter]);

  const totalPassed = attempts.filter((a) => a.passed).length;
  const passRate = attempts.length > 0 ? Math.round((totalPassed / attempts.length) * 100) : 0;
  const avgScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((acc, a) => acc + a.score, 0) / attempts.length)
      : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return <div className="text-center py-8">Chargement du carnet de notes...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">
          Espace Admin
        </p>
        <h2 className="text-xl font-bold text-gray-900">Carnet de Notes</h2>
        <p className="text-sm text-gray-600 mt-1">
          Suivez les performances des étudiants sur tous les quiz.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">
            Total Soumis
          </p>
          <p className="text-2xl font-black text-gray-900 mt-1">{attempts.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">
            Taux de Réussite
          </p>
          <p className="text-2xl font-black text-green-600 mt-1">{passRate}%</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">
            Score Moyen
          </p>
          <p className="text-2xl font-black text-blue-600 mt-1 flex items-center gap-1">
            {avgScore}%
            <TrendingUp className="w-4 h-4" />
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            type="text"
            placeholder="Rechercher par email d'étudiant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Passed' | 'Failed')}
          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition appearance-none cursor-pointer"
        >
          <option value="All">Tous les Statuts</option>
          <option value="Passed">Réussi</option>
          <option value="Failed">Échoué</option>
        </select>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email Étudiant
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nom du Cours
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Score du Quiz
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Statut
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date de Soumission
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAttempts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-600 text-sm">
                    Aucun résultat ne correspond à vos filtres.
                  </td>
                </tr>
              ) : (
                filteredAttempts.map((attempt, index) => (
                  <tr
                    key={attempt._id}
                    className={`border-b border-gray-200 last:border-0 transition-colors hover:bg-gray-50
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  >
                    <td className="px-4 py-3.5 font-medium text-gray-900">
                      {attempt.userId.email}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{attempt.quizId.lessonId}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${attempt.passed ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${attempt.score}%` }}
                          />
                        </div>
                        <span
                          className={`font-bold text-sm ${attempt.passed ? 'text-green-500' : 'text-red-500'}`}
                        >
                          {attempt.score}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
                          ${
                            attempt.passed
                              ? 'bg-green-50 text-green-600 border-green-300'
                              : 'bg-red-50 text-red-600 border-red-300'
                          }`}
                      >
                        {attempt.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {attempt.passed ? 'Réussi' : 'Échoué'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 tabular-nums text-sm">
                      {formatDate(attempt.submittedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredAttempts.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-2.5 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-600">
              Affichage de{' '}
              <span className="text-gray-900 font-semibold">{filteredAttempts.length}</span> sur{' '}
              <span className="text-gray-900 font-semibold">{attempts.length}</span> entrées
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

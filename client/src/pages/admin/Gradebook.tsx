import { useState, useEffect, useMemo } from 'react';
import { quizService } from '@/services/quizService';
import type { QuizAttempt } from '@/types';
import { Search, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

export const Gradebook = () => {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Passed' | 'Failed'>('All');

  useEffect(() => {
    quizService
      .getAdminAttempts()
      .then(setAttempts)
      .catch(() => setAttempts([]))
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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  if (loading) return <div className="text-center py-8 text-[#AACBC4]">Chargement du carnet de notes...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-[#707D7D] mb-1">Espace Admin</p>
        <h2 className="text-xl font-bold text-white">Carnet de Notes</h2>
        <p className="text-sm text-[#AACBC4] mt-1">Suivez les performances des étudiants sur tous les quiz.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#021B1A] border border-[#03624C]/50 rounded-xl p-4">
          <p className="text-xs text-[#707D7D] font-medium uppercase tracking-wider">Total Soumis</p>
          <p className="text-2xl font-black text-white mt-1">{attempts.length}</p>
        </div>
        <div className="bg-[#021B1A] border border-[#03624C]/50 rounded-xl p-4">
          <p className="text-xs text-[#707D7D] font-medium uppercase tracking-wider">Taux de Réussite</p>
          <p className="text-2xl font-black text-[#00DF81] mt-1">{passRate}%</p>
        </div>
        <div className="bg-[#021B1A] border border-[#03624C]/50 rounded-xl p-4">
          <p className="text-xs text-[#707D7D] font-medium uppercase tracking-wider">Score Moyen</p>
          <p className="text-2xl font-black text-[#00DF81] mt-1 flex items-center gap-1">
            {avgScore}%
            <TrendingUp className="w-4 h-4" />
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707D7D]" />
          <input type="text" placeholder="Rechercher par email d'étudiant..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#021B1A] border border-[#03624C]/50 rounded-lg text-sm text-white placeholder:text-[#707D7D] focus:outline-none focus:ring-2 focus:ring-[#00DF81] transition" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Passed' | 'Failed')}
          className="bg-[#021B1A] border border-[#03624C]/50 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00DF81] transition appearance-none cursor-pointer">
          <option value="All">Tous les Statuts</option>
          <option value="Passed">Réussi</option>
          <option value="Failed">Échoué</option>
        </select>
      </div>

      <div className="border border-[#03624C]/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#03624C]/50 bg-[#021B1A]">
                {['Email Étudiant', 'Nom du Cours', 'Score du Quiz', 'Statut', 'Date de Soumission'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#707D7D] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAttempts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[#707D7D] text-sm">
                    Aucun résultat ne correspond à vos filtres.
                  </td>
                </tr>
              ) : (
                filteredAttempts.map((attempt, index) => (
                  <tr key={attempt._id}
                    className={`border-b border-[#03624C]/30 last:border-0 transition-colors hover:bg-[#021B1A]/50
                      ${index % 2 === 0 ? 'bg-[#032221]' : 'bg-[#021B1A]'}`}>
                    <td className="px-4 py-3.5 font-medium text-white">{attempt.userId.email}</td>
                    <td className="px-4 py-3.5 text-[#AACBC4]">{attempt.quizId.lessonId}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-[#021B1A] rounded-full h-1.5 overflow-hidden">
                          <div className={`h-1.5 rounded-full ${attempt.passed ? 'bg-[#00DF81]' : 'bg-red-500'}`}
                            style={{ width: `${attempt.score}%` }} />
                        </div>
                        <span className={`font-bold text-sm ${attempt.passed ? 'text-[#00DF81]' : 'text-red-400'}`}>
                          {attempt.score}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
                        ${attempt.passed
                          ? 'bg-[#00DF81]/15 text-[#00DF81] border-[#00DF81]/30'
                          : 'bg-red-900/30 text-red-400 border-red-700/50'}`}>
                        {attempt.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {attempt.passed ? 'Réussi' : 'Échoué'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[#AACBC4] tabular-nums text-sm">{formatDate(attempt.submittedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredAttempts.length > 0 && (
          <div className="border-t border-[#03624C]/50 px-4 py-2.5 bg-[#021B1A] flex items-center justify-between">
            <p className="text-xs text-[#707D7D]">
              Affichage de <span className="text-white font-semibold">{filteredAttempts.length}</span> sur{' '}
              <span className="text-white font-semibold">{attempts.length}</span> entrées
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { quizService } from '@/services/quizService';
import type { QuizAttempt } from '@/types';
import { Search, CheckCircle2, XCircle, TrendingUp, Trophy, BookOpen } from 'lucide-react';

const StatCard = ({
  label, value, sub, color, bar,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  bar?: number;
}) => (
  <div className="bg-[#021B1A] border border-[#03624C]/50 rounded-xl p-5 flex flex-col gap-3">
    <p className="text-xs font-semibold text-[#707D7D] uppercase tracking-wider">{label}</p>
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 border-2 border-[#00DF81] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#707D7D]">Chargement du carnet de notes...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-[#707D7D] mb-1">Espace Admin</p>
        <h2 className="text-xl font-bold text-white">Carnet de Notes</h2>
        <p className="text-sm text-[#AACBC4] mt-1">Suivez les performances des étudiants sur tous les quiz.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Quiz soumis"
          value={attempts.length}
          sub={`${totalPassed} réussi${totalPassed > 1 ? 's' : ''}, ${attempts.length - totalPassed} échoué${attempts.length - totalPassed > 1 ? 's' : ''}`}
          color="text-white"
        />
        <StatCard
          label="Taux de réussite"
          value={`${passRate}%`}
          sub={passRate >= 70 ? 'Classe performante' : passRate >= 40 ? 'En progression' : 'Des efforts restent à fournir'}
          color={passRate >= 70 ? 'text-[#00DF81]' : passRate >= 40 ? 'text-amber-400' : 'text-red-400'}
          bar={passRate}
        />
        <StatCard
          label="Score moyen"
          value={attempts.length > 0 ? `${avgScore}%` : '—'}
          sub={attempts.length > 0 ? (avgScore >= 70 ? 'Au-dessus du seuil (70%)' : 'En dessous du seuil (70%)') : 'Aucune donnée'}
          color={avgScore >= 70 ? 'text-[#00DF81]' : attempts.length > 0 ? 'text-amber-400' : 'text-[#707D7D]'}
          bar={attempts.length > 0 ? avgScore : undefined}
        />
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
          <option value="All">Tous les statuts</option>
          <option value="Passed">Réussi</option>
          <option value="Failed">Échoué</option>
        </select>
      </div>

      {attempts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 border border-dashed border-[#03624C]/50 rounded-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#00DF81]/10 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-[#00DF81]" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-white mb-1">Aucun résultat de quiz</p>
            <p className="text-sm text-[#707D7D]">Les résultats apparaîtront ici dès que les étudiants auront soumis des quiz.</p>
          </div>
          <Link to="/admin/lessons"
            className="px-4 py-2 bg-[#00DF81] hover:bg-[#2CC295] text-[#021B1A] text-sm font-bold rounded-lg transition">
            Gérer les leçons et quiz →
          </Link>
        </div>
      ) : (
        <div className="border border-[#03624C]/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#03624C]/50 bg-[#021B1A]">
                  {['Email Étudiant', 'Cours', 'Score', 'Statut', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#707D7D] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAttempts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-[#707D7D] text-sm">
                      Aucun résultat pour « {search || statusFilter} »
                    </td>
                  </tr>
                ) : (
                  filteredAttempts.map((attempt, index) => (
                    <tr key={attempt._id}
                      className={`border-b border-[#03624C]/30 last:border-0 transition-colors
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
          <div className="border-t border-[#03624C]/50 px-4 py-2.5 bg-[#021B1A] flex items-center justify-between">
            <p className="text-xs text-[#707D7D]">
              <span className="text-white font-semibold">{filteredAttempts.length}</span> sur{' '}
              <span className="text-white font-semibold">{attempts.length}</span> résultats
            </p>
            <div className="flex items-center gap-2 text-xs text-[#707D7D]">
              <TrendingUp className="w-3.5 h-3.5" />
              Score moyen affiché : <span className="text-[#00DF81] font-semibold ml-1">{avgScore}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

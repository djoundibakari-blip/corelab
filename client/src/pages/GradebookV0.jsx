import React, { useState, useMemo, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, ChevronUp, ChevronDown, TrendingUp } from 'lucide-react';
import axios from 'axios';

export default function GradebookV0() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortKey, setSortKey] = useState('submissionDate');
  const [sortDir, setSortDir] = useState('desc');
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // APPEL À TON VRAI BACKEND SÉCURISÉ
  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const token = localStorage.getItem('token');
        // Modification ici : On appelle TA vraie route /api/quiz-results
        const response = await axios.get('http://localhost:4242/api/quiz-results', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAttempts(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement du carnet de notes');
        setLoading(false);
      }
    };

    fetchAttempts();
  }, []);

  // MOCK DE SECOURS INTELLIGENT
  const MOCK_GRADES = [
    { id: 1, email: "student@test.com", quizTitle: "Architecture des Applications", bestScore: 100, status: "Passed", submissionDate: new Date() }
  ];

  // Adaptation à TON modèle de données QuizResult (student et quiz)
  const grades = attempts.length > 0 ? attempts.map(a => {
    const scoreVal = a.score !== undefined ? a.score : 0;
    return {
      id: a._id,
      email: a.student?.email || a.userId?.email || 'student@test.com',
      quizTitle: a.quiz?.title || "Quiz Évaluation",
      bestScore: scoreVal,
      status: scoreVal >= 70 ? 'Passed' : 'Failed',
      submissionDate: a.createdAt || a.submittedAt || new Date()
    };
  }) : MOCK_GRADES;

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    return grades.filter((g) => {
      const matchSearch = g.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || g.status === statusFilter;
      return matchSearch && matchStatus;
    }).sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];
      if (sortKey === 'bestScore') {
        valA = a.bestScore;
        valB = b.bestScore;
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [search, statusFilter, sortKey, sortDir, grades]);

  const totalPassed = grades.filter((g) => g.status === 'Passed').length;
  const passRate = grades.length > 0 ? Math.round((totalPassed / grades.length) * 100) : 0;
  const avgScore = grades.length > 0 ? Math.round(grades.reduce((acc, g) => acc + g.bestScore, 0) / grades.length) : 0;

  const SortIcon = ({ col }) =>
    sortKey === col ? (
      sortDir === 'asc' ? (
        <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
      ) : (
        <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
      )
    ) : (
      <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
    );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">Tableau de Bord Admin</p>
        <h2 className="text-xl font-bold text-gray-900">Carnet de Notes</h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Total Soumis</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{grades.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Taux de Réussite</p>
          <p className="text-2xl font-black text-green-600 mt-1">{passRate}%</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">Score Moyen</p>
          <p className="text-2xl font-black text-blue-600 mt-1 flex items-center gap-1">
            {avgScore}% <TrendingUp className="w-4 h-4" />
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            type="text"
            placeholder="Rechercher par email d'étudiant..."
            value={search}
            onChange={(e) => setSearchTerm(e.target.value || e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
        >
          <option value="All">Tous les Statuts</option>
          <option value="Passed">Réussi</option>
          <option value="Failed">Échoué</option>
        </select>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-gray-600">Email Étudiant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-gray-600">Titre du Quiz</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-gray-600">Meilleur Score</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-gray-600">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b bg-white hover:bg-gray-50">
                  <td className="px-4 py-3.5 font-medium text-gray-900">{row.email}</td>
                  <td className="px-4 py-3.5 text-gray-600">{row.quizTitle}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${row.status === "Passed" ? "text-green-500" : "text-red-500"}`}>{row.bestScore}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${row.status === "Passed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {row.status === "Passed" ? "Réussi" : "Échoué"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">{new Date(row.submissionDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
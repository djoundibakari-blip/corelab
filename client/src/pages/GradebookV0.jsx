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

  // Fetch attempts from backend
  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4242/api/quiz-attempts/admin', {
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

  // Fallback to mock data if backend fails
  const MOCK_GRADES = [
    { id: 1, email: "alice.martin@corp.io", quizTitle: "JavaScript Fundamentals", bestScore: 92, status: "Passed", submissionDate: "2025-05-28" },
    { id: 2, email: "bob.chen@corp.io", quizTitle: "React Hooks Deep Dive", bestScore: 65, status: "Failed", submissionDate: "2025-05-27" },
    { id: 3, email: "carla.dupont@corp.io", quizTitle: "JavaScript Fundamentals", bestScore: 78, status: "Passed", submissionDate: "2025-05-27" },
    { id: 4, email: "david.kim@corp.io", quizTitle: "Node.js & Express APIs", bestScore: 55, status: "Failed", submissionDate: "2025-05-26" },
    { id: 5, email: "eva.rossi@corp.io", quizTitle: "React Hooks Deep Dive", bestScore: 88, status: "Passed", submissionDate: "2025-05-25" },
    { id: 6, email: "frank.müller@corp.io", quizTitle: "MongoDB Schemas", bestScore: 72, status: "Passed", submissionDate: "2025-05-25" },
    { id: 7, email: "grace.lee@corp.io", quizTitle: "Node.js & Express APIs", bestScore: 48, status: "Failed", submissionDate: "2025-05-24" },
    { id: 8, email: "hugo.silva@corp.io", quizTitle: "MongoDB Schemas", bestScore: 95, status: "Passed", submissionDate: "2025-05-23" },
    { id: 9, email: "iris.ng@corp.io", quizTitle: "JavaScript Fundamentals", bestScore: 61, status: "Failed", submissionDate: "2025-05-22" },
    { id: 10, email: "jack.williams@corp.io", quizTitle: "React Hooks Deep Dive", bestScore: 83, status: "Passed", submissionDate: "2025-05-21" },
  ];

  const grades = attempts.length > 0 ? attempts.map(a => ({
    id: a._id,
    email: a.userId?.email || 'N/A',
    quizTitle: a.quizId?.lessonId || 'N/A',
    bestScore: a.score,
    status: a.passed ? 'Passed' : 'Failed',
    submissionDate: a.submittedAt
  })) : MOCK_GRADES;

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
  const passRate = Math.round((totalPassed / grades.length) * 100);
  const avgScore = Math.round(
    grades.reduce((acc, g) => acc + g.bestScore, 0) / grades.length
  );

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

  if (loading) {
    return <div className="text-center py-8">Chargement du carnet de notes...</div>;
  }

  if (error && attempts.length === 0) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">
          Tableau de Bord Admin
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
          <p className="text-2xl font-black text-gray-900 mt-1">
            {grades.length}
          </p>
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
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition appearance-none pr-8 cursor-pointer"
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
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 transition-colors select-none"
                  onClick={() => handleSort('email')}
                >
                  <span className="flex items-center gap-1">
                    Email Étudiant <SortIcon col="email" />
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Titre du Quiz
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 transition-colors select-none"
                  onClick={() => handleSort('bestScore')}
                >
                  <span className="flex items-center gap-1">
                    Meilleur Score <SortIcon col="bestScore" />
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Statut
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 transition-colors select-none"
                  onClick={() => handleSort('submissionDate')}
                >
                  <span className="flex items-center gap-1">
                    Date <SortIcon col="submissionDate" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-gray-600 text-sm"
                  >
                    Aucun résultat ne correspond à vos filtres.
                  </td>
                </tr>
              ) : (
                filtered.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-200 last:border-0 transition-colors hover:bg-gray-50
                      ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                  >
                    <td className="px-4 py-3.5 font-medium text-gray-900">
                      {row.email}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">
                      {row.quizTitle}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${row.status === "Passed" ? "bg-green-500" : "bg-red-500"}`}
                            style={{ width: `${row.bestScore}%` }}
                          />
                        </div>
                        <span
                          className={`font-bold text-sm ${row.status === "Passed" ? "text-green-500" : "text-red-500"}`}
                        >
                          {row.bestScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
                          ${
                            row.status === "Passed"
                              ? "bg-green-50 text-green-600 border-green-300"
                              : "bg-red-50 text-red-600 border-red-300"
                          }`}
                      >
                        {row.status === "Passed" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {row.status === "Passed" ? "Réussi" : "Échoué"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 tabular-nums text-sm">
                      {new Date(row.submissionDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-2.5 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-600">
              Affichage de{" "}
              <span className="text-gray-900 font-semibold">
                {filtered.length}
              </span>{" "}
              sur{" "}
              <span className="text-gray-900 font-semibold">
                {grades.length}
              </span>{" "}
              entrées
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

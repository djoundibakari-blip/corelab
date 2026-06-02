import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Gradebook = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, passed, failed
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredAttempts = attempts.filter(attempt => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'passed' && attempt.passed) ||
                         (filter === 'failed' && !attempt.passed);
    
    const matchesSearch = searchTerm === '' || 
                         attempt.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attempt.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return <div className="text-center py-8">Chargement du carnet de notes...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4">Carnet de Notes</h1>
        <p className="text-gray-600 mb-6">
          Vue d'ensemble de toutes les tentatives de quiz des étudiants
        </p>

        {/* Filtres */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter('passed')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'passed' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Validés
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'failed' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Échoués
            </button>
          </div>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left font-semibold">Étudiant</th>
                <th className="p-3 text-left font-semibold">Email</th>
                <th className="p-3 text-left font-semibold">Quiz</th>
                <th className="p-3 text-left font-semibold">Score</th>
                <th className="p-3 text-left font-semibold">Statut</th>
                <th className="p-3 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttempts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">
                    Aucune tentative trouvée
                  </td>
                </tr>
              ) : (
                filteredAttempts.map((attempt) => (
                  <tr key={attempt._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      {attempt.userId?.name || 'N/A'}
                    </td>
                    <td className="p-3">
                      {attempt.userId?.email || 'N/A'}
                    </td>
                    <td className="p-3">
                      {attempt.quizId?.lessonId || 'N/A'}
                    </td>
                    <td className="p-3 font-semibold">
                      {attempt.score}%
                    </td>
                    <td className="p-3">
                      {attempt.passed ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Validé
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Échoué
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {new Date(attempt.submittedAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Statistiques */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-gray-800">{attempts.length}</p>
              <p className="text-sm text-gray-600">Total tentatives</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-green-800">
                {attempts.filter(a => a.passed).length}
              </p>
              <p className="text-sm text-green-600">Validés</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-red-800">
                {attempts.filter(a => !a.passed).length}
              </p>
              <p className="text-sm text-red-600">Échoués</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gradebook;

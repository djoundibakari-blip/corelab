import React, { useState } from 'react';
import axios from 'axios';

const QuizImport = () => {
  const [file, setFile] = useState(null);
  const [lessonId, setLessonId] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = JSON.parse(event.target.result);
          setFile(content);
          setError(null);
        } catch (err) {
          setError('Format de fichier invalide. Veuillez utiliser un fichier JSON valide.');
          setFile(null);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    if (!lessonId) {
      setError('Veuillez entrer l\'ID de la leçon');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:4242/api/quizzes/import', {
        lessonId,
        questions: file.questions || [],
        passingScore,
        answers: file.answers || []
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(true);
      setFile(null);
      setLessonId('');
      setPassingScore(70);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'import du quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4">Importer un Quiz</h1>
        <p className="text-gray-600 mb-6">
          Téléversez un fichier JSON contenant la structure du quiz avec les questions, options et réponses correctes.
        </p>

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
            <p className="text-green-700">Quiz importé avec succès !</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              ID de la leçon *
            </label>
            <input
              type="text"
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 507f1f77bcf86cd799439011"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Note minimale de réussite (%)
            </label>
            <input
              type="number"
              value={passingScore}
              onChange={(e) => setPassingScore(parseInt(e.target.value))}
              min="0"
              max="100"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Fichier JSON du quiz *
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Format attendu: {`{"questions": [{"questionText": "...", "options": ["...", "..."]}], "answers": [0, 1]}`}
            </p>
          </div>

          {file && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold mb-2">Aperçu du fichier:</p>
              <p className="text-sm text-gray-600">
                {file.questions?.length || 0} question(s) détectée(s)
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
              loading
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Import en cours...' : 'Importer le quiz'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuizImport;

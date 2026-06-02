import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const QuizView = () => {
  const { lessonId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:4242/api/quizzes/lesson/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuiz(response.data);
        setUserAnswers(new Array(response.data.questions.length).fill(null));
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement du quiz');
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [lessonId]);

  const handleAnswerChange = (questionIndex, selectedAnswer) => {
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = selectedAnswer;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (userAnswers.some(a => a === null)) {
      setError('Veuillez répondre à toutes les questions');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:4242/api/quizzes/${quiz._id}/submit`, 
        { userAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(response.data);
      setSubmitted(true);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission');
    }
  };

  const handleRetry = () => {
    setUserAnswers(new Array(quiz.questions.length).fill(null));
    setSubmitted(false);
    setResult(null);
    setError(null);
  };

  const handleContinue = () => {
    // Navigation vers la suite (à implémenter selon le routing)
    console.log('Continuer vers la leçon suivante');
  };

  if (loading) {
    return <div className="text-center py-8">Chargement du quiz...</div>;
  }

  if (error && !submitted) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (!quiz) {
    return <div className="text-center py-8">Quiz non trouvé</div>;
  }

  if (submitted && result) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-3xl font-bold mb-4">Résultat du Quiz</h2>
          
          {result.passed ? (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-green-800">Quiz réussi !</h3>
                  <p className="mt-1 text-green-700">Score: {result.score}%</p>
                </div>
              </div>
              <button
                onClick={handleContinue}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Passer à la suite
              </button>
            </div>
          ) : (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-red-800">Quiz non réussi</h3>
                  <p className="mt-1 text-red-700">Score: {result.score}% (Minimum: {quiz.passingScore}%)</p>
                  <p className="mt-2 text-red-600">Ne vous découragez pas ! Révisez le cours et réessayez.</p>
                </div>
              </div>
              <button
                onClick={handleRetry}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Recommencer le quiz
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Quiz</h1>
        <p className="text-gray-600 mb-4">Note minimale requise: {quiz.passingScore}%</p>
        
        {quiz.questions.map((question, index) => (
          <div key={index} className="mb-6 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              Question {index + 1}: {question.questionText}
            </h3>
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={optionIndex}
                    checked={userAnswers[index] === optionIndex}
                    onChange={() => handleAnswerChange(index, optionIndex)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={userAnswers.some(a => a === null)}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
            userAnswers.every(a => a !== null)
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Soumettre le test
        </button>
      </div>
    </div>
  );
};

export default QuizView;

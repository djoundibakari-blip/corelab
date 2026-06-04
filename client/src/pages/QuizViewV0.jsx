import React, { useState, useEffect } from 'react';
import { ChevronRight, Clock } from 'lucide-react';
import QuizResult from './QuizResult';
import axios from 'axios';

export default function QuizViewV0() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch quiz from backend
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem('token');
        // Utiliser un lessonId par défaut pour la démo
        const lessonId = '507f1f77bcf86cd799439011';
        const response = await axios.get(`http://localhost:4242/api/quizzes/lesson/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuiz(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors du chargement du quiz');
        setLoading(false);
      }
    };

    fetchQuiz();
  }, []);

  // Fallback to mock data if backend fails
  const MOCK_QUIZ = {
    title: "Fondamentaux JavaScript",
    passingScore: 70,
    questions: [
      {
        id: 1,
        text: "Quel mot-clé est utilisé pour déclarer une variable avec une portée de bloc en JavaScript moderne ?",
        options: ["var", "let", "def", "dim"],
      },
      {
        id: 2,
        text: "Que retourne la méthode Array `.map()` ?",
        options: [
          "Le tableau original modifié",
          "Un nouveau tableau de la même longueur",
          "Un sous-ensemble filtré du tableau",
          "La somme de tous les éléments",
        ],
      },
      {
        id: 3,
        text: "Lequel des éléments suivants n'est PAS un type primitif en JavaScript ?",
        options: ["string", "boolean", "object", "number"],
      },
      {
        id: 4,
        text: "Qu'est-ce que `===` vérifie en JavaScript ?",
        options: [
          "La valeur uniquement",
          "Le type uniquement",
          "La valeur et le type",
          "L'égalité de référence",
        ],
      },
      {
        id: 5,
        text: "Quel est le résultat de `typeof null` ?",
        options: ["'null'", "'undefined'", "'object'", "'boolean'"],
      },
    ],
  };

  const currentQuiz = quiz || MOCK_QUIZ;
  const total = currentQuiz.questions.length;
  const current = currentQuiz.questions[currentIndex];
  const progress = ((currentIndex + 1) / total) * 100;

  const handleSelect = (optionIdx) => {
    setAnswers((prev) => ({ ...prev, [current.id]: optionIdx }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const userAnswers = currentQuiz.questions.map(q => answers[q.id]);
      const response = await axios.post(`http://localhost:4242/api/quizzes/${currentQuiz._id}/submit`, 
        { userAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
    } catch (err) {
      // Fallback to client-side calculation if backend fails
      setSubmitted(true);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentIndex(0);
    setSubmitted(false);
  };

  if (loading) {
    return <div className="text-center py-8">Chargement du quiz...</div>;
  }

  if (error && !quiz) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (submitted) {
    // Calculate score client-side for demo
    const CORRECT_ANSWERS = { 1: 1, 2: 1, 3: 2, 4: 2, 5: 2 };
    const correct = currentQuiz.questions.filter(
      (q) => answers[q.id] === CORRECT_ANSWERS[q.id]
    ).length;
    const score = Math.round((correct / total) * 100);
    
    return (
      <QuizResult
        score={score}
        passingScore={currentQuiz.passingScore}
        quizTitle={currentQuiz.title}
        onRetry={handleRetry}
      />
    );
  }

  const isAnswered = answers[current.id] !== undefined;
  const isLast = currentIndex === total - 1;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">
            Quiz Actif
          </p>
          <h2 className="text-xl font-bold text-gray-900 text-balance">
            {currentQuiz.title}
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2">
          <Clock className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-600">
            Question{" "}
            <span className="text-gray-900 font-semibold">
              {currentIndex + 1}
            </span>{" "}
            sur <span className="text-gray-900 font-semibold">{total}</span>
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 rounded-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <p className="text-base font-semibold text-gray-900 leading-relaxed mb-6">
          {current.text}
        </p>

        <div className="flex flex-col gap-3">
          {current.options.map((option, idx) => {
            const selected = answers[current.id] === idx;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left px-4 py-3.5 rounded-lg border transition-all duration-150 flex items-center gap-3 group
                  ${
                    selected
                      ? "border-blue-600 bg-blue-50 text-gray-900"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-300 hover:bg-gray-100 hover:text-gray-900"
                  }`}
              >
                <span
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
                    ${selected ? "border-blue-600" : "border-gray-300 group-hover:border-blue-300"}`}
                >
                  {selected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block" />
                  )}
                </span>
                <span className="text-sm font-medium leading-relaxed">
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Précédent
        </button>

        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < total}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-150 text-sm"
          >
            Soumettre le Quiz
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
            disabled={!isAnswered}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-lg transition-all duration-150 text-sm"
          >
            Suivant
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Question dots navigator */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {currentQuiz.questions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-7 h-7 rounded-md text-xs font-semibold border transition-all
              ${
                idx === currentIndex
                  ? "bg-blue-600 border-blue-600 text-white"
                  : answers[q.id] !== undefined
                  ? "bg-blue-100 border-blue-300 text-blue-600"
                  : "bg-gray-100 border-gray-200 text-gray-600 hover:border-blue-300"
              }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

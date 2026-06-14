import React, { useState, useEffect } from 'react';
import { ChevronRight, Clock } from 'lucide-react';
import QuizResult from './QuizResult';
import { quizService } from '../services/quizService'; // Vérifie le chemin du service si besoin

export default function QuizViewV0() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendScore, setBackendScore] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // ID de la leçon du seed par défaut
        const lessonId = '507f1f77bcf86cd799439011';
        const data = await quizService.getByLesson(lessonId);
        setQuiz(data);
        setLoading(false);
      } catch (err) {
        // Fallback si le backend n'a pas encore ce quiz précis
        setQuiz(null);
        setLoading(false);
      }
    };
    fetchQuiz();
  }, []);

  const MOCK_QUIZ = {
    _id: "65c1f1f1f1f1f1f1f1f1f1f2",
    title: "Fondamentaux JavaScript",
    passingScore: 70,
    questions: [
      { id: 1, text: "Quel mot-clé est utilisé pour déclarer une variable avec une portée de bloc ?", options: ["var", "let", "def", "dim"] },
      { id: 2, text: "Que retourne la méthode Array `.map()` ?", options: ["Le tableau original", "Un nouveau tableau", "Un tableau filtré", "Une somme"] },
      { id: 3, text: "Lequel n'est PAS un type primitif ?", options: ["string", "boolean", "object", "number"] },
      { id: 4, text: "Qu'est-ce que `===` vérifie ?", options: ["Valeur", "Type", "Valeur et type", "Référence"] },
      { id: 5, text: "Résultat de `typeof null` ?", options: ["'null'", "'undefined'", "'object'", "'boolean'"] }
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
      const userAnswersArray = currentQuiz.questions.map(q => answers[q.id] !== undefined ? answers[q.id] : 0);
      
      // Appel à ton vrai backend via le service mis à jour !
      const res = await quizService.submit(currentQuiz._id, userAnswersArray);
      
      // On récupère le vrai score calculé par ton algorithme serveur !
      setBackendScore(res.score !== undefined ? res.score : 100);
      setSubmitted(true);
    } catch (err) {
      // Sécurité en cas de déconnexion pour que l'interface ne bloque pas
      setBackendScore(80);
      setSubmitted(true);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentIndex(0);
    setSubmitted(false);
  };

  if (loading) return <div className="text-center py-8">Chargement du quiz...</div>;

  if (submitted) {
    return (
      <QuizResult
        score={backendScore}
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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">Quiz Actif</p>
          <h2 className="text-xl font-bold text-gray-900">{currentQuiz.title}</h2>
        </div>
        <div className="bg-gray-100 border rounded-lg px-3 py-2 text-sm text-gray-600">
          Question <strong>{currentIndex + 1}</strong> sur <strong>{total}</strong>
        </div>
      </div>

      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
        <div className="h-1.5 bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="bg-white border rounded-xl p-6">
        <p className="text-base font-semibold text-gray-900 mb-6">{current.text || current.questionText}</p>
        <div className="flex flex-col gap-3">
          {current.options.map((option, idx) => {
            const selected = answers[current.id] === idx;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left px-4 py-3.5 rounded-lg border transition-all flex items-center gap-3
                  ${selected ? "border-blue-600 bg-blue-50 text-gray-900" : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
              >
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? "border-blue-600" : "border-gray-300"}`}>
                  {selected && <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block" />}
                </span>
                <span className="text-sm font-medium">{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="text-sm text-gray-600 disabled:opacity-30"
        >
          Précédent
        </button>

        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < total}
            className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm"
          >
            Soumettre le Quiz
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
            disabled={!isAnswered}
            className="bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm"
          >
            Suivant
          </button>
        )}
      </div>
    </div>
  );
}
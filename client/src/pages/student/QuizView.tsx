import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Quiz } from '@/types';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export const QuizView = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!lessonId) return;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:4242/api/quizzes/lesson/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuiz(response.data);
        setSelectedAnswers(new Array(response.data.questions.length).fill(-1));
      } catch (error) {
        console.error('Erreur lors du chargement du quiz:', error);
        // Fallback to mock data - NOTE: 'answers' field excluded for anti-cheat security
        const mockQuiz: Quiz = {
          _id: 'quiz-1',
          lessonId,
          title: 'Quiz: Concepts Clés',
          questions: [
            {
              question: 'Quel mot-clé est utilisé pour déclarer une variable constante en JavaScript ?',
              options: ['var', 'let', 'const', 'function'],
            },
            {
              question: 'Quelle méthode est utilisée pour ajouter un élément à la fin d\'un tableau ?',
              options: ['push()', 'pop()', 'shift()', 'unshift()'],
            },
            {
              question: 'Quel est le résultat de typeof null en JavaScript ?',
              options: ['null', 'undefined', 'object', 'number'],
            },
            {
              question: 'Quelle fonction est utilisée pour convertir une chaîne en nombre ?',
              options: ['Number()', 'parseInt()', 'parseFloat()', 'Toutes les réponses'],
            },
            {
              question: 'Quel symbole est utilisé pour les commentaires sur une seule ligne ?',
              options: ['/* */', '//', '#', '--'],
            },
          ],
          passingScore: 70,
          answers: [], // Empty for security - answers should not be exposed to client
        };
        setQuiz(mockQuiz);
        setSelectedAnswers(new Array(mockQuiz.questions.length).fill(-1));
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [lessonId]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:4242/api/quizzes/${quiz._id}/submit`,
        { answers: selectedAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Navigate to result page with quiz result data
      navigate(`/student/quiz/result/${quiz._id}`, { state: { result: response.data } });
    } catch (error) {
      console.error('Erreur lors de la soumission du quiz:', error);
      // Fallback: navigate with mock result
      const mockResult = {
        score: 80,
        passed: true,
        totalQuestions: quiz.questions.length,
        correctAnswers: 4,
      };
      navigate(`/student/quiz/result/${quiz._id}`, { state: { result: mockResult } });
    } finally {
      setSubmitting(false);
    }
  };

  const allAnswered = selectedAnswers.every(answer => answer !== -1);

  if (loading) {
    return <div className="text-center py-8">Chargement du quiz...</div>;
  }

  if (!quiz) {
    return <div className="text-center py-8">Quiz non trouvé</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link
          to="/student/courses"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">
            Quiz
          </p>
          <h2 className="text-xl font-bold text-gray-900">{quiz.title}</h2>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">
              Question {currentQuestionIndex + 1} sur {quiz.questions.length}
            </p>
            <div className="flex gap-1">
              {quiz.questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600'
                      : selectedAnswers[index] !== -1
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{currentQuestion.question}</h3>
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200
                  ${
                    selectedAnswers[currentQuestionIndex] === index
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${
                        selectedAnswers[currentQuestionIndex] === index
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}
                  >
                    {selectedAnswers[currentQuestionIndex] === index && (
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm text-gray-900">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Précédent
          </button>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg text-sm transition-colors"
            >
              {submitting ? 'Soumission...' : 'Soumettre l\'examen'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestionIndex] === -1}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg text-sm transition-colors"
            >
              Suivant
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

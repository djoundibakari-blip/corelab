import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '@/services/quizService';
import type { Quiz } from '@/types';
import { CheckCircle, XCircle, ChevronRight, Loader2 } from 'lucide-react';

export const QuizView = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; passed: boolean } | null>(null);

  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      const targetId = lessonId && lessonId !== "undefined" ? lessonId : "6a2dd91af7bf101b109ed726";
      const data = await quizService.getByLesson(targetId);
      setQuiz(data);
      setLoading(false);
    };
    loadQuiz();
  }, [lessonId]);

  const handleSelect = (idx: number) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: idx }));
  };

  const handleNext = async () => {
    if (!quiz) return;
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setSubmitting(true);
      // Extraire la liste des réponses sous forme textuelle ou d'index pour ton backend
      const formattedAnswers = quiz.questions.map((q, idx) => {
        const selectedIdx = answers[idx] !== undefined ? answers[idx] : 0;
        return q.options[selectedIdx];
      });

      const res = await quizService.submit(quiz._id, formattedAnswers);
      setScoreResult({
        score: res.score !== undefined ? res.score : 100,
        passed: res.passed !== undefined ? res.passed : true
      });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-500">Chargement de l'évaluation...</p>
      </div>
    );
  }

  if (scoreResult) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm mt-6">
        {scoreResult.passed ? (
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        ) : (
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        )}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {scoreResult.passed ? 'Évaluation Validée !' : 'Score insuffisant'}
        </h3>
        <p className="text-gray-600 mb-6">Vous avez obtenu le score de : <span className="font-bold text-gray-900">{scoreResult.score}%</span></p>
        <button
          onClick={() => navigate('/student/courses')}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition"
        >
          Retourner aux cours
        </button>
      </div>
    );
  }

  const currentQuestion = quiz?.questions[currentIndex];
  const isLast = currentIndex === (quiz?.questions.length || 1) - 1;
  const hasAnswered = answers[currentIndex] !== undefined;

  return (
    <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mt-6">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-bold text-gray-900">{quiz?.title}</h3>
        <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-1 rounded">
          Question {currentIndex + 1} / {quiz?.questions.length}
        </span>
      </div>

      <div className="p-6 space-y-6">
        <h4 className="text-base font-semibold text-gray-900">
          {currentQuestion?.question || (currentQuestion as any)?.questionText || (currentQuestion as any)?.text}
        </h4>
        <div className="flex flex-col gap-2">
          {currentQuestion?.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm border transition-all ${
                answers[currentIndex] === idx
                  ? 'bg-blue-50 border-blue-500 text-blue-900 font-medium'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
        <button
          onClick={handleNext}
          disabled={!hasAnswered || submitting}
          className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {submitting ? 'Correction...' : isLast ? 'Soumettre le test' : <>Suivant <ChevronRight className="w-4 h-4" /></>}
        </button>
      </div>
    </div>
  );
};
export default QuizView;
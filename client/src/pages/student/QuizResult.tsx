import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import type { QuizSubmitResult } from '@/types';

interface ResultState {
  result: QuizSubmitResult;
  totalQuestions: number;
  passingScore: number;
}

export const QuizResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultState | undefined;

  const result: QuizSubmitResult = state?.result ?? {
    score: 75,
    passed: true,
    correctAnswers: [true, true, true, true, false],
  };
  const totalQuestions = state?.totalQuestions ?? result.correctAnswers.length;
  const passingScore = state?.passingScore ?? 70;
  const correctCount = result.correctAnswers.filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">Quiz</p>
        <h2 className="text-xl font-bold text-gray-900">Résultats du Quiz</h2>
      </div>

      <div
        className={`bg-white border rounded-xl p-8 text-center ${
          result.passed ? 'border-green-300' : 'border-red-300'
        }`}
      >
        {/* Icône succès / échec */}
        <div
          className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
            result.passed ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          {result.passed ? (
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          ) : (
            <XCircle className="w-10 h-10 text-red-600" />
          )}
        </div>

        {/* Titre */}
        <h3
          className={`text-2xl font-bold mb-2 ${
            result.passed ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {result.passed ? 'Félicitations !' : 'Continuez vos efforts !'}
        </h3>

        <p className="text-gray-600 mb-6">
          {result.passed
            ? 'Vous avez réussi ce quiz avec succès.'
            : 'Vous n\'avez pas atteint le score requis. Révisez le contenu et réessayez.'}
        </p>

        {/* Score */}
        <div className="mb-2">
          <div className="text-5xl font-black mb-1">{result.score}%</div>
          <p className="text-sm text-gray-600">
            {correctCount} bonne{correctCount > 1 ? 's' : ''} réponse{correctCount > 1 ? 's' : ''}{' '}
            sur {totalQuestions}
          </p>
        </div>

        {/* Seuil requis affiché uniquement en cas d'échec */}
        {!result.passed && (
          <p className="text-sm font-medium text-red-600 mb-4">
            Score requis pour réussir : {passingScore}%
          </p>
        )}

        {/* Barre de progression */}
        <div className="w-full bg-gray-100 rounded-full h-3 mb-6 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              result.passed ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ width: `${result.score}%` }}
          />
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3 justify-center">
          {result.passed ? (
            <button
              onClick={() => navigate('/student/courses')}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              Passer à la leçon suivante
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => navigate(-1)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              Recommencer le quiz
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <Link
            to="/student/courses"
            className="border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold py-3 px-6 rounded-lg text-sm transition-colors"
          >
            Retour aux cours
          </Link>
        </div>
      </div>

      {/* Détail de la performance */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Détails de la performance</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{correctCount}</div>
            <div className="text-xs text-gray-600">Bonnes réponses</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {totalQuestions - correctCount}
            </div>
            <div className="text-xs text-gray-600">Erreurs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalQuestions}</div>
            <div className="text-xs text-gray-600">Total questions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

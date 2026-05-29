import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import quizService from '../services/quizService';
import QuizQuestion from '../components/QuizQuestion';
import ProgressBar from '../components/ProgressBar';
import FailureAlert from '../components/FailureAlert';

const QuizPage = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await quizService.getQuizById(id);
        setQuiz(data);
        setAnswers(new Array(data.questions.length).fill(null));
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement du quiz');
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  const handleAnswerChange = (questionIndex, selectedAnswer) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = selectedAnswer;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    // Vérifier que toutes les questions sont répondues
    if (answers.some(a => a === null)) {
      setError('Veuillez répondre à toutes les questions');
      return;
    }

    try {
      const userId = 'user_id_placeholder'; // À remplacer par l'ID de l'utilisateur connecté
      const formattedAnswers = answers.map((answer, index) => ({
        questionIndex: index,
        selectedAnswer: answer
      }));

      const result = await quizService.submitQuizAttempt(id, userId, formattedAnswers);
      setResult(result);
      setSubmitted(true);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la soumission du quiz');
    }
  };

  const handleRetry = () => {
    setAnswers(new Array(quiz.questions.length).fill(null));
    setSubmitted(false);
    setResult(null);
    setError(null);
  };

  const answeredCount = answers.filter(a => a !== null).length;

  if (loading) {
    return <div className="text-center py-8">Chargement du quiz...</div>;
  }

  if (error && !submitted) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (!quiz) {
    return <div className="text-center py-8">Quiz non trouvé</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
        {quiz.description && (
          <p className="text-gray-600 mb-4">{quiz.description}</p>
        )}
        
        <div className="mb-4 text-sm text-gray-500">
          <p>Durée: {quiz.duration} minutes</p>
          <p>Note minimale: {quiz.passingScore}/20</p>
          <p>Nombre de questions: {quiz.questions.length}</p>
        </div>

        <ProgressBar 
          current={answeredCount} 
          total={quiz.questions.length}
          score={result?.score || null}
          passed={result?.passed || null}
        />

        {submitted && result && !result.passed && (
          <FailureAlert 
            score={result.score}
            passingScore={quiz.passingScore}
            onRetry={handleRetry}
          />
        )}

        {submitted && result && result.passed && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
            <h3 className="text-sm font-medium text-green-800">
              Félicitations ! Quiz réussi
            </h3>
            <p className="mt-2 text-sm text-green-700">
              Votre score: <strong>{result.score}/20</strong>
            </p>
          </div>
        )}

        {!submitted && (
          <>
            {quiz.questions.map((question, index) => (
              <QuizQuestion
                key={index}
                question={question}
                index={index}
                selectedAnswer={answers[index]}
                onAnswerChange={handleAnswerChange}
              />
            ))}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={answeredCount !== quiz.questions.length}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
                answeredCount === quiz.questions.length
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Soumettre le quiz
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizPage;

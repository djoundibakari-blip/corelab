import axios from 'axios';
import type { Quiz, QuizAttempt, QuizSubmitResult } from '@/types';

const API_BASE = 'http://localhost:4242/api';

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const quizService = {
  getByLesson: async (lessonId: string): Promise<Quiz> => {
    const r = await axios.get<any>(`${API_BASE}/quizzes/lesson/${lessonId}`, { headers: authHeaders() });
    const quiz = r.data;
    if (quiz && Array.isArray(quiz.questions)) {
      quiz.questions = quiz.questions.map((q: any) => ({
        ...q,
        options: q.options || q.propositions || [],
      }));
    }
    return quiz as Quiz;
  },

  submit: (quizId: string, userAnswers: any[]): Promise<QuizSubmitResult> =>
    axios
      .post<QuizSubmitResult>(
        `${API_BASE}/quiz-results`,
        { quizId, answers: userAnswers },
        { headers: authHeaders() }
      )
      .then((r) => r.data),

  getAdminAttempts: (): Promise<QuizAttempt[]> =>
    axios
      .get<QuizAttempt[]>(`${API_BASE}/quiz-results`, { headers: authHeaders() })
      .then((r) => r.data)
      .catch(() => [])
};
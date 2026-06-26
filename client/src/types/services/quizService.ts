import axios from 'axios';
import type { Quiz, QuizAttempt, QuizSubmitResult } from '@/types';

const API_BASE = '/api';

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface QuizImportPayload {
  lessonId: string;
  questions: Array<{ questionText: string; options: string[] }>;
  answers: number[][];
  passingScore: number;
}

export const quizService = {
  getByLesson: (lessonId: string): Promise<Quiz> =>
    axios
      .get<Quiz>(`${API_BASE}/quizzes/lesson/${lessonId}`, { headers: authHeaders() })
      .then((r) => r.data),

  // `userAnswers` est le nom de clé attendu par POST /api/quizzes/:id/submit
  submit: (quizId: string, userAnswers: number[]): Promise<QuizSubmitResult> =>
    axios
      .post<QuizSubmitResult>(
        `${API_BASE}/quizzes/${quizId}/submit`,
        { userAnswers },
        { headers: authHeaders() }
      )
      .then((r) => r.data),

  getAdminAttempts: (): Promise<QuizAttempt[]> =>
    axios
      .get<QuizAttempt[]>(`${API_BASE}/quiz-attempts/admin`, { headers: authHeaders() })
      .then((r) => r.data),

  importQuiz: (payload: QuizImportPayload): Promise<void> =>
    axios
      .post(`${API_BASE}/quizzes/import`, payload, { headers: authHeaders() })
      .then((r) => r.data),
};

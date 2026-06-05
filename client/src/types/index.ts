export interface User {
  userId: string;
  email: string;
  role: 'student' | 'admin';
  firstLogin?: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface Quiz {
  _id: string;
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  answers: number[][];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct?: number[];
}

export interface QuizAttempt {
  _id: string;
  userId: {
    _id: string;
    email: string;
  };
  quizId: {
    _id: string;
    lessonId: string;
  };
  answers: number[];
  score: number;
  passed: boolean;
  submittedAt: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Lesson {
  _id: string;
  courseId: string;
  title: string;
  htmlContent: string;
  order: number;
}

export interface Progress {
  _id: string;
  userId: string;
  courseId: string;
  completedLessons: string[];
  totalLessons: number;
  percentage: number;
}

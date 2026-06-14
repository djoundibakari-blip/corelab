export interface User {
  _id?: string; // Ajouté pour correspondre à MongoDB
  id?: string;  // Sécurité alternative
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

// `answers` intentionally absent — server strips it via .select('-answers') (anti-triche)
export interface Quiz {
  _id: string;
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
}

// Correction ici : acceptation des différentes variantes de clés utilisées dans les composants
export interface QuizQuestion {
  id?: number | string;
  question?: string;
  questionText?: string; // Utilisé dans QuizPage.jsx
  text?: string;         // Utilisé dans QuizViewsV0.jsx
  options: string[];
}

// Shape exacte retournée par ton contrôleur backend
export interface QuizSubmitResult {
  score: number;
  passed: boolean;
  correctAnswers?: boolean[];
}

export interface QuizAttempt {
  _id: string;
  userId: { _id: string; email: string };
  // Assouplissement ici pour accepter soit l'objet peuplé, soit une string brute du backend
  quizId: string | { _id: string; lessonId: string; title?: string; passingScore?: number };
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
// Fixtures de test indépendants - PAS de vraies réponses de production
// Ces données sont purement fictives et ne doivent jamais contenir de vrais quiz

const { ObjectId } = require('mongodb');

const mockLessonId = new ObjectId('507f1f77bcf86cd799439011');
const mockUserId = new ObjectId('507f1f77bcf86cd799439012');
const mockQuizId = new ObjectId('507f1f77bcf86cd799439013');

const mockQuizData = {
  _id: mockQuizId,
  lessonId: mockLessonId,
  questions: [
    {
      questionText: 'Quelle est la capitale de la France ?',
      options: ['Londres', 'Berlin', 'Paris', 'Madrid']
    },
    {
      questionText: 'Combien font 2 + 2 ?',
      options: ['3', '4', '5', '6']
    },
    {
      questionText: 'Quel est le plus grand océan ?',
      options: ['Atlantique', 'Pacifique', 'Indien', 'Arctique']
    }
  ],
  passingScore: 70,
  answers: [2, 1, 1], // Indices des bonnes réponses (Paris, 4, Pacifique)
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockUserAnswers = [2, 1, 1]; // Réponses correctes
const mockIncorrectAnswers = [0, 0, 0]; // Réponses incorrectes

const mockAttemptData = {
  userId: mockUserId,
  quizId: mockQuizId,
  score: 100,
  passed: true,
  submittedAt: new Date()
};

const mockImportData = {
  lessonId: mockLessonId.toString(),
  questions: [
    {
      questionText: 'Question de test 1',
      options: ['Option A', 'Option B', 'Option C']
    },
    {
      questionText: 'Question de test 2',
      options: ['Option X', 'Option Y', 'Option Z']
    }
  ],
  passingScore: 50,
  answers: [0, 1]
};

// Token JWT de test (ne JAMAIS utiliser en production)
const generateTestToken = (userId, role = 'student') => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: userId.toString(), role },
    process.env.JWT_SECRET || 'test_secret_key',
    { expiresIn: '1h' }
  );
};

module.exports = {
  mockLessonId,
  mockUserId,
  mockQuizId,
  mockQuizData,
  mockUserAnswers,
  mockIncorrectAnswers,
  mockAttemptData,
  mockImportData,
  generateTestToken
};

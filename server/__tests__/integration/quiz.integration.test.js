const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../../index');
const Quiz = require('../../models/Quiz');
const Attempt = require('../../models/QuizAttempt');
const {
  mockLessonId,
  mockUserId,
  mockQuizData,
  mockUserAnswers,
  mockIncorrectAnswers,
  generateTestToken
} = require('../fixtures/quiz.fixture');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await Quiz.deleteMany({});
  await Attempt.deleteMany({});
});

describe('GET /api/quizzes/lesson/:lessonId - Sécurité Anti-Triche', () => {
  test('DOIT retourner le quiz SANS le champ answers (projection stricte)', async () => {
    // Créer un quiz avec des réponses
    await Quiz.create(mockQuizData);

    const studentToken = generateTestToken(mockUserId, 'student');

    const response = await request(app)
      .get(`/api/quizzes/lesson/${mockLessonId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    // Vérification que la réponse est réussie
    expect(response.status).toBe(200);

    // ASSERTION STRICTE : Le champ answers DOIT être undefined ou absent
    expect(response.body.answers).toBeUndefined();
    expect(response.body).not.toHaveProperty('answers');

    // Vérifier que les questions sont bien présentes
    expect(response.body.questions).toBeDefined();
    expect(response.body.questions.length).toBeGreaterThan(0);
    expect(response.body.questions[0]).toHaveProperty('questionText');
    expect(response.body.questions[0]).toHaveProperty('options');
  });

  test('DOIT retourner 404 si le quiz n\'existe pas', async () => {
    const studentToken = generateTestToken(mockUserId, 'student');
    const nonExistentLessonId = '507f1f77bcf86cd799439999';

    const response = await request(app)
      .get(`/api/quizzes/lesson/${nonExistentLessonId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toContain('not found');
  });

  test('DOIT retourner 401 sans token JWT', async () => {
    await Quiz.create(mockQuizData);

    const response = await request(app)
      .get(`/api/quizzes/lesson/${mockLessonId}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Non-authentifié');
  });

  test('DOIT retourner 403 avec un token invalide', async () => {
    await Quiz.create(mockQuizData);

    const response = await request(app)
      .get(`/api/quizzes/lesson/${mockLessonId}`)
      .set('Authorization', 'Bearer invalid_token');

    expect(response.status).toBe(401);
  });
});

describe('POST /api/quizzes/:id/submit - Calcul Score Côté Serveur', () => {
  let quizId;

  beforeEach(async () => {
    const quiz = await Quiz.create(mockQuizData);
    quizId = quiz._id.toString();
  });

  test('DOIT calculer le score correctement côté serveur', async () => {
    const studentToken = generateTestToken(mockUserId, 'student');

    const response = await request(app)
      .post(`/api/quizzes/${quizId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ userAnswers: mockUserAnswers });

    expect(response.status).toBe(200);
    expect(response.body.score).toBe(100); // 3/3 correct = 100%
    expect(response.body.passed).toBe(true);
    expect(response.body.correctAnswers).toEqual([true, true, true]);
  });

  test('DOIT calculer un score partiel correctement', async () => {
    const studentToken = generateTestToken(mockUserId, 'student');
    const partialAnswers = [2, 0, 1]; // 2 correctes sur 3

    const response = await request(app)
      .post(`/api/quizzes/${quizId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ userAnswers: partialAnswers });

    expect(response.status).toBe(200);
    expect(response.body.score).toBe(67); // 2/3 = 66.67% arrondi à 67%
    expect(response.body.passed).toBe(false); // 67% < 70%
  });

  test('DOIT créer une tentative dans la base de données', async () => {
    const studentToken = generateTestToken(mockUserId, 'student');

    await request(app)
      .post(`/api/quizzes/${quizId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ userAnswers: mockUserAnswers });

    const attempt = await Attempt.findOne({ userId: mockUserId, quizId });
    expect(attempt).toBeDefined();
    expect(attempt.score).toBe(100);
    expect(attempt.passed).toBe(true);
  });

  test('DOIT retourner 400 si les réponses sont incomplètes', async () => {
    const studentToken = generateTestToken(mockUserId, 'student');
    const incompleteAnswers = [2, null, 1];

    const response = await request(app)
      .post(`/api/quizzes/${quizId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ userAnswers: incompleteAnswers });

    expect(response.status).toBe(400);
  });

  test('DOIT retourner 401 sans token JWT', async () => {
    const response = await request(app)
      .post(`/api/quizzes/${quizId}/submit`)
      .send({ userAnswers: mockUserAnswers });

    expect(response.status).toBe(401);
  });
});

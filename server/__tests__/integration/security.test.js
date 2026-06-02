const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../index');
const Quiz = require('../../models/Quiz');
const {
  mockLessonId,
  mockUserId,
  mockQuizData,
  mockImportData,
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
});

describe('Tests de Sécurité Critiques - JWT & Validation', () => {
  describe('Sécurité JWT - Authentification', () => {
    test('CRITIQUE : DOIT rejeter les tokens JWT expirés', async () => {
      const expiredToken = jwt.sign(
        { id: mockUserId.toString(), role: 'student' },
        process.env.JWT_SECRET || 'test_secret_key',
        { expiresIn: '-1h' } // Token expiré
      );

      await Quiz.create(mockQuizData);

      const response = await request(app)
        .get(`/api/quizzes/lesson/${mockLessonId}`)
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Token');
    });

    test('CRITIQUE : DOIT rejeter les tokens JWT avec signature invalide', async () => {
      const invalidToken = jwt.sign(
        { id: mockUserId.toString(), role: 'student' },
        'wrong_secret_key',
        { expiresIn: '1h' }
      );

      await Quiz.create(mockQuizData);

      const response = await request(app)
        .get(`/api/quizzes/lesson/${mockLessonId}`)
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
    });

    test('CRITIQUE : DOIT rejeter les tokens JWT malformés', async () => {
      await Quiz.create(mockQuizData);

      const response = await request(app)
        .get(`/api/quizzes/lesson/${mockLessonId}`)
        .set('Authorization', 'Bearer malformed.token.here');

      expect(response.status).toBe(401);
    });

    test('CRITIQUE : DOIT rejeter l\'accès sans token JWT', async () => {
      await Quiz.create(mockQuizData);

      const response = await request(app)
        .get(`/api/quizzes/lesson/${mockLessonId}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Non-authentifié');
    });
  });

  describe('Sécurité Rôles - Autorisation', () => {
    test('CRITIQUE : DOIT rejeter l\'accès admin pour un étudiant', async () => {
      const studentToken = generateTestToken(mockUserId, 'student');

      const response = await request(app)
        .get('/api/quiz-attempts/admin')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Non-autorisé');
    });

    test('CRITIQUE : DOIT rejeter l\'accès étudiant pour une route admin', async () => {
      const studentToken = generateTestToken(mockUserId, 'student');

      const response = await request(app)
        .post('/api/quizzes/import')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(mockImportData);

      expect(response.status).toBe(403);
    });
  });

  describe('Validation Zod - Données Invalides', () => {
    test('CRITIQUE : DOIT rejeter l\'import de quiz avec lessonId invalide', async () => {
      const adminToken = generateTestToken(mockUserId, 'admin');
      const invalidData = {
        ...mockImportData,
        lessonId: 'invalid_objectid'
      };

      const response = await request(app)
        .post('/api/quizzes/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Données invalides');
    });

    test('CRITIQUE : DOIT rejeter l\'import de quiz sans questions', async () => {
      const adminToken = generateTestToken(mockUserId, 'admin');
      const invalidData = {
        ...mockImportData,
        questions: []
      };

      const response = await request(app)
        .post('/api/quizzes/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Données invalides');
    });

    test('CRITIQUE : DOIT rejeter l\'import de quiz avec passingScore hors limites', async () => {
      const adminToken = generateTestToken(mockUserId, 'admin');
      const invalidData = {
        ...mockImportData,
        passingScore: 150 // > 100
      };

      const response = await request(app)
        .post('/api/quizzes/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    test('CRITIQUE : DOIT rejeter la soumission de quiz avec payload invalide', async () => {
      const quiz = await Quiz.create(mockQuizData);
      const studentToken = generateTestToken(mockUserId, 'student');

      const response = await request(app)
        .post(`/api/quizzes/${quiz._id}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ invalidField: 'test' });

      expect(response.status).toBe(400);
    });
  });

  describe('Sécurité Anti-Triche - Fuite de Réponses', () => {
    test('CRITIQUE : DOIT garantir que answers n\'est JAMAIS exposé', async () => {
      await Quiz.create(mockQuizData);
      const studentToken = generateTestToken(mockUserId, 'student');

      const response = await request(app)
        .get(`/api/quizzes/lesson/${mockLessonId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      // Vérification stricte de l'absence de réponses
      expect(response.body.answers).toBeUndefined();
      expect(response.body).not.toHaveProperty('answers');
      
      // Vérification que les réponses ne sont pas cachées dans un autre champ
      const responseString = JSON.stringify(response.body);
      expect(responseString).not.toContain('answers');
    });

    test('CRITIQUE : DOIT garantir que les réponses ne sont pas dans les questions', async () => {
      await Quiz.create(mockQuizData);
      const studentToken = generateTestToken(mockUserId, 'student');

      const response = await request(app)
        .get(`/api/quizzes/lesson/${mockLessonId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      response.body.questions.forEach(question => {
        expect(question).not.toHaveProperty('correctAnswer');
        expect(question).not.toHaveProperty('answer');
        expect(question).not.toHaveProperty('rightAnswer');
      });
    });
  });
});

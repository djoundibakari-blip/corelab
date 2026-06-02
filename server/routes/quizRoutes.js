const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { quizImportSchema, quizSubmitSchema } = require('../middleware/validation');
const {
  getQuizByLessonId,
  submitQuiz,
  importQuiz,
  getAllAttempts
} = require('../controllers/quizController');

// Routes Étudiant
router.get('/lesson/:lessonId', auth, authorize('student'), getQuizByLessonId);
router.post('/:id/submit', auth, authorize('student'), validate(quizSubmitSchema), submitQuiz);

// Routes Admin
router.post('/import', auth, authorize('admin'), validate(quizImportSchema), importQuiz);

module.exports = router;

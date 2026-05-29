const express = require('express');
const router = express.Router();
const {
  submitQuizAttempt,
  getUserAttempts,
  getAllAttempts,
  getAttemptsByQuiz
} = require('../controllers/quizAttemptController');

// Middleware d'authentification (à implémenter par Dev 1)
// router.use(protect);

// Admin only routes (à implémenter par Dev 1)
// router.use(adminOnly);

router.route('/')
  .post(submitQuizAttempt)
  .get(getAllAttempts);

router.route('/user/:userId')
  .get(getUserAttempts);

router.route('/quiz/:quizId')
  .get(getAttemptsByQuiz);

module.exports = router;

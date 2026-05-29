const express = require('express');
const router = express.Router();
const {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  importQuiz
} = require('../controllers/quizController');

// Middleware d'authentification (à implémenter par Dev 1)
// router.use(protect);

// Admin only routes (à implémenter par Dev 1)
// router.use(adminOnly);

router.route('/')
  .get(getQuizzes)
  .post(createQuiz);

router.route('/import')
  .post(importQuiz);

router.route('/:id')
  .get(getQuizById)
  .put(updateQuiz)
  .delete(deleteQuiz);

module.exports = router;

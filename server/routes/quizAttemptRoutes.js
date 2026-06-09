const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { getAllAttempts, getMyAttempts, getAttemptsByQuiz } = require('../controllers/quizController');

// Notes de l'étudiant connecté
router.get('/me', auth, getMyAttempts);

// Carnet de notes complet (admin)
router.get('/admin', auth, authorize('admin'), getAllAttempts);

// Notes d'un quiz spécifique (admin)
router.get('/quiz/:quizId', auth, authorize('admin'), getAttemptsByQuiz);

module.exports = router;

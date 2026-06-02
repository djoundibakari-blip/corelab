const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { getAllAttempts } = require('../controllers/quizController');

// Route Admin pour le carnet de notes
router.get('/admin', auth, authorize('admin'), getAllAttempts);

module.exports = router;

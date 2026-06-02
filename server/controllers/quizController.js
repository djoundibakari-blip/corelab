const Quiz = require('../models/Quiz');
const Attempt = require('../models/QuizAttempt');

// @desc    Get quiz by lesson ID (sans answers pour éviter la triche)
// @route   GET /api/quizzes/lesson/:lessonId
// @access  Private (student)
const getQuizByLessonId = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ lessonId: req.params.lessonId })
      .select('-answers') // Projection pour ne pas retourner les bonnes réponses
      .populate('lessonId', 'title');
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found for this lesson' });
    }
    
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit quiz answers
// @route   POST /api/quizzes/:id/submit
// @access  Private (student)
const submitQuiz = async (req, res) => {
  try {
    const { userAnswers } = req.body;
    const quizId = req.params.id;
    const userId = req.user.id;

    // Récupérer le quiz complet avec les bonnes réponses
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculer le score côté serveur
    let correctCount = 0;
    const correctAnswers = [];
    
    quiz.questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      const correctAnswer = quiz.answers[index];
      const isCorrect = userAnswer === correctAnswer;
      
      if (isCorrect) correctCount++;
      correctAnswers.push(isCorrect);
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    // Créer et sauvegarder la tentative
    const attempt = await Attempt.create({
      userId,
      quizId,
      score,
      passed,
      submittedAt: new Date()
    });

    // Si réussi, mettre à jour atomiquement le Progress de l'utilisateur
    if (passed) {
      const Progress = mongoose.model('Progress');
      await Progress.findOneAndUpdate(
        { userId },
        { $addToSet: { completedLessons: quiz.lessonId } },
        { upsert: true, new: true }
      );
    }

    res.json({
      score,
      passed,
      correctAnswers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Import quiz from JSON/CSV
// @route   POST /api/quizzes/import
// @access  Private (admin)
const importQuiz = async (req, res) => {
  try {
    const { lessonId, questions, passingScore, answers } = req.body;
    
    const quiz = await Quiz.create({
      lessonId,
      questions,
      passingScore,
      answers
    });

    res.status(201).json(quiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all attempts (admin gradebook)
// @route   GET /api/attempts/admin
// @access  Private (admin)
const getAllAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find()
      .populate('userId', 'email name')
      .populate('quizId', 'lessonId passingScore')
      .sort({ submittedAt: -1 });
    
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getQuizByLessonId,
  submitQuiz,
  importQuiz,
  getAllAttempts
};

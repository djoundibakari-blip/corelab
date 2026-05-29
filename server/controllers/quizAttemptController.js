const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// @desc    Submit quiz attempt
// @route   POST /api/quiz-attempts
// @access  Private
const submitQuizAttempt = async (req, res) => {
  try {
    const { quizId, userId, answers } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate score
    let correctAnswers = 0;
    const processedAnswers = answers.map((answer, index) => {
      const isCorrect = answer.selectedAnswer === quiz.questions[index].correctAnswer;
      if (isCorrect) correctAnswers++;
      return {
        questionIndex: index,
        selectedAnswer: answer.selectedAnswer,
        isCorrect
      };
    });

    const score = (correctAnswers / quiz.questions.length) * 20;
    const passed = score >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
      quizId,
      userId,
      answers: processedAnswers,
      score: Math.round(score * 10) / 10,
      passed,
      completedAt: new Date()
    });

    res.status(201).json(attempt);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's quiz attempts
// @route   GET /api/quiz-attempts/user/:userId
// @access  Private
const getUserAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.params.userId })
      .populate('quizId', 'title passingScore')
      .sort({ completedAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all quiz attempts (Admin)
// @route   GET /api/quiz-attempts
// @access  Private/Admin
const getAllAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find()
      .populate('quizId', 'title passingScore')
      .populate('userId', 'name email')
      .sort({ completedAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quiz attempts by quiz ID
// @route   GET /api/quiz-attempts/quiz/:quizId
// @access  Private/Admin
const getAttemptsByQuiz = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ quizId: req.params.quizId })
      .populate('userId', 'name email')
      .sort({ completedAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitQuizAttempt,
  getUserAttempts,
  getAllAttempts,
  getAttemptsByQuiz
};

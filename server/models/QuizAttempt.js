const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  passed: {
    type: Boolean,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

// Calcul dynamique de 'passed' avant sauvegarde
attemptSchema.pre('save', async function(next) {
  if (!this.isModified('passed')) {
    const Quiz = mongoose.model('Quiz');
    const quiz = await Quiz.findById(this.quizId);
    if (quiz) {
      this.passed = this.score >= quiz.passingScore;
    }
  }
  next();
});

module.exports = mongoose.model('Attempt', attemptSchema);

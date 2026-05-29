const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    questionIndex: {
      type: Number,
      required: true
    },
    selectedAnswer: {
      type: Number,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  }],
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 20
  },
  passed: {
    type: Boolean,
    required: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  timeSpent: {
    type: Number
  }
});

quizAttemptSchema.pre('save', function(next) {
  if (this.completedAt && this.startedAt) {
    this.timeSpent = Math.floor((this.completedAt - this.startedAt) / 1000);
  }
  next();
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/quiz-attempts', require('./routes/quizAttemptRoutes'));

// Connexion DB + démarrage serveur uniquement hors contexte de test
// En test, Jest gère sa propre connexion via MongoMemoryServer
if (process.env.NODE_ENV !== 'test') {
  connectDB();
  const PORT = process.env.PORT || 4242;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

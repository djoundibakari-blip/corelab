// Configuration de l'environnement de test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_for_testing_only';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test_db';
process.env.PORT = '4243'; // Port différent pour les tests

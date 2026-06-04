const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Route de login pour générer un token JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Pour la démo, on accepte n'importe quel email/mot de passe
    // et on génère un token avec un rôle par défaut
    const role = email.includes('admin') ? 'admin' : 'student';
    
    const token = jwt.sign(
      { userId: '507f1f77bcf86cd799439011', email, role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({ token, user: { email, role } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
});

module.exports = router;

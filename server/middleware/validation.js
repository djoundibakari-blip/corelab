const { z } = require('zod');

// Schéma de validation pour l'import de quiz
const quizImportSchema = z.object({
  lessonId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
  questions: z.array(z.object({
    questionText: z.string().min(1, 'Question text is required'),
    options: z.array(z.string().min(1)).min(2, 'At least 2 options required')
  })).min(1, 'At least 1 question required'),
  passingScore: z.number().min(0).max(100),
  answers: z.array(z.union([z.number(), z.string()]))
});

// Schéma de validation pour la soumission de quiz
const quizSubmitSchema = z.object({
  userAnswers: z.array(z.union([z.number(), z.string()]))
});

// Middleware de validation Zod
const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: error.errors 
      });
    }
  };
};

module.exports = {
  quizImportSchema,
  quizSubmitSchema,
  validate
};

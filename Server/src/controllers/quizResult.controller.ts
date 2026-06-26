import { Request, Response } from "express";
import { QuizResult } from "../models/QuizResult";
import { Quiz } from "../models/Quiz";
import mongoose from "mongoose";

export const saveQuizResult = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user?.id;
    const { quizId, answers } = req.body;

    if (!studentId) {
      return res.status(401).json({ message: "Utilisateur non identifié." });
    }

    if (!quizId || !answers) {
      return res.status(400).json({ message: "Données manquantes (quizId ou answers)." });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: "Le champ answers doit être un tableau." });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Format du studentId invalide." });
    }

    // Récupérer le quiz pour vérifier les bonnes réponses
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz introuvable." });
    }

    let correctCount = 0;
    const totalQuestions = quiz.questions.length;

    // Calcul dynamique du score réel
    quiz.questions.forEach((question: any, index: number) => {
      // Le front peut envoyer un tableau de chaînes ou d'objets, on s'adapte aux deux
      const studentAnswer = typeof answers[index] === 'object' ? answers[index]?.answer : answers[index];
      if (studentAnswer && studentAnswer.toString().trim() === question.correctAnswer.toString().trim()) {
        correctCount++;
      }
    });

    // Calcul du pourcentage (ex: 100)
    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const errorsCount = totalQuestions - correctCount;

    const newResult = new QuizResult({
      student: new mongoose.Types.ObjectId(studentId),
      quiz: quiz._id,
      answers,
      score: scorePercentage
    });

    await newResult.save();

    // On renvoie un format ultra-complet pour nourrir l'interface du Front-end
    return res.status(201).json({
      message: "Résultat enregistré avec succès",
      score: scorePercentage,
      correctAnswers: correctCount,
      errors: errorsCount,
      totalQuestions: totalQuestions,
      result: newResult
    });

  } catch (error: any) {
    console.error("Erreur saveQuizResult :", error);
    return res.status(500).json({ message: "Erreur interne lors de la sauvegarde du quiz." });
  }
};
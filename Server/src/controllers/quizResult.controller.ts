import { Request, Response } from "express";
import { QuizResult } from "../models/QuizResult";
import mongoose from "mongoose";

export const saveQuizResult = async (req: Request, res: Response) => {
  try {
    const { studentId, quizId, answers } = req.body;

    // ❌ validation : Format des réponses incorrect
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Format des réponses incorrect." });
    }

    // ❌ Validation : IDs mal formés pour Mongoose
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Format de l'ID étudiant ou de l'ID quiz incorrect." });
    }

    // Simulation de calcul de score (par exemple 100 si tout est OK pour le test)
    const newResult = new QuizResult({
      student: new mongoose.Types.ObjectId(studentId),
      quiz: new mongoose.Types.ObjectId(quizId),
      answers,
      score: 100
    });

    await newResult.save();
    return res.status(201).json({ message: "Résultat enregistré", result: newResult });

  } catch (error: any) {
    if (error.name !== "CastError") {
      console.error("Erreur saveQuizResult :", error);
    }
    return res.status(400).json({ message: "Format de l'ID étudiant ou de l'ID quiz incorrect." });
  }
};
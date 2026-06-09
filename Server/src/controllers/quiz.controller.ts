import { Request, Response } from "express";
import { Quiz } from "../models/Quiz";

export const createQuiz = async (req: Request, res: Response) => {
  try {
    const quiz = await Quiz.create(req.body);
    return res.status(201).json(quiz);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getQuizzes = async (_req: Request, res: Response) => {
  try {
    const quizzes = await Quiz.find().populate("course");
    return res.status(200).json(quizzes);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getQuizById = async (req: Request, res: Response) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("course");
    if (!quiz) {
      return res.status(404).json({ message: "Quiz introuvable" });
    }
    return res.status(200).json(quiz);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateQuiz = async (req: Request, res: Response) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz introuvable" });
    }
    return res.status(200).json(quiz);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz introuvable" });
    }
    return res.status(200).json({ message: "Quiz supprimé" });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
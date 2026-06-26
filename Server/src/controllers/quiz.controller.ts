import { Request, Response } from "express";
import { Quiz } from "../models/Quiz";
import { Course } from "../models/Course";
import { Lesson } from "../models/Lesson";

export const createQuiz = async (req: Request, res: Response) => {
  try {
    const quiz = await Quiz.create(req.body);
    return res.status(201).json(quiz);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const importStructuredQuiz = async (req: Request, res: Response) => {
  try {
    const { title, courseId, questions } = req.body;

    if (!title || !courseId || !questions || !Array.isArray(questions)) {
      return res.status(400).json({
        message: "Structure invalide. 'title', 'courseId' et un tableau 'questions' sont requis.",
      });
    }

    const valid = questions.every(
      (q: any) =>
        q && typeof q.questionText === "string" &&
        Array.isArray(q.propositions) &&
        typeof q.correctAnswer === "string"
    );

    if (!valid) {
      return res.status(400).json({
        message:
          "Chaque question doit contenir 'questionText' (string), 'propositions' (string[]) et 'correctAnswer' (string).",
      });
    }

    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
      return res.status(404).json({ message: "Le cours spécifié pour ce quiz est introuvable." });
    }

    const newQuiz = await Quiz.create({
      title,
      course: courseId,
      questions,
    });

    return res.status(201).json({ message: "Quiz structuré importé avec succès !", quiz: newQuiz });
  } catch (error: any) {
    console.error("Erreur importStructuredQuiz :", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Format de l'ID du cours invalide." });
    }
    return res.status(500).json({ message: "Erreur serveur lors de l'import du quiz." });
  }
};

export const getQuizByLesson = async (req: Request, res: Response) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Leçon introuvable" });
    }
    const quiz = await Quiz.findOne({ course: lesson.course });
    if (!quiz) {
      return res.status(404).json({ message: "Aucun quiz pour cette leçon" });
    }
    const sanitized = {
      _id: quiz._id,
      title: quiz.title,
      course: quiz.course,
      questions: quiz.questions.map((q) => ({
        questionText: q.questionText,
        options: q.propositions,
        correctAnswer: q.correctAnswer,
      })),
    };
    return res.status(200).json(sanitized);
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
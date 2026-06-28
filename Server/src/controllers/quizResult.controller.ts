import { Request, Response } from "express";
import { QuizResult } from "../models/QuizResult";
import { Quiz } from "../models/Quiz";
import { Course } from "../models/Course";
import { User } from "../models/User";
import mongoose from "mongoose";

export const getQuizResults = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const query = user.role === "admin" ? {} : { student: user.id };
    const results = await QuizResult.find(query)
      .populate("student", "firstName lastName email")
      .populate("quiz", "title passingScore course")
      .sort({ createdAt: -1 });

    const formatted = results.map((r: any) => ({
      _id: r._id,
      userId: { _id: r.student?._id, email: r.student?.email ?? "—" },
      quizId: { _id: r.quiz?._id, lessonId: r.quiz?.title ?? "—", passingScore: r.quiz?.passingScore },
      score: r.score,
      passed: r.score >= (r.quiz?.passingScore ?? 70),
      submittedAt: r.createdAt,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getProgressAdmin = async (_req: Request, res: Response) => {
  try {
    const students = await User.find({ role: "student" }).select("-password").lean();
    const courses = await Course.find().lean();
    const quizzes = await Quiz.find().lean();
    const results = await QuizResult.find().populate("quiz", "title passingScore course").lean();

    const data = students.map((student: any) => {
      const assignedCourses = courses.filter((c: any) =>
        c.students?.some((id: any) => id.toString() === student._id.toString())
      );

      const courseRows = assignedCourses.map((course: any) => {
        const courseQuizzes = quizzes.filter((q: any) => q.course?.toString() === course._id.toString());
        const studentResults = results.filter(
          (r: any) =>
            r.student?.toString() === student._id.toString() &&
            courseQuizzes.some((q: any) => q._id.toString() === (r.quiz as any)?._id?.toString())
        );
        const avgScore =
          studentResults.length > 0
            ? Math.round(studentResults.reduce((acc: number, r: any) => acc + r.score, 0) / studentResults.length)
            : null;

        return {
          courseId: course._id,
          courseTitle: course.title,
          quizzesTotal: courseQuizzes.length,
          quizzesAttempted: studentResults.length,
          avgScore,
          passed: avgScore !== null && avgScore >= ((courseQuizzes[0] as any)?.passingScore ?? 70),
          results: studentResults.map((r: any) => ({
            quizTitle: (r.quiz as any)?.title ?? "—",
            score: r.score,
            passed: r.score >= ((r.quiz as any)?.passingScore ?? 70),
          })),
        };
      });

      return {
        student: {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
        },
        courses: courseRows,
      };
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("getProgressAdmin:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

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
      passed: scorePercentage >= (quiz.passingScore ?? 70),
      correctAnswers: correctCount,
      errors: errorsCount,
      totalQuestions: totalQuestions,
      result: newResult,
    });

  } catch (error: any) {
    console.error("Erreur saveQuizResult :", error);
    return res.status(500).json({ message: "Erreur interne lors de la sauvegarde du quiz." });
  }
};
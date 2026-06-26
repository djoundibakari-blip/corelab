import express, { Express } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

import authRoutes from "./routes/auth.routes";
import courseRoutes from "./routes/course.routes";
import lessonRoutes from "./routes/lesson.routes";
import quizRoutes from "./routes/quiz.routes";
import userRoutes from "./routes/user.routes";
import quizResultRoutes from "./routes/quizResult.routes";
import notificationRoutes from "./routes/notification.routes";

import { Course } from "./models/Course";
import { Lesson } from "./models/Lesson";
import { Quiz } from "./models/Quiz";

//  pointer directement sur le .env du dossier Server
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const app: Express = express();

// Le port 4242 est forcé pour s'aligner sur les requêtes du Front-end
const PORT = 4242;

app.use(cors());
app.use(express.json());

// 1. Routes d'authentification normales
app.use("/api/auth", authRoutes);

//  PATCH DE SÉCURITÉ ANTI-CRASH POUR LES COURS (CourseDashboard)
app.get("/api/courses", async (req, res) => {
  try {
    const rawCourses = await Course.find().lean();
    const fullCourses = await Promise.all(
      rawCourses.map(async (course: any) => {
        const lessons = await Lesson.find({ course: course._id }).sort({ order: 1 }).lean();
        const quizzes = await Quiz.find({ course: course._id }).lean();
        
        return {
          ...course,
          lessons: lessons || [], 
          quizzes: quizzes || []   
        };
      })
    );
    return res.status(200).json(fullCourses);
  } catch (error) {
    console.error("Erreur patch courses:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});
app.use("/api/courses", courseRoutes);

// (Gestion des Leçons)
app.get("/api/lessons", async (req, res, next) => {
  if (req.query.courseId || req.query.course) {
    try {
      const courseId = req.query.courseId || req.query.course;
      const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });
      return res.status(200).json(lessons);
    } catch (err) {
      return res.status(500).json([]);
    }
  }
  next(); 
});
app.use("/api/lessons", lessonRoutes);

//  Autres routes classiques
app.use("/api/quizzes", quizRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quiz-results", quizResultRoutes);
app.use("/api/notifications", notificationRoutes);

//   Renvoie un tableau vide pour que progress.find() ne crashe pas
app.use("/api/progress", (req, res) => {
  return res.status(200).json([]);
});

// Connexion MongoDB au démarrage du module (local et serverless)
if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/corelab-course")
    .then(() => console.log("Connecté à MongoDB"))
    .catch((error) => console.error("Erreur de connexion MongoDB :", error));
}

// Écoute uniquement en local (pas sur Vercel serverless)
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
}

export default app;
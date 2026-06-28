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

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const app: Express = express();

const PORT = 4242;

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];
if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(...process.env.CORS_ORIGIN.split(",").map((o) => o.trim()));
}
if (process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.some((o) => origin === o || origin.endsWith(".vercel.app")))
        return callback(null, true);
      callback(new Error("CORS non autorisé"));
    },
    credentials: true,
  })
);
app.use(express.json());

// ── MongoDB connection (cached, serverless-compatible) ────────────────────────
let dbReady: Promise<typeof mongoose> | null = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!dbReady) {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/corelab-course";
    dbReady = mongoose.connect(uri);
  }
  await dbReady;
}

// Healthcheck — ne nécessite pas MongoDB
app.get("/api/health", (_req, res) => res.status(200).json({ status: "ok" }));

// Middleware de connexion DB — doit être avant toutes les routes métier
if (process.env.NODE_ENV !== "test") {
  app.use(async (_req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (err) {
      console.error("Erreur de connexion MongoDB :", err);
      res.status(503).json({ message: "Base de données indisponible" });
    }
  });
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

app.get("/api/courses", async (_req, res) => {
  try {
    const rawCourses = await Course.find().lean();
    const fullCourses = await Promise.all(
      rawCourses.map(async (course: any) => {
        const lessons = await Lesson.find({ course: course._id }).sort({ order: 1 }).lean();
        const quizzes = await Quiz.find({ course: course._id }).lean();
        const mappedLessons = (lessons || []).map((l: any) => ({
          ...l,
          courseId: l.course,
          htmlContent: l.htmlContent || l.content || "",
        }));
        return { ...course, lessons: mappedLessons, quizzes: quizzes || [] };
      })
    );
    return res.status(200).json(fullCourses);
  } catch (error) {
    console.error("Erreur patch courses:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});
app.use("/api/courses", courseRoutes);

app.get("/api/lessons", async (req, res, next) => {
  if (req.query.courseId || req.query.course) {
    try {
      const courseId = req.query.courseId || req.query.course;
      const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });
      return res.status(200).json(lessons);
    } catch {
      return res.status(500).json([]);
    }
  }
  next();
});
app.use("/api/lessons", lessonRoutes);

app.use("/api/quizzes", quizRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quiz-results", quizResultRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/progress", (_req, res) => res.status(200).json([]));

// ── Démarrage local uniquement ─────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  connectDB()
    .then(() => app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`)))
    .catch((err) => console.error("Impossible de démarrer :", err));
}

export default app;

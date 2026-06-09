import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import courseRoutes from "./routes/course.routes";
import lessonRoutes from "./routes/lesson.routes";
import quizRoutes from "./routes/quiz.routes";
import { connectDB } from "./config/db";
import userRoutes from "./routes/user.routes";

const app = express();
const PORT = process.env.PORT || 4242;

app.use(cors());
app.use(express.json());

// Tes routes applicatives
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/users", userRoutes);

// Ce middleware intercepte les erreurs de parsing (comme les tirets du FormData)
// et renvoie une réponse propre au lieu de faire crash Node.js
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && "status" in err && err.status === 400) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Le format des données envoyées est incorrect pour cette route (JSON mal formé ou FormData mal aiguillé).",
    });
  }
  next(err); // Transmet les autres types d'erreurs si nécessaire
});

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
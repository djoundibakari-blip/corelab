import express, { Express } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import courseRoutes from "./routes/course.routes";
import lessonRoutes from "./routes/lesson.routes";
import quizRoutes from "./routes/quiz.routes";
import userRoutes from "./routes/user.routes";
import quizResultRoutes from "./routes/quizResult.routes";
import notificationRoutes from "./routes/notification.routes";

dotenv.config();

export const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quiz-results", quizResultRoutes);
app.use("/api/notifications", notificationRoutes);

if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/corelab-course")
    .then(() => {
      console.log("Connected to MongoDB");
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error);
    });
}

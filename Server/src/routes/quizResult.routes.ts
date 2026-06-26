import { Router } from "express";
import { saveQuizResult, getQuizResults } from "../controllers/quizResult.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", requireAuth, getQuizResults);
router.post("/", requireAuth, saveQuizResult);
router.post("/submit", requireAuth, saveQuizResult);

export default router;

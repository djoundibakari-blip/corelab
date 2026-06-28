import { Router } from "express";
import { saveQuizResult, getQuizResults, getProgressAdmin } from "../controllers/quizResult.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.get("/", requireAuth, getQuizResults);
router.get("/progress/admin", requireAuth, requireRole(["admin"]), getProgressAdmin);
router.post("/", requireAuth, saveQuizResult);
router.post("/submit", requireAuth, saveQuizResult);

export default router;

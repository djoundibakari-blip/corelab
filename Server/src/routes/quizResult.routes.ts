import { Router } from "express";
import { saveQuizResult } from "../controllers/quizResult.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", requireAuth, saveQuizResult);
router.post("/submit", requireAuth, saveQuizResult);
router.get("/", async (req, res) => {
  return res.status(200).json([]);
});

export default router;
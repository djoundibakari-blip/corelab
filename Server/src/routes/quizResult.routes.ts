import { Router } from "express";
import { saveQuizResult } from "../controllers/quizResult.controller";

const router = Router();

router.post("/", saveQuizResult);
router.post("/submit", saveQuizResult);
router.get("/", async (req, res) => {
  return res.status(200).json([]);
});

export default router;
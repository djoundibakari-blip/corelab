import { Router } from "express";
import { saveQuizResult } from "../controllers/quizResult.controller";

const router = Router();

router.post("/submit", saveQuizResult);

export default router;
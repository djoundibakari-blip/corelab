import { Router } from "express";
import {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  importStructuredQuiz,
} from "../controllers/quiz.controller";

// Je protège les routes avec les middlewares d'authentification et de rôle
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

// On enchaîne requireAuth (pour décoder le token) puis requireRole (pour bloquer si pas admin)
router.post("/", requireAuth, requireRole(["admin"]), createQuiz);
router.post("/import", requireAuth, requireRole(["admin"]), importStructuredQuiz); 

router.get("/", getQuizzes);
router.get("/:id", getQuizById);

router.put("/:id", requireAuth, requireRole(["admin"]), updateQuiz);
router.delete("/:id", requireAuth, requireRole(["admin"]), deleteQuiz);

export default router;
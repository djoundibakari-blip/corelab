import { Router } from "express";
import {
  createLesson,
  getLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
} from "../controllers/lesson.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.post("/", requireAuth, requireRole(["admin"]), createLesson);
router.get("/", getLessons);
router.get("/:id", getLessonById);
router.put("/:id", requireAuth, requireRole(["admin"]), updateLesson);
router.delete("/:id", requireAuth, requireRole(["admin"]), deleteLesson);

export default router;
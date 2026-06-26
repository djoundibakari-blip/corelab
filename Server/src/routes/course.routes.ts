import { Router } from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  assignUserToCourse,
} from "../controllers/course.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.post("/", requireAuth, requireRole(["admin"]), createCourse);
router.get("/", getCourses);
router.post("/assign-user", requireAuth, requireRole(["admin"]), assignUserToCourse);
router.get("/:id", getCourseById);
router.put("/:id", requireAuth, requireRole(["admin"]), updateCourse);
router.delete("/:id", requireAuth, requireRole(["admin"]), deleteCourse);

export default router;
import { Router } from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  assignUserToCourse,
} from "../controllers/course.controller";

const router = Router();

router.post("/", createCourse);
router.get("/", getCourses);
router.post("/assign-user", assignUserToCourse);
router.get("/:id", getCourseById);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

export default router;
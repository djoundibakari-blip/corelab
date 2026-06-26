import { Router } from "express";
import upload from "../middlewares/uploadCsv";
import { importUsersFromCsv, getUsers } from "../controllers/user.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.get("/", requireAuth, requireRole(["admin"]), getUsers);
router.post("/import", requireAuth, requireRole(["admin"]), upload.single("file"), importUsersFromCsv);

export default router;
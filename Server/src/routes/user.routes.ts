import { Router } from "express";
import upload from "../middlewares/uploadCsv";
import { importUsersFromCsv } from "../controllers/user.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.post("/import", requireAuth, requireRole(["admin"]), upload.single("file"), importUsersFromCsv);

export default router;
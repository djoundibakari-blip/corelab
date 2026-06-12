import { Router } from "express";
import { getNotifications } from "../controllers/notification.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", requireAuth, getNotifications);

export default router;
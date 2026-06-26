

import { Router } from "express";
import { login, register, setupPassword } from "../controllers/auth.controller";
import { loginSchema, registerSchema } from "../validators/auth.schema";
import { validateBody } from "../middlewares/validateBody";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", validateBody(registerSchema.shape.body), register);
router.post("/login", validateBody(loginSchema.shape.body), login);
router.put("/setup-password", requireAuth, setupPassword);

export default router;
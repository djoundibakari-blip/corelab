

import { Router } from "express";
import { login, register } from "../controllers/auth.controller";
import { loginSchema, registerSchema } from "../validators/auth.schema";
import { validateBody } from "../middlewares/validateBody";

const router = Router();

router.post("/register", validateBody(registerSchema.shape.body), register);
router.post("/login", validateBody(loginSchema.shape.body), login);

export default router;
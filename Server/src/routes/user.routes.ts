import { Router } from "express";
import upload from "../middlewares/uploadCsv";
import { importUsersFromCsv } from "../controllers/user.controller";

const router = Router();

router.post("/import", upload.single("file"), importUsersFromCsv);

export default router;
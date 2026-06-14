import { Router } from "express";
import { saveQuizResult } from "../controllers/quizResult.controller";

const router = Router();

// On écoute la racine du préfixe affecté dans index.ts
router.post("/", saveQuizResult);
router.get("/", async (req, res) => {
  // Sécurité pour le carnet de notes : renvoie un tableau de résultats s'il n'y a pas de fonction get dédiée
  return res.status(200).json([]);
});

export default router;
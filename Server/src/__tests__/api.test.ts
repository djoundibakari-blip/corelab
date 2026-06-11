import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"; // Import nécessaire pour générer le token de test
import { app } from "../index"; 
import { Quiz } from "../models/Quiz";
import { User } from "../models/User";

describe("🧪 Tests d'Intégration API : Permissions & Validations", () => {
  
  let mockStudentId: string;
  let mockStudentToken: string; // Token généré pour le test
  let mockQuizId: string;
  let mockCourseId = new mongoose.Types.ObjectId().toString();

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect("mongodb://127.0.0.1:27017/corelab-course");
    }

    // 1. Création de l'utilisateur étudiant
    const student = await User.create({
      firstName: "Simple",
      lastName: "Student",
      email: "student-permissions@corelab.com",
      password: "password123",
      role: "student" 
    });
    mockStudentId = (student as any)._id.toString();

    // 2. Génération d'un faux token JWT simulant cet étudiant
    const secret = process.env.JWT_SECRET || "votre_secret_de_test";
    mockStudentToken = jwt.sign(
      { id: mockStudentId, role: "student" },
      secret,
      { expiresIn: "1h" }
    );

    // 3. Création d'un quiz de base
    const quiz = await Quiz.create({
      title: "Quiz Permissions",
      course: mockCourseId as any,
      questions: [
        {
          questionText: "Le TypeScript est-il typé ?",
          propositions: ["Oui", "Non"],
          correctAnswer: "Oui"
        }
      ]
    });
    mockQuizId = quiz._id.toString();
  });

  afterAll(async () => {
    await User.findByIdAndDelete(mockStudentId);
    await Quiz.findByIdAndDelete(mockQuizId);
    await mongoose.connection.close();
  });

  // ========================================================
  // 🔐 PARTIE 1 : TESTS DE PERMISSIONS (RÔLES ET ACCÈS)
  // ========================================================
  describe("🛡️ Permissions : Droits d'accès aux routes d'administration", () => {
    
    it("❌ Doit interdire à un étudiant de créer un quiz (Route Admin)", async () => {
      const response = await request(app)
        .post("/api/quizzes")
        .set("Authorization", `Bearer ${mockStudentToken}`) // Envoi du token étudiant
        .send({
          title: "Quiz Fraude",
          courseId: mockCourseId,
          questions: []
        });

      expect(response.status).toBe(403); 
      expect(response.body.message).toContain("Accès refusé");
    });

    it("❌ Doit interdire à un étudiant de supprimer un quiz (Route Admin)", async () => {
      const response = await request(app)
        .delete(`/api/quizzes/${mockQuizId}`)
        .set("Authorization", `Bearer ${mockStudentToken}`); // Envoi du token étudiant

      expect(response.status).toBe(403);
      expect(response.body.message).toContain("Accès refusé");
    });
  });

  // ========================================================
  // 📐 PARTIE 2 : TESTS DE VALIDATION DES DONNÉES (BAD INPUTS)
  // ========================================================
  describe("🗂️ Validations : Blocage des mauvais inputs", () => {

    it("❌ Doit bloquer la soumission si le format des réponses est incorrect", async () => {
      const response = await request(app)
        .post("/api/quiz-results/submit")
        .send({
          studentId: mockStudentId,
          quizId: mockQuizId,
          answers: "Pas un tableau" 
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it("❌ Doit bloquer les IDs MongoDB mal formés", async () => {
      const response = await request(app)
        .post("/api/quiz-results/submit")
        .send({
          studentId: "ID-COMPLETEMENT-FAUX-123", 
          quizId: mockQuizId,
          answers: ["Oui"]
        });

      expect(response.status).toBe(400);
    });
  });
});
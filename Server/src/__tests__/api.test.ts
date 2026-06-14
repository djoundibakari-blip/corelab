import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"; 
import { app } from "../index"; 
import { Quiz } from "../models/Quiz";
import { User } from "../models/User";

describe("test", () => {
  
  let mockStudentId: string;
  let mockStudentToken: string; 
  let mockQuizId: string;
  let mockCourseId = new mongoose.Types.ObjectId().toString();

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect("mongodb://127.0.0.1:27017/corelab-course");
    }

    //  On force une clé secrète globale pour le mode test si elle n'est pas définie dans le .env
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = "cle_secrete_de_test_super_robuste_123";
    }

    //  Création de l'utilisateur étudiant
    const student = await User.create({
      firstName: "Simple",
      lastName: "Student",
      email: `student-${Date.now()}@corelab.com`, // Email dynamique pour éviter les doublons en BDD
      password: "password123",
      role: "student" 
    });
    mockStudentId = (student as any)._id.toString();

    //  Génération du token JWT avec la clé secrète synchronisée
    mockStudentToken = jwt.sign(
      { id: mockStudentId, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    //  Création d'un quiz de base
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

  describe("Permissions", () => {

    it("un étudiant ne peut pas créer un quiz", async () => {
      const response = await request(app)
        .post("/api/quizzes")
        .set("Authorization", `Bearer ${mockStudentToken}`)
        .send({
          title: "Quiz Fraude",
          courseId: mockCourseId,
          questions: []
        });

      expect(response.status).toBe(403); 
      expect(response.body.message).toContain("Accès refusé");
    });

    it("un étudiant ne peut pas supprimer un quiz", async () => {
      const response = await request(app)
        .delete(`/api/quizzes/${mockQuizId}`)
        .set("Authorization", `Bearer ${mockStudentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain("Accès refusé");
    });
  });

  
  describe("Validations", () => {

    it("rejette les réponses qui ne sont pas un tableau", async () => {
      const response = await request(app)
        .post("/api/quiz-results/submit")
        .send({
          studentId: mockStudentId,
          quizId: mockQuizId,
          answers: "Pas un tableau" 
        });

      expect(response.status).toBe(400);
    });

    it("rejette un studentId invalide", async () => {
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
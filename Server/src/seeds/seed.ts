import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { User } from "../models/User";
import { Course } from "../models/Course";
import { Lesson } from "../models/Lesson";
import { Quiz } from "../models/Quiz";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/corelab-course";

interface CSVUser {
  firstName: string;
  lastName: string;
  role: "admin" | "student";
}

async function seedDatabase() {
  try {
    console.log(" 🔌 Connexion à la base de données...");
    await mongoose.connect(MONGO_URI);

    console.log(" 🧹 Nettoyage complet de la base de données...");
    await User.deleteMany({});
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Quiz.deleteMany({});

    // 1. IMPORTATION DES UTILISATEURS DU CSV
    const usersFromCSV: CSVUser[] = [];
    const csvFilePath = path.resolve(__dirname, "../../user.csv");

    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`Le fichier user.csv est introuvable : ${csvFilePath}`);
    }

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv({
          headers: ['firstName', 'lastName', 'role'],
          skipLines: 0,
          mapHeaders: ({ header }) => header.trim()
        }))
        .on("data", (data) => {
          if (data.firstName && data.firstName.trim() !== "firstName") {
            usersFromCSV.push(data);
          }
        })
        .on("end", () => resolve())
        .on("error", (error) => reject(error));
    });

    console.log(` 📂 Injection de ${usersFromCSV.length} utilisateurs...`);
    for (const u of usersFromCSV) {
      const cleanFirstName = u.firstName.trim().toLowerCase().replace(/\s+/g, "");
      const cleanLastName = u.lastName.trim().toLowerCase().replace(/\s+/g, "");
      const generatedEmail = `${cleanFirstName}.${cleanLastName}@corelab.com`;
      const uniquePassword = `${cleanLastName}123!`;

      await User.create({
        firstName: u.firstName.trim(),
        lastName: u.lastName.trim(),
        email: generatedEmail,
        password: uniquePassword, 
        role: u.role.trim() as any
      });
    }

    // 2. CRÉATION DES COURS (Avec le champ category désormais !)
    console.log(" 📚 Création des cours...");
    
    const courseBackend = await Course.create({
      title: "Développement Backend avec Node.js & Express",
      description: "Devenez autonome sur la création d'API REST robustes et sécurisées.",
      duration: "12 heures",
      level: "Intermédiaire",
      category: "Backend" // <--- Corrigé ici !
    });

    const courseArchitecture = await Course.create({
      title: "Architecture des Applications Modernes",
      description: "Comprenez comment structurer un projet professionnel et gérer la sécurité de vos données.",
      duration: "8 heures",
      level: "Avancé",
      category: "Architecture" // <--- Corrigé ici !
    });

    // 3. CRÉATION DES LEÇONS
    console.log(" 📖 Création des leçons...");

    await Lesson.create([
      {
        title: "Introduction aux architectures REST",
        content: "Dans cette leçon, nous allons voir comment fonctionnent les verbes HTTP (GET, POST, PUT, DELETE) et les codes de statut.",
        course: courseBackend._id,
        order: 1
      },
      {
        title: "Configuration d'Express et connexion MongoDB",
        content: "Découvrez comment initialiser un serveur Express stable et utiliser Mongoose pour manipuler votre base de données locale.",
        course: courseBackend._id,
        order: 2
      },
      {
        title: "Hachage des mots de passe avec Bcrypt",
        content: "Sécurisez vos données utilisateurs en mettant en place un système de hachage robuste grâce aux hooks pré-save de Mongoose.",
        course: courseArchitecture._id,
        order: 1
      }
    ]);

    // 4. CRÉATION DES QUIZ
    console.log(" 📝 Création des quiz d'évaluation...");

    await Quiz.create([
      {
        title: "Quiz : Validation des acquis Node.js",
        course: courseBackend._id,
        questions: [
          {
            questionText: "Quel middleware Express permet de décoder le JSON reçu dans le corps des requêtes ?",
            propositions: ["express.static()", "express.json()", "cors()", "dotenv"],
            correctAnswer: "express.json()"
          }
        ]
      },
      {
        title: "Quiz : Sécurité & Hachage",
        course: courseArchitecture._id,
        questions: [
          {
            questionText: "Pourquoi ne faut-il jamais stocker un mot de passe en clair dans une base de données ?",
            propositions: ["Parce que ça prend trop de place", "Pour éviter qu'un pirate informatique ne les lise en cas de fuite de données", "Parce que MongoDB refuse le texte simple", "Pour ralentir le serveur"],
            correctAnswer: "Pour éviter qu'un pirate informatique ne les lise en cas de fuite de données"
          }
        ]
      }
    ]);

    console.log(" 🎉 Base de données magnifiquement peuplée !");

  } catch (error) {
    console.error(" ❌ Erreur pendant le seeding :", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedDatabase();
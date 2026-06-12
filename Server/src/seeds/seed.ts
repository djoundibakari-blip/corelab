import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { Quiz } from "../models/Quiz";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/corelab-course";

async function seedDatabase() {
  try {
    console.log(" Connexion à la base de données pour le seeding...");
    await mongoose.connect(MONGO_URI);

    console.log(" Nettoyage de la base de données (Users & Quizzes)...");
    await User.deleteMany({});
    await Quiz.deleteMany({});

    console.log(" Chiffrement du mot de passe global ('123456')...");
    const hashedPassword = await bcrypt.hash("123456", 10);

    // 👥 Liste exacte des étudiants et admins de la  base de données
    const usersData = [
      { firstName: "Euphrasy", lastName: "Meyo", email: "euphrasy.meyo@test.com", role: "admin" },
      { firstName: "Djoundi", lastName: "Bakari", email: "djoundi.bakari@test.com", role: "admin" },
      { firstName: "Florian", lastName: "Grima", email: "florian.grima@test.com", role: "student" },
      { firstName: "Salma", lastName: "Naji", email: "salma.naji@test.com", role: "student" },
      { firstName: "Guillaume", lastName: "Soisson", email: "guillaume.soisson@test.com", role: "student" },
      { firstName: "Pauline", lastName: "Bouabssa", email: "pauline.bouabssa@test.com", role: "student" },
      { firstName: "Naïm", lastName: "Bilounga", email: "naim.bilounga@test.com", role: "student" },
      { firstName: "Fai", lastName: "Collins", email: "fai.collins@test.com", role: "student" },
      { firstName: "Pablo", lastName: "Moreno", email: "pablo.moreno@test.com", role: "student" },
      { firstName: "Alicia", lastName: "Kant", email: "alicia.kant@test.com", role: "student" },
      { firstName: "Eve", lastName: "Hotz", email: "eve.hotz@test.com", role: "student" },
      { firstName: "Dimitri", lastName: "Payet", email: "dimitri.paillet@test.com", role: "student" },
      { firstName: "Olivia", lastName: "Yace", email: "olivia.yace@test.com", role: "student" },
      { firstName: "Gabriel", lastName: "Prost", email: "gabriel.prost@test.com", role: "student" }
    ];

    console.log(` Insertion des ${usersData.length} utilisateurs dans MongoDB...`);
    for (const u of usersData) {
      await User.create({
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        password: hashedPassword,
        role: u.role
      });
    }

    // 📚 Création d'un ID de cours factif pour lier le quiz
    const mockCourseId = new mongoose.Types.ObjectId();

    console.log(" Insertion d'un quiz de démonstration CoreLab...");
    await Quiz.create({
      title: "Quiz d'Évaluation TypeScript & Sécurité",
      course: mockCourseId as any,
      questions: [
        {
          questionText: "Quel composant gère le filtrage et la validation des rôles d'accès (Admin/Student) ?",
          propositions: ["Le modèle Mongoose", "Le middleware Express", "Le validateur de schéma Zod", "Le script de compilation"],
          correctAnswer: "Le middleware Express"
        },
        {
          questionText: "Quelle bibliothèque permet de hacher de manière sécurisée les mots de passe avant l'insertion en BDD ?",
          propositions: ["Jsonwebtoken", "Bcrypt", "Mongoose", "Dotenv"],
          correctAnswer: "Bcrypt"
        }
      ]
    });

    console.log("\n Base de données seedée avec succès !");
    console.log("---------------------------------------------------------");
    console.log(` Identifiants : Utilisez l'un des emails ci-dessus`);
    console.log(` Mot de passe unique pour tous : 123456`);
    console.log("---------------------------------------------------------\n");

  } catch (error) {
    console.error(" Erreur pendant le processus de seeding :", error);
  } finally {
    await mongoose.connection.close();
    console.log(" Connexion MongoDB fermée proprement.");
    process.exit(0);
  }
}

seedDatabase();
import { Request, Response } from "express";
import fs from "fs";
import { User } from "../models/User";
import csv from "csv-parser";

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password").lean();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const importUsersFromCsv = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Fichier CSV requis" });
    }

    const results: any[] = [];

    //  Node.js à attendre que le CSV soit entièrement lu en mémoire
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(req.file!.path)
        .pipe(csv())
        .on("data", (data) => {
          // On n'ajoute la ligne que si elle contient au moins un prénom ou un email
          if (data.firstName || data.email) {
            results.push(data);
          }
        })
        .on("end", () => resolve())
        .on("error", (error) => reject(error));
    });

    // Une fois le fichier lu à 100%, on passe au traitement des données
    const users = results.map((row) => ({
      firstName: row.firstName ? row.firstName.trim() : "",
      lastName: row.lastName ? row.lastName.trim() : "",
      // SÉCURITÉ : On vérifie que l'email existe avant de faire le toLowerCase()
      email: row.email ? row.email.toLowerCase().trim() : "",
      password: row.password,
      role: row.role ? row.role.trim() : "student",
    }));

    // On insère en base de données avec l'option ordered: false
    await User.insertMany(users, { ordered: false });

    // On supprime le fichier , quand tout est réussi
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(201).json({
      message: "Utilisateurs importés avec succès",
      count: users.length,
    });

  } catch (error: any) {
    console.error("Erreur lors de l'import :", error);

    // Nettoyage du fichier en cas de problème
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Si MongoDB lève une erreur de doublon, on valide quand même car les nouveaux  ont été ajoutés
    if (error.code === 11000) {
      return res.status(201).json({
        message: "Importation terminée. Les nouveaux profils ont été ajoutés, les doublons ignorés.",
      });
    }

    return res.status(500).json({ message: "Erreur lors de l'import" });
  }
};
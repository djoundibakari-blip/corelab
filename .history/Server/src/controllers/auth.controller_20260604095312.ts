import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

export const login = async (req: Request, res: Response) => {
  try {
    console.log("BODY REÇU :", req.body);

    const { email, password } = req.body;

    console.log("EMAIL :", email);
    console.log("PASSWORD PRÉSENT ?", !!password);

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const user = await User.findOne({ email });
    console.log("UTILISATEUR TROUVÉ :", user);

    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const isMatch = await user.comparePassword(password);
    console.log("MOT DE PASSE CORRESPOND ?", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
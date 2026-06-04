import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
// chercher à se connecter avec l'email et le mot de passe fournis
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }
// si pas trouvé ou mot de passe incorrect, retourner une erreur d'identifiants invalides
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }
si le mot de 
    const isMatch = await user.comparePassword(password);
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
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
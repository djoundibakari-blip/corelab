import { Request, Response } from "express";
import { Notification } from "../models/Notification";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id; // Récupéré via le middleware requireAuth
    const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 });
    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la récupération des notifications." });
  }
};
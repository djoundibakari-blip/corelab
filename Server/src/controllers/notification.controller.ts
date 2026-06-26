import { Request, Response } from "express";
import { Notification } from "../models/Notification";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 }).limit(20);
    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const markAllRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
    return res.status(200).json({ message: "Notifications marquées comme lues" });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

import { Request, Response } from "express";
import { Lesson } from "../models/Lesson";

export const createLesson = async (req: Request, res: Response) => {
  try {
    const lesson = await Lesson.create(req.body);
    return res.status(201).json(lesson);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getLessons = async (_req: Request, res: Response) => {
  try {
    const lessons = await Lesson.find().populate("course");
    return res.status(200).json(lessons);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getLessonById = async (req: Request, res: Response) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("course");
    if (!lesson) {
      return res.status(404).json({ message: "Leçon introuvable" });
    }
    return res.status(200).json(lesson);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateLesson = async (req: Request, res: Response) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!lesson) {
      return res.status(404).json({ message: "Leçon introuvable" });
    }
    return res.status(200).json(lesson);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: "Leçon introuvable" });
    }
    return res.status(200).json({ message: "Leçon supprimée" });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
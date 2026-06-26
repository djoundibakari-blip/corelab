import { Request, Response } from "express";
import { Course } from "../models/Course";
import { User } from "../models/User";

export const createCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.create(req.body);
    return res.status(201).json(course);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getCourses = async (_req: Request, res: Response) => {
  try {
    const courses = await Course.find().populate("students");
    return res.status(200).json(courses);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id).populate("students");
    if (!course) {
      return res.status(404).json({ message: "Cours introuvable" });
    }
    return res.status(200).json(course);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("students");

    if (!course) {
      return res.status(404).json({ message: "Cours introuvable" });
    }

    return res.status(200).json(course);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Cours introuvable" });
    }
    return res.status(200).json({ message: "Cours supprimé" });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const assignUserToCourse = async (req: Request, res: Response) => {
  try {
    const { courseId, userId } = req.body;

    if (!courseId || !userId) {
      return res.status(400).json({ message: "courseId et userId sont requis" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Cours introuvable" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const alreadyAssigned = course.students.some(
      (id) => id.toString() === userId
    );

    if (alreadyAssigned) {
      return res.status(400).json({ message: "Utilisateur déjà affecté" });
    }

    course.students.push(user._id);
    await course.save();

    return res.status(200).json({
      message: "Utilisateur affecté au cours avec succès",
      course,
    });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
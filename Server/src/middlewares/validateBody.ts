 
import { Request, Response, NextFunction } from "express";
import { ZodError, ZodTypeAny } from "zod";

export const validateBody = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Données invalides",
          errors: error.issues,
        });
      }
      return res.status(500).json({ message: "Erreur serveur" });
    }
  };
};
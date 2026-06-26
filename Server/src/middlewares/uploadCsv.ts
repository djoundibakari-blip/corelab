import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

const csvFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (
    file.mimetype === "text/csv" ||
    file.mimetype === "application/vnd.ms-excel" ||
    file.originalname.toLowerCase().endsWith(".csv")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Seuls les fichiers CSV sont acceptés"));
  }
};

const upload = multer({
  dest: "/tmp/uploads/",
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: csvFilter,
});

export default upload;

import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

export type UserRole = "admin" | "student";
// les rôles sont limités à "admin" et "student" pour garantir une gestion claire des permissions et des fonctionnalités dans l'application. Les administrateurs auront des privilèges étendus pour gérer les utilisateurs, les cours et les ressources, tandis que les étudiants auront des accès restreints pour consulter les cours et soumettre des devoirs. Cette approche permet de maintenir la sécurité et l'intégrité de l'application tout en offrant une expérience utilisateur adaptée à chaque rôle.   
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "student"],
      default: "student",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
// pre save permet le hacha
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparePassword = function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser>("User", userSchema);
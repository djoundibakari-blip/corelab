import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

export type UserRole = "admin" | "student";
// limiter les rôles possibles à "admin" et "student"
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

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});
// pre save pour hacher le mot de passe avant la sauvegarde 
userSchema.methods.comparePassword = function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser>("User", userSchema);
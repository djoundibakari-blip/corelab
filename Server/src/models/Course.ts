import { Schema, model, Document, Types } from "mongoose";

export interface ICourse extends Document {
  title: string;
  description: string;
  category: string;
  students: Types.ObjectId[];
}

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const Course = model<ICourse>("Course", courseSchema);
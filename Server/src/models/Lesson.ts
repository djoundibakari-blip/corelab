import { Schema, model, Document } from "mongoose";

export interface ILesson extends Document {
  title: string;
  htmlContent: string;
  course: Schema.Types.ObjectId;
  order: number;
  availableAt?: Date;
}

const lessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true, trim: true },
    htmlContent: { type: String, required: true, trim: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    order: { type: Number, default: 0 },
    availableAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Lesson = model<ILesson>("Lesson", lessonSchema);

import { Schema, model, Document } from "mongoose";

export interface ILesson extends Document {
  title: string;
  content: string;
  course: Schema.Types.ObjectId;
}

const lessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  },
  { timestamps: true }
);

export const Lesson = model<ILesson>("Lesson", lessonSchema);
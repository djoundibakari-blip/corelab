import { Schema, model, Document } from "mongoose";

export interface IQuiz extends Document {
  title: string;
  questions: string[];
  course: Schema.Types.ObjectId;
}

const quizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    questions: {
      type: [String],
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Quiz = model<IQuiz>("Quiz", quizSchema);
import { Schema, model, Document } from "mongoose";

export interface IQuestion {
  questionText: string;
  propositions: string[];
  correctAnswer: string;
}

export interface IQuiz extends Document {
  title: string;
  questions: IQuestion[];
  course: Schema.Types.ObjectId;
}

const questionSchema = new Schema<IQuestion>(
  {
    questionText: {
      type: String,
      required: true,
    },
    propositions: {
      type: [String],
      required: true,
    },
    correctAnswer: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const quizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    questions: {
      type: [questionSchema],
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
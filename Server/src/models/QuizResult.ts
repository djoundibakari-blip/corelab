import mongoose, { Schema, Document } from "mongoose";

export interface IQuizResult extends Document {
  student: mongoose.Types.ObjectId;
  quiz: mongoose.Types.ObjectId;
  answers: string[];
  score: number;
  createdAt: Date;
}

const QuizResultSchema: Schema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: "User", required: true },
  quiz: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
  answers: { type: [String], required: true },
  score: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const QuizResult = mongoose.model<IQuizResult>("QuizResult", QuizResultSchema);
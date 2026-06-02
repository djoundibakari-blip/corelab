"use client";

import { useState } from "react";
import { ChevronRight, Clock } from "lucide-react";
import QuizResult from "./QuizResult";

const MOCK_QUIZ = {
  title: "Fondamentaux JavaScript",
  passingScore: 70,
  questions: [
    {
      id: 1,
      text: "Quel mot-clé est utilisé pour déclarer une variable avec une portée de bloc en JavaScript moderne ?",
      options: ["var", "let", "def", "dim"],
    },
    {
      id: 2,
      text: "Que retourne la méthode Array `.map()` ?",
      options: [
        "Le tableau original modifié",
        "Un nouveau tableau de la même longueur",
        "Un sous-ensemble filtré du tableau",
        "La somme de tous les éléments",
      ],
    },
    {
      id: 3,
      text: "Lequel des éléments suivants n'est PAS un type primitif en JavaScript ?",
      options: ["string", "boolean", "object", "number"],
    },
    {
      id: 4,
      text: "Qu'est-ce que `===` vérifie en JavaScript ?",
      options: [
        "La valeur uniquement",
        "Le type uniquement",
        "La valeur et le type",
        "L'égalité de référence",
      ],
    },
    {
      id: 5,
      text: "Quel est le résultat de `typeof null` ?",
      options: ["'null'", "'undefined'", "'object'", "'boolean'"],
    },
  ],
};

const CORRECT_ANSWERS: Record<number, number> = {
  1: 1,
  2: 1,
  3: 2,
  4: 2,
  5: 2,
};

export default function QuizView() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const quiz = MOCK_QUIZ;
  const total = quiz.questions.length;
  const current = quiz.questions[currentIndex];
  const progress = ((currentIndex + 1) / total) * 100;

  const handleSelect = (optionIdx: number) => {
    setAnswers((prev) => ({ ...prev, [current.id]: optionIdx }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentIndex(0);
    setSubmitted(false);
  };

  if (submitted) {
    const correct = quiz.questions.filter(
      (q) => answers[q.id] === CORRECT_ANSWERS[q.id]
    ).length;
    const score = Math.round((correct / total) * 100);
    return (
      <QuizResult
        score={score}
        passingScore={quiz.passingScore}
        quizTitle={quiz.title}
        onRetry={handleRetry}
      />
    );
  }

  const isAnswered = answers[current.id] !== undefined;
  const isLast = currentIndex === total - 1;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1">
            Quiz Actif
          </p>
          <h2 className="text-xl font-bold text-foreground text-balance">
            {quiz.title}
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-secondary border border-border rounded-lg px-3 py-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Question{" "}
            <span className="text-foreground font-semibold">
              {currentIndex + 1}
            </span>{" "}
            sur <span className="text-foreground font-semibold">{total}</span>
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-base font-semibold text-foreground leading-relaxed mb-6">
          {current.text}
        </p>

        <div className="flex flex-col gap-3">
          {current.options.map((option, idx) => {
            const selected = answers[current.id] === idx;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left px-4 py-3.5 rounded-lg border transition-all duration-150 flex items-center gap-3 group
                  ${
                    selected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50 hover:bg-secondary hover:text-foreground"
                  }`}
              >
                <span
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
                    ${selected ? "border-primary" : "border-border group-hover:border-primary/50"}`}
                >
                  {selected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-primary block" />
                  )}
                </span>
                <span className="text-sm font-medium leading-relaxed">
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Précédent
        </button>

        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < total}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground font-semibold px-6 py-2.5 rounded-lg transition-all duration-150 text-sm"
          >
            Soumettre le Quiz
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
            disabled={!isAnswered}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground font-semibold px-5 py-2.5 rounded-lg transition-all duration-150 text-sm"
          >
            Suivant
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Question dots navigator */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {quiz.questions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-7 h-7 rounded-md text-xs font-semibold border transition-all
              ${
                idx === currentIndex
                  ? "bg-primary border-primary text-primary-foreground"
                  : answers[q.id] !== undefined
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "bg-secondary border-border text-muted-foreground hover:border-primary/40"
              }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

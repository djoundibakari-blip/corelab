"use client";

import { CheckCircle2, XCircle, ArrowRight, RefreshCw } from "lucide-react";

interface QuizResultProps {
  score: number;
  passingScore: number;
  quizTitle: string;
  onRetry: () => void;
}

export default function QuizResult({
  score,
  passingScore,
  quizTitle,
  onRetry,
}: QuizResultProps) {
  const passed = score >= passingScore;

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      {/* Status icon */}
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center
          ${passed ? "bg-success/15 ring-4 ring-success/30" : "bg-destructive/15 ring-4 ring-destructive/30"}`}
      >
        {passed ? (
          <CheckCircle2 className="w-10 h-10 text-success" strokeWidth={1.5} />
        ) : (
          <XCircle className="w-10 h-10 text-destructive" strokeWidth={1.5} />
        )}
      </div>

      {/* Result text */}
      <div className="text-center flex flex-col gap-2">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mx-auto
            ${passed ? "bg-success/15 text-success border border-success/30" : "bg-destructive/15 text-destructive border border-destructive/30"}`}
        >
          {passed ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" /> Réussi
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5" /> Échoué
            </>
          )}
        </span>
        <h2 className="text-2xl font-bold text-foreground mt-2">{quizTitle}</h2>
        <p className="text-muted-foreground text-sm">
          {passed
            ? "Excellent travail ! Vous avez réussi cette évaluation."
            : "N'abandonnez pas — révisez le matériel et réessayez."}
        </p>
      </div>

      {/* Score card */}
      <div className="w-full max-w-sm bg-card border border-border rounded-xl overflow-hidden">
        {/* Score bar */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-end justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Votre score
            </span>
            <span
              className={`text-3xl font-black ${passed ? "text-success" : "text-destructive"}`}
            >
              {score}%
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${passed ? "bg-success" : "bg-destructive"}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        <div className="border-t border-border px-6 py-4 flex items-center justify-between">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Requis
            </p>
            <p className="text-lg font-bold text-foreground mt-0.5">
              {passingScore}%
            </p>
          </div>
          <div
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold
              ${passed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
          >
            {passed
              ? `+${score - passingScore}% au-dessus du minimum`
              : `${passingScore - score}% sous le minimum`}
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              Obtenu
            </p>
            <p className="text-lg font-bold text-foreground mt-0.5">{score}%</p>
          </div>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        {passed ? (
          <button className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-lg transition-all duration-150 text-sm">
            Passer à la leçon suivante
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-lg transition-all duration-150 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer le Quiz
          </button>
        )}
        <button
          onClick={onRetry}
          className="flex-1 flex items-center justify-center gap-2 border border-border bg-secondary hover:bg-muted text-secondary-foreground font-semibold px-6 py-3 rounded-lg transition-all duration-150 text-sm"
        >
          Retour au cours
        </button>
      </div>
    </div>
  );
}

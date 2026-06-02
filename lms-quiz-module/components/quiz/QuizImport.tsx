"use client";

import { useState, useRef } from "react";
import {
  UploadCloud,
  FileJson,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type ImportStatus = "idle" | "validating" | "success" | "error";

const EXAMPLE_FORMAT = `[
  {
    "question": "Qu'est-ce que React ?",
    "options": ["Une base de données", "Une bibliothèque JS", "Un serveur", "Un framework CSS"],
    "correct": [1]
  },
  {
    "question": "Quel hook gère l'état ?",
    "options": ["useEffect", "useRef", "useState", "useContext"],
    "correct": [2]
  }
]`;

export default function QuizImport() {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [showFormat, setShowFormat] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setStatus("idle");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleValidate = () => {
    if (!file) return;
    setStatus("validating");
    // Simulate async validation
    setTimeout(() => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "json" || ext === "csv") {
        setStatus("success");
      } else {
        setStatus("error");
      }
    }, 1400);
  };

  const handleClear = () => {
    setFile(null);
    setStatus("idle");
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1">
          Gestion du Quiz
        </p>
        <h2 className="text-xl font-bold text-foreground">Importer un Quiz</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Téléchargez un fichier JSON ou CSV structuré pour créer une nouvelle évaluation de quiz.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !file && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-4 transition-all duration-200 cursor-pointer
          ${
            dragOver
              ? "border-primary bg-primary/5"
              : file
              ? "border-border bg-secondary/30 cursor-default"
              : "border-border bg-secondary/20 hover:border-primary/50 hover:bg-secondary/40"
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {file ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <FileJson className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors border border-border rounded-md px-2.5 py-1.5"
            >
              <X className="w-3.5 h-3.5" /> Supprimer
            </button>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-xl bg-secondary border border-border flex items-center justify-center">
              <UploadCloud className="w-7 h-7 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground text-sm">
                Glissez-déposez votre fichier de quiz ici
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ou{" "}
                <span className="text-primary underline underline-offset-2">
                  parcourez les fichiers
                </span>{" "}
                — JSON ou CSV acceptés
              </p>
            </div>
          </>
        )}
      </div>

      {/* Status feedback */}
      {status === "success" && (
        <div className="flex items-center gap-3 bg-success/10 border border-success/30 text-success rounded-lg px-4 py-3 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          Quiz validé et importé avec succès !{" "}
          <span className="text-success/70 font-normal">
            Questions ajoutées à la banque de questions.
          </span>
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          Format de fichier invalide. Veuillez télécharger un fichier .json ou .csv.
        </div>
      )}

      {/* Action button */}
      <button
        onClick={handleValidate}
        disabled={!file || status === "validating" || status === "success"}
        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground font-semibold py-3 rounded-lg transition-all duration-150 text-sm"
      >
        {status === "validating" ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
            Validation en cours...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Valider et Importer
          </>
        )}
      </button>

      {/* Format reference */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setShowFormat((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-secondary/50 hover:bg-secondary transition-colors text-sm font-medium text-muted-foreground"
        >
          <span className="flex items-center gap-2">
            <FileJson className="w-4 h-4" />
            Format JSON attendu
          </span>
          {showFormat ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {showFormat && (
          <pre className="bg-background text-xs text-muted-foreground p-4 overflow-x-auto leading-relaxed font-mono">
            {EXAMPLE_FORMAT}
          </pre>
        )}
      </div>
    </div>
  );
}

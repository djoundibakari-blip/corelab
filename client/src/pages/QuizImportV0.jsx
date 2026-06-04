import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileJson,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import axios from 'axios';

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

export default function QuizImportV0() {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [showFormat, setShowFormat] = useState(false);
  const [lessonId, setLessonId] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const fileInputRef = useRef(null);

  const handleFile = (f) => {
    setFile(f);
    setStatus('idle');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleValidate = async () => {
    if (!file) return;
    if (!lessonId) {
      setStatus('error');
      return;
    }

    setStatus('validating');
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = JSON.parse(event.target.result);
          const token = localStorage.getItem('token');
          
          await axios.post('http://localhost:4242/api/quizzes/import', {
            lessonId,
            questions: content.questions || content,
            passingScore,
            answers: content.answers || content.map(q => q.correct)
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setStatus('success');
        } catch (err) {
          setStatus('error');
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setStatus('error');
    }
  };

  const handleClear = () => {
    setFile(null);
    setStatus('idle');
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">
          Gestion du Quiz
        </p>
        <h2 className="text-xl font-bold text-gray-900">Importer un Quiz</h2>
        <p className="text-sm text-gray-600 mt-1">
          Téléchargez un fichier JSON ou CSV structuré pour créer une nouvelle évaluation de quiz.
        </p>
      </div>

      {/* Lesson ID input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ID de la leçon *
        </label>
        <input
          type="text"
          value={lessonId}
          onChange={(e) => setLessonId(e.target.value)}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
          placeholder="Ex: 507f1f77bcf86cd799439011"
        />
      </div>

      {/* Passing score input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Note minimale de réussite (%)
        </label>
        <input
          type="number"
          value={passingScore}
          onChange={(e) => setPassingScore(parseInt(e.target.value))}
          min="0"
          max="100"
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
        />
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
              ? "border-blue-600 bg-blue-50"
              : file
              ? "border-gray-200 bg-gray-50 cursor-default"
              : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-gray-100"
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
            <div className="w-14 h-14 rounded-xl bg-blue-100 border border-blue-300 flex items-center justify-center">
              <FileJson className="w-7 h-7 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900 text-sm">{file.name}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-red-600 transition-colors border border-gray-200 rounded-md px-2.5 py-1.5"
            >
              <X className="w-3.5 h-3.5" /> Supprimer
            </button>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
              <UploadCloud className="w-7 h-7 text-gray-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900 text-sm">
                Glissez-déposez votre fichier de quiz ici
              </p>
              <p className="text-xs text-gray-600 mt-1">
                ou{" "}
                <span className="text-blue-600 underline underline-offset-2">
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
        <div className="flex items-center gap-3 bg-green-50 border border-green-300 text-green-700 rounded-lg px-4 py-3 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          Quiz validé et importé avec succès !{" "}
          <span className="text-green-600 font-normal">
            Questions ajoutées à la banque de questions.
          </span>
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {lessonId ? "Format de fichier invalide. Veuillez télécharger un fichier .json ou .csv." : "Veuillez entrer l'ID de la leçon."}
        </div>
      )}

      {/* Action button */}
      <button
        onClick={handleValidate}
        disabled={!file || status === "validating" || status === "success"}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-150 text-sm"
      >
        {status === "validating" ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
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
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowFormat((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600"
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
          <pre className="bg-white text-xs text-gray-600 p-4 overflow-x-auto leading-relaxed font-mono">
            {EXAMPLE_FORMAT}
          </pre>
        )}
      </div>
    </div>
  );
}

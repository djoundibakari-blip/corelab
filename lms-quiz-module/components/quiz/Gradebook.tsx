"use client";

import { useState, useMemo } from "react";
import { Search, CheckCircle2, XCircle, ChevronUp, ChevronDown, TrendingUp } from "lucide-react";

type Status = "Passed" | "Failed";

interface GradeEntry {
  id: number;
  email: string;
  quizTitle: string;
  bestScore: number;
  status: Status;
  submissionDate: string;
}

const MOCK_GRADES: GradeEntry[] = [
  { id: 1, email: "alice.martin@corp.io", quizTitle: "JavaScript Fundamentals", bestScore: 92, status: "Passed", submissionDate: "2025-05-28" },
  { id: 2, email: "bob.chen@corp.io", quizTitle: "React Hooks Deep Dive", bestScore: 65, status: "Failed", submissionDate: "2025-05-27" },
  { id: 3, email: "carla.dupont@corp.io", quizTitle: "JavaScript Fundamentals", bestScore: 78, status: "Passed", submissionDate: "2025-05-27" },
  { id: 4, email: "david.kim@corp.io", quizTitle: "Node.js & Express APIs", bestScore: 55, status: "Failed", submissionDate: "2025-05-26" },
  { id: 5, email: "eva.rossi@corp.io", quizTitle: "React Hooks Deep Dive", bestScore: 88, status: "Passed", submissionDate: "2025-05-25" },
  { id: 6, email: "frank.müller@corp.io", quizTitle: "MongoDB Schemas", bestScore: 72, status: "Passed", submissionDate: "2025-05-25" },
  { id: 7, email: "grace.lee@corp.io", quizTitle: "Node.js & Express APIs", bestScore: 48, status: "Failed", submissionDate: "2025-05-24" },
  { id: 8, email: "hugo.silva@corp.io", quizTitle: "MongoDB Schemas", bestScore: 95, status: "Passed", submissionDate: "2025-05-23" },
  { id: 9, email: "iris.ng@corp.io", quizTitle: "JavaScript Fundamentals", bestScore: 61, status: "Failed", submissionDate: "2025-05-22" },
  { id: 10, email: "jack.williams@corp.io", quizTitle: "React Hooks Deep Dive", bestScore: 83, status: "Passed", submissionDate: "2025-05-21" },
];

type SortKey = "email" | "bestScore" | "submissionDate";
type SortDir = "asc" | "desc";

export default function Gradebook() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");
  const [sortKey, setSortKey] = useState<SortKey>("submissionDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    return MOCK_GRADES.filter((g) => {
      const matchSearch = g.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || g.status === statusFilter;
      return matchSearch && matchStatus;
    }).sort((a, b) => {
      let valA: string | number = a[sortKey];
      let valB: string | number = b[sortKey];
      if (sortKey === "bestScore") {
        valA = a.bestScore;
        valB = b.bestScore;
      }
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [search, statusFilter, sortKey, sortDir]);

  const totalPassed = MOCK_GRADES.filter((g) => g.status === "Passed").length;
  const passRate = Math.round((totalPassed / MOCK_GRADES.length) * 100);
  const avgScore = Math.round(
    MOCK_GRADES.reduce((acc, g) => acc + g.bestScore, 0) / MOCK_GRADES.length
  );

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === "asc" ? (
        <ChevronUp className="w-3.5 h-3.5 text-primary" />
      ) : (
        <ChevronDown className="w-3.5 h-3.5 text-primary" />
      )
    ) : (
      <ChevronUp className="w-3.5 h-3.5 text-muted-foreground/40" />
    );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1">
          Tableau de Bord Admin
        </p>
        <h2 className="text-xl font-bold text-foreground">Carnet de Notes</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Suivez les performances des étudiants sur tous les quiz.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Total Soumis
          </p>
          <p className="text-2xl font-black text-foreground mt-1">
            {MOCK_GRADES.length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Taux de Réussite
          </p>
          <p className="text-2xl font-black text-success mt-1">{passRate}%</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Score Moyen
          </p>
          <p className="text-2xl font-black text-primary mt-1 flex items-center gap-1">
            {avgScore}%
            <TrendingUp className="w-4 h-4" />
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par email d'étudiant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "All" | Status)}
          className="bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition appearance-none pr-8 cursor-pointer"
        >
          <option value="All">Tous les Statuts</option>
          <option value="Passed">Réussi</option>
          <option value="Failed">Échoué</option>
        </select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/60">
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
                  onClick={() => handleSort("email")}
                >
                  <span className="flex items-center gap-1">
                    Email Étudiant <SortIcon col="email" />
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Titre du Quiz
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
                  onClick={() => handleSort("bestScore")}
                >
                  <span className="flex items-center gap-1">
                    Meilleur Score <SortIcon col="bestScore" />
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Statut
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
                  onClick={() => handleSort("submissionDate")}
                >
                  <span className="flex items-center gap-1">
                    Date <SortIcon col="submissionDate" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground text-sm"
                  >
                    Aucun résultat ne correspond à vos filtres.
                  </td>
                </tr>
              ) : (
                filtered.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`border-b border-border last:border-0 transition-colors hover:bg-secondary/40
                      ${i % 2 === 0 ? "bg-background" : "bg-secondary/10"}`}
                  >
                    <td className="px-4 py-3.5 font-medium text-foreground">
                      {row.email}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {row.quizTitle}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-secondary rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${row.status === "Passed" ? "bg-success" : "bg-destructive"}`}
                            style={{ width: `${row.bestScore}%` }}
                          />
                        </div>
                        <span
                          className={`font-bold text-sm ${row.status === "Passed" ? "text-success" : "text-destructive"}`}
                        >
                          {row.bestScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
                          ${
                            row.status === "Passed"
                              ? "bg-success/10 text-success border-success/30"
                              : "bg-destructive/10 text-destructive border-destructive/30"
                          }`}
                      >
                        {row.status === "Passed" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {row.status === "Passed" ? "Réussi" : "Échoué"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground tabular-nums text-sm">
                      {new Date(row.submissionDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="border-t border-border px-4 py-2.5 bg-secondary/30 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Affichage de{" "}
              <span className="text-foreground font-semibold">
                {filtered.length}
              </span>{" "}
              sur{" "}
              <span className="text-foreground font-semibold">
                {MOCK_GRADES.length}
              </span>{" "}
              entrées
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

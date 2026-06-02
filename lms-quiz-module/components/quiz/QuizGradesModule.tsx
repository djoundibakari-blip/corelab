"use client";

import { useState } from "react";
import { BookOpen, BarChart3, UploadCloud, GraduationCap } from "lucide-react";
import QuizView from "./QuizView";
import QuizImport from "./QuizImport";
import Gradebook from "./Gradebook";

type Role = "student" | "admin";
type StudentTab = "quiz";
type AdminTab = "import" | "gradebook";
type ActiveTab = StudentTab | AdminTab;

export default function QuizGradesModule() {
  const [role, setRole] = useState<Role>("student");
  const [activeTab, setActiveTab] = useState<ActiveTab>("quiz");

  const handleRoleSwitch = (newRole: Role) => {
    setRole(newRole);
    setActiveTab(newRole === "student" ? "quiz" : "gradebook");
  };

  const studentTabs = [
    { id: "quiz" as const, label: "Passer le Quiz", icon: BookOpen },
  ];

  const adminTabs = [
    { id: "gradebook" as const, label: "Carnet de Notes", icon: BarChart3 },
    { id: "import" as const, label: "Importer un Quiz", icon: UploadCloud },
  ];

  const tabs = role === "student" ? studentTabs : adminTabs;

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-black text-foreground tracking-tight text-lg">
              CORE<span className="text-primary">LAB</span>
            </span>
            <span className="hidden sm:block text-muted-foreground text-sm font-medium ml-2 pl-2 border-l border-border">
              Quiz &amp; Notes
            </span>
          </div>

          {/* Role switcher */}
          <div className="flex items-center bg-secondary border border-border rounded-lg p-0.5 text-sm">
            <button
              onClick={() => handleRoleSwitch("student")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all duration-150 text-xs
                ${role === "student"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Vue Étudiant
            </button>
            <button
              onClick={() => handleRoleSwitch("admin")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all duration-150 text-xs
                ${role === "admin"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Vue Admin
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Role badge */}
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase border
              ${role === "student"
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-accent/10 text-accent border-accent/30"
              }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${role === "student" ? "bg-primary" : "bg-accent"}`} />
            {role === "student" ? "Étudiant" : "Administrateur"}
          </span>
          <span className="text-xs text-muted-foreground">
            {role === "student"
              ? "Connecté en tant que Jane Doe · Parcours JavaScript"
              : "Connecté en tant que Prof. Leclerc · Admin Module"}
          </span>
        </div>

        <div className="flex gap-6 flex-col lg:flex-row items-start">
          {/* Sidebar nav */}
          <nav className="w-full lg:w-52 flex-shrink-0">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-3 py-2.5 border-b border-border">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {role === "student" ? "Apprentissage" : "Gestion"}
                </p>
              </div>
              <ul className="p-2 flex flex-col gap-0.5">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <li key={id}>
                    <button
                      onClick={() => setActiveTab(id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                        ${activeTab === id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${activeTab === id ? "text-primary" : ""}`} />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Info card */}
            {role === "student" && (
              <div className="mt-4 bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Module Actuel
                </p>
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Fondamentaux JavaScript
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    5 questions · 70% pour réussir
                  </p>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progression du module</span>
                    <span className="text-primary font-semibold">60%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                    <div className="h-1.5 rounded-full bg-primary" style={{ width: "60%" }} />
                  </div>
                </div>
              </div>
            )}
          </nav>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
              {activeTab === "quiz" && <QuizView />}
              {activeTab === "import" && <QuizImport />}
              {activeTab === "gradebook" && <Gradebook />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

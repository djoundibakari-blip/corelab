import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { User } from "./models/User";
import { Course } from "./models/Course";
import { Lesson } from "./models/Lesson";
import { Quiz } from "./models/Quiz";
import { QuizResult } from "./models/QuizResult";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error("MONGODB_URI manquant"); process.exit(1); }
  await mongoose.connect(uri);
  console.log("Connecté à MongoDB");

  // ── Utilisateurs ────────────────────────────────────────────────────────────
  const usersData = [
    { firstName: "Admin", lastName: "CoreLab", email: "admin@corelab.fr", password: "Admin1234", role: "admin" as const },
    { firstName: "Sophie", lastName: "Martin", email: "sophie.martin@student.fr", password: "Eleve1234", role: "student" as const },
    { firstName: "Marc", lastName: "Dupont", email: "marc.dupont@student.fr", password: "Eleve1234", role: "student" as const },
    { firstName: "Léa", lastName: "Bernard", email: "lea.bernard@student.fr", password: "Eleve1234", role: "student" as const },
    { firstName: "Eleve", lastName: "Test", email: "eleve@corelab.fr", password: "Eleve1234", role: "student" as const },
  ];

  const users: any[] = [];
  for (const u of usersData) {
    let user = await User.findOne({ email: u.email });
    if (!user) { user = await User.create(u); console.log(`  ✓ User: ${u.email}`); }
    else console.log(`  → User déjà existant: ${u.email}`);
    users.push(user);
  }
  const students = users.filter(u => u.role === "student");

  // ── Cours ───────────────────────────────────────────────────────────────────
  const coursesData = [
    {
      title: "JavaScript Fondamentaux",
      description: "Maîtrisez les bases de JavaScript : variables, fonctions, objets, ES6+.",
      category: "JavaScript",
    },
    {
      title: "React.js — De zéro à l'application",
      description: "Construisez des interfaces modernes avec React, hooks et React Router.",
      category: "React",
    },
  ];

  const courses: any[] = [];
  for (const c of coursesData) {
    let course = await Course.findOne({ title: c.title });
    if (!course) {
      course = await Course.create({ ...c, students: students.map((s: any) => s._id) });
      console.log(`  ✓ Cours: ${c.title}`);
    } else {
      await Course.findByIdAndUpdate(course._id, { students: students.map((s: any) => s._id) });
      console.log(`  → Cours déjà existant: ${c.title}`);
    }
    courses.push(course);
  }

  // ── Leçons JavaScript ───────────────────────────────────────────────────────
  const jsLessons = [
    {
      title: "Introduction à JavaScript",
      order: 1,
      htmlContent: `<h1>Introduction à JavaScript</h1>
<p>JavaScript est le langage du web. Il s'exécute dans le navigateur et côté serveur (Node.js).</p>
<h2>Votre premier script</h2>
<pre><code>console.log("Hello, World!");</code></pre>
<p>JavaScript est <strong>dynamiquement typé</strong> et <strong>interprété</strong>.</p>
<h2>Variables</h2>
<pre><code>let nom = "Alice";
const age = 25;
var ancienneVariable = "éviter";</code></pre>
<blockquote><p>Préférez <code>const</code> par défaut, <code>let</code> si la valeur change, jamais <code>var</code>.</p></blockquote>`,
    },
    {
      title: "Fonctions et Portée",
      order: 2,
      htmlContent: `<h1>Fonctions et Portée</h1>
<p>Les fonctions sont des blocs de code réutilisables.</p>
<h2>Déclaration classique</h2>
<pre><code>function saluer(prenom) {
  return "Bonjour, " + prenom + " !";
}
console.log(saluer("Bob")); // Bonjour, Bob !</code></pre>
<h2>Arrow functions (ES6)</h2>
<pre><code>const saluer = (prenom) => \`Bonjour, \${prenom} !\`;
const double = n => n * 2;</code></pre>
<h2>Portée (Scope)</h2>
<pre><code>const x = 10; // portée globale
function test() {
  const y = 20; // portée locale
  console.log(x + y); // 30
}
// console.log(y); → ReferenceError</code></pre>`,
    },
    {
      title: "Tableaux et Objets",
      order: 3,
      htmlContent: `<h1>Tableaux et Objets</h1>
<h2>Tableaux</h2>
<pre><code>const fruits = ["pomme", "banane", "cerise"];
fruits.push("kiwi");
fruits.forEach(f => console.log(f));
const doubles = [1,2,3].map(n => n * 2); // [2,4,6]
const pairs = [1,2,3,4].filter(n => n % 2 === 0); // [2,4]</code></pre>
<h2>Objets</h2>
<pre><code>const etudiant = {
  nom: "Alice",
  age: 22,
  saluer() { return \`Je m'appelle \${this.nom}\`; }
};
const { nom, age } = etudiant; // déstructuration</code></pre>`,
    },
    {
      title: "Promesses et Async/Await",
      order: 4,
      htmlContent: `<h1>Promesses et Async/Await</h1>
<p>JavaScript est <strong>asynchrone</strong>. Les opérations longues (réseau, fichiers) utilisent des callbacks ou des Promesses.</p>
<h2>Promesse</h2>
<pre><code>const maPromesse = new Promise((resolve, reject) => {
  setTimeout(() => resolve("Données reçues !"), 1000);
});
maPromesse.then(data => console.log(data));</code></pre>
<h2>Async/Await (recommandé)</h2>
<pre><code>async function fetchData() {
  try {
    const res = await fetch("https://api.example.com/data");
    const json = await res.json();
    return json;
  } catch (err) {
    console.error("Erreur :", err);
  }
}</code></pre>`,
    },
  ];

  for (const l of jsLessons) {
    const exists = await Lesson.findOne({ title: l.title, course: courses[0]._id });
    if (!exists) {
      await Lesson.create({ ...l, course: courses[0]._id });
      console.log(`  ✓ Leçon JS: ${l.title}`);
    }
  }

  // ── Leçons React ───────────────────────────────────────────────────────────
  const reactLessons = [
    {
      title: "Introduction à React",
      order: 1,
      htmlContent: `<h1>Introduction à React</h1>
<p>React est une bibliothèque JavaScript pour construire des interfaces utilisateur.</p>
<h2>Premier composant</h2>
<pre><code>import React from 'react';

function Bonjour({ nom }) {
  return &lt;h1&gt;Bonjour, {nom} !&lt;/h1&gt;;
}

export default Bonjour;</code></pre>
<p>React utilise le <strong>JSX</strong> — une syntaxe qui ressemble à HTML dans JavaScript.</p>`,
    },
    {
      title: "useState et useEffect",
      order: 2,
      htmlContent: `<h1>Hooks : useState et useEffect</h1>
<h2>useState — gérer l'état</h2>
<pre><code>import { useState } from 'react';

function Compteur() {
  const [count, setCount] = useState(0);
  return (
    &lt;div&gt;
      &lt;p&gt;Compteur : {count}&lt;/p&gt;
      &lt;button onClick={() => setCount(c => c + 1)}&gt;+1&lt;/button&gt;
    &lt;/div&gt;
  );
}</code></pre>
<h2>useEffect — effets de bord</h2>
<pre><code>import { useState, useEffect } from 'react';

function DataFetcher() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []); // [] = exécuter une seule fois au montage
  return &lt;pre&gt;{JSON.stringify(data)}&lt;/pre&gt;;
}</code></pre>`,
    },
    {
      title: "React Router v6",
      order: 3,
      htmlContent: `<h1>Navigation avec React Router v6</h1>
<pre><code>import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    &lt;BrowserRouter&gt;
      &lt;nav&gt;
        &lt;Link to="/"&gt;Accueil&lt;/Link&gt;
        &lt;Link to="/about"&gt;À propos&lt;/Link&gt;
      &lt;/nav&gt;
      &lt;Routes&gt;
        &lt;Route path="/" element={&lt;Accueil /&gt;} /&gt;
        &lt;Route path="/about" element={&lt;About /&gt;} /&gt;
        &lt;Route path="/users/:id" element={&lt;UserDetail /&gt;} /&gt;
      &lt;/Routes&gt;
    &lt;/BrowserRouter&gt;
  );
}</code></pre>
<h2>useNavigate et useParams</h2>
<pre><code>import { useNavigate, useParams } from 'react-router-dom';

function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  return &lt;button onClick={() => navigate(-1)}&gt;Retour&lt;/button&gt;;
}</code></pre>`,
    },
  ];

  for (const l of reactLessons) {
    const exists = await Lesson.findOne({ title: l.title, course: courses[1]._id });
    if (!exists) {
      await Lesson.create({ ...l, course: courses[1]._id });
      console.log(`  ✓ Leçon React: ${l.title}`);
    }
  }

  // ── Quiz JavaScript ─────────────────────────────────────────────────────────
  const jsLessonsDb = await Lesson.find({ course: courses[0]._id });
  let quizJs = await Quiz.findOne({ course: courses[0]._id });
  if (!quizJs) {
    quizJs = await Quiz.create({
      title: "Quiz JavaScript Fondamentaux",
      course: courses[0]._id,
      passingScore: 70,
      questions: [
        {
          questionText: "Quelle instruction déclare une variable dont la valeur ne peut pas être réassignée ?",
          propositions: ["var", "let", "const", "static"],
          correctAnswer: "const",
        },
        {
          questionText: "Que retourne `typeof null` en JavaScript ?",
          propositions: ["null", "undefined", "object", "boolean"],
          correctAnswer: "object",
        },
        {
          questionText: "Quelle méthode de tableau crée un nouveau tableau avec les éléments transformés ?",
          propositions: ["forEach", "filter", "map", "reduce"],
          correctAnswer: "map",
        },
        {
          questionText: "Quel mot-clé permet d'attendre la résolution d'une promesse ?",
          propositions: ["wait", "async", "await", "then"],
          correctAnswer: "await",
        },
        {
          questionText: "Comment accède-t-on à la valeur d'une propriété d'objet par déstructuration ?",
          propositions: [
            "const [nom] = objet;",
            "const { nom } = objet;",
            "const nom = objet[];",
            "const nom => objet;",
          ],
          correctAnswer: "const { nom } = objet;",
        },
      ],
    });
    console.log("  ✓ Quiz JS créé");
  }

  // ── Quiz React ──────────────────────────────────────────────────────────────
  let quizReact = await Quiz.findOne({ course: courses[1]._id });
  if (!quizReact) {
    quizReact = await Quiz.create({
      title: "Quiz React.js",
      course: courses[1]._id,
      passingScore: 60,
      questions: [
        {
          questionText: "Quel hook React permet de gérer un état local dans un composant fonctionnel ?",
          propositions: ["useEffect", "useState", "useContext", "useRef"],
          correctAnswer: "useState",
        },
        {
          questionText: "Que signifie le tableau vide `[]` passé en second argument de useEffect ?",
          propositions: [
            "L'effet s'exécute à chaque rendu",
            "L'effet ne s'exécute jamais",
            "L'effet s'exécute uniquement au montage",
            "L'effet s'exécute au démontage",
          ],
          correctAnswer: "L'effet s'exécute uniquement au montage",
        },
        {
          questionText: "Quel composant React Router v6 définit les routes de l'application ?",
          propositions: ["<Router>", "<Switch>", "<Routes>", "<Navigate>"],
          correctAnswer: "<Routes>",
        },
        {
          questionText: "Comment récupérer un paramètre d'URL (ex: /users/:id) dans React Router v6 ?",
          propositions: ["useParams()", "useRoute()", "getParams()", "this.props.match.params"],
          correctAnswer: "useParams()",
        },
      ],
    });
    console.log("  ✓ Quiz React créé");
  }

  // ── Résultats de quiz (demo) ────────────────────────────────────────────────
  const resultsData = [
    { student: students[0], quiz: quizJs, answers: ["const", "object", "map", "await", "const { nom } = objet;"], score: 100 },
    { student: students[1], quiz: quizJs, answers: ["let", "object", "map", "await", "const { nom } = objet;"], score: 80 },
    { student: students[2], quiz: quizJs, answers: ["var", "null", "filter", "then", "const [nom] = objet;"], score: 20 },
    { student: students[0], quiz: quizReact, answers: ["useState", "L'effet s'exécute uniquement au montage", "<Routes>", "useParams()"], score: 100 },
    { student: students[1], quiz: quizReact, answers: ["useState", "L'effet s'exécute à chaque rendu", "<Routes>", "useParams()"], score: 75 },
    { student: students[3], quiz: quizJs, answers: ["const", "object", "map", "await", "const { nom } = objet;"], score: 100 },
  ];

  for (const r of resultsData) {
    const exists = await QuizResult.findOne({ student: r.student._id, quiz: r.quiz!._id });
    if (!exists) {
      await QuizResult.create({ student: r.student._id, quiz: r.quiz!._id, answers: r.answers, score: r.score });
      console.log(`  ✓ Résultat: ${r.student.email} → quiz score ${r.score}%`);
    }
  }

  await mongoose.disconnect();
  console.log("\nSeed terminé !");
}

seed().catch(err => { console.error(err); process.exit(1); });

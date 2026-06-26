# CoreLab LMS

Plateforme LMS (Learning Management System) MERN — gestion de cours, leçons HTML, QCM, suivi des notes.

## Stack

- **Backend** : Node.js, Express.js, TypeScript, MongoDB/Mongoose, JWT, bcrypt
- **Frontend** : React, TypeScript, Vite, React Router v6, Tailwind CSS
- **Tests** : Jest + Supertest
- **Déploiement** : Vercel (serverless)

## Prérequis

- Node.js v20+
- MongoDB (local) ou compte MongoDB Atlas (gratuit)
- npm

## Installation

```bash
# 1. Cloner le dépôt
git clone <url-du-repo>
cd corelab

# 2. Variables d'environnement (backend)
cp .env.example Server/.env
# Renseigner MONGODB_URI et JWT_SECRET dans Server/.env

# 3. Installer les dépendances
cd Server && npm install
cd ../client && npm install
```

## Lancement en local

```bash
# Terminal 1 — API (port 4242)
cd Server && npm run dev

# Terminal 2 — Client (port 3000)
cd client && npm run dev
```

Ouvrir http://localhost:3000

## Variables d'environnement

Voir `.env.example` à la racine. Copier dans `Server/.env` :

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | URI MongoDB Atlas ou local |
| `JWT_SECRET` | Secret JWT (générer : `openssl rand -hex 32`) |
| `PORT` | Port du serveur (défaut : 4242) |
| `CORS_ORIGIN` | URL du frontend |

## Comptes

**Création d'un compte élève** : `/register` sur le site.

**Création d'un compte admin** : via l'import CSV (`/admin/users`) ou directement dans MongoDB Atlas.

Format CSV pour import : `firstName,lastName,email,password,role`

## Scripts utiles

```bash
# Tests (backend)
cd Server && npm test

# Build production
cd Server && npm run build
cd client && npm run build
```

## Architecture

```
corelab/
├── Server/          # API Express + TypeScript
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/      # Mongoose : User, Course, Lesson, Quiz, QuizResult, Notification
│   │   ├── routes/
│   │   ├── middlewares/ # auth (JWT), role, validation (Zod), upload CSV
│   │   └── __tests__/
├── client/          # React + Vite + TypeScript
│   └── src/
│       ├── components/
│       ├── pages/
│       │   ├── admin/   # Gradebook, CourseManagement, LessonManagement, UserManagement
│       │   └── student/ # CourseDashboard, LessonView, QuizView
│       └── services/
├── api/             # Entrée serverless Vercel
└── vercel.json
```

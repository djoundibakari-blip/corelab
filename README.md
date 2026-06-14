# CoreLab LMS

## Prérequis

- Node.js v20+
- MongoDB (local ou Atlas)
- npm

## Installation

```bash
# Backend
cd Server
cp ../.env.example .env   # renseigner MONGO_URI et JWT_SECRET
npm install
npm run seed              # initialise la base de données

# Frontend
cd ../client
npm install
```

## Lancement

```bash
# Terminal 1 — API (port 4242)
cd Server && npm run dev

# Terminal 2 — Client (port 5173)
cd client && npm run dev
```

## Identifiants

Format automatique généré par le seed :

| Rôle    | Email                          | Mot de passe  |
|---------|--------------------------------|---------------|
| Admin   | `euphrasy.meyo@corelab.com`    | `meyo123!`    |
| Admin   | `djoundi.bakari@corelab.com`   | `bakari123!`  |
| Student | `florian.grima@corelab.com`    | `grima123!`   |
| Student | `salma.naji@corelab.com`       | `naji123!`    |

> Règle : `prenom.nom@corelab.com` / `nom123!`

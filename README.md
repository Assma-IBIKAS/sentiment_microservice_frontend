# 💻 SENTIMENT_MICROSERVICE - Client Web (Front-end)

Ce dossier contient l'application web basée sur Next.js et React, servant d'interface utilisateur pour interagir avec l'API d'analyse de sentiment.

## 🛠️ Technologies Utilisées

- **Framework :** Next.js
- **Librairie UI :** React
- **Styling :** Tailwind CSS
- **Langage :** TypeScript / JavaScript

## 📂 Structure du Projet

Basé sur le routeur Next.js (app directory):
```
app/
├── login/        # Page de Connexion (page.tsx)
├── sentiment/    # Page principale d'Analyse de Sentiment (page.tsx)
└── page.tsx      # Page d'accueil/Redirection
```
## 🚀 Démarrage Rapide

### Prérequis

Assurez-vous d'avoir Node.js et npm (ou yarn/pnpm) installés.

### Installation

Accédez au dossier du front-end :

```bash
cd frontend/
```
Installez les dépendances :
```
npm install
```
### Lancement
Lancez le serveur de développement :
````
npm run dev
````
L'application sera accessible sur http://localhost:3000.

### 🔑 Authentification

L'application gère la connexion utilisateur via la page /login.

* Les identifiants sont envoyés à l'endpoint de l'API /token (FastAPI).

* Le token JWT reçu est stocké dans le localStorage du navigateur.

* Ce token doit être inclus dans les en-têtes (Header Authorization: Bearer <token>) de toutes les requêtes subséquentes vers les endpoints protégés de l'API.
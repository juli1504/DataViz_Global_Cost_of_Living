# 🌍 EcoPulse - Global Economy Visualization

[![Live Demo](https://img.shields.io/badge/Live-Demo-cyan?style=for-the-badge&logo=vercel)](https://economypulse.netlify.app/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![D3.js](https://img.shields.io/badge/D3.js-v7-orange?style=for-the-badge&logo=d3.js)](https://d3js.org/)
[![Vite](https://img.shields.io/badge/Vite-v7-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev/)

**[Français]** | [English](#english-version)

**EcoPulse** est une application web interactive permettant de visualiser et comparer l'évolution économique des pays sur les 50 dernières années. Le projet utilise **React 19** pour l'architecture et **D3.js** pour la génération de graphiques avancés (Line Charts, Pie Charts, Cartes choroplèthes).

🔗 **Voir le projet en ligne :** [https://economypulse.netlify.app/](https://economypulse.netlify.app/)

---

## Fonctionnalités Clés

*   **Dashboard Dynamique** : Basculez entre une vue détaillée ("Pulse") et une vue comparative multi-pays.
*   **Visualisations D3.js** :
    *   Courbes d'évolution (PIB, Commerce, Population) avec détection des crises (Krach 2008, COVID-19).
    *   Diagrammes circulaires pour la répartition sectorielle (Agriculture, Industrie, Services).
    *   Carte du monde interactive pour la sélection géographique.
    *   Visualisation des flux import/export et balance commerciale.
*   **Projections** : Algorithme de régression linéaire calculant les tendances prévisionnelles à 5 ans.
*   **Navigation Temporelle** : Slider interactif couvrant la période 1970-2021.

---

## Aperçu de l'Application

### Page d'Accueil
Une introduction immersive au projet.
<img src="./Welcome%20Page.png" alt="Page d'Accueil EcoPulse" width="600" style="border-radius: 10px; border: 1px solid #333;">

### Mode Résumé (Pulse)
Analyse d'un pays spécifique (Structure économique et PIB).
<img src="./Focus%20on%20a%20particular%20country.png" alt="Dashboard Vue Pulse" width="600" style="border-radius: 10px; border: 1px solid #333;">

### Mode Comparaison
Comparaison historique ou sectorielle entre plusieurs pays.
<img src="./Comparison%20of%20GDP%20evolution.png" alt="Mode Comparaison" width="600" style="border-radius: 10px; border: 1px solid #333;">

---


## Prérequis Techniques

Pour faire tourner ce projet localement, vous devez disposer de l'environnement suivant :

*   **Node.js** : Version **v22.14.0** (Recommandée).
*   **npm** : Inclus avec Node.js.

### Vérification :

```bash
node -v
```

---

## Installation et Lancement

Suivez ces étapes pour lancer l'application sur votre machine :

### 1. Cloner le projet
Récupérez les fichiers sources dans un dossier local :

```bash
git clone https://github.com/juli1504/Ecopuls_Global_Cost_of_Living_Visualization.git
cd Ecopuls_Global_Cost_of_Living_Visualization
cd web
```

### 2. Installer les dépendances
Installez les librairies nécessaires (React, D3, Tailwind, Vite) :

```bash
npm install
```

### 3. Configuration des Données (⚠️ Important)
Le projet nécessite un fichier de données pour fonctionner.
1.  Assurez-vous d'avoir le fichier `economy.csv`.
2.  Placez ce fichier impérativement dans le dossier **`public/`** à la racine du projet.
    *   *Chemin final : `public/economy.csv`*

### 4. Lancer le serveur de développement
Pour démarrer l'application en mode local :

```bash
npm run dev
```

Ouvrez votre navigateur et allez sur l'URL indiquée (généralement `http://localhost:5173`).

---

## Build pour la Production

Pour compiler l'application en fichiers statiques optimisés pour la mise en ligne :

```bash
npm run build
```
Les fichiers générés se trouveront dans le dossier `dist/`.

Pour tester le build localement avant déploiement :
```bash
npm run preview
```

---

## L'Équipe

Projet réalisé par :

- Julia - Project Coordination & Data Processing & Final Improvements
- Oscar - Data Exploration & Cleaning
- Hamidoullah - D3.js Visualization Development
- Danyl - UI/UX Design & React Development


---
---

<a name="english-version"></a>
# EcoPulse - Global Economy Visualization (English)

**EcoPulse** is an interactive web application designed to visualize and compare the economic evolution of countries over the last 50 years. It leverages **React 19** for the UI architecture and **D3.js** for advanced data visualization components.

🔗 **Live Demo:** [https://economypulse.netlify.app/](https://economypulse.netlify.app/)

---

## Key Features

*   **Dynamic Dashboard**: Switch between a focused single-country view ("Pulse") and a multi-country comparison tool.
*   **D3.js Visualizations**:
    *   Evolution charts (GDP, Trade, Population) with historical crisis highlighting (2008 Crash, COVID-19).
    *   Pie charts for sector distribution (Agriculture, Manufacturing, Services).
    *   Interactive World Map for geographic selection.
    *   Trade flows visualization (Imports/Exports/Balance).
*   **Projections**: Linear regression algorithm providing 5-year trend forecasts.
*   **Time Travel**: Interactive slider spanning from 1970 to 2021.

---

## App Previews

### Home Page
Immersive landing page.
<img src="./Welcome%20Page.png" alt="EcoPulse Home Page" width="600" style="border-radius: 10px; border: 1px solid #333;">

### Summary Mode (Pulse)
Analysis of a specific country.
<img src="./Focus%20on%20a%20particular%20country.png" alt="Dashboard Pulse View" width="600" style="border-radius: 10px; border: 1px solid #333;">

### Comparison Mode
Historical or sectoral comparison between multiple countries.
<img src="./Comparison%20of%20GDP%20evolution.png" alt="Comparison Mode" width="600" style="border-radius: 10px; border: 1px solid #333;">

---


## Prerequisites

To run this project locally, ensure you have the following environment:

*   **Node.js**: Version **v22.14.0** (Recommended).
*   **npm**: Included with Node.js.

---
### Verification :

```bash
node -v
```


## Setup and Run

Follow these steps to launch the app on your machine:

### 1. Clone the project
Download the source code:

```bash
git clone https://github.com/juli1504/Ecopuls_Global_Cost_of_Living_Visualization.git
cd Ecopuls_Global_Cost_of_Living_Visualization
cd web
```

### 2. Install dependencies
Install the required libraries (React, D3, Tailwind, Vite):

```bash
npm install
```

### 3. Data Configuration (⚠️ Important)
The project relies on a specific dataset to function.
1.  Ensure you have the `economy.csv` file.
2.  Place this file strictly inside the **`public/`** folder at the project root.
    *   *Final path: `public/economy.csv`*

### 4. Start Development Server
To launch the app in local development mode:

```bash
npm run dev
```

Open your browser and navigate to the provided URL (usually `http://localhost:5173`).

---

## Build for Production

To compile the application into optimized static files for deployment:

```bash
npm run build
```
The generated files will be located in the `dist/` directory.

To preview the production build locally:
```bash
npm run preview
```
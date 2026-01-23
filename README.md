<p align=center> EcoPulse </p>
Our project, EcoPulse, aims to analyze the evolution of the global economy from 1970 to 2021 by studying the impact of structural factors on countries' GDP. It offers a variety of tools to compare the economic evolution of different countries over time across four aspects:

- GDP evolution
- Import/export dynamics
- Demographic situation
- Sectoral distribution of GDP

EcoPulse also enables to focus on the economic situation of a particular country.

You can find our web site by following the link : https://economypulse.netlify.app/

<p align="center">
  <strong>Welcome Page</strong><br>
  <img width="600" src="https://github.com/user-attachments/assets/01440a99-5e6d-4554-bbea-83d34475cb8e" alt="Page_accueil" />
</p>

<p align="center">
  <strong>Focus on a particular country</strong><br>
  <img width="600" src="https://github.com/user-attachments/assets/d2731f26-e4bc-426c-9ab6-fa35da04003a" alt="Focus_pays" />
</p>

<p align="center">
  <strong>Comparison of GDP evolution</strong><br>
  <img width="600" src="https://github.com/user-attachments/assets/b9802b2e-f8ef-40a3-945a-8fa750097626" alt="Comp_PIB" />
</p>

EcoPulse integrates interactive features & technical highlights
- Economic Pulse (Custom D3.js): A custom radial visualization representing GDP structure, sector distribution, and trade flows as an organic, living system.
- Temporal Navigation: A synchronized slider allowing users to time-travel through 50 years of data, updating all charts instantaneously.
- Geospatial Integration: An interactive world map linked to the sidebar for intuitive country selection.
- Smart UX/State Management:
  - Comparison Mode: Select up to 5 countries simultaneously.
  - Smart Reset: A context-aware "Erase All" button that improves ergonomics by keeping the primary country focused while clearing comparisons.

Tech Stack
- Frontend: React.js
- Build Tool: Vite
- Visualization: D3.js (v7) & Recharts
- Styling: Tailwind CSS
- Data Processing: JavaScript (ES6+) & PapaParse

This project aggregates and cleans data from three major sources to ensure robustness:
- Kaggle: Global Economy Indicators (Primary Backbone)
- World Bank: World Development Indicators (WDI) (Supplementary historical data)
- OECD: Better Life Index (Well-being & Satisfaction metrics)

Getting Started
1. To run this project locally, clone the repository:

Bash
git clone https://github.com/YourUsername/EcoPulse.git
cd EcoPulse
(If the web app is in a subfolder, navigate into it (e.g., cd web))

2. Install dependencies:

Bash
npm install

3. Run the development server:

Bash
npm run dev
Open your browser: Navigate to http://localhost:5173/

Team
- Julia - Project Coordination & Data Processing & Final Improvements
- Oscar - Data Exploration & Cleaning
- Hamidoullah - D3.js Visualization Development
- Danyl - UI/UX Design & React Development

import React from 'react';

const team = [
  { name: 'Julia', role: 'Data Engineer', avatar: '👩🏼‍💻', desc: 'Traitement et nettoyage des données', color: 'cyan', studyProgram: "Erasmus"},
  { name: 'Hamidoullah', role: 'Web Developer', avatar: '👨🏿‍💻', desc: 'Développement D3.js', color: 'pink', studyProgram: "M2 Intelligence Artificielle"},
  { name: 'Danyl', role: 'Web Developer', avatar: '👨‍💻', desc: 'Développement React et D3.js', color: 'purple', studyProgram: "M2 Intelligence Artificielle"},
  { name: 'Oscar', role: 'Data Engineer', avatar: '🧑🏼‍💻', desc: 'Traitement et nettoyage des données', color: 'emerald', studyProgram: "M2 Intelligence Artificielle"},
];

const TeamPage = () => {
  return (
    <div className="min-h-screen pt-16 bg-slate-950">
      {/* Header */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/3 w-72 h-72 bg-purple-500 rounded-full filter blur-[100px]" />
          <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-cyan-500 rounded-full filter blur-[100px]" />
        </div>
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-white mb-4">Notre Équipe</h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Une équipe passionnée par la data visualisation et l'économie mondiale
            </p>
          </div>

          {/* Membres */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, idx) => (
              <div 
                key={idx}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center hover:border-slate-700 transition-all hover:-translate-y-1 hover:shadow-xl flex flex-col items-center"
              >
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-${member.color}-500/20 to-${member.color}-600/20 flex items-center justify-center text-4xl border-2 border-${member.color}-500/30`}>
                  {member.avatar}
                </div>
                
                <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                <p className={`text-${member.color}-400 text-sm font-medium mb-3`}>{member.role}</p>
                <p className="text-slate-500 text-sm mb-4 flex-grow">{member.desc}</p>
                
                <div className="pt-4 border-t border-slate-800 w-full mt-auto">
                   <span className={`inline-block px-3 py-1 text-xs font-semibold tracking-wide text-${member.color}-100 bg-${member.color}-500/10 rounded-full border border-${member.color}-500/20`}>
                    {member.studyProgram}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projet */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Le Projet</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Problématique */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
                🎯 Problématique
              </h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                L'objectif de ce projet est de comprendre comment évolue l'économie mondiale 
                et d'identifier les facteurs qui influencent cette évolution.
              </p>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  Comment évoluent les principaux indicateurs macroéconomiques ?
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  Quels facteurs contribuent le plus à la croissance économique ?
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  Comment les crises majeures ont-elles impacté les économies ?
                </li>
              </ul>
            </div>

            {/* Public cible */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-2">
                👥 Public Cible
              </h3>
              <div className="space-y-4">
                <TargetAudience 
                  icon="🎓" 
                  title="Étudiants & Chercheurs" 
                  desc="En économie, data science ou relations internationales"
                />
                <TargetAudience 
                  icon="📰" 
                  title="Journalistes & Analystes" 
                  desc="Pour illustrer et comprendre les tendances économiques"
                />
                <TargetAudience 
                  icon="🏛️" 
                  title="Décideurs publics" 
                  desc="Institutions et organisations internationales"
                />
                <TargetAudience 
                  icon="🌍" 
                  title="Grand public" 
                  desc="Toute personne intéressée par l'économie mondiale"
                />
              </div>
            </div>
          </div>

          {/* Questions d'analyse */}
          <div className="mt-12 bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
              📊 Questions d'Analyse
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <QuestionCard
                title="Structure sectorielle"
                questions={[
                  "Comment le PIB est-il réparti entre les secteurs ?",
                  "Quels secteurs sont moteurs de croissance ?"
                ]}
              />
              <QuestionCard
                title="Commerce international"
                questions={[
                  "Existe-t-il une corrélation entre commerce et PIB ?",
                  "Comment évolue la balance commerciale ?"
                ]}
              />
              <QuestionCard
                title="Impact des crises"
                questions={[
                  "Effet de la crise de 2008 sur les indicateurs ?",
                  "Impact du COVID-19 sur l'économie mondiale ?"
                ]}
              />
            </div>
          </div>

          {/* Technologies */}
          <div className="mt-12">
            <h3 className="text-xl font-bold text-white text-center mb-8">Technologies utilisées</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {['React', 'D3.js', 'Tailwind CSS', 'Vite', 'JavaScript'].map(tech => (
                <span 
                  key={tech}
                  className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-full text-sm text-slate-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Source des données */}
          <div className="mt-12 text-center">
            <p className="text-slate-500">
              Données : <a href="https://www.kaggle.com/datasets/prasad22/global-economy-indicators" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Global Economy Indicators (Kaggle)</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

const TargetAudience = ({ icon, title, desc }) => (
  <div className="flex items-start gap-3">
    <span className="text-2xl">{icon}</span>
    <div>
      <h4 className="text-white font-medium">{title}</h4>
      <p className="text-slate-500 text-sm">{desc}</p>
    </div>
  </div>
);

const QuestionCard = ({ title, questions }) => (
  <div className="bg-slate-800/50 rounded-xl p-4">
    <h4 className="text-white font-medium mb-3">{title}</h4>
    <ul className="space-y-2">
      {questions.map((q, i) => (
        <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
          <span className="text-emerald-400">→</span>
          {q}
        </li>
      ))}
    </ul>
  </div>
);

export default TeamPage;

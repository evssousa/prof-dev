import React, { useState, useMemo } from 'react';
import { Subject, View } from './types';
import { SUBJECTS, CHANGELOG_DATA } from './constants';
import ChatInterface from './components/ChatInterface';
import PracticeMode from './components/PracticeMode';
import { SubjectCard } from './components/SubjectCard';

const Header: React.FC = () => (
  <header className="bg-gray-900/80 backdrop-blur-sm p-4 sticky top-0 z-50 border-b border-purple-500/30">
    <h1 className="text-2xl md:text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
      Prof. DEV 🤖
    </h1>
  </header>
);

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.Home);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const handleSelectSubject = (subject: Subject, targetView: View) => {
    setSelectedSubject(subject);
    setView(targetView);
  };

  const handleGoHome = () => {
    setView(View.Home);
    setSelectedSubject(null);
  };

  const MemoizedChatInterface = useMemo(() => {
    return selectedSubject ? <ChatInterface subject={selectedSubject} onBack={handleGoHome} /> : null;
  }, [selectedSubject]);
  
  const MemoizedPracticeMode = useMemo(() => {
    return selectedSubject ? <PracticeMode subject={selectedSubject} onBack={handleGoHome} /> : null;
  }, [selectedSubject]);


  const renderView = () => {
    switch (view) {
      case View.Chat:
        return MemoizedChatInterface;
      case View.Practice:
        return MemoizedPracticeMode;
      case View.Home:
      default:
        return (
          <div className="p-4 md:p-8">
            <div className="text-center mb-12 animate-fade-in-down">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Seja bem-vindo, futuro dev!</h2>
              <p className="text-md md:text-lg text-gray-400">Escolha uma disciplina para começar sua jornada.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {SUBJECTS.map((subject, index) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  onSelect={handleSelectSubject}
                  index={index}
                />
              ))}
            </div>

            <div className="mt-20 animate-fade-in-up">
              <h2 className="text-2xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Histórico de Modificações
              </h2>
              <div className="max-w-3xl mx-auto bg-gray-800/50 border border-purple-500/30 rounded-lg p-6 space-y-4">
                {CHANGELOG_DATA.map((entry) => (
                  <div key={entry.version} className="border-b border-gray-700 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-center mb-1 flex-wrap">
                      <span className="font-bold text-lg text-white">{entry.version}</span>
                      <span className="text-sm text-gray-400">{entry.date}</span>
                    </div>
                    <p className="text-gray-300" style={{ whiteSpace: 'pre-line' }}>{entry.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Header />
      <main className="container mx-auto max-w-7xl">
        {renderView()}
      </main>
       <footer className="text-center p-4 text-gray-500 text-sm">
        Criado para os melhores alunos de DS, por <a href="https://github.com/evssousa" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Everson Sousa</a>.
      </footer>
    </div>
  );
};

export default App;
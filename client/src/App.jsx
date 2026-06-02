import React from 'react';
import QuizView from './pages/QuizPage.jsx';
import QuizImport from './pages/QuizImport.jsx';
import Gradebook from './pages/Gradebook.jsx';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Corelab LMS - Quiz & Notes</h1>
        <p className="text-gray-600 mb-8">Bienvenue sur le système de quiz et de notes</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Section Quiz pour étudiants */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Quiz pour Étudiants</h2>
          <QuizView />
        </div>

        {/* Section Import pour admin */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Import de Quiz (Admin)</h2>
          <QuizImport />
        </div>

        {/* Section Carnet de notes pour admin */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Carnet de Notes (Admin)</h2>
          <Gradebook />
        </div>
      </div>
    </div>
  );
}

export default App;

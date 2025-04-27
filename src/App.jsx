import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { QuizProvider } from './context/QuizContext';
import SubjectList from './components/SubjectList';
import Quiz from './components/Quiz';
import Score from './components/Score';
import Dashboard from './components/Dashboard';
import CreateQuiz from './components/CreateQuiz';
import QuizRoom from './components/QuizRoom';

function Header() {
  const location = useLocation();
  const isQuizPage = location.pathname.includes('/quiz/');
  
  return (
    <header className="bg-gray-800/50 border-b border-gray-700/50">
      <div className={`max-w-7xl mx-auto px-4 py-6 ${isQuizPage ? 'text-left' : 'text-center'}`}>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            Online Quiz Portal
          </h1>
          {!isQuizPage && (
            <Link
              to="/create-quiz"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
            >
              Create Quiz
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <QuizProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <Header />
          <main>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-quiz" element={<CreateQuiz />} />
              <Route path="/" element={<SubjectList />} />
              <Route path="/quiz/:subject" element={<Quiz />} />
              <Route path="/quiz/room/:roomId" element={<QuizRoom />} />
              <Route path="/score" element={<Score />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QuizProvider>
  );
}

export default App;
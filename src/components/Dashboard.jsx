import React from 'react';
import { useQuiz } from '../context/QuizContext';
import { useNavigate } from 'react-router-dom';
import { ChartBarIcon, AcademicCapIcon, TrophyIcon } from '@heroicons/react/24/solid';

function Dashboard() {
  const { quizData, loading } = useQuiz();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-gray-300">Loading dashboard...</h2>
        </div>
      </div>
    );
  }

  const totalQuizzes = quizData ? Object.keys(quizData).length : 0;
  const averageScore = quizData 
    ? Math.round(Object.values(quizData).reduce((acc, scores) => 
        acc + scores.reduce((sum, score) => sum + score.percentage, 0) / scores.length, 0) / totalQuizzes)
    : 0;
  
  const bestSubject = quizData 
    ? Object.entries(quizData).reduce((best, [subject, scores]) => {
        const avg = scores.reduce((sum, score) => sum + score.percentage, 0) / scores.length;
        return avg > (best.avg || 0) ? { subject, avg } : best;
      }, { subject: 'N/A', avg: 0 }).subject
    : 'N/A';

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            Quiz Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <AcademicCapIcon className="w-8 h-8 text-indigo-400 mr-3" />
              <h3 className="text-xl font-semibold text-gray-300">Total Quizzes</h3>
            </div>
            <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
              {totalQuizzes}
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <ChartBarIcon className="w-8 h-8 text-indigo-400 mr-3" />
              <h3 className="text-xl font-semibold text-gray-300">Average Score</h3>
            </div>
            <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
              {averageScore}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <TrophyIcon className="w-8 h-8 text-indigo-400 mr-3" />
              <h3 className="text-xl font-semibold text-gray-300">Best Subject</h3>
            </div>
            <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
              {bestSubject}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-6">
            Quiz History
          </h2>
          <div className="space-y-4">
            {quizData && Object.entries(quizData).map(([subject, scores]) => (
              <div
                key={subject}
                className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-300 capitalize">
                    {subject}
                  </h3>
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                    {Math.round(scores.reduce((sum, score) => sum + score.percentage, 0) / scores.length)}%
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-gray-400">
                    Last attempt: {new Date(scores[scores.length - 1].timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 
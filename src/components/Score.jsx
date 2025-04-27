import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

function Score() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, total, subject, userAnswers, questions } = location.state || { score: 0, total: 0 };
  const percentage = Math.round((score / total) * 100);
  const [showExplanations, setShowExplanations] = useState(false);

  const getScoreMessage = () => {
    if (percentage >= 90) return "Outstanding! You're a true expert! 🎉";
    if (percentage >= 80) return "Excellent work! You've mastered this subject! 🌟";
    if (percentage >= 70) return "Great job! You have a solid understanding! 👍";
    if (percentage >= 60) return "Good effort! You're on the right track! 💪";
    if (percentage >= 50) return "Not bad! Keep practicing to improve! 📚";
    return "Don't worry! Practice makes perfect! Keep learning! 🎯";
  };

  const getScoreColor = () => {
    if (percentage >= 90) return "from-green-400 to-emerald-500";
    if (percentage >= 70) return "from-indigo-400 to-purple-500";
    if (percentage >= 50) return "from-yellow-400 to-amber-500";
    return "from-red-400 to-rose-500";
  };

  const handleShare = () => {
    const message = `I scored ${percentage}% on the ${subject || 'quiz'}! Can you beat my score? 🎯`;
    if (navigator.share) {
      navigator.share({
        title: 'Quiz Results',
        text: message,
      });
    } else {
      navigator.clipboard.writeText(message);
      alert('Results copied to clipboard!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 text-center backdrop-blur-sm mb-8">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-6">
          Quiz Complete!
        </h2>
        <div className="mb-8">
          <div className={`text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${getScoreColor()} mb-4`}>
            {percentage}%
          </div>
          <p className="text-xl text-gray-300 mb-2">
            You scored {score} out of {total} questions
          </p>
          <p className="text-lg text-gray-300 mt-4">{getScoreMessage()}</p>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/20 font-semibold"
          >
            Try Another Quiz
          </button>
          <button
            onClick={handleShare}
            className="w-full bg-gradient-to-r from-gray-700 to-gray-600 text-white py-3 px-6 rounded-xl hover:from-gray-600 hover:to-gray-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-gray-500/20 font-semibold"
          >
            Share Results
          </button>
          <button
            onClick={() => setShowExplanations(!showExplanations)}
            className="w-full bg-gradient-to-r from-gray-800 to-gray-700 text-white py-3 px-6 rounded-xl hover:from-gray-700 hover:to-gray-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-gray-500/20 font-semibold"
          >
            {showExplanations ? 'Hide Explanations' : 'Show Explanations'}
          </button>
        </div>
      </div>

      {showExplanations && questions && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-6">
            Question Explanations
          </h3>
          <div className="space-y-6">
            {questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              return (
                <div
                  key={index}
                  className={`p-6 rounded-xl backdrop-blur-sm ${
                    userAnswer?.isCorrect
                      ? 'bg-green-500/10 border border-green-500/20'
                      : 'bg-red-500/10 border border-red-500/20'
                  }`}
                >
                  <div className="flex items-start mb-4">
                    <span className="text-2xl mr-4 text-indigo-400 font-bold">{index + 1}.</span>
                    <div className="flex-1">
                      <h4 className="text-xl text-white mb-3 font-semibold">{question.question}</h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <span className="font-semibold mr-2 text-gray-300">Your answer:</span>
                          <span className={`font-medium ${
                            userAnswer?.isCorrect ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {userAnswer?.answer || 'No answer'}
                          </span>
                          {userAnswer?.isCorrect ? (
                            <CheckCircleIcon className="w-5 h-5 ml-2 text-green-400" />
                          ) : (
                            <XCircleIcon className="w-5 h-5 ml-2 text-red-400" />
                          )}
                        </div>
                        <div className="text-green-400 flex items-center">
                          <span className="font-semibold mr-2">Correct answer:</span>
                          <span className="font-medium">{question.correctAnswer}</span>
                        </div>
                        <div className="text-gray-300 mt-2">
                          <span className="font-semibold mr-2">Explanation:</span>
                          <span>{question.explanation}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Score;
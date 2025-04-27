import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AcademicCapIcon, ClockIcon, ChartBarIcon, TrashIcon, ShareIcon } from '@heroicons/react/24/outline';
import { collection, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const predefinedSubjects = [
  {
    id: 'math',
    name: 'Mathematics',
    description: 'Test your mathematical skills with algebra, geometry, and more. Perfect for sharpening your problem-solving abilities.',
    icon: '📐',
    difficulty: 'Medium',
    time: '10 minutes',
    questions: 10
  },
  {
    id: 'science',
    name: 'Science',
    description: 'Explore physics, chemistry, and biology concepts. A great way to test your scientific knowledge.',
    icon: '🔬',
    difficulty: 'Hard',
    time: '12 minutes',
    questions: 10
  },
  {
    id: 'computer-science',
    name: 'Computer Science',
    description: 'Challenge yourself with programming and computer theory. Ideal for tech enthusiasts and aspiring developers.',
    icon: '💻',
    difficulty: 'Hard',
    time: '15 minutes',
    questions: 10
  },
  {
    id: 'history',
    name: 'History',
    description: 'Journey through world history and important events. Test your knowledge of past civilizations and key moments.',
    icon: '📚',
    difficulty: 'Medium',
    time: '10 minutes',
    questions: 10
  }
];

function SubjectList() {
  const navigate = useNavigate();
  const [customQuizzes, setCustomQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [sharing, setSharing] = useState(null);

  const fetchQuizzes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'quizzes'));
      const fetchedQuizzes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomQuizzes(fetchedQuizzes);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Failed to load custom quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleSubjectClick = (subject) => {
    navigate(`/quiz/${subject.toLowerCase()}`);
  };

  const handleCustomQuizClick = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  const handleDeleteQuiz = async (e, quizId) => {
    e.stopPropagation(); // Prevent quiz navigation when clicking delete
    
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        setDeleting(quizId);
        await deleteDoc(doc(db, 'quizzes', quizId));
        await fetchQuizzes(); // Refresh the list
      } catch (err) {
        console.error('Error deleting quiz:', err);
        alert('Failed to delete quiz. Please try again.');
      } finally {
        setDeleting(null);
      }
    }
  };

  const handleShareQuiz = async (e, quiz) => {
    e.stopPropagation(); // Prevent quiz navigation
    
    setSharing(quiz.id);
    try {
      // Create a new room for the quiz
      const roomRef = await addDoc(collection(db, 'quizRooms'), {
        quizId: quiz.id,
        title: quiz.title,
        status: 'waiting',
        players: [],
        currentQuestion: 0,
        startTime: null,
        maxPlayers: 10,
        minPlayers: 3,
        hostId: Date.now().toString(), // In a real app, this would be the user's ID
        questions: quiz.questions,
        createdAt: new Date().toISOString()
      });

      // Generate the room link
      const roomLink = `${window.location.origin}/quiz/room/${roomRef.id}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(roomLink);
      alert('Room link copied to clipboard! Share this with other players.');

    } catch (err) {
      console.error('Error creating room:', err);
      alert('Failed to create room. Please try again.');
    } finally {
      setSharing(null);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="p-6 min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("7246102.jpg")' }}>
      <div className="backdrop-blur-sm bg-black/50 min-h-screen p-6">
        {/* Featured Subjects section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-8 text-center">
            Featured Subjects
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {predefinedSubjects.map((subject) => (
              <div
                key={subject.id}
                onClick={() => handleSubjectClick(subject.name)}
                className="group bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl shadow-2xl p-6 cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-indigo-500/20 border border-gray-700/50 backdrop-blur-sm"
              >
                <div className="flex items-center mb-6">
                  <span className="text-4xl mr-4 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                    {subject.icon}
                  </span>
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                    {subject.name}
                  </h2>
                </div>
                <p className="text-gray-300 mb-6 text-lg leading-relaxed">{subject.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm">
                    <ChartBarIcon className="w-5 h-5 mr-2 text-indigo-400" />
                    <span className={getDifficultyColor(subject.difficulty) + " font-semibold"}>
                      {subject.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <ClockIcon className="w-5 h-5 mr-2 text-indigo-400" />
                    <span className="text-gray-300">{subject.time}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <AcademicCapIcon className="w-5 h-5 mr-2 text-indigo-400" />
                    <span className="text-gray-300">{subject.questions} questions</span>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/20 font-semibold">
                  Start Quiz
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Quizzes Section */}
        <div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-8 text-center">
            Your Quizzes
          </h2>
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="text-2xl text-white">Loading your quizzes...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="text-2xl text-red-500">{error}</div>
            </div>
          ) : customQuizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[200px] space-y-6">
              <div className="text-2xl text-white">You haven't created any quizzes yet</div>
              <button
                onClick={() => navigate('/create-quiz')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
              >
                Create Your First Quiz
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {customQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  onClick={() => handleCustomQuizClick(quiz.id)}
                  className="group bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl shadow-2xl p-6 cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-indigo-500/20 border border-gray-700/50 backdrop-blur-sm relative"
                >
                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    {/* Share Button */}
                    <button
                      onClick={(e) => handleShareQuiz(e, quiz)}
                      disabled={sharing === quiz.id}
                      className="p-2 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors duration-200"
                      title="Share Quiz"
                    >
                      <ShareIcon className={`w-5 h-5 ${sharing === quiz.id ? 'text-gray-400' : 'text-indigo-400'}`} />
                    </button>
                    
                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDeleteQuiz(e, quiz.id)}
                      disabled={deleting === quiz.id}
                      className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-colors duration-200"
                      title="Delete Quiz"
                    >
                      <TrashIcon className={`w-5 h-5 ${deleting === quiz.id ? 'text-gray-400' : 'text-red-400'}`} />
                    </button>
                  </div>

                  {/* Quiz Content */}
                  <div className="flex items-center mb-6">
                    <span className="text-4xl mr-4 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                      📝
                    </span>
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                      {quiz.title}
                    </h2>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm">
                      <AcademicCapIcon className="w-5 h-5 mr-2 text-indigo-400" />
                      <span className="text-gray-300">{quiz.questions.length} questions</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <ClockIcon className="w-5 h-5 mr-2 text-indigo-400" />
                      <span className="text-gray-300">Created: {new Date(quiz.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <ChartBarIcon className="w-5 h-5 mr-2 text-indigo-400" />
                      <span className="text-gray-300">Attempts: {quiz.totalAttempts || 0}</span>
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/20 font-semibold">
                    Start Quiz
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubjectList;
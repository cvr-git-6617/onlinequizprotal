import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

function QuizRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [playerInfo, setPlayerInfo] = useState(null);

  useEffect(() => {
    if (!roomId) return;

    // Load player info from localStorage
    const savedPlayer = localStorage.getItem('quizPlayer');
    if (savedPlayer) {
      setPlayerInfo(JSON.parse(savedPlayer));
    }

    const unsubscribe = onSnapshot(doc(db, 'quizRooms', roomId), (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.data();
        setRoom(roomData);

        // Auto-start quiz when minimum players join
        if (roomData.status === 'waiting' && roomData.players.length >= 3 && roomData.hostId === playerInfo?.playerId) {
          handleStartQuiz();
        }
      } else {
        setError('Room not found');
      }
    });

    return () => unsubscribe();
  }, [roomId, playerInfo]);

  const handleStartQuiz = async () => {
    const roomRef = doc(db, 'quizRooms', roomId);
    await updateDoc(roomRef, {
      status: 'in-progress',
      startTime: new Date().toISOString(),
      currentQuestion: 0
    });
  };

  const handleAnswer = async (answer) => {
    if (!playerInfo) return;

    const roomRef = doc(db, 'quizRooms', roomId);
    const roomDoc = await getDoc(roomRef);
    const roomData = roomDoc.data();

    // Find current player
    const playerIndex = roomData.players.findIndex(p => p.id === playerInfo.playerId);
    if (playerIndex === -1) return;

    // Update player's answer
    const updatedPlayers = [...roomData.players];
    updatedPlayers[playerIndex].answers[roomData.currentQuestion] = answer;

    // Check if all players answered
    const allAnswered = updatedPlayers.every(player => 
      player.answers[roomData.currentQuestion] !== undefined
    );

    if (allAnswered) {
      // Calculate scores for current question
      updatedPlayers.forEach(player => {
        if (player.answers[roomData.currentQuestion] === roomData.questions[roomData.currentQuestion].correctAnswer) {
          player.score += 10;
        }
      });

      // Move to next question or end game
      if (roomData.currentQuestion + 1 >= roomData.questions.length) {
        await updateDoc(roomRef, {
          status: 'completed',
          players: updatedPlayers
        });
      } else {
        await updateDoc(roomRef, {
          currentQuestion: roomData.currentQuestion + 1,
          players: updatedPlayers
        });
      }
    } else {
      // Just update player's answer
      await updateDoc(roomRef, {
        players: updatedPlayers
      });
    }
  };

  const joinRoom = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsJoining(true);
    try {
      const roomRef = doc(db, 'quizRooms', roomId);
      const roomDoc = await getDoc(roomRef);
      const roomData = roomDoc.data();

      if (!roomData) {
        setError('Room not found');
        return;
      }

      if (roomData.status !== 'waiting') {
        setError('Game has already started');
        return;
      }

      if (roomData.players.length >= roomData.maxPlayers) {
        setError('Room is full');
        return;
      }

      const newPlayer = {
        id: Date.now().toString(),
        name: playerName,
        score: 0,
        answers: []
      };

      // Make first player the host
      const isHost = roomData.players.length === 0;
      
      await updateDoc(roomRef, {
        players: [...roomData.players, newPlayer],
        ...(isHost && { hostId: newPlayer.id })
      });

      // Store player info in localStorage for reconnection
      const playerData = {
        roomId,
        playerId: newPlayer.id,
        playerName
      };
      localStorage.setItem('quizPlayer', JSON.stringify(playerData));
      setPlayerInfo(playerData);

    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room');
    } finally {
      setIsJoining(false);
    }
  };

  const renderGameContent = () => {
    if (!room || !playerInfo) return null;

    const currentPlayer = room.players.find(p => p.id === playerInfo.playerId);
    if (!currentPlayer) return null;

    if (room.status === 'completed') {
      // Show final scores
      const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
      return (
        <div className="bg-gray-800/50 p-8 rounded-lg max-w-2xl w-full backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            Quiz Results
          </h2>
          <div className="space-y-4">
            {sortedPlayers.map((player, index) => (
              <div 
                key={player.id} 
                className={`flex justify-between items-center p-4 rounded-lg ${
                  index === 0 ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-gray-700/30'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-xl font-bold mr-4">{index + 1}</span>
                  <span className="text-lg">{player.name}</span>
                </div>
                <span className="text-xl font-bold">{player.score} points</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/')}
            className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
          >
            Back to Home
          </button>
        </div>
      );
    }

    if (room.status === 'in-progress') {
      const question = room.questions[room.currentQuestion];
      const hasAnswered = currentPlayer.answers[room.currentQuestion] !== undefined;
      const totalAnswered = room.players.filter(p => p.answers[room.currentQuestion] !== undefined).length;

      return (
        <div className="bg-gray-800/50 p-8 rounded-lg max-w-2xl w-full backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-300">
              Question {room.currentQuestion + 1} of {room.questions.length}
            </h3>
            <span className="text-gray-400">
              {totalAnswered} of {room.players.length} answered
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-6">{question.question}</h2>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !hasAnswered && handleAnswer(option)}
                  disabled={hasAnswered}
                  className={`w-full p-4 rounded-lg text-left transition-all duration-300 ${
                    hasAnswered
                      ? currentPlayer.answers[room.currentQuestion] === option
                        ? 'bg-indigo-500/20 border border-indigo-500/50'
                        : 'bg-gray-700/30'
                      : 'bg-gray-700/30 hover:bg-gray-700/50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">Players:</h3>
            <div className="grid grid-cols-2 gap-2">
              {room.players.map(player => (
                <div 
                  key={player.id}
                  className={`p-2 rounded-lg ${
                    player.answers[room.currentQuestion] !== undefined
                      ? 'bg-green-500/20 border border-green-500/50'
                      : 'bg-gray-700/30'
                  }`}
                >
                  {player.name}: {player.score} pts
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Waiting room
    return (
      <div className="bg-gray-800/50 p-8 rounded-lg max-w-md w-full backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
          Waiting Room
        </h2>
        
        <div className="space-y-4">
          <div className="text-center text-gray-300 mb-4">
            {room.players.length < 3 
              ? `Waiting for more players (${room.players.length}/3)`
              : 'Ready to start!'}
          </div>
          
          <div className="space-y-2">
            {room.players.map(player => (
              <div 
                key={player.id} 
                className={`bg-gray-700/30 px-4 py-2 rounded-lg text-white flex justify-between items-center ${
                  player.id === room.hostId ? 'border border-yellow-500/50' : ''
                }`}
              >
                <span>{player.name}</span>
                {player.id === room.hostId && (
                  <span className="text-yellow-500 text-sm">Host</span>
                )}
              </div>
            ))}
          </div>

          {playerInfo?.playerId === room.hostId && room.players.length >= 3 && (
            <button
              onClick={handleStartQuiz}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
            >
              Start Quiz
            </button>
          )}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-500/10 p-6 rounded-lg text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-white">Loading room...</div>
      </div>
    );
  }

  if (room.status === 'waiting' && !playerInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-gray-800/50 p-8 rounded-lg max-w-md w-full backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            Join Quiz Room
          </h2>
          <form onSubmit={joinRoom} className="space-y-4">
            <div>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-gray-700/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                maxLength={20}
              />
            </div>
            <button
              type="submit"
              disabled={isJoining}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
            >
              {isJoining ? 'Joining...' : 'Join Room'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {renderGameContent()}
    </div>
  );
}

export default QuizRoom; 
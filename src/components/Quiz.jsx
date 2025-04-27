import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useQuiz } from '../context/QuizContext';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

const predefinedQuizzes = {
  mathematics: {
    title: 'Mathematics',
    questions: [
      {
        question: 'What is the value of π (pi) to two decimal places?',
        options: ['3.14', '3.16', '3.12', '3.18'],
        correctAnswer: 0,
        explanation: 'π is approximately equal to 3.14159..., which rounds to 3.14'
      },
      {
        question: 'What is the square root of 144?',
        options: ['10', '12', '14', '16'],
        correctAnswer: 1,
        explanation: '12 × 12 = 144, therefore the square root of 144 is 12'
      },
      {
        question: 'What is the result of 7 × 8?',
        options: ['54', '56', '58', '60'],
        correctAnswer: 1,
        explanation: '7 × 8 = 56 is a basic multiplication fact'
      },
      {
        question: 'Which of these numbers is a prime number?',
        options: ['15', '21', '23', '25'],
        correctAnswer: 2,
        explanation: '23 is only divisible by 1 and itself, making it a prime number'
      },
      {
        question: 'What is 25% of 200?',
        options: ['25', '40', '50', '75'],
        correctAnswer: 2,
        explanation: '25% is one quarter, so 200 ÷ 4 = 50'
      },
      {
        question: 'What is the next number in the sequence: 2, 4, 8, 16, ...?',
        options: ['24', '32', '30', '28'],
        correctAnswer: 1,
        explanation: 'Each number is doubled to get the next number, so 16 × 2 = 32'
      },
      {
        question: 'What is the area of a rectangle with length 8 units and width 5 units?',
        options: ['13 square units', '26 square units', '40 square units', '45 square units'],
        correctAnswer: 2,
        explanation: 'Area of rectangle = length × width = 8 × 5 = 40 square units'
      },
      {
        question: 'If x + 5 = 12, what is the value of x?',
        options: ['5', '7', '8', '17'],
        correctAnswer: 1,
        explanation: 'Subtracting 5 from both sides: x = 12 - 5 = 7'
      },
      {
        question: 'What is the sum of angles in a triangle?',
        options: ['90 degrees', '180 degrees', '270 degrees', '360 degrees'],
        correctAnswer: 1,
        explanation: 'The sum of angles in a triangle is always 180 degrees'
      },
      {
        question: 'What is (3 × 4) + (5 × 2)?',
        options: ['22', '21', '23', '24'],
        correctAnswer: 0,
        explanation: '(3 × 4) + (5 × 2) = 12 + 10 = 22'
      }
    ]
  },
  science: {
    title: 'Science',
    questions: [
      {
        question: 'What is the chemical symbol for gold?',
        options: ['Au', 'Ag', 'Fe', 'Cu'],
        correctAnswer: 0,
        explanation: 'Au is the chemical symbol for gold, derived from the Latin word "aurum"'
      },
      {
        question: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        correctAnswer: 1,
        explanation: 'Mars appears red due to iron oxide (rust) on its surface'
      },
      {
        question: 'What is the hardest natural substance on Earth?',
        options: ['Gold', 'Iron', 'Diamond', 'Platinum'],
        correctAnswer: 2,
        explanation: 'Diamond is the hardest natural substance, rating 10 on the Mohs scale'
      },
      {
        question: 'What is the largest organ in the human body?',
        options: ['Heart', 'Brain', 'Liver', 'Skin'],
        correctAnswer: 3,
        explanation: 'The skin is the largest organ, covering the entire body'
      },
      {
        question: 'Which gas do plants absorb from the atmosphere?',
        options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'],
        correctAnswer: 1,
        explanation: 'Plants absorb CO2 during photosynthesis to produce glucose'
      },
      {
        question: 'What is the speed of light in vacuum?',
        options: ['299,792 km/s', '199,792 km/s', '399,792 km/s', '499,792 km/s'],
        correctAnswer: 0,
        explanation: 'Light travels at approximately 299,792 kilometers per second in vacuum'
      },
      {
        question: 'Which of these is not a state of matter?',
        options: ['Solid', 'Liquid', 'Energy', 'Gas'],
        correctAnswer: 2,
        explanation: 'Energy is not a state of matter; it is a property of matter',
      },
      {
        question: 'What is the atomic number of oxygen?',
        options: ['6', '7', '8', '9'],
        correctAnswer: 2,
        explanation: 'Oxygen has 8 protons, giving it an atomic number of 8'
      },
      {
        question: 'Which blood type is known as the universal donor?',
        options: ['A+', 'B+', 'AB+', 'O-'],
        correctAnswer: 3,
        explanation: 'O- blood can be given to patients of all blood types'
      },
      {
        question: 'What force keeps planets in orbit around the Sun?',
        options: ['Magnetic Force', 'Gravity', 'Nuclear Force', 'Friction'],
        correctAnswer: 1,
        explanation: 'Gravitational force keeps planets in their orbits around the Sun'
      }
    ]
  },
  'computer-science': {
    title: 'Computer Science',
    questions: [
      {
        question: 'What does HTML stand for?',
        options: [
          'Hyper Text Markup Language',
          'High Tech Modern Language',
          'Hyper Transfer Markup Language',
          'High Text Machine Language'
        ],
        correctAnswer: 0,
        explanation: 'HTML (Hyper Text Markup Language) is the standard markup language for web pages'
      },
      {
        question: 'Which data structure uses LIFO?',
        options: ['Queue', 'Stack', 'Array', 'Tree'],
        correctAnswer: 1,
        explanation: 'Stack uses Last In First Out (LIFO) principle'
      },
      {
        question: 'What is the binary number 1010 in decimal?',
        options: ['8', '10', '12', '14'],
        correctAnswer: 1,
        explanation: '1010 in binary = (1×8) + (0×4) + (1×2) + (0×1) = 10 in decimal'
      },
      {
        question: 'Which of these is not a programming paradigm?',
        options: ['Object-Oriented', 'Functional', 'Declarative', 'Systematic'],
        correctAnswer: 3,
        explanation: 'Systematic is not a programming paradigm'
      },
      {
        question: 'What does SQL stand for?',
        options: [
          'Structured Query Language',
          'Simple Query Language',
          'Standard Query Logic',
          'System Query Language'
        ],
        correctAnswer: 0,
        explanation: 'SQL stands for Structured Query Language, used for managing databases'
      },
      {
        question: 'Which protocol is used for secure internet browsing?',
        options: ['HTTP', 'HTTPS', 'FTP', 'SMTP'],
        correctAnswer: 1,
        explanation: 'HTTPS (HTTP Secure) is used for secure web browsing'
      },
      {
        question: 'What is the smallest unit of digital information?',
        options: ['Bit', 'Byte', 'Kilobyte', 'Megabyte'],
        correctAnswer: 0,
        explanation: 'A bit (binary digit) is the smallest unit of digital information'
      },
      {
        question: 'Which company developed Java?',
        options: ['Microsoft', 'Sun Microsystems', 'IBM', 'Apple'],
        correctAnswer: 1,
        explanation: 'Java was developed by Sun Microsystems (now owned by Oracle)'
      },
      {
        question: 'What does RAM stand for?',
        options: [
          'Random Access Memory',
          'Read Access Memory',
          'Random Allocation Memory',
          'Read Allocation Memory'
        ],
        correctAnswer: 0,
        explanation: 'RAM (Random Access Memory) is the main memory of a computer'
      },
      {
        question: 'Which of these is not an operating system?',
        options: ['Windows', 'Linux', 'Oracle', 'macOS'],
        correctAnswer: 2,
        explanation: 'Oracle is a database management system, not an operating system'
      }
    ]
  },
  history: {
    title: 'History',
    questions: [
      {
        question: 'When did World War I begin?',
        options: ['1912', '1914', '1916', '1918'],
        correctAnswer: 1,
        explanation: 'World War I began in 1914 with the assassination of Archduke Franz Ferdinand'
      },
      {
        question: 'Who was the first woman to win a Nobel Prize?',
        options: ['Mother Teresa', 'Marie Curie', 'Jane Addams', 'Pearl Buck'],
        correctAnswer: 1,
        explanation: 'Marie Curie won the Nobel Prize in Physics in 1903'
      },
      {
        question: 'Which ancient wonder was located in Egypt?',
        options: ['Hanging Gardens', 'Colossus of Rhodes', 'Great Pyramid of Giza', 'Temple of Artemis'],
        correctAnswer: 2,
        explanation: 'The Great Pyramid of Giza is the only ancient wonder still largely intact'
      },
      {
        question: 'When did the Roman Empire fall?',
        options: ['276 AD', '376 AD', '476 AD', '576 AD'],
        correctAnswer: 2,
        explanation: 'The Western Roman Empire fell in 476 AD'
      },
      {
        question: 'Who painted the Mona Lisa?',
        options: ['Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Donatello'],
        correctAnswer: 0,
        explanation: 'Leonardo da Vinci painted the Mona Lisa in the early 16th century'
      },
      {
        question: 'Which civilization built Machu Picchu?',
        options: ['Aztecs', 'Mayans', 'Incas', 'Olmecs'],
        correctAnswer: 2,
        explanation: 'Machu Picchu was built by the Inca Empire in the 15th century'
      },
      {
        question: 'When was the Declaration of Independence signed?',
        options: ['1772', '1774', '1776', '1778'],
        correctAnswer: 2,
        explanation: 'The Declaration of Independence was signed on July 4, 1776'
      },
      {
        question: 'Who was the first Emperor of China?',
        options: ['Qin Shi Huang', 'Han Wudi', 'Sun Yat-sen', 'Kublai Khan'],
        correctAnswer: 0,
        explanation: 'Qin Shi Huang unified China and became its first emperor in 221 BC'
      },
      {
        question: 'Which event marked the start of the French Revolution?',
        options: ['Battle of Waterloo', 'Storming of the Bastille', 'Treaty of Versailles', 'Reign of Terror'],
        correctAnswer: 1,
        explanation: 'The Storming of the Bastille on July 14, 1789, marked the start of the French Revolution'
      },
      {
        question: 'Who was the first woman to fly solo across the Atlantic Ocean?',
        options: ['Bessie Coleman', 'Amelia Earhart', 'Amy Johnson', 'Harriet Quimby'],
        correctAnswer: 1,
        explanation: 'Amelia Earhart completed this flight in 1932'
      }
    ]
  }
};

function Quiz() {
  const { subject } = useParams();
  const navigate = useNavigate();
  const { addQuizScore } = useQuiz();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // First check if it's a predefined quiz
        if (predefinedQuizzes[subject.toLowerCase()]) {
          setQuizData(predefinedQuizzes[subject.toLowerCase()]);
          setLoading(false);
          return;
        }

        // If not predefined, try to fetch from Firestore
        const quizRef = doc(db, 'quizzes', subject);
        const quizSnap = await getDoc(quizRef);
        
        if (quizSnap.exists()) {
          setQuizData(quizSnap.data());
        } else {
          setError('Quiz not found');
        }
      } catch (err) {
        setError('Failed to load quiz');
        console.error('Error fetching quiz:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [subject]);

  useEffect(() => {
    if (timeLeft > 0 && !selectedOption) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !selectedOption) {
      handleAnswerOptionClick(null);
    }
  }, [timeLeft, selectedOption]);

  const handleAnswerOptionClick = (optionIndex) => {
    setSelectedOption(optionIndex);
    setUserAnswers([...userAnswers, optionIndex]);
  };

  const handleNextQuestion = () => {
    const isCorrect = selectedOption === quizData.questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }

    setSelectedOption(null);

    if (currentQuestion + 1 < quizData.questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(30);
    } else {
      setShowScore(true);
      const finalScore = (score / quizData.questions.length) * 100;
      addQuizScore(subject, finalScore);
    }
  };

  const getEncouragingRemark = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return "Outstanding! You're a true expert! 🎉";
    if (percentage >= 70) return "Great job! You have a solid understanding! 👍";
    if (percentage >= 50) return "Good effort! Keep practicing! 💪";
    return "Don't worry! Practice makes perfect! 🎯";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-red-500">{error}</div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-red-500">Quiz not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {showScore ? (
          <div className="bg-gray-800/50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-4">
              Quiz Completed!
            </h2>
            <p className="text-2xl text-white mb-6">
              You scored {((score / quizData.questions.length) * 100).toFixed(1)}%
            </p>
            <p className="text-xl text-gray-300 mb-8">
              {getEncouragingRemark(score, quizData.questions.length)}
            </p>

            {/* Review Section */}
            <div className="mt-8 space-y-6">
              <h3 className="text-2xl font-bold text-white mb-4">Review Your Answers</h3>
              {quizData.questions.map((question, index) => (
                <div 
                  key={index}
                  className={`p-6 rounded-lg ${
                    userAnswers[index] === question.correctAnswer
                      ? 'bg-green-500/10 border border-green-500/50'
                      : 'bg-red-500/10 border border-red-500/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {userAnswers[index] === question.correctAnswer ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 text-red-500" />
                    )}
                    <h4 className="text-lg font-semibold text-white">
                      Question {index + 1}
                    </h4>
                  </div>
                  
                  <p className="text-white mb-4">{question.question}</p>
                  
                  <div className="space-y-2 mb-4">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`p-3 rounded ${
                          optionIndex === question.correctAnswer
                            ? 'bg-green-500/20 border border-green-500/50'
                            : optionIndex === userAnswers[index]
                            ? 'bg-red-500/20 border border-red-500/50'
                            : 'bg-gray-700/30'
                        }`}
                      >
                        <span className="text-white">{option}</span>
                        {optionIndex === question.correctAnswer && (
                          <span className="ml-2 text-green-400">(Correct Answer)</span>
                        )}
                        {optionIndex === userAnswers[index] && optionIndex !== question.correctAnswer && (
                          <span className="ml-2 text-red-400">(Your Answer)</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-start gap-2 mt-4 bg-gray-700/30 p-4 rounded-lg">
                    <InformationCircleIcon className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
                    <p className="text-gray-300">{question.explanation}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/')}
              className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="text-xl font-semibold text-gray-300">
                Question {currentQuestion + 1} of {quizData.questions.length}
              </div>
              <div className={`text-xl font-semibold ${timeLeft < 10 ? 'text-red-400' : 'text-indigo-400'}`}>
                Time: {timeLeft}s
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {quizData.questions[currentQuestion].question}
              </h2>
            </div>

            <div className="space-y-4">
              {quizData.questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                    selectedOption === index
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => handleAnswerOptionClick(index)}
                  disabled={selectedOption !== null}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNextQuestion}
                disabled={selectedOption === null}
                className={`py-3 px-6 rounded-xl transition-all duration-300 ${
                  selectedOption === null
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                }`}
              >
                {currentQuestion + 1 === quizData.questions.length ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Quiz;
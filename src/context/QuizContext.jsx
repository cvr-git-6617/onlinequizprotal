  import React, { createContext, useState, useContext } from 'react';
import { db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const QuizContext = createContext();

export function useQuiz() {
  return useContext(QuizContext);
}

export function QuizProvider({ children }) {
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function saveQuizScore(subject, score, total) {
    try {
      setLoading(true);
      const quizRef = doc(db, 'quizzes', subject);
      const quizDoc = await getDoc(quizRef);
      
      const newScore = {
        score,
        total,
        percentage: Math.round((score / total) * 100),
        timestamp: new Date()
      };

      if (quizDoc.exists()) {
        await setDoc(quizRef, {
          scores: [...(quizDoc.data().scores || []), newScore]
        }, { merge: true });
      } else {
        await setDoc(quizRef, {
          scores: [newScore]
        });
      }

      setQuizData(prev => ({
        ...prev,
        [subject]: [...(prev?.[subject] || []), newScore]
      }));
    } catch (error) {
      console.error('Error saving quiz score:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const value = {
    quizData,
    loading,
    saveQuizScore
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
} 
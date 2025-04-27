import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// Get this from Firebase Console -> Project Settings -> General -> Your Apps -> SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGqo20ZXyd3g30X4x90UjREoHu32AgCg0",
  authDomain: "online-quiz-portal-fdb37.firebaseapp.com",
  projectId: "online-quiz-portal-fdb37",
  storageBucket: "online-quiz-portal-fdb37.firebasestorage.app",
  messagingSenderId: "577723475859",
  appId: "1:577723475859:web:2608f65871eec2fed9ea66",
  measurementId: "G-WS1P2MV2JM"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app); 
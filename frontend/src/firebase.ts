/**
 * Firebase configuration and authentication setup.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDUdAC7D7Q-q9X2PWgK-JExUctHUU5yGy0",
  authDomain: "motor-diagnostic-tool.firebaseapp.com",
  projectId: "motor-diagnostic-tool",
  storageBucket: "motor-diagnostic-tool.firebasestorage.app",
  messagingSenderId: "276298763750",
  appId: "1:276298763750:web:a8bfe1f23ea62d09fb5a27",
  measurementId: "G-BC26767EJR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export type { User };

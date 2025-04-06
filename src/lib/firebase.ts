// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDr7r3voFpcaCtefkltVddHYt1HaTTfL1g",
  authDomain: "bookeasy-b2421.firebaseapp.com",
  projectId: "bookeasy-b2421",
  storageBucket: "bookeasy-b2421.firebasestorage.app",
  messagingSenderId: "841271503337",
  appId: "1:841271503337:web:f4ae0739ff2f14c8918378",
  measurementId: "G-XHV5N7B148",
  databaseURL: "https://bookeasy-b2421-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const database = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Authentication functions
export const signInWithGoogle = async (userType: string) => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Store user type in local storage for UI customization
    localStorage.setItem('userType', userType);
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const logInWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error logging in with email and password:", error);
    throw error;
  }
};

export const registerWithEmailAndPassword = async (
  email: string, 
  password: string, 
  userType: string,
  displayName?: string
) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Store user type in local storage for UI customization
    localStorage.setItem('userType', userType);
    
    return user;
  } catch (error) {
    console.error("Error registering with email and password:", error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    localStorage.removeItem('userType');
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Authentication state observer
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firebase services export
export {
  app,
  auth,
  firestore,
  storage,
  database,
  analytics
};
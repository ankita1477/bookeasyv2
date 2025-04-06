import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { setUserData, clearUserData } from '../api/apiClient';

/**
 * Syncs the Firebase Auth user with our backend
 * and ensures the user ID is available in localStorage
 */
export const setupUserSync = () => {
  onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      // Store user ID and auth data in localStorage
      const userType = user.email?.endsWith('@business.com') ? 'business' : 'customer';
      setUserData(user.uid, userType);
      
      console.log("User synced:", user.uid, userType);
    } else {
      // User is signed out, clear data
      clearUserData();
    }
  });
};

// Initialize user sync on app load
export const initUserSync = () => {
  setupUserSync();
};

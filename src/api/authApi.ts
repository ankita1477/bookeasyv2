import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "firebase/auth";
import { firebaseDB, fetchAPI } from "./apiClient";
import { AuthResponse, LoginCredentials, RegisterData, User } from "./types";

/**
 * Auth API wrapper for Firebase Authentication and backend integration
 */
export const authApi = {
  // Register a new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const auth = getAuth();
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth, 
        data.email, 
        data.password
      );

      // Create user in Firebase Database
      const newUser: Omit<User, 'id'> = {
        email: data.email,
        name: data.name,
        type: data.type,
        createdAt: new Date().toISOString(),
        photoURL: firebaseUser.photoURL || undefined
      };

      const createdUser = await firebaseDB.create<Omit<User, 'id'>>('users', newUser);
      
      // Get the token
      const token = await firebaseUser.getIdToken();
      
      // Store auth data locally
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', createdUser.id);
      localStorage.setItem('userType', data.type);
      
      return {
        user: createdUser as User,
        token
      };
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(error.message || "Failed to register user");
    }
  },

  // Login with email password
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const auth = getAuth();
      const { user: firebaseUser } = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      );

      // Get user data from database
      const users = await firebaseDB.queryByField<User>('users', 'email', credentials.email);
      
      if (!users || users.length === 0) {
        throw new Error("User not found in the database");
      }
      
      const user = users[0];
      const token = await firebaseUser.getIdToken();
      
      // Store auth data locally
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userType', user.type);
      
      return {
        user,
        token
      };
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Failed to login");
    }
  },

  // Login with Google
  loginWithGoogle: async (): Promise<AuthResponse> => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const { user: firebaseUser } = await signInWithPopup(auth, provider);
      
      // Check if user exists in database
      let users = await firebaseDB.queryByField<User>('users', 'email', firebaseUser.email || '');
      let user: User;
      
      if (!users || users.length === 0) {
        // Create new user in database
        const newUser = {
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || '',
          type: 'customer', // Default type for Google sign-in
          createdAt: new Date().toISOString(),
          photoURL: firebaseUser.photoURL || undefined
        };
        
        user = await firebaseDB.create<Omit<User, 'id'>>('users', newUser) as User;
      } else {
        user = users[0];
      }
      
      const token = await firebaseUser.getIdToken();
      
      // Store auth data locally
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userType', user.type);
      
      return {
        user,
        token
      };
    } catch (error: any) {
      console.error("Google login error:", error);
      throw new Error(error.message || "Failed to login with Google");
    }
  },
  
  // Reset password
  resetPassword: async (email: string): Promise<boolean> => {
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error: any) {
      console.error("Password reset error:", error);
      throw new Error(error.message || "Failed to send password reset email");
    }
  },
  
  // Get current user data
  getCurrentUser: async (): Promise<User | null> => {
    const userId = localStorage.getItem('userId');
    if (!userId) return null;
    
    try {
      return await firebaseDB.getById<User>('users', userId);
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  },
  
  // Sign out
  signOut: async (): Promise<void> => {
    try {
      const auth = getAuth();
      await firebaseSignOut(auth);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userType');
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userId: string, data: Partial<User>): Promise<User> => {
    try {
      await firebaseDB.update<User>('users', userId, data);
      return await firebaseDB.getById<User>('users', userId);
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  }
};
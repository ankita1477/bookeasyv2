import { database } from '../lib/firebase';
import { ref, get, set, push, update, remove, query, orderByChild, equalTo } from 'firebase/database';

// API Configuration
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://bookeasy-api.vercel.app/api' 
  : 'http://localhost:5000/api';

// Helper function to handle fetch API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || `Error: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }
  return response.json();
};

// Generic fetch function with error handling
export const fetchAPI = async (
  endpoint: string, 
  options: RequestInit = {}
) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
};

// Firebase Database helper functions
export const firebaseDB = {
  // Create a new item in a collection
  create: async <T>(path: string, data: T) => {
    try {
      const newItemRef = push(ref(database, path));
      await set(newItemRef, { id: newItemRef.key, ...data });
      return { id: newItemRef.key, ...data };
    } catch (error) {
      console.error(`Firebase create error at ${path}:`, error);
      throw error;
    }
  },

  // Update an existing item
  update: async <T>(path: string, id: string, data: Partial<T>) => {
    try {
      const itemRef = ref(database, `${path}/${id}`);
      await update(itemRef, data);
      return { id, ...data };
    } catch (error) {
      console.error(`Firebase update error at ${path}/${id}:`, error);
      throw error;
    }
  },

  // Get a single item by ID
  getById: async <T>(path: string, id: string): Promise<T> => {
    try {
      const itemRef = ref(database, `${path}/${id}`);
      const snapshot = await get(itemRef);
      
      if (!snapshot.exists()) {
        throw new Error(`Item not found at ${path}/${id}`);
      }
      
      return snapshot.val() as T;
    } catch (error) {
      console.error(`Firebase getById error at ${path}/${id}:`, error);
      throw error;
    }
  },

  // Get all items in a collection
  getAll: async <T>(path: string): Promise<T[]> => {
    try {
      const collectionRef = ref(database, path);
      const snapshot = await get(collectionRef);
      
      if (!snapshot.exists()) {
        return [];
      }
      
      const data: Record<string, T> = snapshot.val();
      return Object.values(data);
    } catch (error) {
      console.error(`Firebase getAll error at ${path}:`, error);
      throw error;
    }
  },

  // Query items by a field value
  queryByField: async <T>(path: string, field: string, value: string | number | boolean): Promise<T[]> => {
    try {
      const q = query(ref(database, path), orderByChild(field), equalTo(value));
      const snapshot = await get(q);
      
      if (!snapshot.exists()) {
        return [];
      }
      
      const data: Record<string, T> = snapshot.val();
      return Object.values(data);
    } catch (error) {
      console.error(`Firebase query error at ${path} (${field}=${value}):`, error);
      throw error;
    }
  },

  // Delete an item
  delete: async (path: string, id: string) => {
    try {
      const itemRef = ref(database, `${path}/${id}`);
      await remove(itemRef);
      return true;
    } catch (error) {
      console.error(`Firebase delete error at ${path}/${id}:`, error);
      throw error;
    }
  }
};

// User authentication helpers
export const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const getUserId = () => {
  return localStorage.getItem('userId') || null;
};

export const getUserType = () => {
  return localStorage.getItem('userType') || 'customer';
};
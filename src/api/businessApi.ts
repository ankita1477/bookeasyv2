import { database } from '../lib/firebase';
import { ref, get, set, push, update, query, orderByChild, equalTo } from 'firebase/database';
import { Business, ApiResponse } from './types';
import { fetchAPI } from './apiClient';

const BUSINESSES_PATH = 'businesses';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Firebase Database operations
export const getBusinessById = async (businessId: string): Promise<Business | null> => {
  try {
    const businessRef = ref(database, `${BUSINESSES_PATH}/${businessId}`);
    const snapshot = await get(businessRef);
    
    if (snapshot.exists()) {
      return { id: businessId, ...snapshot.val() } as Business;
    }
    return null;
  } catch (error) {
    console.error('Error fetching business:', error);
    throw error;
  }
};

export const createBusiness = async (business: Omit<Business, 'id' | 'createdAt'>): Promise<Business> => {
  try {
    const businessesRef = ref(database, BUSINESSES_PATH);
    const newBusinessRef = push(businessesRef);
    const businessId = newBusinessRef.key as string;
    
    const newBusiness: Business = {
      ...business,
      id: businessId,
      createdAt: new Date().toISOString()
    };
    
    await set(newBusinessRef, newBusiness);
    return newBusiness;
  } catch (error) {
    console.error('Error creating business:', error);
    throw error;
  }
};

export const updateBusiness = async (businessId: string, updates: Partial<Business>): Promise<Business> => {
  try {
    const businessRef = ref(database, `${BUSINESSES_PATH}/${businessId}`);
    await update(businessRef, updates);
    
    // Fetch the updated business
    const updatedBusiness = await getBusinessById(businessId);
    if (!updatedBusiness) {
      throw new Error('Business not found after update');
    }
    
    return updatedBusiness;
  } catch (error) {
    console.error('Error updating business:', error);
    throw error;
  }
};

export const getBusinessesByOwnerId = async (ownerId: string): Promise<Business[]> => {
  try {
    const businessesRef = ref(database, BUSINESSES_PATH);
    const businessQuery = query(businessesRef, orderByChild('ownerId'), equalTo(ownerId));
    const snapshot = await get(businessQuery);
    
    if (snapshot.exists()) {
      const businesses: Business[] = [];
      snapshot.forEach((childSnapshot) => {
        businesses.push({ id: childSnapshot.key as string, ...childSnapshot.val() });
      });
      return businesses;
    }
    return [];
  } catch (error) {
    console.error('Error fetching businesses by owner:', error);
    throw error;
  }
};

// Express API operations with proper error handling and connection to backend
export const fetchBusinesses = async (page = 1, limit = 10): Promise<ApiResponse<Business[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/businesses?page=${page}&limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
        // Include authentication header if needed
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch businesses: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching businesses:', error);
    throw error;
  }
};

export const fetchBusinessById = async (id: string): Promise<ApiResponse<Business>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/businesses/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch business: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching business ${id}:`, error);
    throw error;
  }
};

export const createBusinessApi = async (businessData: Omit<Business, 'id' | 'createdAt'>): Promise<ApiResponse<Business>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/businesses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }),
        'user-id': localStorage.getItem('userId') || ''
      },
      body: JSON.stringify(businessData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create business: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating business:', error);
    throw error;
  }
};

export const updateBusinessApi = async (id: string, businessData: Partial<Business>): Promise<ApiResponse<Business>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/businesses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }),
        'user-id': localStorage.getItem('userId') || ''
      },
      body: JSON.stringify(businessData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update business: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error updating business ${id}:`, error);
    throw error;
  }
};

export const deleteBusinessApi = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/businesses/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }),
        'user-id': localStorage.getItem('userId') || ''
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete business: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error deleting business ${id}:`, error);
    throw error;
  }
};
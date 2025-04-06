// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  type: 'customer' | 'business';
  createdAt: string;
  phoneNumber?: string;
  photoURL?: string;
}

// Business Types
export interface Business {
  id: string;
  email: string;
  name: string;
  description: string;
  createdAt: string;
  contactInfo: string;
  address: string;
  logoUrl?: string;
  ownerId: string;
  businessType?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

// Listing Types
export interface Listing {
  id: string;
  title: string;
  description: string;
  type: string;
  price: number;
  currency: string;
  capacity: number;
  active: boolean;
  location: string;
  businessId: string;
  createdAt: string;
  images: string[];
  tags: string[];
  rating: number;
  reviews: number;
  amenities?: string[];
  availability?: {
    [date: string]: {
      isAvailable: boolean;
      timeSlots?: {
        [timeSlot: string]: boolean;
      };
    };
  };
}

// Booking Types
export interface Booking {
  id: string;
  listingId: string;
  userId: string;
  businessId: string;
  customerName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  attendees: number;
  totalPaid: number;
  createdAt: string;
  contactInfo: string;
  specialRequests?: string;
  paymentInfo?: {
    method: string;
    transactionId?: string;
    paidAmount: number;
  };
}

// Review Types
export interface Review {
  id: string;
  listingId: string;
  userId: string;
  userName: string;
  rating: number;
  content: string;
  date: string;
  businessResponse?: {
    content: string;
    date: string;
  };
}

// Search and Filter Types
export interface SearchParams {
  query?: string;
  type?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  capacity?: number;
  amenities?: string[];
  date?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  type: string;
  price: number;
  currency: string;
  location: string;
  image: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  type: 'customer' | 'business';
}

export interface AuthResponse {
  user: User;
  token: string;
}
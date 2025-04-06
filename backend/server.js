// BookEasy Backend Server
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const { initializeApp } = require('firebase/app');
const { 
  getDatabase, 
  ref, 
  set, 
  get, 
  push, 
  remove, 
  update, 
  query, 
  orderByChild, 
  equalTo 
} = require('firebase/database');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Firebase configuration
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
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

// Helper function to initialize empty database structure if needed
const initializeDatabase = async () => {
  try {
    console.log('Database initialization skipped - waiting for real data from businesses');
    
    // Create empty nodes if they don't exist to ensure proper structure
    const nodes = ['listings', 'bookings', 'users', 'businesses'];
    
    for (const node of nodes) {
      const nodeRef = ref(database, node);
      const snapshot = await get(nodeRef);
      
      if (!snapshot.exists()) {
        // Just create an empty node
        await set(nodeRef, {});
        console.log(`Created empty ${node} node in database`);
      }
    }
  } catch (error) {
    console.error('Error initializing database structure:', error);
  }
};

// Helper middleware for checking authentication
// In a real application, this would verify JWT tokens
const authenticateUser = (req, res, next) => {
  // For demo purposes, we'll just pass through
  // In a real app, this would verify the JWT token in the Authorization header
  const userId = req.headers['user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }
  req.userId = userId;
  next();
};

// API Routes

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'BookEasy API is running' });
});

// Listings Routes
app.get('/api/listings', async (req, res) => {
  try {
    // Get query parameters for filtering
    const { type, location, minPrice, maxPrice, capacity } = req.query;
    
    // Fetch all listings
    const listingsRef = ref(database, 'listings');
    const snapshot = await get(listingsRef);
    
    if (!snapshot.exists()) {
      return res.status(200).json([]);
    }
    
    // Convert snapshot to array and apply filters
    let listings = [];
    snapshot.forEach(childSnapshot => {
      const listing = childSnapshot.val();
      listings.push(listing);
    });
    
    // Apply filters if provided
    if (type) {
      listings = listings.filter(listing => listing.type === type);
    }
    
    if (location) {
      listings = listings.filter(listing => 
        listing.location.toLowerCase().includes(location.toLowerCase()));
    }
    
    if (minPrice) {
      listings = listings.filter(listing => listing.price >= parseInt(minPrice));
    }
    
    if (maxPrice) {
      listings = listings.filter(listing => listing.price <= parseInt(maxPrice));
    }
    
    if (capacity) {
      listings = listings.filter(listing => listing.capacity >= parseInt(capacity));
    }
    
    // Only show active listings in public API
    listings = listings.filter(listing => listing.active);
    
    res.status(200).json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

app.get('/api/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const listingRef = ref(database, `listings/${id}`);
    const snapshot = await get(listingRef);
    
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    const listing = snapshot.val();
    res.status(200).json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

app.post('/api/listings', authenticateUser, async (req, res) => {
  try {
    const { 
      title, description, type, price, currency, capacity, 
      location, images, tags
    } = req.body;
    
    if (!title || !description || !type || !price || !capacity || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const listingId = uuidv4();
    
    // Create new listing object
    const newListing = {
      id: listingId,
      title,
      description,
      type,
      price: parseInt(price),
      currency: currency || 'INR',
      capacity: parseInt(capacity),
      active: true,
      location,
      businessId: req.userId,
      createdAt: new Date().toISOString(),
      images: images || [],
      tags: tags || [],
      rating: 0,
      reviews: 0,
    };
    
    // Save to Firebase
    const listingRef = ref(database, `listings/${listingId}`);
    await set(listingRef, newListing);
    
    res.status(201).json(newListing);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

app.put('/api/listings/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if listing exists
    const listingRef = ref(database, `listings/${id}`);
    const snapshot = await get(listingRef);
    
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    const listing = snapshot.val();
    
    // Check ownership
    if (listing.businessId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }
    
    // Keep existing data that shouldn't be updated
    const updatedListing = {
      ...listing,
      ...req.body,
      // Don't allow updating these fields
      id: listing.id,
      businessId: listing.businessId,
      createdAt: listing.createdAt,
    };
    
    // Update in Firebase
    await set(listingRef, updatedListing);
    
    res.status(200).json(updatedListing);
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

app.delete('/api/listings/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if listing exists
    const listingRef = ref(database, `listings/${id}`);
    const snapshot = await get(listingRef);
    
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    const listing = snapshot.val();
    
    // Check ownership
    if (listing.businessId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }
    
    // Delete from Firebase
    await remove(listingRef);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// Business dashboard listings
app.get('/api/business/listings', authenticateUser, async (req, res) => {
  try {
    const businessId = req.userId;
    
    // Query for listings with matching businessId
    const listingsRef = ref(database, 'listings');
    const snapshot = await get(listingsRef);
    
    if (!snapshot.exists()) {
      return res.status(200).json([]);
    }
    
    // Filter listings by businessId
    const businessListings = [];
    snapshot.forEach(childSnapshot => {
      const listing = childSnapshot.val();
      if (listing.businessId === businessId) {
        businessListings.push(listing);
      }
    });
    
    res.status(200).json(businessListings);
  } catch (error) {
    console.error('Error fetching business listings:', error);
    res.status(500).json({ error: 'Failed to fetch business listings' });
  }
});

// Booking Routes
app.get('/api/bookings', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const userType = req.headers['user-type'];
    
    // Fetch all bookings
    const bookingsRef = ref(database, 'bookings');
    const snapshot = await get(bookingsRef);
    
    if (!snapshot.exists()) {
      return res.status(200).json([]);
    }
    
    // Filter bookings based on user type
    const userBookings = [];
    snapshot.forEach(childSnapshot => {
      const booking = childSnapshot.val();
      if (
        (userType === 'business' && booking.businessId === userId) ||
        (userType !== 'business' && booking.userId === userId)
      ) {
        userBookings.push(booking);
      }
    });
    
    res.status(200).json(userBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

app.post('/api/bookings', authenticateUser, async (req, res) => {
  try {
    const { 
      listingId, customerName, date, time, attendees,
      contactInfo, specialRequests 
    } = req.body;
    
    if (!listingId || !customerName || !date || !time || !attendees) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if listing exists
    const listingRef = ref(database, `listings/${listingId}`);
    const listingSnapshot = await get(listingRef);
    
    if (!listingSnapshot.exists()) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    const listing = listingSnapshot.val();
    
    if (!listing.active) {
      return res.status(400).json({ error: 'This listing is not currently available for booking' });
    }
    
    if (parseInt(attendees) > listing.capacity) {
      return res.status(400).json({ 
        error: `Requested attendees exceed the venue capacity of ${listing.capacity}`
      });
    }
    
    const bookingId = uuidv4();
    
    const newBooking = {
      id: bookingId,
      listingId,
      userId: req.userId,
      businessId: listing.businessId,
      customerName,
      date,
      time,
      status: 'pending',
      attendees: parseInt(attendees),
      totalPaid: listing.price,
      createdAt: new Date().toISOString(),
      contactInfo: contactInfo || '',
      specialRequests: specialRequests || '',
    };
    
    // Save to Firebase
    const bookingRef = ref(database, `bookings/${bookingId}`);
    await set(bookingRef, newBooking);
    
    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

app.put('/api/bookings/:id/status', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    // Check if booking exists
    const bookingRef = ref(database, `bookings/${id}`);
    const snapshot = await get(bookingRef);
    
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const booking = snapshot.val();
    
    // Check ownership
    if (booking.businessId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to update this booking' });
    }
    
    // Update booking status
    await update(bookingRef, { status });
    
    // Get updated booking
    const updatedSnapshot = await get(bookingRef);
    const updatedBooking = updatedSnapshot.val();
    
    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Search functionality
app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const normalizedQuery = query.toLowerCase();
    
    // Fetch all listings
    const listingsRef = ref(database, 'listings');
    const snapshot = await get(listingsRef);
    
    if (!snapshot.exists()) {
      return res.status(200).json([]);
    }
    
    // Filter and map listings based on search query
    const results = [];
    snapshot.forEach(childSnapshot => {
      const listing = childSnapshot.val();
      
      if (listing.active && (
        listing.title.toLowerCase().includes(normalizedQuery) ||
        listing.description.toLowerCase().includes(normalizedQuery) ||
        listing.type.toLowerCase().includes(normalizedQuery) ||
        listing.location.toLowerCase().includes(normalizedQuery) ||
        (listing.tags && listing.tags.some(tag => tag.toLowerCase().includes(normalizedQuery)))
      )) {
        results.push({
          id: listing.id,
          title: listing.title,
          type: listing.type,
          price: listing.price,
          currency: listing.currency,
          location: listing.location,
          image: listing.images && listing.images.length > 0 ? listing.images[0] : '',
        });
      }
    });
    
    res.status(200).json(results);
  } catch (error) {
    console.error('Error searching listings:', error);
    res.status(500).json({ error: 'Failed to search listings' });
  }
});

// User Routes (simplified - in a real app would have proper authentication)
app.post('/api/users/register', async (req, res) => {
  try {
    const { email, name, password, type } = req.body;
    
    if (!email || !name || !password || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if user with this email already exists
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      let emailExists = false;
      snapshot.forEach(childSnapshot => {
        const user = childSnapshot.val();
        if (user.email === email) {
          emailExists = true;
        }
      });
      
      if (emailExists) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }
    }
    
    const userId = `user-${uuidv4()}`;
    
    const newUser = {
      id: userId,
      email,
      name,
      type,
      createdAt: new Date().toISOString(),
      // In a real app, would hash the password
    };
    
    // Save to Firebase
    const userRef = ref(database, `users/${userId}`);
    await set(userRef, newUser);
    
    // In a real app, would generate and return JWT token
    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      type: newUser.type,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user by email
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    let user = null;
    snapshot.forEach(childSnapshot => {
      const userData = childSnapshot.val();
      if (userData.email === email) {
        user = userData;
      }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // In a real app, would verify password hash
    
    // In a real app, would generate and return JWT token
    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      type: user.type,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// Initialize database with sample data if empty
initializeDatabase();

// Start the server
app.listen(PORT, () => {
  console.log(`BookEasy API server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}/api/health`);
});
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, logOut } from '@/lib/firebase';
import { Listing, Booking, SearchParams } from '@/api/types';
import { fetchAPI, getUserId, getUserType, firebaseDB } from '@/api/apiClient';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { 
  Loader2, 
  Search, 
  Calendar, 
  User,
  Star,
  Clock,
  Repeat,
  Package,
  Coffee,
  PartyPopper,
  MonitorPlay,
  Palette,
  Dumbbell,
  MapPin,
  ChevronRight,
  Heart,
  Building,
  BadgePercent,
  AlertCircle
} from 'lucide-react';

// Category component
const CategoryItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 transition-all hover:bg-gray-100 rounded-xl"
  >
    <div className="h-14 w-14 bg-bookeasy-orange/10 rounded-full flex items-center justify-center text-bookeasy-orange mb-2">
      {icon}
    </div>
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </button>
);

// Listing card component
const ListingCard: React.FC<{
  listing: Listing;
  onBookNow: (id: string) => void;
}> = ({ listing, onBookNow }) => (
  <Card className="overflow-hidden transition-all hover:shadow-lg">
    <div className="relative h-48">
      <img 
        src={listing.images && listing.images.length > 0 
          ? listing.images[0] 
          : 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80'}
        alt={listing.title} 
        className="h-full w-full object-cover"
      />
      <button className="absolute top-2 right-2 h-8 w-8 bg-white/80 rounded-full flex items-center justify-center hover:text-red-500 transition-colors">
        <Heart className="h-5 w-5" />
      </button>
    </div>
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium line-clamp-1">{listing.title}</h3>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="line-clamp-1">{listing.location}</span>
          </div>
        </div>
        <div className="flex items-center bg-gray-100 px-2 py-1 rounded-md">
          <Star className="h-3 w-3 text-yellow-500 mr-1" />
          <span className="text-xs font-medium">{listing.rating || 'New'}</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mt-2 h-10">{listing.description}</p>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">From</p>
          <p className="font-medium">₹{listing.price}/hr</p>
        </div>
        <Button 
          size="sm" 
          onClick={() => onBookNow(listing.id)}
          className="bg-bookeasy-orange hover:bg-bookeasy-orange/90"
        >
          Book Now
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Booking card component
const BookingCard: React.FC<{
  booking: Booking;
  listing: Listing | null;
  onRebook?: (id: string) => void;
}> = ({ booking, listing, onRebook }) => {
  if (!listing) return null;
  
  return (
    <Card>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{listing?.title}</h3>
            <p className="text-sm text-gray-500">{listing?.type}</p>
          </div>
          <span className={`px-3 py-1 text-xs rounded-full ${
            booking.status === 'confirmed' 
              ? 'bg-green-100 text-green-800' 
              : booking.status === 'cancelled'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
          }`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-y-2">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm">{new Date(booking.date).toLocaleDateString('en-IN')}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm">{booking.time}</span>
          </div>
          <div className="flex items-center">
            <Building className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm">{listing.location}</span>
          </div>
          <div className="flex items-center">
            <BadgePercent className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm">₹{booking.totalPaid} paid</span>
          </div>
        </div>

        {onRebook && (
          <div className="mt-4 pt-4 border-t text-right">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onRebook(listing.id)}
              className="space-x-1"
            >
              <Repeat className="h-4 w-4 mr-1" />
              Rebook
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

// Featured Carousel Component
const FeaturedCarousel: React.FC<{
  listings: Listing[]
  onBookNow: (id: string) => void
}> = ({ listings, onBookNow }) => {
  return (
    <div className="relative py-6">
      <h2 className="text-xl font-medium mb-4">Featured Spaces</h2>
      {listings.length > 0 ? (
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {listings.map(listing => (
            <div key={listing.id} className="min-w-[300px] max-w-[300px]">
              <ListingCard 
                listing={listing} 
                onBookNow={onBookNow} 
              />
            </div>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No listings available</h3>
          <p className="text-gray-500 mb-4">Check back soon for new spaces</p>
        </Card>
      )}
    </div>
  );
};

// Main customer panel
const UserHome: React.FC = () => {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchType, setSearchType] = useState("");
  
  // Data states
  const [listings, setListings] = useState<Listing[]>([]);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [listingDetails, setListingDetails] = useState<Record<string, Listing>>({});
  
  // Loading states
  const [listingsLoading, setListingsLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to auth page if not logged in
      navigate('/auth', { state: { userType: 'user' } });
    } else if (user) {
      // Load data when user is authenticated
      loadListings();
      loadBookings();
    }
  }, [user, loading, navigate]);

  // Fetch all active listings from businesses
  const loadListings = async () => {
    setListingsLoading(true);
    try {
      // Use the fetchAPI function to get real listings data
      const response = await fetchAPI('/listings');
      
      // Filter to only show active listings
      const activeListings = response.filter((listing: Listing) => listing.active === true);
      setListings(activeListings);
      
      // Set featured listings (listings with highest ratings)
      if (activeListings.length > 0) {
        // Sort by rating and take top 5
        const featured = [...activeListings]
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, Math.min(5, activeListings.length));
        setFeaturedListings(featured);
      }
      
      setListingsLoading(false);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      toast({
        title: "Error",
        description: "Could not load listings. Please try again.",
        variant: "destructive"
      });
      setListingsLoading(false);
    }
  };

  // Fetch user's bookings with real API
  const loadBookings = async () => {
    setBookingsLoading(true);
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      // Use fetchAPI with proper headers for authentication
      const response = await fetchAPI('/bookings', {
        headers: {
          'user-id': userId,
          'user-type': 'customer'
        }
      });
      
      setBookings(response);
      
      // Fetch details for all listings associated with bookings
      if (response && response.length > 0) {
        const listingIds = Array.from(new Set(response.map((booking: Booking) => booking.listingId)));
        await loadListingDetails(listingIds);
      }
      
      setBookingsLoading(false);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast({
        title: "Error",
        description: "Could not load your bookings. Please try again.",
        variant: "destructive"
      });
      setBookingsLoading(false);
    }
  };

  // Fetch details of specific listings by IDs using real API
  const loadListingDetails = async (listingIds: string[]) => {
    try {
      const details: Record<string, Listing> = {};
      
      for (const id of listingIds) {
        try {
          // Use fetchAPI to get individual listing details
          const response = await fetchAPI(`/listings/${id}`);
          details[id] = response;
        } catch (listingError) {
          console.error(`Error fetching details for listing ${id}:`, listingError);
          // Continue with other listings even if one fails
        }
      }
      
      setListingDetails(prev => ({...prev, ...details}));
    } catch (error) {
      console.error('Failed to fetch listing details:', error);
    }
  };

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  const handleBookNow = (listingId: string) => {
    navigate(`/booking/${listingId}`);
  };

  const handleRebook = (listingId: string) => {
    navigate(`/booking/${listingId}`);
  };

  // Implement real search functionality using API
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setListingsLoading(true);
    
    try {
      // Prepare search params
      const searchParams: Record<string, string> = {};
      
      if (searchLocation) searchParams.location = searchLocation;
      if (searchType) searchParams.type = searchType;
      if (searchDate) searchParams.date = searchDate;
      if (searchQuery) searchParams.query = searchQuery;
      
      // Construct query string
      const queryString = Object.entries(searchParams)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      
      // Make API call
      const response = await fetchAPI(`/listings${queryString ? '?' + queryString : ''}`);
      
      // Filter to only show active listings
      const activeListings = response.filter((listing: Listing) => listing.active === true);
      setListings(activeListings);
      setListingsLoading(false);
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: "Search Error",
        description: "Could not perform search. Please try again.",
        variant: "destructive"
      });
      setListingsLoading(false);
    }
  };

  // Use real API for category filtering
  const handleCategoryClick = async (category: string) => {
    setSearchType(category);
    setListingsLoading(true);
    
    try {
      // Fetch listings by category using API
      const response = await fetchAPI(`/listings?type=${category}`);
      
      // Filter to only show active listings
      const activeListings = response.filter((listing: Listing) => listing.active === true);
      setListings(activeListings);
      setListingsLoading(false);
    } catch (error) {
      console.error(`Failed to fetch ${category} listings:`, error);
      toast({
        title: "Error",
        description: `Could not load ${category} listings.`,
        variant: "destructive"
      });
      setListingsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bookeasy-light">
        <Loader2 className="h-12 w-12 animate-spin text-bookeasy-orange" />
        <p className="mt-4 text-bookeasy-dark">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold text-bookeasy-purple">Book<span className="text-bookeasy-orange">Easy</span></span>
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search for spaces..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center space-x-6">
            <button className="text-gray-600 hover:text-bookeasy-orange flex items-center">
              <Package className="h-5 w-5 mr-2" />
              <span className="hidden md:inline">Bookings</span>
            </button>
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8 border border-bookeasy-orange">
                {user?.photoURL ? (
                  <AvatarImage src={user.photoURL} alt="Profile" />
                ) : (
                  <AvatarFallback className="bg-bookeasy-orange/20 text-bookeasy-orange">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="hidden md:inline text-sm font-medium">
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </span>
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-bookeasy-purple to-bookeasy-orange rounded-2xl text-white p-8 mb-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">
              Find spaces that vibe with your plans
            </h1>
            <p className="text-lg mb-6 opacity-90">
              Discover and book unique spaces for any occasion
            </p>
            
            <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-lg shadow-lg flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-600 mb-1 block">Location</label>
                <Input 
                  placeholder="Where do you need a space?" 
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="border-0 focus-visible:ring-0"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600 mb-1 block">Date</label>
                <Input 
                  type="date" 
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="border-0 focus-visible:ring-0"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600 mb-1 block">Type</label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="border-0 focus:ring-0">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gym">Gym</SelectItem>
                    <SelectItem value="cafe">Café</SelectItem>
                    <SelectItem value="banquet">Banquet</SelectItem>
                    <SelectItem value="coworking">Co-working</SelectItem>
                    <SelectItem value="studio">Creative Studio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full md:w-auto bg-bookeasy-orange hover:bg-bookeasy-orange/90">
                  Search
                </Button>
              </div>
            </form>
          </div>
        </section>

        {/* Featured Carousel - Now showing real top-rated listings */}
        {featuredListings.length > 0 && (
          <FeaturedCarousel 
            listings={featuredListings}
            onBookNow={handleBookNow}
          />
        )}

        {/* Categories Section */}
        <section className="py-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Browse by Category</h2>
            <Button variant="ghost" size="sm" className="text-sm text-gray-600">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <CategoryItem 
              icon={<Dumbbell className="h-6 w-6" />}
              label="Gym"
              onClick={() => handleCategoryClick("gym")}
            />
            <CategoryItem 
              icon={<Coffee className="h-6 w-6" />}
              label="Café"
              onClick={() => handleCategoryClick("cafe")}
            />
            <CategoryItem 
              icon={<PartyPopper className="h-6 w-6" />}
              label="Banquet"
              onClick={() => handleCategoryClick("banquet")}
            />
            <CategoryItem 
              icon={<MonitorPlay className="h-6 w-6" />}
              label="Co-working"
              onClick={() => handleCategoryClick("coworking")}
            />
            <CategoryItem 
              icon={<Palette className="h-6 w-6" />}
              label="Creative Studios"
              onClick={() => handleCategoryClick("studio")}
            />
          </div>
        </section>

        {/* Available Spaces Section - Now showing real business listings */}
        <section className="py-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Available Spaces</h2>
          </div>

          {listingsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-bookeasy-orange" />
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map(listing => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing} 
                  onBookNow={handleBookNow} 
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No listings available</h3>
              <p className="text-gray-500 mb-4">
                We couldn't find any spaces matching your criteria.
                Try adjusting your search or check back soon for new listings.
              </p>
            </Card>
          )}
        </section>

        {/* Booking History Section - Now showing real user bookings */}
        <section className="py-6">
          <h2 className="text-xl font-medium mb-4">Your Bookings</h2>
          
          {bookingsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-bookeasy-orange" />
            </div>
          ) : (
            <Tabs defaultValue="upcoming">
              <TabsList className="mb-6">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookings
                    .filter(booking => 
                      (booking.status === 'confirmed' || booking.status === 'pending') && 
                      new Date(booking.date) >= new Date())
                    .map(booking => (
                      <BookingCard 
                        key={booking.id}
                        booking={booking}
                        listing={listingDetails[booking.listingId] || null}
                      />
                    ))}
                  
                  {bookings.filter(booking => 
                    (booking.status === 'confirmed' || booking.status === 'pending') && 
                    new Date(booking.date) >= new Date()
                  ).length === 0 && (
                    <Card className="col-span-full p-6 text-center">
                      <h3 className="font-medium mb-2">No upcoming bookings</h3>
                      <p className="text-gray-500 mb-4">Browse and book spaces to see them here</p>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="past">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookings
                    .filter(booking => 
                      new Date(booking.date) < new Date() || 
                      booking.status === 'completed' ||
                      booking.status === 'cancelled')
                    .map(booking => (
                      <BookingCard 
                        key={booking.id}
                        booking={booking}
                        listing={listingDetails[booking.listingId] || null}
                        onRebook={booking.status !== 'cancelled' ? handleRebook : undefined}
                      />
                    ))}
                  
                  {bookings.filter(booking => 
                    new Date(booking.date) < new Date() || 
                    booking.status === 'completed' ||
                    booking.status === 'cancelled'
                  ).length === 0 && (
                    <Card className="col-span-full p-6 text-center">
                      <h3 className="font-medium mb-2">No booking history yet</h3>
                      <p className="text-gray-500">Your past bookings will appear here</p>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default UserHome;
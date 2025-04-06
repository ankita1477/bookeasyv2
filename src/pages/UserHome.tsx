import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, logOut } from '@/lib/firebase';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  BadgePercent
} from 'lucide-react';

// Mock data for listings
const mockListings = [
  {
    id: '1',
    title: 'Quiet Co-working Space',
    description: 'Perfect for focused work with high-speed internet',
    type: 'Co-working',
    location: 'Mumbai, India',
    price: 499,
    currency: 'INR',
    rating: 4.8,
    reviews: 24,
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
  },
  {
    id: '2',
    title: 'Urban Fitness Center',
    description: 'Fully equipped gym with personal training options',
    type: 'Gym',
    location: 'Delhi, India',
    price: 799,
    currency: 'INR',
    rating: 4.5,
    reviews: 18,
    image: 'https://images.unsplash.com/photo-1534438097545-a2c22c57f2ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
  },
  {
    id: '3',
    title: 'Creative Studio with Natural Light',
    description: 'Perfect for photography and creative projects',
    type: 'Creative Studio',
    location: 'Bangalore, India',
    price: 1299,
    currency: 'INR',
    rating: 4.9,
    reviews: 32,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80'
  },
  {
    id: '4',
    title: 'Rooftop Café for Private Events',
    description: 'Host your next meetup or small gathering here',
    type: 'Café',
    location: 'Hyderabad, India',
    price: 1999,
    currency: 'INR',
    rating: 4.7,
    reviews: 15,
    image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
  },
];

// Mock data for bookings
const mockBookings = [
  {
    id: 'b1',
    listingId: '1',
    date: '2025-04-15',
    time: '09:00 - 17:00',
    status: 'confirmed',
    totalPaid: 499
  },
  {
    id: 'b2',
    listingId: '2',
    date: '2025-04-12',
    time: '10:00 - 12:00',
    status: 'confirmed',
    totalPaid: 799
  },
  {
    id: 'b3',
    listingId: '3',
    date: '2025-03-30',
    time: '14:00 - 18:00',
    status: 'cancelled',
    totalPaid: 1299
  }
];

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
  listing: typeof mockListings[0];
  onBookNow: (id: string) => void;
}> = ({ listing, onBookNow }) => (
  <Card className="overflow-hidden transition-all hover:shadow-lg">
    <div className="relative h-48">
      <img 
        src={listing.image} 
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
          <span className="text-xs font-medium">{listing.rating}</span>
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
  booking: typeof mockBookings[0];
  listing: typeof mockListings[0];
  onRebook?: (id: string) => void;
}> = ({ booking, listing, onRebook }) => (
  <Card>
    <div className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{listing.title}</h3>
          <p className="text-sm text-gray-500">{listing.type}</p>
        </div>
        <span className={`px-3 py-1 text-xs rounded-full ${
          booking.status === 'confirmed' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {booking.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}
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

// Featured Carousel Component
const FeaturedCarousel: React.FC = () => {
  return (
    <div className="relative py-6">
      <h2 className="text-xl font-medium mb-4">Featured Spaces</h2>
      <div className="flex space-x-6 overflow-x-auto pb-4">
        {mockListings.map(listing => (
          <div key={listing.id} className="min-w-[300px] max-w-[300px]">
            <ListingCard 
              listing={listing} 
              onBookNow={() => console.log(`Booking ${listing.id}`)} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Main customer panel
const UserHome: React.FC = () => {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchType, setSearchType] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to auth page if not logged in
      navigate('/auth', { state: { userType: 'user' } });
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  const handleBookNow = (listingId: string) => {
    console.log(`Booking listing ${listingId}`);
    // In a real app, this would navigate to a booking page or open a booking dialog
  };

  const handleRebook = (listingId: string) => {
    console.log(`Rebooking listing ${listingId}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching with params:", { searchLocation, searchDate, searchType });
  };

  const handleCategoryClick = (category: string) => {
    console.log(`Selected category: ${category}`);
    setSearchType(category);
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

        {/* Featured Carousel */}
        <FeaturedCarousel />

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

        {/* Trending Listings Section */}
        <section className="py-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Trending Listings</h2>
            <Button variant="ghost" size="sm" className="text-sm text-gray-600">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockListings.map(listing => (
              <ListingCard 
                key={listing.id} 
                listing={listing} 
                onBookNow={handleBookNow} 
              />
            ))}
          </div>
        </section>

        {/* Booking History Section */}
        <section className="py-6">
          <h2 className="text-xl font-medium mb-4">Your Bookings</h2>
          
          <Tabs defaultValue="upcoming">
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockBookings
                  .filter(booking => booking.status === 'confirmed' && new Date(booking.date) >= new Date())
                  .map(booking => {
                    const listing = mockListings.find(l => l.id === booking.listingId);
                    if (!listing) return null;
                    return (
                      <BookingCard 
                        key={booking.id}
                        booking={booking}
                        listing={listing}
                      />
                    );
                  })}
                
                {mockBookings.filter(booking => 
                  booking.status === 'confirmed' && new Date(booking.date) >= new Date()
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
                {mockBookings
                  .filter(booking => new Date(booking.date) < new Date())
                  .map(booking => {
                    const listing = mockListings.find(l => l.id === booking.listingId);
                    if (!listing) return null;
                    return (
                      <BookingCard 
                        key={booking.id}
                        booking={booking}
                        listing={listing}
                        onRebook={handleRebook}
                      />
                    );
                  })}
                
                {mockBookings.filter(booking => 
                  new Date(booking.date) < new Date()
                ).length === 0 && (
                  <Card className="col-span-full p-6 text-center">
                    <h3 className="font-medium mb-2">No booking history yet</h3>
                    <p className="text-gray-500">Your past bookings will appear here</p>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default UserHome;
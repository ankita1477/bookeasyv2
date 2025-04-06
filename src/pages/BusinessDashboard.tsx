import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, logOut } from '@/lib/firebase';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Plus, 
  Calendar, 
  Settings, 
  Users, 
  Home,
  ListChecks,
  BookOpen,
  Bell,
  LayoutDashboard,
  Building2,
  Upload,
  ToggleLeft,
  ToggleRight,
  X,
  Pencil,
  ChevronRight,
  Search,
  FileText,
  Clock,
  // DollarSign,  // Replacing with Indian Rupee symbol
  MapPin,
  Tag,
  Check
} from 'lucide-react';
// Adding custom Rupee icon component
const RupeeIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 7H9.5a3.5 3.5 0 0 0 0 7h.5"></path>
    <path d="M18 14H9"></path>
    <path d="M14 17l-5-5 5-5"></path>
  </svg>
);
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { fetchAPI, getAuthHeader, getUserId } from '@/api/apiClient';
import { Listing, Booking, ApiResponse } from '@/api/types';
import { useToast } from '@/components/ui/use-toast';

// Component to display a calendar preview with real data
const CalendarPreview: React.FC<{bookings?: Booking[]}> = ({ bookings = [] }) => {
  const today = new Date();
  const month = today.toLocaleString('default', { month: 'long' });
  const year = today.getFullYear();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const currentDay = today.getDate();
  
  // Generate array of day numbers for the current month
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Generate array of empty slots for days before the first day of month
  const emptySlots = Array.from({ length: firstDayOfMonth }, (_, i) => null);
  
  // Combine empty slots and day numbers
  const allDays = [...emptySlots, ...daysArray];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-700">{month} {year}</h3>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm"><ChevronRight className="h-4 w-4 rotate-180" /></Button>
          <Button variant="ghost" size="sm"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500">{day}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {allDays.map((day, index) => (
          <div 
            key={index} 
            className={cn(
              "text-center text-sm p-1 rounded-full",
              day === currentDay 
                ? "bg-bookeasy-orange text-white font-medium" 
                : "text-gray-700 hover:bg-gray-100",
              bookings.some(booking => {
                const bookingDate = new Date(booking.date);
                return bookingDate.getDate() === day && 
                       bookingDate.getMonth() === today.getMonth() && 
                       bookingDate.getFullYear() === today.getFullYear();
              }) && day !== currentDay ? "border border-bookeasy-orange text-bookeasy-orange" : "",
              !day && "invisible"
            )}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

// Sidebar item component
const SidebarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center space-x-3 w-full py-3 px-4 rounded-lg transition-colors",
      active 
        ? "bg-bookeasy-orange text-white font-medium"
        : "text-gray-600 hover:bg-bookeasy-orange/10 hover:text-bookeasy-orange"
    )}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// Main dashboard layout
const BusinessDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const [activeItem, setActiveItem] = useState<string>("dashboard");
  const [showAddListingDialog, setShowAddListingDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Real data states
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // API functions for fetching data - moved to the top to maintain hooks order
  const fetchListings = async () => {
    setListingsLoading(true);
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      const response = await fetchAPI('/business/listings', {
        headers: {
          ...getAuthHeader(),
          'user-id': userId,
        }
      });
      
      setListings(response);
      setListingsLoading(false);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      toast({
        title: "Error",
        description: "Could not load your listings. Please try again.",
        variant: "destructive"
      });
      setListingsLoading(false);
    }
  };

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      const response = await fetchAPI('/bookings', {
        headers: {
          ...getAuthHeader(),
          'user-id': userId,
          'user-type': 'business'
        }
      });
      
      setBookings(response);
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

  const toggleListingStatus = async (id: string) => {
    const listing = listings.find(l => l.id === id);
    if (!listing) return;
    
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      await fetchAPI(`/listings/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(),
          'user-id': userId,
        },
        body: JSON.stringify({
          active: !listing.active
        })
      });
      
      // Update the local state with the toggled listing
      setListings(prevListings => 
        prevListings.map(l => 
          l.id === id ? { ...l, active: !l.active } : l
        )
      );
      
      toast({
        title: "Success",
        description: `Listing has been ${!listing.active ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      console.error('Failed to toggle listing status:', error);
      toast({
        title: "Error",
        description: "Could not update listing status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const createListing = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      // Create data object for API submission
      const listingData = {
        title: formData.title,
        description: formData.description,
        type: formData.category,
        price: parseInt(formData.price),
        capacity: parseInt(formData.capacity),
        location: formData.location,
        currency: 'INR',
        tags: formData.tags,
        active: true
      };
      
      // Send the request to create listing
      const response = await fetchAPI('/listings', {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'user-id': userId,
        },
        body: JSON.stringify(listingData)
      });
      
      // Add the new listing to state
      setListings(prev => [...prev, response]);
      
      // Close the dialog and reset form
      setShowAddListingDialog(false);
      setCurrentStep(1);
      setFormData({
        title: '',
        description: '',
        type: '',
        location: '',
        date: '',
        time: '',
        timeEnd: '',
        price: '',
        capacity: '',
        category: '',
        tags: [],
        termsAccepted: false,
        images: [],
        imagePreview: [],
      });
      setSelectedTags([]);
      
      toast({
        title: "Success",
        description: "Your new listing has been created!",
      });
    } catch (error) {
      console.error('Failed to create listing:', error);
      toast({
        title: "Error",
        description: "Could not create your listing. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      await fetchAPI(`/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(),
          'user-id': userId,
        },
        body: JSON.stringify({ status })
      });
      
      // Update the local state with the updated booking status
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === bookingId ? { ...b, status } : b
        )
      );
      
      toast({
        title: "Success",
        description: `Booking ${status === 'confirmed' ? 'confirmed' : 'cancelled'} successfully.`,
      });
    } catch (error) {
      console.error(`Failed to update booking status:`, error);
      toast({
        title: "Error",
        description: "Could not update booking status. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    location: '',
    date: '',
    time: '',
    timeEnd: '',
    price: '',
    capacity: '',
    category: '',
    tags: [] as string[],
    termsAccepted: false,
    images: [] as File[],
    imagePreview: [] as string[],
  });

  const allCategories = [
    "Gym", "Café", "Co-working", "Party", "Workshop", "Conference", "Meeting", 
    "Studio", "Restaurant", "Concert", "Exhibition", "Class"
  ];
  
  const allTags = [
    "Fitness", "Air-conditioned", "Parking Available", "Outdoor", "Indoor",
    "Wheelchair Access", "Pet Friendly", "WiFi", "Catering", "AV Equipment",
    "Family Friendly", "Private", "Public Transport", "Weekend", "Weekday"
  ];

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      
      setFormData({
        ...formData,
        images: [...formData.images, ...filesArray],
        imagePreview: [...formData.imagePreview, ...newPreviewUrls]
      });
    }
  };

  // Remove an image from the preview
  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    const newPreviews = [...formData.imagePreview];
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviews[index]);
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setFormData({
      ...formData,
      images: newImages,
      imagePreview: newPreviews
    });
  };

  // Handle dropping image files
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      
      setFormData({
        ...formData,
        images: [...formData.images, ...filesArray],
        imagePreview: [...newPreviewUrls]
      });
    }
  };

  // Prevent default behavior for drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (checked: boolean, name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    // Call the createListing function to submit the form data to the API
    createListing();
  };

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to auth page if not logged in
      navigate('/auth', { state: { userType: 'business' } });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && user) {
      fetchListings();
      fetchBookings();
    }
  }, [user, loading]);

  useEffect(() => {
    // Import and initialize user sync
    import('../lib/userSync').then(module => {
      module.initUserSync();
    });
  }, []);

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const todaysBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date).toISOString().split('T')[0];
    const todayDate = new Date().toISOString().split('T')[0];
    return bookingDate === todayDate;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bookeasy-light">
        <Loader2 className="h-12 w-12 animate-spin text-bookeasy-orange" />
        <p className="mt-4 text-bookeasy-dark">Loading your business portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex h-screen">
        {/* Left Sidebar (Sticky) */}
        <aside className="w-64 bg-white shadow-md fixed h-full">
          {/* Logo + Business Name */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-bookeasy-purple">Book<span className="text-bookeasy-orange">Easy</span></span>
            </div>
            <p className="text-sm text-gray-600 mt-1 truncate">
              {user?.displayName || user?.email || 'Business Account'}
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-2">
            <SidebarItem
              icon={<LayoutDashboard className="h-5 w-5" />}
              label="Dashboard"
              active={activeItem === "dashboard"}
              onClick={() => setActiveItem("dashboard")}
            />
            <SidebarItem
              icon={<Building2 className="h-5 w-5" />}
              label="Listings"
              active={activeItem === "listings"}
              onClick={() => setActiveItem("listings")}
            />
            <SidebarItem
              icon={<Calendar className="h-5 w-5" />}
              label="Calendar"
              active={activeItem === "calendar"}
              onClick={() => setActiveItem("calendar")}
            />
            <SidebarItem
              icon={<BookOpen className="h-5 w-5" />}
              label="Bookings"
              active={activeItem === "bookings"}
              onClick={() => setActiveItem("bookings")}
            />
            <SidebarItem
              icon={<Settings className="h-5 w-5" />}
              label="Settings"
              active={activeItem === "settings"}
              onClick={() => setActiveItem("settings")}
            />
          </nav>

          {/* Calendar Preview (shows when appropriate) */}
          {(activeItem === "dashboard" || activeItem === "calendar") && (
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Calendar Preview</h3>
              <CalendarPreview bookings={bookings} />
            </div>
          )}

          {/* Logout Button */}
          <div className="absolute bottom-0 w-full p-4 border-t">
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="w-full border-red-500 text-red-500 hover:bg-red-50"
            >
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Panel */}
        <main className="ml-64 w-full p-8 overflow-y-auto">
          {/* Dashboard View */}
          {activeItem === "dashboard" && (
            <div>
              {/* Welcome Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Welcome Back!</h1>
                  <p className="text-gray-600">{today}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2 border-bookeasy-orange text-bookeasy-orange hover:bg-bookeasy-orange/10"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="font-medium">{bookings.filter(b => b.status === 'pending').length}</span>
                  </Button>
                  <Avatar className="h-10 w-10 border-2 border-bookeasy-orange">
                    {user?.photoURL ? (
                      <AvatarImage src={user.photoURL} alt="Profile" />
                    ) : (
                      <AvatarFallback className="bg-bookeasy-orange/20 text-bookeasy-orange">
                        {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "B"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-l-4 border-l-bookeasy-orange">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                    <Building2 className="h-4 w-4 text-bookeasy-orange" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{listings.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {listings.filter(l => l.active).length} active listings
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Bookings Today</CardTitle>
                    <Calendar className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{todaysBookings.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {todaysBookings.reduce((acc, booking) => acc + booking.attendees, 0)} total attendees
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                    <Bell className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'pending').length}</div>
                    <p className="text-xs text-muted-foreground">
                      {bookings.filter(b => b.status === 'pending').length} pending requests
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Add New Event CTA */}
              <Button 
                className="bg-bookeasy-orange hover:bg-bookeasy-orange/90 mb-8"
                onClick={() => setShowAddListingDialog(true)}
              >
                <Plus size={18} className="mr-2" />
                Add New Event
              </Button>

              {/* Listing Cards */}
              <h2 className="text-xl font-medium text-gray-800 mb-4">Your Current Listings</h2>
              
              {listings.length > 0 ? (
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <Card key={listing.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row h-full">
                        <div className="w-full md:w-1/4 h-48 md:h-auto relative">
                          <img 
                            src={listing.image} 
                            alt={listing.title} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-6">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-lg font-medium">{listing.title}</h3>
                              <p className="text-sm text-gray-500">{listing.type}</p>
                            </div>
                            <div className="flex items-center">
                              <button 
                                onClick={() => toggleListingStatus(listing.id)} 
                                className="flex items-center space-x-2"
                              >
                                {listing.active ? (
                                  <>
                                    <span className="text-sm text-green-600">Active</span>
                                    <ToggleRight className="h-6 w-6 text-green-600" />
                                  </>
                                ) : (
                                  <>
                                    <span className="text-sm text-gray-400">Inactive</span>
                                    <ToggleLeft className="h-6 w-6 text-gray-400" />
                                  </>
                                )}
                              </button>
                              <button className="ml-4 text-gray-500 hover:text-bookeasy-orange">
                                <Pencil className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{listing.description}</p>

                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-gray-500">Price</p>
                              <p className="font-medium">₹{listing.price}/{listing.type === 'Conference' ? 'hr' : 'day'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Capacity</p>
                              <p className="font-medium">{listing.capacity} people</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Bookings</p>
                              <p className="font-medium">{listing.bookings} total</p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <CalendarPreview bookings={bookings} />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <h3 className="text-lg font-medium mb-2">No listings yet</h3>
                  <p className="text-gray-500 mb-4">Create your first listing to start accepting bookings</p>
                  <Button 
                    className="bg-bookeasy-orange hover:bg-bookeasy-orange/90"
                    onClick={() => setShowAddListingDialog(true)}
                  >
                    <Plus size={18} className="mr-2" />
                    Add New Listing
                  </Button>
                </Card>
              )}
            </div>
          )}

          {/* Listings View */}
          {activeItem === "listings" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Your Listings</h1>
                <Button 
                  className="bg-bookeasy-orange hover:bg-bookeasy-orange/90"
                  onClick={() => setShowAddListingDialog(true)}
                >
                  <Plus size={18} className="mr-2" />
                  Add New Listing
                </Button>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input placeholder="Search listings..." className="pl-10" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="event">Event Space</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Tabs defaultValue="grid">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-sm text-gray-500">
                    Showing {listings.length} listings
                  </div>
                  <TabsList>
                    <TabsTrigger value="grid">Grid</TabsTrigger>
                    <TabsTrigger value="list">List</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="grid">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                      <Card key={listing.id} className="overflow-hidden">
                        <div className="h-48 relative">
                          <img 
                            src={listing.image} 
                            alt={listing.title} 
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute top-3 right-3 flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 bg-white rounded-full"
                              onClick={() => toggleListingStatus(listing.id)}
                            >
                              {listing.active ? (
                                <ToggleRight className="h-5 w-5 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-5 w-5 text-gray-400" />
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 bg-white rounded-full"
                            >
                              <Pencil className="h-4 w-4 text-gray-600" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium">{listing.title}</h3>
                          <p className="text-sm text-gray-500">{listing.type}</p>
                          
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-gray-500">Price</p>
                              <p className="font-medium">₹{listing.price}/{listing.type === 'Conference' ? 'hr' : 'day'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Capacity</p>
                              <p className="font-medium">{listing.capacity} people</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg 
                                  key={i} 
                                  className={`w-4 h-4 ${i < Math.floor(listing.rating) ? "text-yellow-400" : "text-gray-300"}`}
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="text-xs text-gray-600">{listing.rating}</span>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${listing.active 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-800"}`}
                            >
                              {listing.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="list">
                  <div className="space-y-4">
                    {listings.map((listing) => (
                      <Card key={listing.id} className="overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                          <div className="w-full sm:w-48 h-48 sm:h-auto relative">
                            <img 
                              src={listing.image} 
                              alt={listing.title} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 p-4">
                            <div className="flex justify-between">
                              <div>
                                <h3 className="font-medium">{listing.title}</h3>
                                <p className="text-sm text-gray-500">{listing.type}</p>
                              </div>
                              <div className="flex items-center">
                                <button 
                                  onClick={() => toggleListingStatus(listing.id)} 
                                  className="flex items-center space-x-2"
                                >
                                  {listing.active ? (
                                    <>
                                      <span className="text-sm text-green-600">Active</span>
                                      <ToggleRight className="h-6 w-6 text-green-600" />
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-sm text-gray-400">Inactive</span>
                                      <ToggleLeft className="h-6 w-6 text-gray-400" />
                                    </>
                                  )}
                                </button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="ml-2"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{listing.description}</p>

                            <div className="grid grid-cols-4 gap-4 mt-4">
                              <div>
                                <p className="text-xs text-gray-500">Price</p>
                                <p className="font-medium">₹{listing.price}/{listing.type === 'Conference' ? 'hr' : 'day'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Capacity</p>
                                <p className="font-medium">{listing.capacity} people</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Bookings</p>
                                <p className="font-medium">{listing.bookings} total</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Rating</p>
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span className="ml-1 text-sm">{listing.rating}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Calendar View */}
          {activeItem === "calendar" && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-8">Calendar</h1>
              <p className="text-gray-600 mb-8">This is the calendar view for managing your bookings.</p>
              <div className="bg-white p-6 rounded-lg shadow">
                <CalendarPreview bookings={bookings} />
              </div>
            </div>
          )}

          {/* Bookings View */}
          {activeItem === "bookings" && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-8">Bookings</h1>
              
              <Tabs defaultValue="upcoming">
                <TabsList className="mb-8">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming">
                  {bookings.filter(b => b.status === 'confirmed').length > 0 ? (
                    <div className="space-y-4">
                      {bookings
                        .filter(b => b.status === 'confirmed')
                        .map(booking => {
                          const listing = listings.find(l => l.id === booking.listingId);
                          return (
                            <Card key={booking.id}>
                              <div className="p-6">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium">{listing?.title}</h3>
                                    <p className="text-sm text-gray-500">{booking.customerName}</p>
                                  </div>
                                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    Confirmed
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4 mt-4">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                                    <span className="text-sm">{new Date(booking.date).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                                    <span className="text-sm">{booking.time}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="h-4 w-4 text-gray-500 mr-2" />
                                    <span className="text-sm">{booking.attendees} attendees</span>
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                  <div className="flex items-center">
                                    <RupeeIcon className="h-4 w-4 text-green-500 mr-2" />
                                    <span className="font-medium">₹{booking.totalPaid} paid</span>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button size="sm" variant="outline">
                                      <FileText className="h-4 w-4 mr-2" />
                                      View Details
                                    </Button>
                                    <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
                                      <X className="h-4 w-4 mr-2" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                    </div>
                  ) : (
                    <Card className="p-8 text-center">
                      <h3 className="text-lg font-medium mb-2">No upcoming bookings</h3>
                      <p className="text-gray-500">When you receive bookings, they will appear here</p>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="pending">
                  {bookings.filter(b => b.status === 'pending').length > 0 ? (
                    <div className="space-y-4">
                      {bookings
                        .filter(b => b.status === 'pending')
                        .map(booking => {
                          const listing = listings.find(l => l.id === booking.listingId);
                          return (
                            <Card key={booking.id}>
                              <div className="p-6">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium">{listing?.title}</h3>
                                    <p className="text-sm text-gray-500">{booking.customerName}</p>
                                  </div>
                                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                    Pending
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4 mt-4">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                                    <span className="text-sm">{new Date(booking.date).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                                    <span className="text-sm">{booking.time}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="h-4 w-4 text-gray-500 mr-2" />
                                    <span className="text-sm">{booking.attendees} attendees</span>
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                  <div className="flex items-center">
                                    <RupeeIcon className="h-4 w-4 text-gray-500 mr-2" />
                                    <span className="font-medium">₹{booking.totalPaid} pending</span>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                      Accept
                                    </Button>
                                    <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
                                      Decline
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                    </div>
                  ) : (
                    <Card className="p-8 text-center">
                      <h3 className="text-lg font-medium mb-2">No pending bookings</h3>
                      <p className="text-gray-500">When you receive booking requests, they will appear here</p>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="past">
                  <Card className="p-8 text-center">
                    <h3 className="text-lg font-medium mb-2">No past bookings</h3>
                    <p className="text-gray-500">Your booking history will appear here</p>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Settings View */}
          {activeItem === "settings" && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>
              <p className="text-gray-600">This is where you can manage your business settings.</p>
            </div>
          )}
        </main>
      </div>

      {/* Add Listing Dialog with Step by Step Form */}
      <Dialog open={showAddListingDialog} onOpenChange={(open) => {
        setShowAddListingDialog(open);
        if (!open) {
          setCurrentStep(1);
          setSelectedTags([]);
        }
      }}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create New Event / Space</DialogTitle>
            <DialogDescription>
              {currentStep === 1 && "Step 1: Basic Information"}
              {currentStep === 2 && "Step 2: Time & Location"}
              {currentStep === 3 && "Step 3: Pricing & Capacity"}
              {currentStep === 4 && "Step 4: Description & Categories"}
              {currentStep === 5 && "Step 5: Images & Final Details"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 h-2 rounded-full mb-6">
              <div 
                className="bg-bookeasy-orange h-2 rounded-full transition-all" 
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>
            
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center">
                    <span className="text-bookeasy-orange mr-1">🏷️</span> Event Title <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input 
                    id="title" 
                    name="title"
                    placeholder="E.g., Yoga Morning Bliss, Downtown Co-working Hall"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-xs text-gray-500">Give your event or space a catchy name</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type" className="flex items-center">
                    <span className="text-bookeasy-orange mr-1">🧾</span> Event Type <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select 
                    name="category"
                    value={formData.category} 
                    onValueChange={(value) => handleSelectChange(value, 'category')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Choose the category that best describes your event</p>
                </div>
              </div>
            )}
            
            {/* Step 2: Time & Location */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center">
                    <span className="text-bookeasy-orange mr-1">📍</span> Location <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input 
                    id="location" 
                    name="location"
                    placeholder="Full address of the venue"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-xs text-gray-500">Enter the full address or add a map pin</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    Pin on Map
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center">
                    <span className="text-bookeasy-orange mr-1">📆</span> Date <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input 
                    id="date" 
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time" className="flex items-center">
                      <span className="text-bookeasy-orange mr-1">🕒</span> Start Time <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input 
                      id="time" 
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeEnd">End Time <span className="text-red-500 ml-1">*</span></Label>
                    <Input 
                      id="timeEnd" 
                      name="timeEnd"
                      type="time"
                      value={formData.timeEnd}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 3: Pricing & Capacity */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center">
                    <span className="text-bookeasy-orange mr-1">💰</span> Price <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="flex">
                    <span className="flex items-center bg-gray-100 px-3 rounded-l-md border border-r-0">₹</span>
                    <Input 
                      id="price" 
                      name="price"
                      type="number"
                      className="rounded-l-none"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">Price per booking / per hour / per person</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="capacity" className="flex items-center">
                    <span className="text-bookeasy-orange mr-1">👥</span> Capacity <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input 
                    id="capacity" 
                    name="capacity"
                    type="number"
                    placeholder="Maximum number of attendees"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-xs text-gray-500">Maximum number of attendees or participants</p>
                </div>
              </div>
            )}
            
            {/* Step 4: Description & Categories */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center">
                    <span className="text-bookeasy-orange mr-1">📝</span> Description <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Textarea 
                    id="description" 
                    name="description"
                    placeholder="Provide detailed information about your event or space..."
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    required
                  />
                  <p className="text-xs text-gray-500">Describe what the event is about, who should attend, what to expect, etc.</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <span className="text-bookeasy-orange mr-1">🔖</span> Tags
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedTags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {allTags
                      .filter(tag => !selectedTags.includes(tag))
                      .map(tag => (
                        <Badge 
                          key={tag}
                          variant="outline" 
                          className="cursor-pointer hover:bg-gray-100"
                          onClick={() => addTag(tag)}
                        >
                          + {tag}
                        </Badge>
                      ))
                    }
                  </div>
                  <p className="text-xs text-gray-500">Add relevant tags to make your listing more discoverable</p>
                </div>
              </div>
            )}
            
            {/* Step 5: Images & Final Details */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <span className="text-bookeasy-orange mr-1">🖼️</span> Images <span className="text-red-500 ml-1">*</span>
                  </Label>
                  
                  {/* Image Preview Grid */}
                  {formData.imagePreview.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {formData.imagePreview.map((url, index) => (
                        <div key={index} className="relative h-24 rounded-md overflow-hidden">
                          <img 
                            src={url} 
                            alt={`Preview ${index + 1}`} 
                            className="h-full w-full object-cover"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute top-1 right-1 h-5 w-5 rounded-full"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Image Upload Area */}
                  <div 
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer",
                      "hover:bg-gray-50 transition-colors",
                      formData.imagePreview.length > 0 ? "border-bookeasy-orange" : "border-gray-300"
                    )}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => document.getElementById('imageUpload')?.click()}
                  >
                    <input
                      type="file"
                      id="imageUpload"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                    />
                    
                    <Upload className="h-10 w-10 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange(checked as boolean, 'termsAccepted')
                      }
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <span className="text-bookeasy-orange mr-1">✅</span> I agree to BookEasy's Terms and Conditions
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">You must agree to our terms before publishing</p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-between items-center mt-6">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                Previous
              </Button>
            ) : (
              <div></div>
            )}
            
            {currentStep < 5 ? (
              <Button 
                type="button" 
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && (!formData.title || !formData.category)) ||
                  (currentStep === 2 && (!formData.location || !formData.date || !formData.time || !formData.timeEnd)) ||
                  (currentStep === 3 && (!formData.price || !formData.capacity))
                }
              >
                Next Step
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={handleSubmit}
                disabled={!formData.termsAccepted || formData.images.length === 0}
                className="bg-bookeasy-orange hover:bg-bookeasy-orange/90"
              >
                Create Event
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ... rest of the component ... */}
    </div>
  );
};

export default BusinessDashboard;
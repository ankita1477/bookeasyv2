import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Listing, Booking } from '@/api/types';
import { fetchAPI, getUserId } from '@/api/apiClient';
import CustomerNavbar from '@/components/CustomerNavbar';
import Footer from '@/components/Footer';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useToast } from '@/components/ui/use-toast';
import { 
  Loader2, 
  Calendar as CalendarIcon,
  Clock, 
  MapPin, 
  Users,
  Star,
  Building,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

const BookingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const { toast } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Booking form state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [attendees, setAttendees] = useState<string>('1');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Available time slots
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
  ];

  useEffect(() => {
    const fetchListingDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await fetchAPI(`/listings/${id}`);
        
        if (response.data) {
          setListing(response.data);
        } else {
          toast({
            title: 'Error',
            description: 'Could not load listing details.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while loading the listing details.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchListingDetails();
  }, [id, toast]);

  const handleBookNow = async () => {
    if (!user) {
      navigate('/auth', { state: { from: `/booking/${id}` } });
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast({
        title: 'Missing information',
        description: 'Please select a date and time for your booking.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const userId = await getUserId();
      if (!userId || !listing) {
        toast({
          title: 'Error',
          description: 'User information or listing details not available.',
          variant: 'destructive',
        });
        return;
      }

      const bookingData: Partial<Booking> = {
        listingId: listing.id,
        userId,
        businessId: listing.businessId,
        customerName: user.displayName || user.email?.split('@')[0] || 'Guest',
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        status: 'pending',
        attendees: parseInt(attendees),
        totalPaid: listing.price * parseInt(attendees),
        createdAt: new Date().toISOString(),
        contactInfo: user.email || '',
        specialRequests: specialRequests || undefined,
        paymentInfo: {
          method: 'online',
          paidAmount: listing.price * parseInt(attendees),
        }
      };

      const response = await fetchAPI('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });

      if (response.data && response.data.id) {
        toast({
          title: 'Booking Successful!',
          description: 'Your booking request has been submitted successfully.',
        });
        // Navigate to booking confirmation page
        navigate(`/booking-confirmation/${response.data.id}`);
      } else {
        throw new Error(response.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Error',
        description: 'There was an error processing your booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <CustomerNavbar />
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="h-10 w-10 animate-spin text-bookeasy-orange" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <CustomerNavbar />
        <div className="flex-1 container mx-auto px-4 py-10">
          <Card className="text-center p-10">
            <CardTitle className="text-xl mb-4">Listing Not Found</CardTitle>
            <CardDescription>
              The listing you're looking for doesn't exist or has been removed.
            </CardDescription>
            <Button 
              className="mt-6" 
              onClick={() => navigate('/user-home')}
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <CustomerNavbar />
      <main className="flex-1 container mx-auto px-4 py-10">
        <Button 
          variant="outline"
          className="mb-6"
          onClick={() => navigate('/user-home')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to listings
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column: Listing details */}
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
            <div className="flex items-center text-sm text-gray-600 mb-6">
              <div className="flex items-center mr-4">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span>{listing.rating}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{listing.location}</span>
              </div>
            </div>

            {/* Image carousel */}
            <div className="mb-8">
              <Carousel className="w-full">
                <CarouselContent>
                  {listing.images && listing.images.length > 0 ? (
                    listing.images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="p-1">
                          <div className="overflow-hidden rounded-lg aspect-video bg-gray-100">
                            <img 
                              src={image} 
                              alt={`${listing.title} - Image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </CarouselItem>
                    ))
                  ) : (
                    <CarouselItem>
                      <div className="p-1">
                        <div className="overflow-hidden rounded-lg aspect-video bg-gray-100 flex items-center justify-center">
                          <Building className="h-16 w-16 text-gray-400" />
                        </div>
                      </div>
                    </CarouselItem>
                  )}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>

            {/* Description and details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-3">About this space</h2>
                <p className="text-gray-700">{listing.description}</p>
              </div>

              <Separator />

              <div>
                <h2 className="text-xl font-semibold mb-3">Amenities</h2>
                <div className="grid grid-cols-2 gap-y-2">
                  {listing.amenities && listing.amenities.length > 0 ? (
                    listing.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-bookeasy-orange mr-2" />
                        <span>{amenity}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No amenities listed</p>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="text-xl font-semibold mb-3">Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500">Type</p>
                    <p className="font-medium">{listing.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Capacity</p>
                    <p className="font-medium">{listing.capacity} people</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Price</p>
                    <p className="font-medium">₹{listing.price}/{listing.type === 'Conference' ? 'hr' : 'day'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Booking form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Book this space</CardTitle>
                <CardDescription>Fill in the details to book this space</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <div className="border rounded-md mt-1">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="time">Time</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="attendees">Number of attendees</Label>
                  <Select value={attendees} onValueChange={setAttendees}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select attendees" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: listing.capacity }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'person' : 'people'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="specialRequests">Special requests (optional)</Label>
                  <Textarea
                    id="specialRequests"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any special requirements or requests..."
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Price ({attendees} × ₹{listing.price})</span>
                  <span>₹{parseInt(attendees) * listing.price}</span>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between font-medium">
                  <span>Total</span>
                  <span>₹{parseInt(attendees) * listing.price}</span>
                </div>
                
                <Button 
                  className="w-full bg-bookeasy-orange hover:bg-bookeasy-orange/90"
                  onClick={handleBookNow}
                  disabled={isSubmitting || !selectedDate || !selectedTime}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Book Now
                </Button>
                
                <p className="text-xs text-center text-gray-500">
                  You won't be charged yet. Payment will be collected at venue.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingDetails;
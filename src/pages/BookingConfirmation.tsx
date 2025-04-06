import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Booking, Listing } from '@/api/types';
import { fetchAPI } from '@/api/apiClient';
import CustomerNavbar from '@/components/CustomerNavbar';
import Footer from '@/components/Footer';
import QRCode from 'react-qr-code';
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
import { useToast } from '@/components/ui/use-toast';
import { 
  Loader2, 
  Calendar, 
  Clock, 
  MapPin, 
  Users,
  Check,
  Download,
  Share2,
  Ticket,
  ArrowLeft,
  Star
} from 'lucide-react';

const BookingConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrValue, setQrValue] = useState<string>('');

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await fetchAPI(`/bookings/${id}`);
        
        if (response.data) {
          setBooking(response.data);
          
          // Fetch venue details
          const listingResponse = await fetchAPI(`/listings/${response.data.listingId}`);
          if (listingResponse.data) {
            setListing(listingResponse.data);
          }

          // Create QR code data
          // Using booking ID and some booking details to create a unique identifier
          const qrData = {
            bookingId: response.data.id,
            listingId: response.data.listingId,
            date: response.data.date,
            time: response.data.time,
            user: response.data.userId,
            created: Date.now()
          };
          
          setQrValue(JSON.stringify(qrData));
        } else {
          toast({
            title: 'Error',
            description: 'Could not load booking details.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while loading the booking details.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id, toast]);

  const handleDownloadQR = () => {
    const svg = document.getElementById('booking-qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      // Download PNG
      const downloadLink = document.createElement('a');
      downloadLink.download = `bookeasy-checkin-${id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleShareBooking = async () => {
    if (!booking || !listing) return;
    
    const shareData = {
      title: `BookEasy Booking: ${listing.title}`,
      text: `I've booked ${listing.title} for ${booking.date} at ${booking.time}. Join me!`,
      url: window.location.href
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support sharing
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link copied!',
          description: 'Booking link copied to clipboard.',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
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

  if (!booking || !listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <CustomerNavbar />
        <div className="flex-1 container mx-auto px-4 py-10">
          <Card className="text-center p-10">
            <CardTitle className="text-xl mb-4">Booking Not Found</CardTitle>
            <CardDescription>
              The booking you're looking for doesn't exist or has been removed.
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
          Back to home
        </Button>

        <div className="flex justify-center items-center mb-8">
          <div className="bg-green-100 rounded-full p-3">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <div className="ml-4">
            <h1 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
            <p className="text-gray-600">Your booking has been successfully confirmed.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column: Booking details */}
          <div className="md:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Venue info */}
                <div className="flex items-start">
                  <div className="bg-gray-200 h-20 w-20 rounded-lg flex items-center justify-center mr-4">
                    {listing.images && listing.images.length > 0 ? (
                      <img 
                        src={listing.images[0]} 
                        alt={listing.title}
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <MapPin className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{listing.title}</h2>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{listing.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span>{listing.rating}</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Date and time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">Date</span>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-bookeasy-orange" />
                      <span className="font-medium">{formatDate(booking.date)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">Time</span>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-bookeasy-orange" />
                      <span className="font-medium">{booking.time}</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">Guests</span>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-bookeasy-orange" />
                      <span className="font-medium">{booking.attendees} {booking.attendees === 1 ? 'person' : 'people'}</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Booking reference */}
                <div>
                  <span className="text-sm text-gray-500 mb-1 block">Booking Reference</span>
                  <div className="bg-gray-100 p-3 rounded-md font-mono text-sm">
                    {booking.id}
                  </div>
                </div>
                
                {/* Special requests if any */}
                {booking.specialRequests && (
                  <div>
                    <span className="text-sm text-gray-500 mb-1 block">Special Requests</span>
                    <div className="bg-gray-100 p-3 rounded-md text-sm">
                      {booking.specialRequests}
                    </div>
                  </div>
                )}
                
                {/* Payment */}
                <div>
                  <h3 className="text-md font-semibold mb-2">Payment Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Amount</span>
                      <p className="font-medium">₹{booking.totalPaid}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Status</span>
                      <p className="font-medium">
                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          Pay at venue
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Cancellation policy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cancellation Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Free cancellation up to 24 hours before your booking. After that, 
                  a cancellation fee of 50% of the total booking amount will be charged.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right column: QR Code */}
          <div>
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center">
                  <Ticket className="h-5 w-5 mr-2" />
                  Check-in QR Code
                </CardTitle>
                <CardDescription>
                  Present this QR code when you arrive at the venue
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  {qrValue && (
                    <QRCode
                      id="booking-qr-code"
                      value={qrValue}
                      size={200}
                      level="H"
                      className="qr-code"
                    />
                  )}
                </div>
                
                <div className="text-center mb-2">
                  <p className="text-sm font-medium">Booking ID: {booking.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-500">{formatDate(booking.date)} • {booking.time}</p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  onClick={handleDownloadQR}
                  className="w-full flex items-center justify-center"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
                
                <Button
                  onClick={handleShareBooking}
                  className="w-full flex items-center justify-center"
                  variant="outline"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Booking
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingConfirmation;
import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, Calendar, CheckCircle, Map, LogIn, User, Building, X } from 'lucide-react';
import AnimatedShape from './AnimatedShape';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const HeroSection: React.FC = () => {
  const phoneRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (phoneRef.current) {
        const scrollY = window.scrollY;
        const translateY = Math.min(scrollY * 0.2, 40);
        const rotate = Math.min(scrollY * 0.05, 10);
        phoneRef.current.style.transform = `translateY(${translateY}px) rotate(${rotate}deg)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add keyboard event listener to close modal with Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showLoginOptions) {
        handleCloseModal();
      }
    };

    if (showLoginOptions) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore body scrolling when modal is closed
      document.body.style.overflow = '';
    };
  }, [showLoginOptions]);

  const handleLogin = () => {
    setShowLoginOptions(true);
    setAnimatingOut(false);
  };

  const handleCloseModal = () => {
    setAnimatingOut(true);
    // Wait for animation to complete before hiding the modal
    setTimeout(() => {
      setShowLoginOptions(false);
      setAnimatingOut(false);
    }, 300);
  };

  const handleUserTypeSelection = (userType: string) => {
    // Add a slight delay before navigation for better UX
    setAnimatingOut(true);
    setTimeout(() => {
      navigate('/auth', { state: { userType } });
    }, 300);
  };

  const handleGuestAccess = () => {
    setAnimatingOut(true);
    setTimeout(() => {
      navigate('/user-home');
    }, 300);
  };

  // Handle click outside to close modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleCloseModal();
    }
  };

  return (
    <section className="relative pt-28 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-bookeasy-light min-h-[calc(100vh-4rem)]" id="hero">
      <div className="container mx-auto px-6">
        {/* Login Options Modal */}
        {showLoginOptions && (
          <div 
            className={cn(
              "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300",
              animatingOut 
                ? "bg-black/0 backdrop-blur-none" 
                : "bg-black/40 backdrop-blur-sm"
            )}
            onClick={handleBackdropClick}
          >
            <div 
              ref={modalRef}
              className={cn(
                "bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative transition-all duration-300",
                animatingOut 
                  ? "opacity-0 scale-95 translate-y-4" 
                  : "opacity-100 scale-100 translate-y-0"
              )}
            >
              {/* Close button */}
              <button
                onClick={handleCloseModal}
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded-full"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
              
              <h2 className="text-3xl font-bold text-center text-bookeasy-dark mb-6">
                Ready to Book or List Your Space?
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <button
                  onClick={() => handleUserTypeSelection('customer')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-6 rounded-xl transition-all",
                    "bg-gradient-to-b from-bookeasy-purple/10 to-bookeasy-purple/20",
                    "hover:shadow-lg hover:shadow-bookeasy-purple/20 hover:scale-105 active:scale-95",
                    "border-2 border-bookeasy-purple"
                  )}
                >
                  <div className="w-16 h-16 rounded-full bg-bookeasy-purple/20 flex items-center justify-center">
                    <User size={32} className="text-bookeasy-purple" />
                  </div>
                  <span className="text-xl font-bold text-bookeasy-purple">👥 I'm a Customer</span>
                  <span className="text-sm text-gray-500">Book cool places</span>
                </button>
                
                <button
                  onClick={() => handleUserTypeSelection('business')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-6 rounded-xl transition-all",
                    "bg-gradient-to-b from-bookeasy-orange/10 to-bookeasy-orange/20",
                    "hover:shadow-lg hover:shadow-bookeasy-orange/20 hover:scale-105 active:scale-95",
                    "border-2 border-bookeasy-orange"
                  )}
                >
                  <div className="w-16 h-16 rounded-full bg-bookeasy-orange/20 flex items-center justify-center">
                    <Building size={32} className="text-bookeasy-orange" />
                  </div>
                  <span className="text-xl font-bold text-bookeasy-orange">🏢 I'm a Business</span>
                  <span className="text-sm text-gray-500">List my space</span>
                </button>
              </div>
              
              <div className="text-center">
                <button
                  onClick={handleGuestAccess}
                  className="text-gray-500 hover:text-bookeasy-purple underline text-sm transition-colors"
                >
                  Continue as Guest
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text */}
          <div className="z-10 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-bookeasy-dark">
              Book Smarter. <br />
              Host Easier. <br />
              <span className="text-bookeasy-purple">Live Local.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-700 mb-8">
              Gyms, Cafes, Halls & More – All at One Click.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button 
                className="btn-find px-6 py-3 bg-bookeasy-purple text-white font-medium rounded-lg shadow-lg hover:shadow-bookeasy-purple/50 transition-all duration-300 hover:scale-105 active:scale-95"
                onClick={handleLogin}
              >
                <span className="flex items-center justify-center gap-2">
                  <LogIn size={20} />
                  Login / Sign Up
                </span>
              </button>

              <button className="btn-find px-6 py-3 bg-white border border-bookeasy-orange text-bookeasy-orange font-medium rounded-lg shadow-lg hover:shadow-bookeasy-orange/30 transition-all duration-300 hover:scale-105 active:scale-95">
                <span className="flex items-center justify-center gap-2">
                  <Map size={20} />
                  Find a Venue
                </span>
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 text-gray-700">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-bookeasy-purple" />
                <span>Verified Spaces</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-bookeasy-orange" />
                <span>Instant Booking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-bookeasy-purple" />
                <span>Local Support</span>
              </div>
            </div>
          </div>
          
          {/* Right Column - App Preview */}
          <div className="relative flex justify-center">
            <div 
              ref={phoneRef} 
              className="relative z-10 shadow-2xl rounded-3xl w-64 md:w-72 lg:w-80 transition-transform duration-200"
            >
              {/* App mockup preview */}
              <div className="rounded-3xl overflow-hidden border-8 border-black relative bg-white">
                {/* App header */}
                <div className="bg-bookeasy-purple text-white p-4 text-center relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-b-xl"></div>
                  <h3 className="text-sm font-bold mt-2">BookEasy</h3>
                </div>
                
                {/* App content */}
                <div className="p-3">
                  <div className="bg-gray-100 rounded-lg p-2 mb-3">
                    <div className="text-xs text-gray-600 mb-1">Search Location</div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium truncate">Downtown NYC</div>
                      <Map size={14} className="text-bookeasy-orange" />
                    </div>
                  </div>
                  
                  {/* Venue card */}
                  <div className="bg-white rounded-lg shadow-md p-3 mb-3">
                    <div className="rounded-md bg-gray-200 h-24 mb-2 flex items-center justify-center">
                      <Calendar size={24} className="text-gray-400" />
                    </div>
                    <div className="text-xs font-bold text-bookeasy-purple">Brew Cafe</div>
                    <div className="text-xs text-gray-500">Coworking • $35/hour</div>
                    <div className="bg-bookeasy-orange/20 text-bookeasy-orange text-xs rounded-full px-2 py-0.5 mt-1 inline-block">
                      Available Now
                    </div>
                  </div>
                  
                  {/* Venue card */}
                  <div className="bg-white rounded-lg shadow-md p-3">
                    <div className="rounded-md bg-gray-200 h-24 mb-2 flex items-center justify-center">
                      <Calendar size={24} className="text-gray-400" />
                    </div>
                    <div className="text-xs font-bold text-bookeasy-purple">Gym 99</div>
                    <div className="text-xs text-gray-500">Fitness • $20/hour</div>
                    <div className="bg-bookeasy-purple/20 text-bookeasy-purple text-xs rounded-full px-2 py-0.5 mt-1 inline-block">
                      Book for Later
                    </div>
                  </div>
                </div>
                
                {/* App nav */}
                <div className="flex justify-around p-3 border-t">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <Map size={14} className="text-gray-500" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-bookeasy-orange flex items-center justify-center">
                    <Calendar size={14} className="text-white" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-gray-500"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating shapes decoration */}
        <AnimatedShape color="bg-bookeasy-orange/20" size="lg" top="10%" left="5%" delay="0s" />
        <AnimatedShape color="bg-bookeasy-purple/20" size="md" top="40%" right="10%" delay="0.5s" />
        <AnimatedShape color="bg-bookeasy-orange/20" size="sm" bottom="10%" left="20%" delay="1s" />
        <AnimatedShape color="bg-bookeasy-purple/30" shape="square" top="5%" right="30%" delay="1.5s" />
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
        <span className="text-sm text-gray-500 mb-2">Scroll to explore</span>
        <ArrowDown className="animate-arrow-bounce text-bookeasy-purple" />
      </div>
    </section>
  );
};

export default HeroSection;

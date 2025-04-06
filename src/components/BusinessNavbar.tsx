import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X, Search, Bell, Building, User, LogOut, BarChart, Calendar, Settings } from 'lucide-react';
import { auth, logOut } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const BusinessNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  return (
    <>
      <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300 py-4",
          isScrolled 
            ? "bg-white/80 backdrop-blur-md shadow-md"
            : "bg-white shadow-md"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-bold text-bookeasy-purple">
                Book<span className="text-bookeasy-orange">Easy</span>
                <span className="ml-2 bg-bookeasy-orange text-white text-xs px-2 py-1 rounded-md">Business</span>
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a className="text-gray-700 hover:text-bookeasy-orange transition-colors" href="/business-dashboard">Dashboard</a>
              <a className="text-gray-700 hover:text-bookeasy-orange transition-colors" href="/my-venues">My Venues</a>
              <a className="text-gray-700 hover:text-bookeasy-orange transition-colors" href="/bookings-management">Bookings</a>
              <a className="text-gray-700 hover:text-bookeasy-orange transition-colors" href="/analytics">Analytics</a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" className="rounded-full p-2 relative" onClick={() => navigate('/notifications')}>
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 bg-red-500 rounded-full w-2 h-2"></span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full h-10 w-10 p-0 overflow-hidden border-2 border-bookeasy-orange">
                    {user?.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || "Business"} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bookeasy-orange/10">
                      {user?.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName || "Business"} 
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <Building className="h-5 w-5 text-bookeasy-orange" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user?.displayName || user?.email || "Business"}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/business-profile')}>
                    <User className="mr-2 h-4 w-4" />Business Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-red-500" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                variant="outline" 
                className="border-bookeasy-orange text-bookeasy-orange hover:bg-bookeasy-orange/10"
                onClick={() => navigate('/add-venue')}
              >
                <span className="flex items-center gap-2">
                  + Add Venue
                </span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-30 bg-white flex flex-col pt-20 pb-6 px-6 md:hidden">
          <nav className="flex flex-col space-y-6 text-lg font-medium">
            <a className="py-2 border-b" href="/business-dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</a>
            <a className="py-2 border-b" href="/my-venues" onClick={() => setIsMenuOpen(false)}>My Venues</a>
            <a className="py-2 border-b" href="/bookings-management" onClick={() => setIsMenuOpen(false)}>Bookings</a>
            <a className="py-2 border-b" href="/analytics" onClick={() => setIsMenuOpen(false)}>Analytics</a>
            
            <Button 
              className="w-full bg-bookeasy-orange hover:bg-bookeasy-orange/90 text-white"
              onClick={() => {
                setIsMenuOpen(false);
                navigate('/add-venue');
              }}
            >
              + Add Venue
            </Button>
          </nav>
          <div className="mt-auto">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-12 h-12 rounded-full mr-3" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-bookeasy-orange/20 flex items-center justify-center mr-3">
                      <Building className="h-6 w-6 text-bookeasy-orange" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{user.displayName || "Business"}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Button 
                  className="w-full bg-bookeasy-orange hover:bg-bookeasy-orange/90"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/business-profile');
                  }}
                >
                  Business Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-red-500 text-red-500 hover:bg-red-50"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/auth', { state: { userType: 'business' } });
                  }}
                >
                  Log In
                </Button>
                <Button 
                  className="w-full bg-bookeasy-orange hover:bg-bookeasy-orange/90 text-white" 
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/auth', { state: { userType: 'business', authMode: 'register' } });
                  }}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BusinessNavbar;
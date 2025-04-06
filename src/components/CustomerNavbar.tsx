import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X, Search, Bell, Calendar, User, LogOut } from 'lucide-react';
import { auth, logOut } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const CustomerNavbar: React.FC = () => {
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
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a className="text-gray-700 hover:text-bookeasy-purple transition-colors" href="/user-home">Dashboard</a>
              <a className="text-gray-700 hover:text-bookeasy-purple transition-colors" href="/venues">Venues</a>
              <a className="text-gray-700 hover:text-bookeasy-purple transition-colors" href="/bookings">My Bookings</a>
              <a className="text-gray-700 hover:text-bookeasy-purple transition-colors" href="/favorites">Favorites</a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" className="rounded-full p-2 relative" onClick={() => navigate('/notifications')}>
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 bg-red-500 rounded-full w-2 h-2"></span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full h-10 w-10 p-0 overflow-hidden border-2 border-bookeasy-purple">
                    {user?.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || "User"} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bookeasy-purple/10">
                      {user?.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName || "User"} 
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-bookeasy-purple" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user?.displayName || user?.email || "Customer"}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/bookings')}>
                    <Calendar className="mr-2 h-4 w-4" />My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-red-500" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search venues..."
                  className="bg-gray-100 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bookeasy-purple/30 w-[180px] transition-all focus:w-[220px]"
                />
              </div>
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
            <a className="py-2 border-b" href="/user-home" onClick={() => setIsMenuOpen(false)}>Dashboard</a>
            <a className="py-2 border-b" href="/venues" onClick={() => setIsMenuOpen(false)}>Venues</a>
            <a className="py-2 border-b" href="/bookings" onClick={() => setIsMenuOpen(false)}>My Bookings</a>
            <a className="py-2 border-b" href="/favorites" onClick={() => setIsMenuOpen(false)}>Favorites</a>
            
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search venues..."
                className="bg-gray-100 rounded-full pl-10 pr-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-bookeasy-purple/30"
              />
            </div>
          </nav>
          <div className="mt-auto">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-12 h-12 rounded-full mr-3" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-bookeasy-purple/20 flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-bookeasy-purple" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{user.displayName || "Customer"}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Button 
                  className="w-full bg-bookeasy-purple hover:bg-bookeasy-purple/90"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/profile');
                  }}
                >
                  My Profile
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
                    navigate('/auth');
                  }}
                >
                  Log In
                </Button>
                <Button 
                  className="w-full bg-bookeasy-purple hover:bg-bookeasy-purple/90 text-white" 
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/auth', { state: { authMode: 'register' } });
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

export default CustomerNavbar;
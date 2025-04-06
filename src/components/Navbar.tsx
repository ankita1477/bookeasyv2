
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X, Search } from 'lucide-react';

const Navbar: React.FC = () => {
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

  return (
    <>
      <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300 py-4",
          isScrolled 
            ? "bg-white/80 backdrop-blur-md shadow-md"
            : "bg-transparent"
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
              <a className="text-gray-700 hover:text-bookeasy-purple transition-colors" href="#features">Features</a>
              <a className="text-gray-700 hover:text-bookeasy-purple transition-colors" href="#how-it-works">How It Works</a>
              <a className="text-gray-700 hover:text-bookeasy-purple transition-colors" href="#spaces">Spaces</a>
              <a className="text-gray-700 hover:text-bookeasy-purple transition-colors" href="#testimonials">Testimonials</a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" className="rounded-full p-2">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="outline" className="rounded-full">
                Log In
              </Button>
              <Button className="bg-bookeasy-purple hover:bg-bookeasy-purple/90 text-white rounded-full">
                Sign Up
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
            <a className="py-2 border-b" href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a className="py-2 border-b" href="#how-it-works" onClick={() => setIsMenuOpen(false)}>How It Works</a>
            <a className="py-2 border-b" href="#spaces" onClick={() => setIsMenuOpen(false)}>Spaces</a>
            <a className="py-2 border-b" href="#testimonials" onClick={() => setIsMenuOpen(false)}>Testimonials</a>
          </nav>
          <div className="mt-auto grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full" onClick={() => setIsMenuOpen(false)}>
              Log In
            </Button>
            <Button className="w-full bg-bookeasy-purple hover:bg-bookeasy-purple/90 text-white" onClick={() => setIsMenuOpen(false)}>
              Sign Up
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

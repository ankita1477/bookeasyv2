
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeatureCards from '../components/FeatureCards';
import HowItWorks from '../components/HowItWorks';
import VendorCarousel from '../components/VendorCarousel';
import Testimonials from '../components/Testimonials';
import CtaSection from '../components/CtaSection';
import Footer from '../components/Footer';

const Index: React.FC = () => {
  useEffect(() => {
    // Set page title
    document.title = 'BookEasy - Book Smarter. Host Easier. Live Local.';
    
    // Smooth scroll to section when URL has a hash
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <main>
        <HeroSection />
        <FeatureCards />
        <HowItWorks />
        <VendorCarousel />
        <Testimonials />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

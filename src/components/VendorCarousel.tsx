
import React, { useState, useEffect, useRef } from 'react';
import { Star, MapPin, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VendorCardProps {
  name: string;
  category: string;
  price: string;
  rating: number;
  location: string;
  isActive: boolean;
}

const VendorCard: React.FC<VendorCardProps> = ({ 
  name, 
  category, 
  price, 
  rating, 
  location, 
  isActive 
}) => {
  return (
    <div 
      className={cn(
        "glass-card transition-all duration-500 p-5",
        isActive ? "opacity-100 scale-100" : "opacity-70 scale-95"
      )}
    >
      <div className="bg-gray-200 h-40 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
        <span className="text-gray-400 text-xl">{name} Image</span>
        <div className="absolute top-3 right-3 bg-white/90 rounded-full px-3 py-1 text-xs font-medium text-bookeasy-purple">
          {category}
        </div>
      </div>

      <h3 className="text-xl font-bold mb-1">{name}</h3>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={cn(
                "w-4 h-4",
                i < rating ? "text-bookeasy-orange fill-bookeasy-orange" : "text-gray-300"
              )} 
            />
          ))}
          <span className="ml-1 text-sm text-gray-600">{rating}.0</span>
        </div>
        <span className="font-bold text-bookeasy-purple">{price}</span>
      </div>

      <div className="flex items-center text-gray-600 text-sm mb-4">
        <MapPin className="w-4 h-4 mr-1" />
        <span>{location}</span>
      </div>

      <button className="w-full bg-bookeasy-purple text-white py-2 rounded-lg hover:bg-bookeasy-purple/90 transition-colors">
        Book Now
      </button>
    </div>
  );
};

const VendorCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const vendors = [
    {
      name: "Gym 99",
      category: "Fitness",
      price: "$20/hour",
      rating: 4,
      location: "Downtown, NY"
    },
    {
      name: "Brew Cafe",
      category: "Coworking",
      price: "$15/hour",
      rating: 5,
      location: "Midtown, NY"
    },
    {
      name: "Vibe Hall",
      category: "Events",
      price: "$100/hour",
      rating: 4,
      location: "Brooklyn, NY"
    },
    {
      name: "Studio Space",
      category: "Photography",
      price: "$45/hour",
      rating: 5,
      location: "Queens, NY"
    },
    {
      name: "Zen Room",
      category: "Wellness",
      price: "$25/hour",
      rating: 4,
      location: "East Village, NY"
    }
  ];

  const nextSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex === vendors.length - 1 ? 0 : prevIndex + 1));
  };

  const prevSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex === 0 ? vendors.length - 1 : prevIndex - 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }

    return () => {
      if (carouselRef.current) {
        observer.unobserve(carouselRef.current);
      }
    };
  }, []);

  return (
    <section 
      ref={carouselRef}
      className="py-20 bg-bookeasy-gray opacity-0 transition-opacity duration-1000"
      id="spaces"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-bookeasy-dark">
            Featured <span className="text-bookeasy-purple">Spaces</span>
          </h2>
          <p className="text-bookeasy-dark/80 max-w-2xl mx-auto">
            Discover unique local spaces available for instant booking.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="flex overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {vendors.map((vendor, index) => (
                <div key={index} className="min-w-full sm:min-w-[50%] lg:min-w-[33.333%] p-4">
                  <VendorCard
                    name={vendor.name}
                    category={vendor.category}
                    price={vendor.price}
                    rating={vendor.rating}
                    location={vendor.location}
                    isActive={index === activeIndex}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation controls */}
          <button 
            className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hidden md:flex items-center justify-center"
            onClick={prevSlide}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button 
            className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hidden md:flex items-center justify-center"
            onClick={nextSlide}
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Mobile indicators */}
          <div className="flex justify-center space-x-2 mt-6 md:hidden">
            {vendors.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === activeIndex 
                    ? "bg-bookeasy-purple w-6" 
                    : "bg-gray-300"
                )}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VendorCarousel;

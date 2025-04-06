
import React, { useEffect, useRef } from 'react';
import { 
  Calendar, 
  FileText, 
  Lock, 
  Shield, 
  MessageSquare, 
  MapPin 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('opacity-100', 'translate-y-0');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [delay]);

  return (
    <div 
      ref={cardRef}
      className={cn(
        "feature-card neon-border bg-bookeasy-purple text-white",
        "opacity-0 translate-y-8 transition-all duration-700"
      )}
    >
      <div className="p-2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/80">{description}</p>
    </div>
  );
};

const FeatureCards: React.FC = () => {
  const features = [
    {
      icon: <Calendar className="text-bookeasy-orange h-6 w-6" />,
      title: "Calendar Scheduling",
      description: "Book spaces with a few clicks and manage your reservations all in one place."
    },
    {
      icon: <FileText className="text-bookeasy-orange h-6 w-6" />,
      title: "Booking Confirmation",
      description: "Receive instant confirmation and detailed information about your booking."
    },
    {
      icon: <Lock className="text-bookeasy-orange h-6 w-6" />,
      title: "Email/OTP Login",
      description: "Secure and hassle-free login with email or one-time password verification."
    },
    {
      icon: <Shield className="text-bookeasy-orange h-6 w-6" />,
      title: "Verified Hosts",
      description: "All hosts are verified to ensure quality and security for every booking."
    },
    {
      icon: <MessageSquare className="text-bookeasy-orange h-6 w-6" />,
      title: "Instant Support",
      description: "Get help when you need it with our responsive customer support team."
    },
    {
      icon: <MapPin className="text-bookeasy-orange h-6 w-6" />,
      title: "Map-Based Listings",
      description: "Find the perfect venue near you with our interactive map interface."
    }
  ];

  return (
    <section className="py-20 bg-bookeasy-purple" id="features">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Features You'll <span className="text-bookeasy-orange">Love</span>
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            BookEasy comes packed with everything you need to find and book spaces effortlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;

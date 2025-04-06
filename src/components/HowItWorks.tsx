
import React, { useEffect, useRef } from 'react';
import { User, Search, CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const Step: React.FC<StepProps> = ({ number, title, description, icon, isActive, onClick }) => {
  return (
    <div 
      className={cn(
        "relative transition-all duration-500 cursor-pointer",
        "p-6 rounded-xl",
        isActive 
          ? "bg-white shadow-lg transform scale-105" 
          : "bg-white/20 hover:bg-white/30"
      )}
      onClick={onClick}
    >
      <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-bookeasy-purple text-white flex items-center justify-center font-bold">
        {number}
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="p-3 rounded-full bg-bookeasy-purple/20">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold mb-1 text-bookeasy-dark">{title}</h3>
          <p className="text-bookeasy-dark/70">{description}</p>
        </div>
      </div>
    </div>
  );
};

const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState(1);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev === 3 ? 1 : prev + 1));
    }, 4000);

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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const steps = [
    {
      number: 1,
      icon: <User className="h-6 w-6 text-bookeasy-purple" />,
      title: "Register",
      description: "Create an account in seconds with email or social login."
    },
    {
      number: 2,
      icon: <Search className="h-6 w-6 text-bookeasy-purple" />,
      title: "Explore Spaces",
      description: "Browse through verified venues filtered by your needs."
    },
    {
      number: 3,
      icon: <CalendarCheck className="h-6 w-6 text-bookeasy-purple" />,
      title: "Book Instantly",
      description: "Secure your space with instant confirmation and payment."
    }
  ];

  return (
    <section 
      ref={sectionRef} 
      className="py-20 bg-bookeasy-orange opacity-0 transition-opacity duration-1000"
      id="how-it-works"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-bookeasy-dark">
            How It <span className="text-bookeasy-purple">Works</span>
          </h2>
          <p className="text-bookeasy-dark/80 max-w-2xl mx-auto">
            BookEasy makes finding and booking local spaces simple and fast.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/30 -translate-y-1/2 rounded-full hidden md:block">
            <div 
              className="h-full bg-bookeasy-purple rounded-full transition-all duration-500"
              style={{ width: `${(activeStep / 3) * 100}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((step) => (
              <Step
                key={step.number}
                number={step.number}
                icon={step.icon}
                title={step.title}
                description={step.description}
                isActive={activeStep === step.number}
                onClick={() => setActiveStep(step.number)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

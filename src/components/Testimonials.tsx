
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  rating: number;
  index: number;
}

const Testimonial: React.FC<TestimonialProps> = ({ quote, author, role, rating, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('opacity-100', 'translate-y-0');
            }, index * 150);
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
  }, [index]);

  return (
    <div 
      ref={cardRef}
      className={cn(
        "bg-white rounded-xl p-6 shadow-lg",
        "opacity-0 translate-y-8 transition-all duration-700"
      )}
    >
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-lg">
            {i < rating ? "⭐" : "☆"}
          </span>
        ))}
      </div>
      <p className="text-gray-700 mb-4 italic">"{quote}"</p>
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-bookeasy-purple text-white flex items-center justify-center font-bold">
          {author.charAt(0)}
        </div>
        <div className="ml-3">
          <p className="font-bold text-bookeasy-dark">{author}</p>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
    </div>
  );
};

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      quote: "BookEasy helped me find a perfect studio space for my photography sessions. Booking was instant and hassle-free!",
      author: "Sarah J.",
      role: "Photographer",
      rating: 5
    },
    {
      quote: "I've been using BookEasy to list my cafe during off-hours. My revenue has increased by 30% since joining!",
      author: "Michael T.",
      role: "Cafe Owner",
      rating: 5
    },
    {
      quote: "As a yoga instructor, I needed flexible spaces. BookEasy makes it easy to find and book venues across the city.",
      author: "Elena M.",
      role: "Yoga Instructor",
      rating: 4
    },
    {
      quote: "The BookEasy platform is intuitive and reliable. I can always count on confirmed bookings and great spaces.",
      author: "David K.",
      role: "Event Planner",
      rating: 5
    },
    {
      quote: "I listed my gym's unused rooms and it's been a game-changer for our business model. Highly recommend!",
      author: "Robert L.",
      role: "Gym Owner",
      rating: 4
    },
    {
      quote: "The customer support is amazing! They helped me resolve a booking issue within minutes.",
      author: "Jessica W.",
      role: "Regular User",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-bookeasy-light" id="testimonials">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-bookeasy-dark">
            What Our <span className="text-bookeasy-orange">Users Say</span>
          </h2>
          <p className="text-bookeasy-dark/80 max-w-2xl mx-auto">
            Don't just take our word for it - hear from the BookEasy community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              rating={testimonial.rating}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

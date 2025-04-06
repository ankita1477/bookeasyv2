
import React from 'react';
import AnimatedShape from './AnimatedShape';

const CtaSection: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-cta" id="cta">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Host or Find Your Perfect Spot?
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of users and businesses already using BookEasy to connect and make the most of local spaces.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button className="glass px-8 py-4 rounded-xl text-white font-medium hover:bg-white/20 transition-all transform hover:-translate-y-1 hover:shadow-glow">
              Join as Business
            </button>
            <button className="px-8 py-4 rounded-xl text-bookeasy-dark font-medium bg-bookeasy-orange hover:bg-bookeasy-orange/90 transition-all transform hover:-translate-y-1 hover:shadow-lg">
              Explore Events
            </button>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <AnimatedShape color="bg-white/5" size="lg" top="10%" left="5%" />
        <AnimatedShape color="bg-white/5" size="md" top="60%" right="8%" delay="0.5s" />
        <AnimatedShape color="bg-white/5" size="sm" bottom="10%" left="20%" delay="1s" />
        <AnimatedShape color="bg-white/5" shape="square" top="30%" right="25%" delay="1.5s" />
      </div>
    </section>
  );
};

export default CtaSection;

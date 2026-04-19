import { Link } from 'react-router-dom';
import { ArrowDown, Scale } from 'lucide-react';
import { useSelector } from 'react-redux';

const Hero = () => {
  const { isDarkMode } = useSelector((state) => state.theme);

  return (
    <section
      id="home"
      className="h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: isDarkMode
          ? 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #2A2A2A 100%)'
          : 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 50%, #E5E5E5 100%)'
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, #D4AF37 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gold/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="text-center">
          {/* Animated Icon */}
          <div className="fade-in-up mb-6">
            <div className="inline-block p-3 md:p-4 rounded-full bg-gold/10">
              <Scale className="w-10 h-10 md:w-14 md:h-14 text-gold" />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="fade-in-up stagger-1 text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-cinzel font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Streamline Your
            <span className="block text-gold mt-2">Legal Practice</span>
          </h1>
          
          {/* Subtitle */}
          <p className="fade-in-up stagger-2 text-sm sm:text-lg md:text-xl mb-3 font-inter max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Case Management. Client Portal. Hearing Scheduling.
          </p>
          <p className="fade-in-up stagger-2 text-sm sm:text-base mb-8 font-inter max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            A role-based web application designed to streamline internal operations of a legal firm by enabling efficient management of cases, clients, and hearings.
          </p>
          
          {/* CTA Buttons */}
          <div className="fade-in-up stagger-3 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              to="/login"
              className="bg-gold hover:bg-gold-dark text-black-rich font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-base w-full sm:w-auto"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="border-2 border-gold text-gold hover:bg-gold hover:text-black-rich font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 text-base w-full sm:w-auto"
            >
              Learn More
            </a>
          </div>
          
          {/* Trust Indicators */}
          {/* <div className="fade-in-up stagger-4 mt-10 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-gold font-cinzel">500+</p>
              <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Cases Managed</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-gold font-cinzel">200+</p>
              <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Happy Clients</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-gold font-cinzel">98%</p>
              <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Success Rate</p>
            </div>
          </div> */}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="hidden md:block absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <a href="#features" className="text-gold hover:text-gold-light transition-colors animate-bounce block">
          <ArrowDown className="w-10 h-10" />
        </a>
      </div>
    </section>
  );
};

export default Hero;

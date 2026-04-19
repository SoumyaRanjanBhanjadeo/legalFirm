import { CheckCircle } from 'lucide-react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const About = () => {
  const [leftRef, leftVisible] = useScrollAnimation({ threshold: 0.2 });
  const [rightRef, rightVisible] = useScrollAnimation({ threshold: 0.2 });

  const benefits = [
    'Streamlined case management workflow',
    'Secure client data protection',
    'Automated hearing reminders',
    'Real-time collaboration tools',
    'Comprehensive reporting & analytics',
    'Mobile-friendly interface',
  ];

  return (
    <section id="about" className="py-16" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div
            ref={leftRef}
            className={`transition-all duration-800 ${
              leftVisible ? 'fade-in-left visible' : 'animate-on-scroll'
            }`}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-cinzel font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Transforming Legal Practice <span className="text-gold">Management</span>
            </h2>
            <p className="text-lg mb-6 font-inter leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Our comprehensive case management system is designed specifically for modern legal firms. 
              We understand the complexities of legal practice management and have built a solution that 
              addresses every aspect of your workflow.
            </p>
            <p className="text-lg mb-8 font-inter leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              From intake to resolution, our platform ensures that every case is managed efficiently, 
              every client is kept informed, and every deadline is met with precision.
            </p>

            {/* Benefits List */}
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-gold shrink-0" />
                  <span className="font-inter" style={{ color: 'var(--text-primary)' }}>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Visual */}
          <div
            ref={rightRef}
            className={`transition-all duration-800 ${
              rightVisible ? 'fade-in-right visible' : 'animate-on-scroll'
            }`}
          >
            <div className="relative">
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-linear-to-br from-gold/20 to-transparent rounded-2xl blur-2xl"></div>
              
              {/* Main Card */}
              <div className="relative p-8 rounded-2xl border border-gold/20" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div className="space-y-6">
                  {/* Stat Card 1 */}
                  <div className="p-6 rounded-lg border border-gold/10" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Active Cases</p>
                        <p className="text-3xl font-bold text-gold font-cinzel">150+</p>
                      </div>
                      <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-gold rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Stat Card 2 */}
                  <div className="p-6 rounded-lg border border-gold/10" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Upcoming Hearings</p>
                        <p className="text-3xl font-bold text-gold font-cinzel">25</p>
                      </div>
                      <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-gold rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Stat Card 3 */}
                  <div className="p-6 rounded-lg border border-gold/10" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Client Satisfaction</p>
                        <p className="text-3xl font-bold text-gold font-cinzel">98%</p>
                      </div>
                      <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-gold rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

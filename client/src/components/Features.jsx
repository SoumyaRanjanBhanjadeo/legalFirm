import { Scale, Users, Calendar, FileText, Shield, Bell } from 'lucide-react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const Features = () => {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });

  const features = [
    {
      icon: Scale,
      title: 'Case Management',
      description: 'Efficiently organize and track all your legal cases with detailed information, status updates, and document management.',
    },
    {
      icon: Users,
      title: 'Client Portal',
      description: 'Provide secure access to clients for real-time case updates, document sharing, and seamless communication.',
    },
    {
      icon: Calendar,
      title: 'Hearing Scheduling',
      description: 'Never miss a court date with intelligent scheduling, automated reminders, and calendar integration.',
    },
    {
      icon: FileText,
      title: 'Document Management',
      description: 'Centralized storage for all legal documents with version control, search functionality, and secure access.',
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Granular permission system ensuring secure access control based on user roles within the organization.',
    },
    {
      icon: Bell,
      title: 'Real-Time Updates',
      description: 'Stay informed with instant notifications on case progress, hearing changes, and important deadlines.',
    },
  ];

  return (
    <section id="features" className="py-16" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={ref}
          className={`text-center mb-10 transition-all duration-800 ${
            isVisible ? 'fade-in-up visible' : 'animate-on-scroll'
          }`}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-cinzel font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Powerful <span className="text-gold">Features</span>
          </h2>
          <p className="text-base max-w-2xl mx-auto font-inter" style={{ color: 'var(--text-secondary)' }}>
            Everything you need to manage your legal practice efficiently and securely
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                ref={ref}
                className={`p-6 rounded-lg border border-gold/10 hover:border-gold/30 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-lg hover:shadow-gold/10 group ${
                  isVisible ? `fade-in-up visible stagger-${index + 1}` : 'animate-on-scroll'
                }`}
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                {/* Icon */}
                <div className="inline-block p-2.5 bg-gold/10 rounded-lg mb-4 group-hover:bg-gold/20 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-gold" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-cinzel font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm font-inter leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;

import { useState, useEffect } from 'react';
import { Scale, Users, Trophy, Calendar } from 'lucide-react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const StatCounter = ({ end, duration, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
};

const Statistics = () => {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.3 });

  const stats = [
    {
      icon: Scale,
      value: 500,
      suffix: '+',
      label: 'Cases Managed',
    },
    {
      icon: Users,
      value: 200,
      suffix: '+',
      label: 'Happy Clients',
    },
    {
      icon: Trophy,
      value: 98,
      suffix: '%',
      label: 'Success Rate',
    },
    {
      icon: Calendar,
      value: 1200,
      suffix: '+',
      label: 'Hearings Scheduled',
    },
  ];

  return (
    <section className="py-16" style={{ background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-800 ${
            isVisible ? 'fade-in-up visible' : 'animate-on-scroll'
          }`}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-cinzel font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Our <span className="text-gold">Achievements</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto font-inter" style={{ color: 'var(--text-secondary)' }}>
            Trusted by legal professionals across the nation
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                ref={ref}
                className={`p-8 rounded-lg border border-gold/20 hover:border-gold/40 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-lg hover:shadow-gold/20 text-center group ${
                  isVisible ? `fade-in-up visible stagger-${index + 1}` : 'animate-on-scroll'
                }`}
                style={{ backgroundColor: 'var(--bg-primary)' + '80' }}
              >
                {/* Icon */}
                <div className="inline-block p-4 bg-gold/10 rounded-full mb-6 group-hover:bg-gold/20 transition-colors duration-300">
                  <Icon className="w-8 h-8 text-gold" />
                </div>

                {/* Counter */}
                <div className="text-4xl sm:text-5xl font-bold text-gold font-cinzel mb-2">
                  {isVisible ? (
                    <StatCounter end={stat.value} duration={2000} suffix={stat.suffix} />
                  ) : (
                    <span>0{stat.suffix}</span>
                  )}
                </div>

                {/* Label */}
                <p className="font-inter" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Statistics;

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scale, Menu, X, Sun, Moon } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../store/themeSlice';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const { isDarkMode } = useSelector((state) => state.theme);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.add('light-mode');
    }
  }, [isDarkMode]);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (href) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      window.location.href = href;
    }
  };

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black-rich/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
      style={{
        backgroundColor: isScrolled 
          ? (isDarkMode ? 'rgba(10, 10, 10, 0.95)' : 'rgba(255, 255, 255, 0.95)')
          : 'transparent'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Scale className="w-8 h-8 text-gold" />
            <span className="text-2xl font-cinzel font-bold" style={{ color: 'var(--text-primary)' }}>
              Legal<span className="text-gold">Firm</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => handleNavClick(link.href)}
                className="hover:text-gold transition-colors duration-300 font-inter"
                style={{ color: 'var(--text-primary)' }}
              >
                {link.name}
              </a>
            ))}
            
            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-lg hover:bg-gold/10 transition-colors duration-300 cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-gold" />
              ) : (
                <Moon className="w-5 h-5 text-gold" />
              )}
            </button>

            <Link
              to="/login"
              className="bg-gold hover:bg-gold-dark text-black-rich font-semibold px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden hover:text-gold transition-colors"
            style={{ color: 'var(--text-primary)' }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden backdrop-blur-md border-t border-gold/20"
          style={{ backgroundColor: isDarkMode ? 'rgba(10, 10, 10, 0.95)' : 'rgba(255, 255, 255, 0.95)' }}
        >
          <div className="px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => handleNavClick(link.href)}
                className="block hover:text-gold transition-colors duration-300 font-inter"
                style={{ color: 'var(--text-primary)' }}
              >
                {link.name}
              </a>
            ))}
            
            {/* Theme Toggle Mobile */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="flex items-center space-x-2 hover:text-gold transition-colors duration-300"
              style={{ color: 'var(--text-primary)' }}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <Link
              to="/login"
              className="block bg-gold hover:bg-gold-dark text-black-rich font-semibold px-6 py-2 rounded-lg transition-all duration-300 text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

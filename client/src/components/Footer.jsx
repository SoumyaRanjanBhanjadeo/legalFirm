import { Link } from 'react-router-dom';
import { Scale, Mail, Phone, MapPin } from 'lucide-react';
import { FaXTwitter } from "react-icons/fa6";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";

const Footer = () => {
  const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  const services = [
    'Case Management',
    'Client Portal',
    'Hearing Scheduling',
    'Document Management',
  ];

  return (
    <footer id="contact" className="border-t border-gold/10" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Scale className="w-8 h-8 text-gold" />
              <span className="text-2xl font-cinzel font-bold" style={{ color: 'var(--text-primary)' }}>
                Legal<span className="text-gold">Firm</span>
              </span>
            </div>
            <p className="font-inter mb-4" style={{ color: 'var(--text-secondary)' }}>
              Streamlining legal practice management with modern technology and secure solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-gold transition-colors duration-300">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-gold transition-colors duration-300">
                <FaXTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-gold transition-colors duration-300">
                <FaLinkedin className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-gold transition-colors duration-300">
                <FaInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-cinzel font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="hover:text-gold transition-colors duration-300 font-inter"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
              {/* <li>
                <Link
                  to="/login"
                  className="hover:text-gold transition-colors duration-300 font-inter"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Login
                </Link>
              </li> */}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-cinzel font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Services</h3>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index}>
                  <span className="font-inter" style={{ color: 'var(--text-secondary)' }}>{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-cinzel font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-1" />
                <span className="font-inter">
                  Buxi Bazar<br />
                  India, Odisha, 753001
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gold shrink-0" />
                <span className="font-inter"><a href="tel:+919876543210">+91 9876543210</a></span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <span className="font-inter"><a href="mailto:contact@legalfirm.com">contact@legalfirm.com</a></span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gold/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="font-inter text-sm" style={{ color: 'var(--text-secondary)' }}>
              © {new Date().getFullYear()} LegalFirm. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-gold transition-colors duration-300 text-sm font-inter">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-gold transition-colors duration-300 text-sm font-inter">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

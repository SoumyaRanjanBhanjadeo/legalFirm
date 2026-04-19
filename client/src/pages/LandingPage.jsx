import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import About from '../components/About';
import Statistics from '../components/Statistics';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <About />
      <Statistics />
      <Footer />
    </div>
  );
};

export default LandingPage;

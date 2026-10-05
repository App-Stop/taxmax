import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustBar from './components/TrustBar';
import Services from './components/Services';
import Process from './components/Process';
import Stats from './components/Stats';
import WhyUs from './components/WhyUs';
import TaxEstimator from './components/TaxEstimator';
import FreeTools from './components/FreeTools';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen w-full bg-[#07152a] font-['Manrope',sans-serif] selection:bg-[#0094c5] selection:text-white">
      {/* 1. Header Navigation */}
      <Navbar />

      <main className="w-full">
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. Trust Bar */}
        <TrustBar />

        {/* 4. Full-Spectrum Services */}
        <Services />

        {/* 5. 4-Step Process */}
        <Process />

        {/* 6. Stats Bar */}
        <Stats />

        {/* 7. Why TAXMAX / Partnership */}
        <WhyUs />

        {/* 8. Tax Strategy & Savings Estimator */}
        <TaxEstimator />

        {/* 9. Free Tax Tools & Retention Guide */}
        <FreeTools />

        {/* 10. Client Testimonials */}
        <Testimonials />

        {/* 11. Frequently Asked Questions */}
        <FAQ />

        {/* 12. Document Upload & Consultation Form */}
        <ContactForm />
      </main>

      {/* 13. Website Footer */}
      <Footer />
    </div>
  );
}

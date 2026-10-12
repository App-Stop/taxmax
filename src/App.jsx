import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustBar from './components/TrustBar';
import Services from './components/Services';
import Process from './components/Process';
import Stats from './components/Stats';
import WhyUs from './components/WhyUs';
import IrsEstimates from './components/IrsEstimates';
import FreeTools from './components/FreeTools';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';

import DocumentUploadFlow from './components/upload/DocumentUploadFlow';
import ClientDashboard from './components/dashboard/ClientDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import AuthScreen from './components/auth/AuthScreen';
import { getRoleFromToken, clearSession } from './services/auth';

const dashboardViewFor = (role) => (role === 'admin' ? 'admin' : 'dashboard');

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('taxmax_user'));
  } catch (e) {
    console.error(e);
    return null;
  }
};

export default function App() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'login' | 'dashboard' | 'admin'
  const [user, setUser] = useState(null);

  // Load existing authenticated user session from localStorage
  useEffect(() => {
    try {
      const isAuth = localStorage.getItem('taxmax_is_authenticated') === 'true';
      const storedUser = localStorage.getItem('taxmax_user');
      if (isAuth && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleOpenUpload = () => {
    setIsUploadOpen(true);
  };

  const handleOpenLogin = () => {
    setCurrentView('login');
    window.scrollTo({ top: 0 });
  };

  // Customers and admin staff share one login; the role in the returned token picks the dashboard.
  const handleLoginSuccess = ({ token, user: userData }) => {
    setUser(userData);
    setCurrentView(dashboardViewFor(getRoleFromToken(token)));
    window.scrollTo({ top: 0 });
  };

  const handleCompleteToDashboard = (userData) => {
    // The upload flow saves the full account (filing id, documents) before handing over.
    setUser(readStoredUser() || userData);
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewTaxTools = () => {
    setCurrentView('landing');
    setTimeout(() => document.getElementById('tax-tools')?.scrollIntoView(), 0);
  };

  const handleLogout = () => {
    try {
      clearSession();
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentView === 'login') {
    return <AuthScreen onAuthenticated={handleLoginSuccess} onBackToHome={() => setCurrentView('landing')} />;
  }

  if (currentView === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} onBackToHome={() => setCurrentView('landing')} />;
  }

  // If user is viewing the dashboard
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen w-full bg-[#07152a] font-['Manrope',sans-serif] selection:bg-[#0094c5] selection:text-white">
        <ClientDashboard
          key={user?.filingId}
          user={user}
          onLogout={handleLogout}
          onBackToHome={() => setCurrentView('landing')}
          onOpenUpload={handleOpenUpload}
          onViewTaxTools={handleViewTaxTools}
        />

        {/* Global Document Upload Modal accessible anytime */}
        <DocumentUploadFlow
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onCompleteToDashboard={handleCompleteToDashboard}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#07152a] font-['Manrope',sans-serif] selection:bg-[#0094c5] selection:text-white">
      {/* 1. Header Navigation */}
      <Navbar
        onOpenUpload={handleOpenUpload}
        onOpenLogin={handleOpenLogin}
        user={user}
        onOpenDashboard={() => setCurrentView(dashboardViewFor(user?.role))}
      />

      <main className="w-full">
        {/* 2. Hero Section */}
        <Hero onOpenUpload={handleOpenUpload} />

        {/* 3. Trust Bar */}
        <TrustBar />

        {/* 4. Full-Spectrum Services */}
        <Services />

        {/* 5. 4-Step Process */}
        <Process />

        {/* 6. Stats Bar */}
        <Stats />

        {/* 7. Why TAXMAX / Partnership */}
        <WhyUs onOpenUpload={handleOpenUpload} />

        {/* 8. IRS Tax Estimates & Information */}
        <IrsEstimates />

        {/* 9. Free Tax Tools & Retention Guide */}
        <FreeTools />

        {/* 10. Client Testimonials */}
        <Testimonials />

        {/* 11. Frequently Asked Questions */}
        <FAQ />

        {/* 12. Document Upload & Consultation Form */}
        <ContactForm onOpenUpload={handleOpenUpload} />
      </main>

      {/* 13. Website Footer */}
      <Footer />

      {/* Document Upload Flow (Figma Screens 67:407, 67:496, 67:530, 67:605, 67:648, 67:775) */}
      <DocumentUploadFlow
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onCompleteToDashboard={handleCompleteToDashboard}
      />
    </div>
  );
}

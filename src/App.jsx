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
import AdminDashboard from './components/admin/AdminDashboard';
import AuthScreen from './components/auth/AuthScreen';
import { getAccountType, getStoredToken, clearSession, logout, refreshCustomerProfile } from './services/auth';
import { setUnauthorizedHandler } from './services/api';
import { disconnectChat } from './services/chatSocket';

// Team members (admin and staff) use the admin portal; everyone else the customer dashboard.
const dashboardViewFor = (accountType) => (accountType === 'team' ? 'admin' : 'dashboard');

// The session saved in localStorage: { accountType, user }, or null when there is no live one.
// Read before the first render, so a signed-in reload opens on the dashboard, not the landing page.
function restoreSession() {
  try {
    // No live API session (expired, or an old local-only account) means signing in again.
    const accountType = getAccountType(getStoredToken());
    if (!accountType) {
      clearSession();
      return null;
    }
    const isAuth = localStorage.getItem('taxmax_is_authenticated') === 'true';
    const storedUser = localStorage.getItem('taxmax_user');
    return { accountType, user: isAuth && storedUser ? JSON.parse(storedUser) : null };
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default function App() {
  const [session] = useState(restoreSession);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  // 'landing' | 'login' | 'dashboard' | 'admin'
  const [currentView, setCurrentView] = useState(() =>
    session?.user ? dashboardViewFor(session.accountType) : 'landing',
  );
  const [user, setUser] = useState(session?.user ?? null);
  // Bumped when the upload flow adds documents, so the dashboard reloads them.
  const [documentsVersion, setDocumentsVersion] = useState(0);

  // Show the cached profile at once, then swap in the current one from the API.
  // A revoked session is handled by the 401 handler; other failures keep the cache.
  useEffect(() => {
    if (session?.accountType === 'customer') {
      refreshCustomerProfile().then(setUser, (err) => console.error(err));
    }
  }, [session]);

  // A 401 on any signed-in request means the session expired or was revoked: back to login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      disconnectChat();
      setUser(null);
      setCurrentView('login');
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const handleOpenUpload = () => {
    setIsUploadOpen(true);
  };

  const handleOpenLogin = () => {
    setCurrentView('login');
    window.scrollTo({ top: 0 });
  };

  // Customers and team members share one login; the token's account type picks the dashboard.
  const handleLoginSuccess = ({ token, user: userData }) => {
    setUser(userData);
    setCurrentView(dashboardViewFor(getAccountType(token)));
    window.scrollTo({ top: 0 });
  };

  // Finishing sign-up in the upload flow signs the new customer in.
  const handleSignedUp = ({ user: userData }) => {
    setIsUploadOpen(false);
    setUser(userData);
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // An existing account found during sign-up: log in instead.
  const handleLoginFromUpload = () => {
    setIsUploadOpen(false);
    handleOpenLogin();
  };

  const uploadFlow = isUploadOpen && (
    <DocumentUploadFlow
      isOpen
      onClose={() => setIsUploadOpen(false)}
      onSignedUp={handleSignedUp}
      onDocumentsAdded={() => setDocumentsVersion((v) => v + 1)}
      onLogin={handleLoginFromUpload}
    />
  );

  const handleViewTaxTools = () => {
    setCurrentView('landing');
    setTimeout(() => document.getElementById('tax-tools')?.scrollIntoView(), 0);
  };

  const handleLogout = () => {
    // Clears the local session at once; the server-side revoke runs in the background.
    logout();
    disconnectChat();
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
          key={user?.id}
          user={user}
          documentsVersion={documentsVersion}
          onLogout={handleLogout}
          onBackToHome={() => setCurrentView('landing')}
          onOpenUpload={handleOpenUpload}
          onViewTaxTools={handleViewTaxTools}
        />

        {/* Global Document Upload Modal accessible anytime */}
        {uploadFlow}
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
        onOpenDashboard={() => setCurrentView(dashboardViewFor(user?.accountType))}
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
      {uploadFlow}
    </div>
  );
}

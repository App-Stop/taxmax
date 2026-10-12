import { useState, useEffect } from 'react';

const imgLogo = "/figma/b888a9396e41ae8b3746258887ab3eadbe9402d1.svg";

export default function LoginModal({ isOpen, onClose, onLoginSuccess, onOpenUpload }) {
  const [email, setEmail] = useState('johndoe@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('taxmax_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.email) setEmail(parsed.email);
      }
    } catch (e) {
      console.error(e);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      let user = null;
      const savedUser = localStorage.getItem('taxmax_user');
      if (savedUser) {
        user = JSON.parse(savedUser);
      } else {
        user = {
          fullName: 'John Doe',
          email: email || 'johndoe@gmail.com',
          phone: '(612) 213 231421',
          address: 'Park Avenue, 234, Str, Texas, US',
          status: 'Single',
          dependents: 'No',
          filingId: 'TM-849204',
          estimatedRefund: {
            total: '$5,213.23',
            federal: '$2,340',
            state: '$2,726',
          },
          documents: [
            {
              id: 'doc-1',
              name: 'W-2 Form',
              pageCount: 2,
              thumb: '/figma/upload/w2-thumbnail.png',
              status: 'Verified',
            },
            {
              id: 'doc-2',
              name: '1099-NEC',
              pageCount: 1,
              thumb: '/figma/upload/1099-nec-thumbnail.png',
              status: 'Under Review',
            },
          ],
        };
        localStorage.setItem('taxmax_user', JSON.stringify(user));
      }
      localStorage.setItem('taxmax_is_authenticated', 'true');
      onLoginSuccess(user);
      onClose();
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-[6px] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[440px] bg-white rounded-[20px] shadow-2xl p-7 sm:p-9 relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 size-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close login modal"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Logo & Heading */}
        <div className="flex flex-col gap-3 items-start mb-6">
          <div className="h-8 w-auto">
            <img src={imgLogo} alt="TAXMAX" className="h-full w-auto object-contain" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#111] mt-2">
            Client Portal Login
          </h2>
          <p className="text-sm text-[#505050]">
            Sign in to access your tax return status, refund calculation, and documents.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#111]">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:outline-none focus:border-[#0094c5] text-sm text-[#111]"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#111]">Password or Last 4 of SSN</label>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-[11px] text-[#0094c5] hover:underline">
                Forgot?
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:outline-none focus:border-[#0094c5] text-sm text-[#111]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-[#0094c5] hover:bg-[#0082ad] text-white font-bold rounded-full transition-colors shadow-md mt-2 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Log In to Dashboard</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col items-center gap-2 text-center">
          <p className="text-xs text-gray-500">
            Haven't uploaded your tax documents yet?
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenUpload();
            }}
            className="text-xs font-bold text-[#0094c5] hover:underline cursor-pointer"
          >
            Start Document Upload Flow →
          </button>
        </div>
      </div>
    </div>
  );
}

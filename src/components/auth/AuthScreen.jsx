import { useState, useCallback } from 'react';
import useDesignScale from '../../hooks/useDesignScale';
import LoginShowcase from './LoginShowcase';
import EmailLoginCard from './EmailLoginCard';
import OtpVerificationCard from './OtpVerificationCard';
import VerifiedModal from './VerifiedModal';

// Shared login for customers and admin staff
// (Figma 71:1595, 71:1632, 71:1669 → 71:1706, 71:1733 → 71:2416).
export default function AuthScreen({ onAuthenticated, onBackToHome }) {
  const { isDesktop, scale, width, height } = useDesignScale();
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [session, setSession] = useState(null);

  const handleDone = useCallback(() => onAuthenticated(session), [onAuthenticated, session]);

  return (
    <div
      className="relative flex bg-[#f5f5f5] font-['Manrope',sans-serif] text-[#111] overflow-x-hidden overflow-y-auto"
      style={isDesktop ? { zoom: scale, width, height } : { minHeight: '100dvh' }}
      data-node-id="71:1595"
    >
      {isDesktop && step === 'email' && <LoginShowcase />}

      <div className="flex-1 min-w-0 flex items-center justify-center p-[16px]">
        {step === 'email' ? (
          <EmailLoginCard
            initialEmail={email}
            onCodeSent={(value) => {
              setEmail(value);
              setStep('otp');
            }}
            onBackToHome={onBackToHome}
          />
        ) : (
          <OtpVerificationCard email={email} onVerified={setSession} onBackToHome={onBackToHome} />
        )}
      </div>

      {session && <VerifiedModal onDone={handleDone} />}
    </div>
  );
}

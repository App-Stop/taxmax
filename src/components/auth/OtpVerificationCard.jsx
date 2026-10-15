import { useState, useEffect, useRef } from 'react';
import { sendCode, verifyCode, OTP_LENGTH, RESEND_SECONDS } from '../../services/auth';

const imgLogo = "/figma/auth/logo.svg";
const imgArrowRight = "/figma/auth/arrow-right.svg";

export default function OtpVerificationCard({ email, accountType, onVerified, onChangeEmail, onBackToHome }) {
  const [digits, setDigits] = useState(() => Array(OTP_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const inputsRef = useRef([]);

  const code = digits.join('');
  const canSubmit = code.length === OTP_LENGTH && !verifying;

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  const focusInput = (index) => {
    inputsRef.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))]?.focus();
  };

  // Writes one or more digits starting at `index` (covers typing, paste and SMS autofill).
  const fillFrom = (index, value) => {
    const incoming = value.replace(/\D/g, '').slice(0, OTP_LENGTH - index);
    if (!incoming) return;
    const next = [...digits];
    [...incoming].forEach((digit, i) => {
      next[index + i] = digit;
    });
    setDigits(next);
    setError('');
    focusInput(index + incoming.length);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const target = digits[index] ? index : index - 1;
      if (target < 0) return;
      const next = [...digits];
      next[target] = '';
      setDigits(next);
      setError('');
      focusInput(target);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusInput(index + 1);
    }
  };

  const handleResend = async () => {
    setSecondsLeft(RESEND_SECONDS);
    setDigits(Array(OTP_LENGTH).fill(''));
    setError('');
    focusInput(0);
    try {
      await sendCode(email, accountType);
    } catch (err) {
      setError(err.message);
      // A 429 means the server's cooldown is still running; anything else can be retried now.
      if (err.status !== 429) setSecondsLeft(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setVerifying(true);
    setError('');
    try {
      onVerified(await verifyCode(email, code, accountType));
    } catch (err) {
      setError(err.message);
      setVerifying(false);
      setDigits(Array(OTP_LENGTH).fill(''));
      focusInput(0);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-[0px_10px_50px_rgba(0,0,0,0.1)] flex flex-col gap-[40px] items-center p-[24px] sm:p-[40px] rounded-[20px] w-[500px] max-w-full"
      data-node-id="71:1707"
    >
      <button type="button" onClick={onBackToHome} className="h-[38.107px] relative shrink-0 w-[159px] cursor-pointer" aria-label="TAXMAX home" data-node-id="71:1708">
        <img alt="TAXMAX" className="absolute block inset-0 max-w-none size-full" src={imgLogo} />
      </button>

      <div className="flex flex-col gap-[10px] items-start justify-center w-full" data-node-id="71:1717">
        <h1 className="font-extrabold leading-[36px] text-[32px] text-[#111] tracking-[-0.32px] w-full" data-node-id="71:1718">
          Verification
        </h1>
        <p className="font-normal leading-[normal] text-[16px] text-[#444] w-full" data-node-id="71:1719">
          Enter the {OTP_LENGTH} digit code sent to your email
          <br />
          <span className="[word-break:break-word]">{email}</span>
          {accountType === 'team' && <span className="text-[#6a6a6a]"> · Team login</span>}
        </p>
        <button
          type="button"
          onClick={onChangeEmail}
          disabled={verifying}
          className="font-semibold leading-[normal] text-[14px] text-[#0094c5] cursor-pointer hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Change email or account type
        </button>
      </div>

      <div className="relative w-full">
        <div className="flex gap-[10px] items-start w-full" data-node-id="71:1720">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              autoFocus={i === 0}
              aria-label={`Digit ${i + 1}`}
              value={digit}
              placeholder="_"
              onChange={(e) => fillFrom(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={(e) => {
                e.preventDefault();
                fillFrom(i, e.clipboardData.getData('text'));
              }}
              onFocus={(e) => e.target.select()}
              className={`bg-white border border-solid flex-[1_0_0] h-[90px] min-w-px px-[16px] py-[24px] rounded-[20px] font-semibold leading-[normal] text-[24px] text-[#111] text-center placeholder:text-[#b6b6b6] outline-none transition-colors focus:border-[#0094c5] ${error ? 'border-red-500' : 'border-[#dcdcdc]'}`}
            />
          ))}
        </div>
        {error && (
          <p className="absolute left-0 top-full mt-[10px] w-full text-center font-normal leading-[normal] text-[12px] text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>

      {secondsLeft > 0 ? (
        <p className="font-normal leading-[normal] text-[16px] text-[#b6b6b6] text-center max-w-full w-[370px] whitespace-pre-wrap" data-node-id="71:1729">
          {'Resend code   '}
          <span className="font-semibold text-[#111]">{secondsLeft}s</span>
        </p>
      ) : (
        <button type="button" onClick={handleResend} className="font-semibold leading-[normal] text-[16px] text-[#111] text-center max-w-full w-[370px] cursor-pointer hover:text-[#0094c5] transition-colors" data-node-id="71:1756">
          Resend code
        </button>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="bg-[#0094c5] flex gap-[8px] h-[56px] items-center justify-center p-[12px] rounded-[100px] shrink-0 w-full font-bold leading-[normal] text-[16px] text-white whitespace-nowrap cursor-pointer transition-[opacity,background-color] hover:bg-[#0082ad] disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-[#0094c5]"
        data-node-id="71:1757"
      >
        <span>{verifying ? 'Verifying…' : 'Verify'}</span>
        <span className="relative shrink-0 size-[24px]" data-node-id="71:1759">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowRight} />
        </span>
      </button>
    </form>
  );
}

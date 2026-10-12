import { useState } from 'react';
import { sendCode, PHONE_LENGTH } from '../../services/auth';

const imgLogo = "/figma/auth/logo.svg";

// Keeps the 10 national digits. US area codes never start with 1, so a leading 1
// is the country code being typed or pasted again.
const toDigits = (value) => value.replace(/\D/g, '').replace(/^1+/, '').slice(0, PHONE_LENGTH);

export default function PhoneLoginCard({ initialPhone, onCodeSent, onBackToHome }) {
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const canSubmit = phone.length === PHONE_LENGTH && !sending;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSending(true);
    setError('');
    try {
      await sendCode(phone);
      onCodeSent(phone);
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-[0px_10px_50px_rgba(0,0,0,0.1)] flex flex-col gap-[40px] items-center p-[24px] sm:p-[40px] rounded-[20px] w-[500px] max-w-full"
      data-node-id="71:1607"
    >
      <button type="button" onClick={onBackToHome} className="h-[38.107px] relative shrink-0 w-[159px] cursor-pointer" aria-label="TAXMAX home" data-node-id="71:1608">
        <img alt="TAXMAX" className="absolute block inset-0 max-w-none size-full" src={imgLogo} />
      </button>

      <div className="flex flex-col gap-[10px] items-start justify-center w-full" data-node-id="71:1617">
        <h1 className="font-extrabold leading-[normal] text-[32px] text-[#111] tracking-[-0.32px] w-full" data-node-id="71:1618">
          Your files,
          <br />
          in good order
        </h1>
        <p className="font-normal leading-[normal] text-[16px] text-[#444] w-full" data-node-id="71:1619">
          Log in to keep every tax document and filing update accounted for.
        </p>
      </div>

      <div className="flex flex-col gap-[20px] items-start w-full" data-node-id="71:1620">
        <div className="flex flex-col gap-[10px] items-start w-full" data-node-id="71:1621">
          <label htmlFor="login-phone" className="font-normal leading-[normal] text-[16px] text-[#111] w-full" data-node-id="71:1622">
            Phone number
          </label>
          <div className="flex gap-[10px] items-start w-full" data-node-id="71:1623">
            <div className="bg-[#f5f5f5] flex font-medium gap-[8px] h-[54px] items-center leading-[normal] p-[16px] rounded-[20px] shrink-0 text-[16px] text-[#111] whitespace-nowrap" data-node-id="71:1624">
              <span>🇺🇸</span>
              <span>US +1</span>
            </div>
            <input
              id="login-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              autoFocus
              value={phone}
              onChange={(e) => {
                setPhone(toDigits(e.target.value));
                setError('');
              }}
              placeholder="+1 213 123412312"
              className={`bg-white border border-solid flex-[1_0_0] h-[54px] min-w-px p-[16px] rounded-[20px] font-medium leading-[normal] text-[16px] text-[#111] placeholder:text-[#b6b6b6] outline-none transition-colors focus:border-[#0094c5] ${error ? 'border-red-500' : 'border-[#dcdcdc]'}`}
              data-node-id="71:1627"
            />
          </div>
        </div>
        <p className={`font-normal min-h-[18px] leading-[normal] text-[12px] max-w-full w-[354px] ${error ? 'text-red-600' : 'text-[#444]'}`} role={error ? 'alert' : undefined} data-node-id="71:1629">
          {error || 'A private login code, sent by text. No password.'}
        </p>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="bg-[#0094c5] flex h-[56px] items-center justify-center p-[12px] rounded-[100px] shrink-0 w-full font-bold leading-[normal] text-[16px] text-white whitespace-nowrap cursor-pointer transition-[opacity,background-color] hover:bg-[#0082ad] disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-[#0094c5]"
        data-node-id="71:1630"
      >
        {sending ? 'Sending…' : 'Send code'}
      </button>
    </form>
  );
}

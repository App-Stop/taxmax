import { useState } from 'react';
import { sendCode, isValidEmail, ACCOUNT_TYPES } from '../../services/auth';

const imgLogo = "/figma/auth/logo.svg";

function AccountTypeTabs({ value, onChange, disabled }) {
  return (
    <div role="tablist" aria-label="Log in as" className="bg-[#e8e8e8] flex items-center p-[2px] rounded-[30px] w-full">
      {ACCOUNT_TYPES.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(t.id)}
            className={`flex-1 px-[20px] py-[8px] rounded-[20px] leading-[24px] text-[14px] text-[#111] text-center whitespace-nowrap cursor-pointer transition-colors disabled:cursor-not-allowed ${active ? 'bg-white font-semibold drop-shadow-[0px_2px_2px_rgba(0,0,0,0.1)]' : 'font-normal hover:bg-white/50'}`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export default function EmailLoginCard({ initialEmail, accountType, onAccountTypeChange, onCodeSent, onBackToHome }) {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const canSubmit = isValidEmail(email) && !sending;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSending(true);
    setError('');
    try {
      const address = email.trim();
      await sendCode(address, accountType);
      onCodeSent(address);
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
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
        <AccountTypeTabs
          value={accountType}
          disabled={sending}
          onChange={(type) => {
            onAccountTypeChange(type);
            setError('');
          }}
        />
        <div className="flex flex-col gap-[10px] items-start w-full" data-node-id="71:1621">
          <label htmlFor="login-email" className="font-normal leading-[normal] text-[16px] text-[#111] w-full" data-node-id="71:1622">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="you@example.com"
            className={`bg-white border border-solid h-[54px] p-[16px] rounded-[20px] w-full font-medium leading-[normal] text-[16px] text-[#111] placeholder:text-[#b6b6b6] outline-none transition-colors focus:border-[#0094c5] ${error ? 'border-red-500' : 'border-[#dcdcdc]'}`}
            data-node-id="71:1627"
          />
        </div>
        <p className={`font-normal min-h-[18px] leading-[normal] text-[12px] max-w-full w-[354px] ${error ? 'text-red-600' : 'text-[#444]'}`} role={error ? 'alert' : undefined} data-node-id="71:1629">
          {error || (accountType === 'team' ? 'For TaxMax staff and admins. A private login code, sent by email.' : 'A private login code, sent by email. No password.')}
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

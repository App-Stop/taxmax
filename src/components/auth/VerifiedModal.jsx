import { useEffect } from 'react';

const imgBadge = "/figma/auth/verified-badge.png";

const DISMISS_MS = 1600;

export default function VerifiedModal({ onDone }) {
  useEffect(() => {
    const id = setTimeout(onDone, DISMISS_MS);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-[16px] animate-auth-fade-in" role="status">
      <div className="bg-white flex flex-col gap-[10px] items-center overflow-clip p-[20px] rounded-[20px] shadow-[0px_0px_40px_0px_rgba(0,0,0,0.16)] w-[268px]" data-node-id="71:2416">
        <div className="h-[120px] relative shrink-0 w-[121px]" data-node-id="71:2417">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgBadge} />
        </div>
        <p className="font-bold leading-[normal] text-[20px] text-[#111] text-center tracking-[-0.2px] w-full" data-node-id="71:2419">
          Verification Success
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { initialsOf } from './dashboardData';

const imgSignOut = "/figma/dashboard/sign-out.svg";

const maskSsn = (ssn) => `**-**-${(ssn || '').replace(/\D/g, '').slice(-4) || '8492'}`;

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-[16px] items-center justify-between p-[16px] shrink-0 w-full">
      <p className="font-normal leading-[normal] text-[14px] text-[#444] whitespace-nowrap">{label}</p>
      <p className="font-semibold leading-[normal] text-[14px] text-[#111] text-right">{value}</p>
    </div>
  );
}

// Profile (Node 71:2377)
export default function ProfileView({ user, onLogout }) {
  const [pushEnabled, setPushEnabled] = useState(true);

  return (
    <div className="flex justify-center px-[16px] lg:pl-0 lg:pr-[60px] pt-[8px] lg:pt-[80px] pb-[60px] lg:pb-[80px]">
      <div className="bg-[rgba(255,255,255,0.6)] border border-[#f5f5f5] border-solid flex flex-col items-center overflow-clip rounded-[20px] shadow-[0px_0px_60px_0px_rgba(0,101,131,0.1)] w-full max-w-[664px] lg:w-[664px]" data-node-id="71:2377">
        <div className="flex flex-col gap-[16px] items-center px-[24px] py-[40px] shrink-0 w-full" data-node-id="71:2378">
          <div className="bg-[rgba(0,148,197,0.1)] flex flex-col items-center justify-center rounded-[100px] shrink-0 size-[80px]">
            <p className="font-extrabold leading-[normal] text-[20px] text-[#0094c5] text-center whitespace-nowrap">{initialsOf(user)}</p>
          </div>
          <div className="flex flex-col gap-[10px] items-center shrink-0 max-w-full">
            <div className="flex flex-col gap-[4px] items-center leading-[normal] text-center max-w-full">
              <p className="font-bold text-[20px] text-[#111]">{user?.fullName}</p>
              <p className="font-normal text-[14px] text-[#444] [word-break:break-word]">{user?.email}</p>
            </div>
            <div className="bg-[#f5f5f5] border border-[#e8e8e8] border-solid flex items-start px-[10px] py-[4px] rounded-[100px] shrink-0">
              <p className="font-medium leading-[normal] text-[10px] text-[#6a6a6a] text-center tracking-[0.1px] whitespace-nowrap">
                Taxpayer ID: {user?.filingId}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-[24px] items-start p-[20px] sm:p-[40px] shrink-0 w-full" data-node-id="71:2387">
          <div className="flex flex-col gap-[12px] items-start w-full" data-node-id="71:2388">
            <p className="font-semibold leading-[normal] text-[16px] text-[#111] whitespace-nowrap">Personal Information</p>
            <div className="bg-white border border-[#e8e8e8] border-solid flex flex-col items-start overflow-clip rounded-[20px] shrink-0 w-full">
              <InfoRow label="Social Security" value={maskSsn(user?.ssn)} />
              <InfoRow label="Phone Number" value={user?.phone} />
              <InfoRow label="Filing Status" value={user?.status} />
            </div>
          </div>

          <div className="flex flex-col gap-[12px] items-start w-full" data-node-id="71:2403">
            <p className="font-semibold leading-[normal] text-[16px] text-[#111] whitespace-nowrap">Preferences</p>
            <div className="bg-white border border-[#e8e8e8] border-solid flex flex-col items-start overflow-clip rounded-[20px] shrink-0 w-full">
              <div className="flex items-center justify-between p-[16px] shrink-0 w-full">
                <div className="flex flex-col gap-[6px] items-start justify-center shrink-0">
                  <p className="font-medium leading-[normal] text-[14px] text-[#111] whitespace-nowrap">Push Notifications</p>
                  <p className="font-normal leading-[normal] text-[12px] text-[#6a6a6a] whitespace-nowrap">IRS status changes &amp; messages</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={pushEnabled}
                  aria-label="Push Notifications"
                  onClick={() => setPushEnabled(!pushEnabled)}
                  className={`border border-[rgba(255,255,255,0.1)] border-solid cursor-pointer flex flex-col h-[26px] items-start justify-center p-[4px] rounded-[100px] shrink-0 w-[44px] transition-colors ${pushEnabled ? 'bg-[#0094c5]' : 'bg-[#cfcfcf]'}`}
                  data-node-id="71:2412"
                >
                  <span className={`bg-white rounded-[100px] shrink-0 size-[18px] transition-transform ${pushEnabled ? 'translate-x-[18px]' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="bg-[#ffecec] hover:bg-[#ffdede] transition-colors cursor-pointer flex gap-[12px] items-center justify-center px-[16px] py-[12px] rounded-[30px] shrink-0 w-full"
            data-node-id="71:2413"
          >
            <span className="relative shrink-0 size-[24px]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSignOut} />
            </span>
            <span className="font-bold leading-[normal] text-[15px] text-[#ea0101] text-left whitespace-nowrap">Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

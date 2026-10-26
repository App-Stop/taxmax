import { DOC_STATUS } from './dashboardData';

export default function DocumentThumb({ doc, className }) {
  return (
    <div className={`relative shrink-0 ${className}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className={`absolute max-w-none ${doc.crop}`} src={doc.thumb} />
      </div>
    </div>
  );
}

export function DocumentStatus({ status, icon }) {
  const meta = DOC_STATUS[status];
  return (
    <div className="flex gap-[6px] items-center shrink-0">
      {icon || meta.icon ? (
        <div className="relative shrink-0 size-[16px]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={icon || meta.icon} />
        </div>
      ) : (
        <svg className={`shrink-0 size-[16px] ${meta.color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )}
      <p className={`font-semibold leading-[normal] text-[12px] text-left whitespace-nowrap ${meta.color}`}>
        {meta.label}
      </p>
    </div>
  );
}

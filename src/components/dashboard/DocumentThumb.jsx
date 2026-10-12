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
      <div className="relative shrink-0 size-[16px]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={icon || meta.icon} />
      </div>
      <p className={`font-semibold leading-[normal] text-[12px] text-left whitespace-nowrap ${meta.color}`}>
        {meta.label}
      </p>
    </div>
  );
}

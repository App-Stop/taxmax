import { useState, useRef, useEffect } from 'react';
import { statusById, initialsOf } from './adminData';

const A = '/figma/admin';

export function Icon({ src, size = 24, className = '' }) {
  return (
    <span className={`relative block shrink-0 ${className}`} style={{ width: size, height: size }}>
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={src} />
    </span>
  );
}

export function StatusBadge({ status }) {
  const s = statusById(status);
  return (
    <span className={`${s.bg} inline-flex items-center justify-center px-[6px] py-[4px] rounded-[20px] shrink-0`}>
      <span className={`font-medium leading-[normal] text-[12px] text-center whitespace-nowrap ${s.text}`}>{s.label}</span>
    </span>
  );
}

// Grey initials circle used for clients and staff without a photo.
export function Avatar({ name, photo, size = 32, className = '', textClassName = '' }) {
  if (photo) {
    return (
      <span className={`block relative shrink-0 rounded-[200px] ${className}`} style={{ width: size, height: size }}>
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[200px] size-full" src={photo} />
      </span>
    );
  }
  return (
    <span
      className={`bg-[#e8e8e8] flex items-center justify-center rounded-[200px] shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <span className={`font-medium leading-[18px] overflow-hidden text-[12px] text-[#6a6a6a] text-ellipsis whitespace-nowrap ${textClassName}`}>
        {initialsOf(name)}
      </span>
    </span>
  );
}

function useDismiss(open, onClose) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
  return ref;
}

// Pop-over list shared by dropdowns and row "more" menus.
export function Popover({ trigger, items, align = 'left', className = '' }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const ref = useDismiss(open, close);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div
          role="menu"
          className={`absolute top-full mt-[6px] z-30 min-w-full bg-white border border-[#e8e8e8] rounded-[12px] shadow-[0px_10px_30px_rgba(0,0,0,0.1)] py-[6px] ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                close();
                item.onSelect();
              }}
              className={`block w-full text-left px-[14px] py-[8px] text-[14px] leading-[normal] whitespace-nowrap cursor-pointer hover:bg-[#f5f5f5] ${item.active ? 'font-semibold text-[#0094c5]' : `font-normal ${item.danger ? 'text-[#ea0101]' : 'text-[#111]'}`}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Pill select. `variant` picks one of the button styles used across the admin screens.
const DROPDOWN_VARIANTS = {
  // Dashboard chart range (Node 87:1694)
  soft: {
    button: 'bg-[#f5f5f5] gap-[4px] px-[12px] py-[8px] rounded-[100px]',
    label: 'font-medium leading-[16px] px-[2px] text-[12px]',
    caret: `${A}/chevron-down.svg`,
  },
  // Filter pills (Node 87:1981)
  outline: {
    button: 'bg-white border border-[#e8e8e8] border-solid gap-[8px] px-[14px] py-[10px] rounded-[30px]',
    label: 'font-normal leading-[24px] min-w-[30px] text-[14px] text-center',
    caret: `${A}/caret-down.svg`,
  },
  // Document status (Node 87:2441)
  outlineLarge: {
    button: 'bg-white border border-[#e8e8e8] border-solid gap-[8px] px-[14px] py-[10px] rounded-[30px]',
    label: 'font-medium leading-[24px] min-w-[30px] text-[16px] text-center',
    caret: `${A}/caret-down.svg`,
  },
  // Client submissions sort (Node 87:2791)
  compact: {
    button: 'bg-white border border-[#e8e8e8] border-solid gap-[8px] pl-[14px] pr-[10px] py-[8px] rounded-[30px]',
    label: 'font-normal leading-[normal] min-w-[30px] text-[14px] text-center',
    caret: `${A}/caret-down.svg`,
  },
};

export function Dropdown({ value, options, onChange, label, variant = 'outline', align = 'left', menuAlign }) {
  const v = DROPDOWN_VARIANTS[variant];
  const current = options.find((o) => o.value === value);
  return (
    <Popover
      align={menuAlign || align}
      className="shrink-0"
      items={options.map((o) => ({ key: o.value, label: o.label, active: o.value === value, onSelect: () => onChange(o.value) }))}
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          className={`flex items-center justify-center overflow-clip shrink-0 cursor-pointer hover:bg-[#fafafa] transition-colors ${v.button}`}
        >
          <span className={`text-[#111] whitespace-nowrap ${v.label}`}>{label || current?.label}</span>
          <Icon src={v.caret} size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      )}
    />
  );
}

export function SearchField({ value, onChange, placeholder, className = 'w-[260px]', onSubmit }) {
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className={`border border-[#cfcfcf] border-solid flex gap-[8px] items-center overflow-clip pl-[14px] pr-[24px] py-[10px] rounded-[30px] shrink-0 focus-within:border-[#0094c5] transition-colors ${className}`}
    >
      <Icon src={`${A}/magnifying-glass-20.svg`} size={20} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="flex-1 min-w-0 bg-transparent outline-none font-normal leading-[24px] text-[14px] text-[#111] placeholder:text-[#6a6a6a]"
      />
    </form>
  );
}

// "Export"/"Print" pill (Node 87:1962). `tone="soft"` is the grey variant used in the document header.
export function PillButton({ icon, children, onClick, tone = 'outline', compact = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex gap-[8px] items-center justify-center px-[16px] ${compact ? 'py-[6px]' : 'py-[10px]'} rounded-[100px] shrink-0 cursor-pointer transition-colors ${tone === 'soft' ? 'bg-[#f5f5f5] hover:bg-[#ececec]' : 'bg-white border border-[#e8e8e8] border-solid hover:bg-[#fafafa]'}`}
    >
      <Icon src={icon} size={20} />
      <span className="font-['DM_Sans',sans-serif] font-medium leading-[normal] text-[14px] text-[#111] whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
        {children}
      </span>
    </button>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap gap-[10px] items-center w-full">
      <div className="flex flex-[1_0_0] flex-col gap-[10px] items-start min-w-[240px] [word-break:break-word]">
        <h1 className="font-bold leading-[36px] text-[28px] sm:text-[32px] text-[#111] tracking-[-0.32px]">{title}</h1>
        <p className="font-normal leading-[normal] text-[16px] text-[#444]">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function Pagination({ page, pageCount, onChange }) {
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  const start = Math.min(Math.max(1, page - 2), Math.max(1, pageCount - 4));
  const visible = pages.slice(start - 1, start + 4);
  const arrow = 'flex items-center justify-center rounded-[20px] shrink-0 size-[44px] cursor-pointer disabled:opacity-40 disabled:cursor-default enabled:hover:bg-white/60';

  return (
    <nav aria-label="Pagination" className="flex h-[44px] items-center justify-center overflow-clip rounded-[30px] shrink-0">
      <button type="button" className={arrow} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <Icon src={`${A}/caret-left.svg`} size={16} />
      </button>
      {visible.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-current={n === page ? 'page' : undefined}
          className={`flex items-center justify-center shrink-0 size-[44px] cursor-pointer leading-[24px] text-[14px] text-[#111] text-center ${n === page ? 'bg-white border border-[#e8e8e8] border-solid rounded-[30px] font-semibold' : 'rounded-[20px] font-normal hover:bg-white/60'}`}
        >
          {n}
        </button>
      ))}
      <button type="button" className={arrow} disabled={page >= pageCount} onClick={() => onChange(page + 1)} aria-label="Next page">
        <Icon src={`${A}/caret-left.svg`} size={16} className="-scale-x-100" />
      </button>
    </nav>
  );
}

// Table checkbox: the Square icon (Node 87:1990) when unchecked.
export function Checkbox({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className="relative shrink-0 size-[24px] cursor-pointer"
    >
      {checked ? (
        <span className="absolute inset-[3px] bg-[#0094c5] rounded-[4px] flex items-center justify-center">
          <img alt="" className="block max-w-none" src={`${A}/check-white.svg`} width="18" height="18" />
        </span>
      ) : (
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={`${A}/checkbox-square.svg`} />
      )}
    </button>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return (
    <div role="status" className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-50 bg-[#111] text-white text-[14px] font-medium px-[18px] py-[12px] rounded-[100px] shadow-[0px_10px_30px_rgba(0,0,0,0.2)] animate-auth-fade-in">
      {message}
    </div>
  );
}

const tableHeaderCell = 'flex gap-[4px] h-[48px] items-center pl-[14px] pr-[10px] font-semibold leading-[normal] text-[12px] text-[#6a6a6a] tracking-[0.24px] uppercase whitespace-nowrap';

export function SortHeader({ label, direction, onToggle }) {
  return (
    <button type="button" onClick={onToggle} className={`${tableHeaderCell} cursor-pointer`} aria-label={`Sort by ${label}`}>
      {label}
      <Icon src={`${A}/caret-up-down.svg`} size={16} className={`-scale-y-100 rotate-180 transition-opacity ${direction ? 'opacity-100' : 'opacity-70'}`} />
    </button>
  );
}

export function RowMenu({ items }) {
  return (
    <Popover
      align="right"
      items={items}
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          aria-label="More actions"
          className="flex items-center justify-center rounded-[100px] size-[36px] cursor-pointer hover:bg-[#f5f5f5]"
        >
          <Icon src={`${A}/dots-three.svg`} />
        </button>
      )}
    />
  );
}

// Settings toggle (Node 87:3541)
export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`flex flex-col h-[26px] justify-center p-[4px] rounded-[100px] shrink-0 w-[44px] cursor-pointer border border-solid transition-colors ${checked ? 'bg-[#0094c5] border-[rgba(255,255,255,0.1)] items-end' : 'bg-white border-[#e8e8e8] items-start'}`}
    >
      <span className={`block rounded-[100px] shrink-0 size-[18px] ${checked ? 'bg-white' : 'bg-[#848484]'}`} />
    </button>
  );
}

// Centered dialog (Nodes 87:3961, 87:1880). Closes on backdrop click and Escape.
export function Modal({ width, onClose, labelledBy, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto bg-[rgba(0,0,0,0.6)] p-[16px] animate-auth-fade-in" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="bg-white flex flex-col gap-[20px] items-start overflow-clip rounded-[20px] shadow-[0px_6px_250px_0px_rgba(0,0,0,0.4)] w-full my-auto"
        style={{ maxWidth: width }}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ id, title, subtitle }) {
  return (
    <div className="border-[#e8e8e8] border-b border-solid flex flex-col gap-[7px] items-start justify-center leading-[normal] p-[16px] shrink-0 w-full text-[#111]">
      <h2 id={id} className="font-bold text-[16px] w-full">{title}</h2>
      {subtitle && <p className="font-medium text-[14px] w-full">{subtitle}</p>}
    </div>
  );
}

export const secondaryButton = 'bg-white border border-[#e8e8e8] border-solid flex items-center justify-center px-[24px] py-[12px] rounded-[100px] shrink-0 cursor-pointer hover:bg-[#fafafa] font-medium leading-[normal] text-[16px] text-[#111] whitespace-nowrap';
export const primaryButton = 'bg-[#0094c5] flex gap-[8px] items-center justify-center px-[24px] py-[12px] rounded-[100px] shrink-0 cursor-pointer hover:bg-[#0082ad] transition-colors disabled:opacity-60 disabled:cursor-default font-bold leading-[normal] text-[16px] text-white whitespace-nowrap';

export const fieldBoxClass = 'bg-white border border-[#dcdcdc] border-solid flex items-center justify-between gap-[10px] overflow-clip p-[12px] rounded-[10px] w-full font-medium leading-[normal] text-[14px] text-[#111]';

export function FieldLabel({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="font-normal leading-[normal] text-[14px] text-[#111] w-full">
      {children}
    </label>
  );
}

export function TextField({ id, label, value, onChange, type = 'text', placeholder, required }) {
  return (
    <div className="flex flex-col gap-[10px] items-start w-full">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldBoxClass} outline-none focus:border-[#0094c5] placeholder:text-[#848484] placeholder:font-normal`}
      />
    </div>
  );
}

// Full-width select styled like an input (Node 87:3445)
export function SelectField({ id, label, value, options, onChange }) {
  return (
    <div className="flex flex-col gap-[10px] items-start w-full min-w-0">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Popover
        className="w-full"
        items={options.map((o) => ({ key: o, label: o, active: o === value, onSelect: () => onChange(o) }))}
        trigger={({ open, toggle }) => (
          <button id={id} type="button" onClick={toggle} aria-haspopup="menu" aria-expanded={open} className={`${fieldBoxClass} cursor-pointer text-left`}>
            <span className="truncate">{value}</span>
            <Icon src={`${A}/caret-down.svg`} size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        )}
      />
    </div>
  );
}

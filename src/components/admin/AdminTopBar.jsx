import { useEffect, useRef, useState } from 'react';
import { Icon, Avatar, Popover, StatusBadge } from './ui';
import { formatDate } from './adminData';
import { localDay, mapDocument } from './adminApiMappers';
import { searchAll, MIN_SEARCH_LENGTH } from '../../services/search';
import useApiQuery from '../../hooks/useApiQuery';
import useDebouncedValue from '../../hooks/useDebouncedValue';

const A = '/figma/admin';

const resultButton = 'flex w-full gap-[10px] items-center px-[14px] py-[8px] text-left cursor-pointer hover:bg-[#f5f5f5] focus-visible:bg-[#f5f5f5] outline-none';

// Search as you type (GET /search): clients by name, submissions by ID or form type.
function GlobalSearch({ onOpenClient, onOpenDocument }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const term = useDebouncedValue(query.trim());
  const ready = term.length >= MIN_SEARCH_LENGTH;

  const { data, loading, error, reload } = useApiQuery(`global-search:${ready ? term : ''}`, () =>
    ready ? searchAll(term) : Promise.resolve(null),
  );

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (action) => {
    setOpen(false);
    setQuery('');
    action();
  };

  const clients = data?.clients || [];
  const documents = data?.documents || [];
  const settled = ready && !loading && data;

  return (
    <div ref={ref} className="relative hidden md:block shrink-0" data-node-id="87:1827">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="flex bg-white gap-[8px] items-center px-[16px] py-[14px] rounded-[60px] w-[360px]">
        <Icon src={`${A}/magnifying-glass.svg`} />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query && setOpen(true)}
          placeholder="Search clients, submissions, documents..."
          aria-label="Search clients, submissions, documents"
          aria-expanded={open}
          aria-controls="global-search-results"
          className="flex-1 min-w-0 bg-transparent outline-none font-normal leading-[normal] text-[14px] text-[#111] tracking-[0.14px] placeholder:text-[#444]"
        />
      </form>

      {open && query.trim() && (
        <div
          id="global-search-results"
          role="listbox"
          aria-busy={loading}
          className="absolute z-40 top-full mt-[6px] left-0 w-[460px] max-h-[420px] overflow-y-auto bg-white border border-[#e8e8e8] rounded-[16px] shadow-[0px_10px_30px_rgba(0,0,0,0.12)] py-[8px]"
        >
          {query.trim().length < MIN_SEARCH_LENGTH && <p className="px-[14px] py-[10px] text-[13px] text-[#6a6a6a]">Type at least {MIN_SEARCH_LENGTH} characters.</p>}
          {ready && loading && <p className="px-[14px] py-[10px] text-[13px] text-[#6a6a6a]" role="status">Searching…</p>}
          {ready && error && !loading && (
            <div role="alert" className="flex items-center justify-between gap-[10px] px-[14px] py-[10px]">
              <p className="text-[13px] font-medium text-[#ea0101]">{error.message}</p>
              <button type="button" onClick={reload} className="text-[13px] font-semibold text-[#0094c5] cursor-pointer hover:underline">Try again</button>
            </div>
          )}

          {settled && !error && clients.length > 0 && (
            <>
              <p className="px-[14px] pt-[6px] pb-[4px] text-[11px] font-semibold uppercase tracking-[0.4px] text-[#6a6a6a]">Clients</p>
              {clients.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  className={resultButton}
                  onClick={() => pick(() => onOpenClient({ id: c._id, name: c.fullName || c.email, email: c.email || '' }))}
                >
                  <Avatar name={c.fullName || c.email} size={28} />
                  <span className="flex flex-col min-w-0 leading-[normal]">
                    <span className="font-medium text-[14px] text-[#111] truncate">{c.fullName || 'Unnamed client'}</span>
                    <span className="text-[12px] text-[#6a6a6a] truncate">{c.email}</span>
                  </span>
                  {c.isActive === false && <StatusBadge status="non-active" />}
                </button>
              ))}
            </>
          )}

          {settled && !error && documents.length > 0 && (
            <>
              <p className="px-[14px] pt-[10px] pb-[4px] text-[11px] font-semibold uppercase tracking-[0.4px] text-[#6a6a6a]">Submissions</p>
              {documents.map((d) => (
                <button
                  key={d._id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  className={resultButton}
                  onClick={() =>
                    pick(() =>
                      onOpenDocument(mapDocument({
                        _id: d._id,
                        formType: d.documentType,
                        formLabel: d.documentTypeLabel,
                        submissionId: d.submissionId,
                        status: d.status,
                        submittedAt: d.submittedAt,
                        customer: { _id: d.client._id, fullName: d.client.fullName, email: d.client.email },
                      })),
                    )
                  }
                >
                  <span className="flex flex-col flex-1 min-w-0 leading-[normal]">
                    <span className="font-medium text-[14px] text-[#111] truncate">
                      {[d.submissionId, d.documentTypeLabel || d.documentType].filter(Boolean).join(' · ')}
                    </span>
                    <span className="text-[12px] text-[#6a6a6a] truncate">
                      {[d.client.fullName, d.submittedAt && formatDate(localDay(d.submittedAt))].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  <StatusBadge status={d.status} />
                </button>
              ))}
            </>
          )}

          {settled && !error && !clients.length && !documents.length && (
            <p className="px-[14px] py-[10px] text-[13px] text-[#6a6a6a]">No clients or submissions match “{term}”.</p>
          )}
        </div>
      )}
    </div>
  );
}

// Top bar (Node 87:1820): profile pill, global search, bell and info buttons.
export default function AdminTopBar({ profile, showSearch, onOpenClient, onOpenDocument, onOpenMenu, onLogout, onBackToHome }) {
  return (
    <div className="flex items-center justify-between gap-[10px] w-full" data-node-id="87:1820">
      <div className="flex gap-[10px] items-center min-w-0">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation"
          className="lg:hidden bg-white flex items-center p-[16px] rounded-[60px] shrink-0 cursor-pointer"
        >
          <img alt="" className="block max-w-none" src={`${A}/sidebar.svg`} width="20" height="20" />
        </button>

        <Popover
          items={[
            { key: 'home', label: 'Back to website', onSelect: onBackToHome },
            { key: 'logout', label: 'Log out', danger: true, onSelect: onLogout },
          ]}
          trigger={({ open, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-haspopup="menu"
              aria-expanded={open}
              className="bg-white flex gap-[10px] items-center pl-[4px] pr-[20px] py-[4px] rounded-[100px] shrink-0 cursor-pointer"
              data-node-id="87:1822"
            >
              <Avatar name={profile.name} photo={profile.photo} size={44} />
              <span className="flex flex-col items-start justify-center leading-[normal] whitespace-nowrap">
                <span className="font-semibold overflow-hidden text-[14px] text-[#111] text-ellipsis">{profile.name}</span>
                <span className="font-normal overflow-hidden text-[12px] text-[#6a6a6a] text-ellipsis">{profile.role}</span>
              </span>
            </button>
          )}
        />

        {showSearch && <GlobalSearch onOpenClient={onOpenClient} onOpenDocument={onOpenDocument} />}
      </div>

      <div className="flex gap-[10px] items-center shrink-0" data-node-id="87:1830">
        <button type="button" aria-label="Notifications" className="bg-white flex items-center p-[14px] rounded-[60px] shrink-0 cursor-pointer">
          <Icon src={`${A}/bell.svg`} />
        </button>
        <button type="button" aria-label="Help" className="bg-white flex items-center p-[14px] rounded-[60px] shrink-0 cursor-pointer">
          <Icon src={`${A}/info.svg`} />
        </button>
      </div>
    </div>
  );
}

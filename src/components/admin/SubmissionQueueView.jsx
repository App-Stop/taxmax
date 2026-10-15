import { useMemo, useState } from 'react';
import { Avatar, StatusBadge, Dropdown, SearchField, PillButton, PageHeader, Pagination, Checkbox, SortHeader, RowMenu } from './ui';
import { PAGE_SIZE, STATUSES, REFERENCE_DATE, formatDate, staffById, statusById, toCsv, downloadFile } from './adminData';

const A = '/figma/admin';

const TABS = [{ id: 'all', label: 'All' }, ...STATUSES.map(({ id, label }) => ({ id, label }))];

const RANGE_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

const COLUMNS = 'grid-cols-[40px_230px_150px_160px_170px_130px_minmax(150px,1fr)_60px]';
const headerCell = 'flex gap-[4px] h-[48px] items-center pl-[14px] pr-[10px] font-semibold leading-[normal] text-[12px] text-[#6a6a6a] tracking-[0.24px] uppercase whitespace-nowrap';

const withinRange = (iso, range) => {
  if (range === 'all') return true;
  const from = new Date(`${REFERENCE_DATE}T12:00:00`);
  from.setDate(from.getDate() - Number(range));
  return new Date(`${iso}T12:00:00`) >= from;
};

// Submission queue (Node 87:1921)
export default function SubmissionQueueView({ documents, clientsById, filters, onFiltersChange, onOpenDocument, onOpenClient, onMessageClient }) {
  const [selected, setSelected] = useState(() => new Set());
  const { status, range, query, page, sortDir } = filters;
  const update = (patch) => onFiltersChange({ ...filters, page: 1, ...patch });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = documents.filter((doc) => {
      const client = clientsById[doc.clientId];
      if (status !== 'all' && doc.status !== status) return false;
      if (!withinRange(doc.date, range)) return false;
      if (!q) return true;
      return [client.name, client.email, doc.submissionId, doc.type].some((v) => v.toLowerCase().includes(q));
    });
    if (sortDir) {
      const dir = sortDir === 'asc' ? 1 : -1;
      list.sort((a, b) => dir * clientsById[a.clientId].name.localeCompare(clientsById[b.clientId].name));
    }
    return list;
  }, [documents, clientsById, status, range, query, sortDir]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const pageRows = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const allOnPageSelected = pageRows.length > 0 && pageRows.every((d) => selected.has(d.id));

  const toggle = (id, on) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const togglePage = (on) =>
    setSelected((prev) => {
      const next = new Set(prev);
      pageRows.forEach((d) => (on ? next.add(d.id) : next.delete(d.id)));
      return next;
    });

  const exportCsv = () => {
    const picked = selected.size ? rows.filter((d) => selected.has(d.id)) : rows;
    downloadFile(
      'submissions.csv',
      toCsv([
        ['Client', 'Email', 'Submission ID', 'Document Type', 'Date Submitted', 'Status', 'Assigned'],
        ...picked.map((d) => {
          const c = clientsById[d.clientId];
          return [c.name, c.email, d.submissionId, d.type, `${formatDate(d.date)} ${d.time}`, statusById(d.status).label, staffById(d.assigneeId)?.name];
        }),
      ]),
    );
  };

  const first = rows.length ? (current - 1) * PAGE_SIZE + 1 : 0;
  const last = Math.min(current * PAGE_SIZE, rows.length);

  return (
    <div className="flex flex-col gap-[20px] items-start w-full" data-node-id="87:1957">
      <PageHeader
        title="Submission queue"
        subtitle="All client submissions sorted by date. Click a row to review."
        action={<PillButton icon={`${A}/download-simple.svg`} onClick={exportCsv}>{selected.size ? `Export (${selected.size})` : 'Export'}</PillButton>}
      />

      <div className="flex flex-col gap-[10px] items-start w-full" data-node-id="87:1965">
        <div className="flex flex-wrap gap-[10px] items-center justify-between w-full">
          <div className="flex flex-wrap gap-[10px] items-center">
            <div role="tablist" aria-label="Filter by status" className="bg-[#e8e8e8] flex flex-wrap items-center justify-center overflow-clip p-[2px] rounded-[30px] shrink-0" data-node-id="87:1968">
              {TABS.map((tab) => {
                const active = tab.id === status;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => update({ status: tab.id })}
                    className={`flex items-center justify-center min-w-[60px] px-[16px] py-[8px] rounded-[20px] shrink-0 cursor-pointer leading-[24px] text-[14px] text-[#111] text-center whitespace-nowrap transition-colors ${active ? 'bg-white drop-shadow-[0px_2px_2px_rgba(0,0,0,0.1)] font-semibold' : 'font-normal hover:bg-white/50'}`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <Dropdown value={range} options={RANGE_OPTIONS} onChange={(value) => update({ range: value })} />
          </div>
          <SearchField value={query} onChange={(value) => update({ query: value })} placeholder="Search by name, email or ID" />
        </div>

        <div className="bg-white overflow-x-auto rounded-[20px] w-full" data-node-id="87:1987">
          <div className="min-w-[1116px]" role="table" aria-label="Submissions">
            <div role="row" className={`grid ${COLUMNS} border-[#e8e8e8] border-b border-solid`}>
              <div role="columnheader" className="flex h-[48px] items-center justify-center pl-[14px] pr-[10px]">
                <Checkbox checked={allOnPageSelected} onChange={togglePage} label="Select all on page" />
              </div>
              <div role="columnheader">
                <SortHeader
                  label="Client"
                  direction={sortDir}
                  onToggle={() => onFiltersChange({ ...filters, sortDir: sortDir === 'asc' ? 'desc' : sortDir === 'desc' ? null : 'asc' })}
                />
              </div>
              {['Submission ID', 'Document Type', 'Date Submitted', 'Status', 'Assigned'].map((h) => (
                <div key={h} role="columnheader" className={headerCell}>{h}</div>
              ))}
              <div role="columnheader" />
            </div>

            {pageRows.map((doc) => {
              const client = clientsById[doc.clientId];
              const assignee = staffById(doc.assigneeId);
              return (
                <div
                  key={doc.id}
                  role="row"
                  tabIndex={0}
                  onClick={() => onOpenDocument(doc.id)}
                  onKeyDown={(e) => e.key === 'Enter' && onOpenDocument(doc.id)}
                  className={`grid ${COLUMNS} h-[73px] border-[#e8e8e8] border-b border-solid cursor-pointer transition-colors hover:bg-[#fafafa] focus-visible:outline-none focus-visible:bg-[rgba(0,148,197,0.05)] ${selected.has(doc.id) ? 'bg-[rgba(0,148,197,0.04)]' : ''}`}
                >
                  <div role="cell" className="flex items-center justify-center pl-[14px] pr-[10px]">
                    <Checkbox checked={selected.has(doc.id)} onChange={(on) => toggle(doc.id, on)} label={`Select ${client.name}`} />
                  </div>
                  <div role="cell" className="flex gap-[6px] items-center min-w-0 px-[14px]">
                    <Avatar name={client.name} />
                    <div className="flex flex-col gap-[2px] items-start justify-center leading-[normal] min-w-0 whitespace-nowrap">
                      <p className="font-medium max-w-full overflow-hidden text-[14px] text-[#111] text-ellipsis">{client.name}</p>
                      <p className="font-normal max-w-full overflow-hidden text-[12px] text-[#6a6a6a] text-ellipsis">{client.email}</p>
                    </div>
                  </div>
                  <div role="cell" className="flex items-center px-[16px] font-medium leading-[normal] text-[14px] text-[#111] whitespace-nowrap">{doc.submissionId}</div>
                  <div role="cell" className="flex items-center px-[16px] font-medium leading-[normal] text-[14px] text-[#111] whitespace-nowrap">{doc.type}</div>
                  <div role="cell" className="flex flex-col gap-[4px] items-start justify-center px-[16px] whitespace-nowrap">
                    <p className="font-medium leading-[24px] text-[14px] text-[#111]">{formatDate(doc.date)}</p>
                    <p className="font-normal leading-[normal] text-[12px] text-[#6a6a6a]">{doc.time}</p>
                  </div>
                  <div role="cell" className="flex items-center px-[16px]">
                    <StatusBadge status={doc.status} />
                  </div>
                  <div role="cell" className="flex gap-[6px] items-center min-w-0 px-[14px]">
                    <Avatar name={assignee.name} photo={assignee.photo} textClassName="font-['Geist',sans-serif]" />
                    <p className="font-medium leading-[24px] overflow-hidden text-[14px] text-[#111] text-ellipsis whitespace-nowrap">{assignee.name}</p>
                  </div>
                  <div role="cell" className="flex items-center justify-center px-[10px]">
                    <RowMenu
                      items={[
                        { key: 'review', label: 'Review document', onSelect: () => onOpenDocument(doc.id) },
                        { key: 'client', label: 'View client', onSelect: () => onOpenClient(client.id) },
                        { key: 'message', label: 'Message client', onSelect: () => onMessageClient(client.id) },
                      ]}
                    />
                  </div>
                </div>
              );
            })}

            {pageRows.length === 0 && (
              <div className="flex h-[200px] items-center justify-center text-[14px] text-[#6a6a6a]">No submissions match your filters.</div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-[10px] items-center justify-between w-full" data-node-id="87:2229">
          <p className="font-normal leading-[normal] text-[16px] text-[#444] whitespace-nowrap">
            Showing {first}-{last} of {rows.length} submissions
          </p>
          <Pagination page={current} pageCount={pageCount} onChange={(n) => onFiltersChange({ ...filters, page: n })} />
        </div>
      </div>
    </div>
  );
}

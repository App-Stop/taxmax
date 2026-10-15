import { useMemo } from 'react';
import { Avatar, StatusBadge, Dropdown, SearchField, PillButton, PageHeader, Pagination, SortHeader, RowMenu } from './ui';
import { PAGE_SIZE, STATUSES, formatDate, statusById, toCsv, downloadFile } from './adminData';

const A = '/figma/admin';

const STATUS_FILTERS = [{ value: 'all', label: 'All statuses' }, ...STATUSES.map(({ id, label }) => ({ value: id, label }))];
const COLUMNS = 'grid-cols-[230px_170px_150px_110px_100px_130px_170px_minmax(56px,1fr)]';
const headerCell = 'flex h-[48px] items-center pl-[14px] pr-[10px] font-semibold leading-[normal] text-[12px] text-[#6a6a6a] tracking-[0.24px] uppercase whitespace-nowrap';
const textCell = 'flex items-center px-[16px] font-medium leading-[normal] text-[14px] text-[#111] whitespace-nowrap';

// Client directory (Node 87:2446)
export default function ClientsDirectoryView({ clients, documents, filters, onFiltersChange, onOpenClient, onMessageClient }) {
  const { status, query, page, sortDir } = filters;
  const update = (patch) => onFiltersChange({ ...filters, page: 1, ...patch });

  const submissionCounts = useMemo(() => {
    const counts = {};
    documents.forEach((d) => {
      counts[d.clientId] = (counts[d.clientId] || 0) + 1;
    });
    return counts;
  }, [documents]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = clients.filter((c) => {
      if (status !== 'all' && c.status !== status) return false;
      if (!q) return true;
      return [c.name, c.email, c.phone].some((v) => v.toLowerCase().includes(q));
    });
    if (sortDir) {
      const dir = sortDir === 'asc' ? 1 : -1;
      list.sort((a, b) => dir * a.name.localeCompare(b.name));
    }
    return list;
  }, [clients, status, query, sortDir]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const pageRows = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const first = rows.length ? (current - 1) * PAGE_SIZE + 1 : 0;
  const last = Math.min(current * PAGE_SIZE, rows.length);

  const exportCsv = () =>
    downloadFile(
      'clients.csv',
      toCsv([
        ['Client', 'Email', 'Phone', 'SSN', 'Submissions', 'Tax Year', 'Status', 'Account Created'],
        ...rows.map((c) => [c.name, c.email, c.phone, c.ssn, submissionCounts[c.id] || 0, c.taxYear, statusById(c.status).label, formatDate(c.createdAt)]),
      ]),
    );

  return (
    <div className="flex flex-col gap-[20px] items-start w-full" data-node-id="87:2482">
      <PageHeader
        title="Client directory"
        subtitle="Manage client records, submissions, and internal notes"
        action={<PillButton icon={`${A}/download-simple.svg`} onClick={exportCsv}>Export</PillButton>}
      />

      <div className="flex flex-col gap-[10px] items-start w-full" data-node-id="87:2490">
        <div className="flex flex-wrap gap-[10px] items-center justify-between w-full">
          <Dropdown
            value={status}
            options={STATUS_FILTERS}
            onChange={(value) => update({ status: value })}
            label={status === 'all' ? 'Status' : statusById(status).label}
          />
          <SearchField value={query} onChange={(value) => update({ query: value })} placeholder="Search clients..." />
        </div>

        <div className="bg-white overflow-x-auto rounded-[20px] w-full" data-node-id="87:2498">
          <div className="min-w-[1116px]" role="table" aria-label="Clients">
            <div role="row" className={`grid ${COLUMNS} border-[#e8e8e8] border-b border-solid`}>
              <div role="columnheader">
                <SortHeader
                  label="Client"
                  direction={sortDir}
                  onToggle={() => onFiltersChange({ ...filters, sortDir: sortDir === 'asc' ? 'desc' : sortDir === 'desc' ? null : 'asc' })}
                />
              </div>
              {['phone', 'SSN', 'submission', 'Tax year', 'Status', 'account created'].map((h) => (
                <div key={h} role="columnheader" className={headerCell}>{h}</div>
              ))}
              <div role="columnheader" />
            </div>

            {pageRows.map((client) => (
              <div
                key={client.id}
                role="row"
                tabIndex={0}
                onClick={() => onOpenClient(client.id)}
                onKeyDown={(e) => e.key === 'Enter' && onOpenClient(client.id)}
                className={`grid ${COLUMNS} h-[73px] border-[#e8e8e8] border-b border-solid cursor-pointer transition-colors hover:bg-[#fafafa] focus-visible:outline-none focus-visible:bg-[rgba(0,148,197,0.05)]`}
              >
                <div role="cell" className="flex gap-[6px] items-center min-w-0 px-[14px]">
                  <Avatar name={client.name} />
                  <div className="flex flex-col gap-[2px] items-start justify-center leading-[normal] min-w-0 whitespace-nowrap">
                    <p className="font-medium max-w-full overflow-hidden text-[14px] text-[#111] text-ellipsis">{client.name}</p>
                    <p className="font-normal max-w-full overflow-hidden text-[12px] text-[#6a6a6a] text-ellipsis">{client.email}</p>
                  </div>
                </div>
                <div role="cell" className={textCell}>{client.phone}</div>
                <div role="cell" className={textCell}>{client.ssn}</div>
                <div role="cell" className={textCell}>{submissionCounts[client.id] || 0}</div>
                <div role="cell" className={textCell}>{client.taxYear}</div>
                <div role="cell" className="flex items-center px-[16px]">
                  <StatusBadge status={client.status} />
                </div>
                <div role="cell" className={textCell}>{formatDate(client.createdAt)}</div>
                <div role="cell" className="flex items-center justify-center px-[10px]">
                  <RowMenu
                    items={[
                      { key: 'view', label: 'View client', onSelect: () => onOpenClient(client.id) },
                      { key: 'message', label: 'Message client', onSelect: () => onMessageClient(client.id) },
                    ]}
                  />
                </div>
              </div>
            ))}

            {pageRows.length === 0 && (
              <div className="flex h-[200px] items-center justify-center text-[14px] text-[#6a6a6a]">No clients match your filters.</div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-[10px] items-center justify-between w-full" data-node-id="87:2713">
          <p className="font-normal leading-[normal] text-[16px] text-[#444] whitespace-nowrap">
            Showing {first}-{last} of {rows.length} clients
          </p>
          <Pagination page={current} pageCount={pageCount} onChange={(n) => onFiltersChange({ ...filters, page: n })} />
        </div>
      </div>
    </div>
  );
}

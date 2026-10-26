import { useMemo } from 'react';
import { Avatar, StatusBadge, Dropdown, SearchField, PillButton, PageHeader, Pagination, SortHeader, RowMenu, ListState } from './ui';
import { CLIENT_STATUSES, formatDate, statusById, toCsv, downloadFile } from './adminData';
import { mapDirectoryClient } from './adminApiMappers';
import { FIRST_PAGE, cursorFor, pageCountFor, goToPage } from './cursorPages';
import { listClientDirectory } from '../../services/dashboard';
import useApiQuery from '../../hooks/useApiQuery';
import useDebouncedValue from '../../hooks/useDebouncedValue';

const A = '/figma/admin';

const STATUS_FILTERS = [{ value: 'all', label: 'All statuses' }, ...CLIENT_STATUSES.map(({ id, label }) => ({ value: id, label }))];
const COLUMNS = 'grid-cols-[230px_170px_150px_110px_100px_130px_170px_minmax(56px,1fr)]';
const headerCell = 'flex h-[48px] items-center pl-[14px] pr-[10px] font-semibold leading-[normal] text-[12px] text-[#6a6a6a] tracking-[0.24px] uppercase whitespace-nowrap';
const textCell = 'flex items-center px-[16px] font-medium leading-[normal] text-[14px] text-[#111] whitespace-nowrap';

const dash = (value) => (value === null || value === undefined || value === '' ? '—' : value);

// Client directory (Node 87:2446). Status, search and paging run on the API; the sort
// only orders the loaded page.
export default function ClientsDirectoryView({ filters, onFiltersChange, onOpenClient, onMessageClient }) {
  const { status, query, page, sortDir } = filters;
  const update = (patch) => onFiltersChange({ ...filters, ...FIRST_PAGE, ...patch });
  const search = useDebouncedValue(query.trim());
  const cursor = cursorFor(filters);

  const { data, loading, error, reload } = useApiQuery(`clients:${status}:${search}:${cursor}`, () =>
    listClientDirectory({ status, search, cursor }),
  );

  const clients = useMemo(() => (data?.data || []).map(mapDirectoryClient), [data]);
  const hasMore = Boolean(data?.pagination?.hasMore);
  const pageSize = data?.pagination?.limit || 10;
  const pageCount = pageCountFor(filters, hasMore);

  const rows = useMemo(() => {
    const list = [...clients];
    if (sortDir) {
      const dir = sortDir === 'asc' ? 1 : -1;
      list.sort((a, b) => dir * a.name.localeCompare(b.name));
    }
    return list;
  }, [clients, sortDir]);

  const first = clients.length ? (page - 1) * pageSize + 1 : 0;
  const last = clients.length ? first + clients.length - 1 : 0;

  const exportCsv = () =>
    downloadFile(
      'clients.csv',
      toCsv([
        ['Client', 'Email', 'Phone', 'SSN', 'Submissions', 'Tax Year', 'Status', 'Account Created'],
        ...rows.map((c) => [
          c.name,
          c.email,
          c.phone,
          c.ssn,
          c.submissionCount ?? '',
          c.taxYear ?? '',
          statusById(c.status).label,
          c.createdAt ? formatDate(c.createdAt) : '',
        ]),
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
          <div className="min-w-[1116px]" role="table" aria-label="Clients" aria-busy={loading}>
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

            {!error && (
              <div className={`transition-opacity ${loading && data ? 'opacity-50' : ''}`}>
                {rows.map((client) => (
                  <div
                    key={client.id}
                    role="row"
                    tabIndex={0}
                    onClick={() => onOpenClient(client)}
                    onKeyDown={(e) => e.key === 'Enter' && onOpenClient(client)}
                    className={`grid ${COLUMNS} h-[73px] border-[#e8e8e8] border-b border-solid cursor-pointer transition-colors hover:bg-[#fafafa] focus-visible:outline-none focus-visible:bg-[rgba(0,148,197,0.05)]`}
                  >
                    <div role="cell" className="flex gap-[6px] items-center min-w-0 px-[14px]">
                      <Avatar name={client.name} />
                      <div className="flex flex-col gap-[2px] items-start justify-center leading-[normal] min-w-0 whitespace-nowrap">
                        <p className="font-medium max-w-full overflow-hidden text-[14px] text-[#111] text-ellipsis">{client.name}</p>
                        <p className="font-normal max-w-full overflow-hidden text-[12px] text-[#6a6a6a] text-ellipsis">{client.email}</p>
                      </div>
                    </div>
                    <div role="cell" className={textCell}>{dash(client.phone)}</div>
                    <div role="cell" className={textCell}>{dash(client.ssn)}</div>
                    <div role="cell" className={textCell}>{dash(client.submissionCount)}</div>
                    <div role="cell" className={textCell}>{dash(client.taxYear)}</div>
                    <div role="cell" className="flex items-center px-[16px]">
                      <StatusBadge status={client.status} />
                    </div>
                    <div role="cell" className={textCell}>{client.createdAt ? formatDate(client.createdAt) : '—'}</div>
                    <div role="cell" className="flex items-center justify-center px-[10px]">
                      <RowMenu
                        items={[
                          { key: 'view', label: 'View client', onSelect: () => onOpenClient(client) },
                          { key: 'message', label: 'Message client', onSelect: () => onMessageClient(client) },
                        ]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(error || rows.length === 0) && (
              <ListState
                loading={loading}
                error={error}
                onRetry={reload}
                empty={search || status !== 'all' ? 'No clients match your filters.' : 'No clients yet.'}
              />
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-[10px] items-center justify-between w-full" data-node-id="87:2713">
          <p className="font-normal leading-[normal] text-[16px] text-[#444] whitespace-nowrap">
            {clients.length ? `Showing ${first}-${last}${hasMore ? '' : ` of ${last}`} clients` : 'No clients'}
          </p>
          <Pagination
            page={page}
            pageCount={pageCount}
            // The next page's cursor comes from the loaded page, so wait for it to settle.
            onChange={(n) => !loading && onFiltersChange({ ...filters, ...goToPage(filters, n, data?.pagination?.nextCursor) })}
          />
        </div>
      </div>
    </div>
  );
}

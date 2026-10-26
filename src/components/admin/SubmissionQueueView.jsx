import { useMemo, useRef, useState } from 'react';
import { Avatar, StatusBadge, Dropdown, SearchField, PillButton, PageHeader, Pagination, Checkbox, SortHeader, RowMenu, ListState } from './ui';
import { DOCUMENT_STATUSES, formatDate, statusById, toCsv, downloadFile } from './adminData';
import { mapQueueRow } from './adminApiMappers';
import { FIRST_PAGE, cursorFor, pageCountFor, goToPage } from './cursorPages';
import SubmissionOptionsMenu from './SubmissionOptionsMenu';
import { listTeam, getDocument, setCustomerAssignees } from '../../services/team';
import { listSubmissionQueue } from '../../services/dashboard';
import useApiQuery from '../../hooks/useApiQuery';
import useDebouncedValue from '../../hooks/useDebouncedValue';

const A = '/figma/admin';

// The statuses the queue endpoint filters by. Uploaded, re-upload and completed documents
// are only listed under "All".
const QUEUE_STATUSES = ['in-review', 'action-needed', 'accepted', 'submitted', 'filed'];
const TABS = [{ id: 'all', label: 'All' }, ...DOCUMENT_STATUSES.filter(({ id }) => QUEUE_STATUSES.includes(id)).map(({ id, label }) => ({ id, label }))];

const RANGE_OPTIONS = [
  { value: 1, label: 'Yesterday' },
  { value: 7, label: 'Last 7 days' },
  { value: 14, label: 'Last 14 days' },
  { value: 21, label: 'Last 21 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 60, label: 'Last 60 days' },
];

const COLUMNS = 'grid-cols-[40px_230px_150px_160px_170px_130px_minmax(150px,1fr)_60px]';
const headerCell = 'flex gap-[4px] h-[48px] items-center pl-[14px] pr-[10px] font-semibold leading-[normal] text-[12px] text-[#6a6a6a] tracking-[0.24px] uppercase whitespace-nowrap';

// Assignee ids -> display, from the names the row carries (or the team list for admins).
function assigneeLabel(doc, namesById, currentUserId) {
  const ids = doc.assigneeIds;
  if (!ids.length) return null;
  const names = ids.map((id) => doc.assigneeNames?.[id] || namesById[id] || (id === currentUserId ? 'You' : null));
  const first = names.find(Boolean);
  if (!first) return `${ids.length} assigned`;
  return ids.length > 1 ? `${first} +${ids.length - 1}` : first;
}

const escapeHtml = (text) =>
  String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// There is no PDF endpoint: the document's pages open in a print window, where the browser
// saves them as a PDF. The window is opened before the request so popup blockers allow it.
async function exportDocumentPdf(doc) {
  const win = window.open('', '_blank');
  if (!win) throw new Error('Allow pop-ups for this site to export the PDF.');
  const title = escapeHtml(`${doc.title} - ${doc.client?.name || 'Client'}`);
  win.document.write(`<title>${title}</title><p style="font-family:sans-serif">Preparing PDF…</p>`);
  try {
    const data = await getDocument(doc.id);
    const pages = (data.pages || []).filter((page) => page.url);
    if (!pages.length) throw new Error('This document has no pages to export.');
    win.document.open();
    win.document.write(`<!doctype html><title>${title}</title>
      <style>@page{margin:0}body{margin:0}img{display:block;width:100%;page-break-after:always}img:last-child{page-break-after:auto}</style>
      ${pages.map((page, i) => `<img src="${escapeHtml(page.url)}" alt="Page ${i + 1}">`).join('')}`);
    win.document.close();
    const images = [...win.document.images];
    await Promise.all(images.map((img) => (img.complete ? null : new Promise((done) => { img.onload = img.onerror = done; }))));
    win.focus();
    win.print();
  } catch (err) {
    win.close();
    throw err;
  }
}

// Submission queue (Node 87:1921). Status, date range and search run on the API; the
// client sort only orders the loaded page.
export default function SubmissionQueueView({ filters, onFiltersChange, onOpenDocument, onMessageClient, onNotify, isAdmin, currentUserId }) {
  const [selected, setSelected] = useState(() => new Map()); // id -> row, kept across pages for export
  const [assigningDocId, setAssigningDocId] = useState(null);
  const { status, range, query, page, sortDir } = filters;
  const update = (patch) => onFiltersChange({ ...filters, ...FIRST_PAGE, ...patch });
  const search = useDebouncedValue(query.trim());
  const cursor = cursorFor(filters);

  const { data, loading, error, reload } = useApiQuery(`queue:${status}:${range}:${search}:${cursor}`, () =>
    listSubmissionQueue({ status, days: range, search, cursor }),
  );

  const team = useApiQuery(`team:${isAdmin}`, () => (isAdmin ? listTeam({ limit: 100 }) : Promise.resolve({ data: [] })));
  const namesById = useMemo(() => Object.fromEntries((team.data?.data || []).map((m) => [m._id, m.fullName])), [team.data]);
  // Inactive members can't be assigned; null for staff, who can't change assignees.
  const assignableTeam = useMemo(() => (isAdmin ? (team.data?.data || []).filter((m) => m.isActive !== false) : null), [isAdmin, team.data]);

  // Queue rows don't carry the customer's id; it is read from the document when needed.
  const clientIds = useRef(new Map());
  const resolveClient = async (doc) => {
    if (!clientIds.current.has(doc.id)) {
      const detail = await getDocument(doc.id);
      const customer = detail.customer;
      clientIds.current.set(doc.id, typeof customer === 'object' ? customer?._id : customer);
    }
    const id = clientIds.current.get(doc.id);
    return { ...doc.client, id };
  };

  // Assignees belong to the customer, so this changes all of their documents: reload the page.
  const toggleAssignee = async (doc, memberId) => {
    const ids = doc.assigneeIds.includes(memberId) ? doc.assigneeIds.filter((id) => id !== memberId) : [...doc.assigneeIds, memberId];
    setAssigningDocId(doc.id);
    try {
      const client = await resolveClient(doc);
      await setCustomerAssignees(client.id, ids);
      reload();
      onNotify?.(`Assignees updated for ${client.name || 'client'}`);
    } catch (err) {
      onNotify?.(err.message);
    } finally {
      setAssigningDocId(null);
    }
  };

  const messageClient = (doc) =>
    resolveClient(doc).then(onMessageClient, (err) => onNotify?.(err.message));

  const exportPdf = (doc) => exportDocumentPdf(doc).catch((err) => onNotify?.(err.message));

  const documents = useMemo(() => (data?.data || []).map(mapQueueRow), [data]);
  const hasMore = Boolean(data?.pagination?.hasMore);
  const pageSize = data?.pagination?.limit || 20;
  const pageCount = pageCountFor(filters, hasMore);

  const rows = useMemo(() => {
    const list = [...documents];
    if (sortDir) {
      const dir = sortDir === 'asc' ? 1 : -1;
      list.sort((a, b) => dir * (a.client?.name || '').localeCompare(b.client?.name || ''));
    }
    return list;
  }, [documents, sortDir]);

  const allOnPageSelected = rows.length > 0 && rows.every((d) => selected.has(d.id));

  const toggle = (doc, on) =>
    setSelected((prev) => {
      const next = new Map(prev);
      if (on) next.set(doc.id, doc);
      else next.delete(doc.id);
      return next;
    });

  const togglePage = (on) =>
    setSelected((prev) => {
      const next = new Map(prev);
      rows.forEach((d) => (on ? next.set(d.id, d) : next.delete(d.id)));
      return next;
    });

  const exportCsv = () => {
    const picked = selected.size ? [...selected.values()] : rows;
    downloadFile(
      'submissions.csv',
      toCsv([
        ['Client', 'Email', 'Submission ID', 'Document Type', 'Date Submitted', 'Status', 'Assigned'],
        ...picked.map((d) => [
          d.client?.name,
          d.client?.email,
          d.submissionId || '',
          d.type,
          `${formatDate(d.date)} ${d.time}`,
          statusById(d.status).label,
          assigneeLabel(d, namesById, currentUserId) || 'Unassigned',
        ]),
      ]),
    );
  };

  const first = documents.length ? (page - 1) * pageSize + 1 : 0;
  const last = documents.length ? first + documents.length - 1 : 0;

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
          <div className="min-w-[1116px]" role="table" aria-label="Submissions" aria-busy={loading}>
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

            {!error && (
              <div className={`transition-opacity ${loading && data ? 'opacity-50' : ''}`}>
                {rows.map((doc) => {
                  const client = doc.client;
                  const assignee = assigneeLabel(doc, namesById, currentUserId);
                  return (
                    <div
                      key={doc.id}
                      role="row"
                      tabIndex={0}
                      onClick={() => onOpenDocument(doc)}
                      onKeyDown={(e) => e.key === 'Enter' && onOpenDocument(doc)}
                      className={`grid ${COLUMNS} h-[73px] border-[#e8e8e8] border-b border-solid cursor-pointer transition-colors hover:bg-[#fafafa] focus-visible:outline-none focus-visible:bg-[rgba(0,148,197,0.05)] ${selected.has(doc.id) ? 'bg-[rgba(0,148,197,0.04)]' : ''}`}
                    >
                      <div role="cell" className="flex items-center justify-center pl-[14px] pr-[10px]">
                        <Checkbox checked={selected.has(doc.id)} onChange={(on) => toggle(doc, on)} label={`Select ${client?.name}`} />
                      </div>
                      <div role="cell" className="flex gap-[6px] items-center min-w-0 px-[14px]">
                        <Avatar name={client?.name} />
                        <div className="flex flex-col gap-[2px] items-start justify-center leading-[normal] min-w-0 whitespace-nowrap">
                          <p className="font-medium max-w-full overflow-hidden text-[14px] text-[#111] text-ellipsis">{client?.name}</p>
                          <p className="font-normal max-w-full overflow-hidden text-[12px] text-[#6a6a6a] text-ellipsis">{client?.email}</p>
                        </div>
                      </div>
                      <div role="cell" className="flex items-center px-[16px] font-medium leading-[normal] text-[14px] text-[#111] whitespace-nowrap">{doc.submissionId || '—'}</div>
                      <div role="cell" className="flex items-center px-[16px] font-medium leading-[normal] text-[14px] text-[#111] whitespace-nowrap">{doc.type}</div>
                      <div role="cell" className="flex flex-col gap-[4px] items-start justify-center px-[16px] whitespace-nowrap">
                        <p className="font-medium leading-[24px] text-[14px] text-[#111]">{formatDate(doc.date)}</p>
                        <p className="font-normal leading-[normal] text-[12px] text-[#6a6a6a]">{doc.time}</p>
                      </div>
                      <div role="cell" className="flex items-center px-[16px]">
                        <StatusBadge status={doc.status} />
                      </div>
                      <div role="cell" className="flex gap-[6px] items-center min-w-0 px-[14px]">
                        {assignee ? (
                          <>
                            <Avatar name={assignee} textClassName="font-['Geist',sans-serif]" />
                            <p className="font-medium leading-[24px] overflow-hidden text-[14px] text-[#111] text-ellipsis whitespace-nowrap">{assignee}</p>
                          </>
                        ) : (
                          <p className="font-medium leading-[24px] text-[14px] text-[#6a6a6a] whitespace-nowrap">Unassigned</p>
                        )}
                      </div>
                      <div role="cell" className="flex items-center justify-center px-[10px]">
                        <RowMenu
                          label="Options"
                          panelClassName="bg-white overflow-clip rounded-[20px] shadow-[0px_0px_40px_0px_rgba(0,0,0,0.16)]"
                        >
                          {(close) => (
                            <SubmissionOptionsMenu
                              assigneeIds={doc.assigneeIds}
                              team={assignableTeam}
                              busy={assigningDocId === doc.id}
                              onMessage={() => {
                                close();
                                messageClient(doc);
                              }}
                              onPreview={() => {
                                close();
                                onOpenDocument(doc);
                              }}
                              onExportPdf={() => {
                                close();
                                exportPdf(doc);
                              }}
                              onToggleAssignee={(memberId) => toggleAssignee(doc, memberId)}
                            />
                          )}
                        </RowMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {(error || rows.length === 0) && (
              <ListState
                loading={loading}
                error={error}
                onRetry={reload}
                empty={status !== 'all' || search ? 'No submissions match your filters.' : 'No submissions in this date range.'}
              />
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-[10px] items-center justify-between w-full" data-node-id="87:2229">
          <p className="font-normal leading-[normal] text-[16px] text-[#444] whitespace-nowrap">
            {documents.length ? `Showing ${first}-${last}${hasMore ? '' : ` of ${last}`} submissions` : 'No submissions'}
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

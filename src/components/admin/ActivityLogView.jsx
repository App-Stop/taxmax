import { useMemo, useState } from 'react';
import { Dropdown, SearchField, PageHeader, ListState } from './ui';
import { ActivityRow } from './DashboardView';
import { mapActivity } from './adminApiMappers';
import { listActivity, listTeam } from '../../services/team';
import { listTeamRecentActivity } from '../../services/dashboard';
import useApiQuery from '../../hooks/useApiQuery';
import useDebouncedValue from '../../hooks/useDebouncedValue';

const PAGE_LIMIT = 30;

// One page of the log -> { rows, next, hasMore }. The unfiltered feed pages by cursor
// (GET /dashboard/team/recent-activity, 10 a page), which never repeats or skips a row as
// new activity arrives; filtered views use GET /activity, which pages by number.
async function fetchActivityPage(filters, next) {
  if (filters.target === 'all' && filters.action === 'all' && !filters.search) {
    const res = await listTeamRecentActivity({ cursor: next ?? undefined });
    return { rows: res.data, next: res.pagination.nextCursor, hasMore: res.pagination.hasMore };
  }
  const page = next ?? 1;
  const res = await listActivity({ ...filters, page, limit: PAGE_LIMIT });
  return { rows: res.data, next: page + 1, hasMore: res.pagination.hasMore };
}
// The API filters by one action group: document status changes made by the team.
const ACTION_OPTIONS = [
  { value: 'all', label: 'All actions' },
  { value: 'document', label: 'Status changes' },
];

// Pages loaded after the first. `next` is null until one has loaded.
const NO_MORE = { key: null, rows: [], next: null, hasMore: null, loading: false, error: null };

const teamActorsOf = (rows) => {
  const byId = new Map();
  rows.forEach((row) => {
    const { actor } = row;
    if (actor?._id && (actor.type === 'staff' || actor.type === 'admin') && !byId.has(actor._id)) {
      byId.set(actor._id, actor.name || 'Unnamed member');
    }
  });
  return [...byId].map(([value, label]) => ({ value, label }));
};

// Activity Log (Node 87:3046). The API returns newest first in pages, filtered by staff
// member, action and search; "Load more" appends the next page.
export default function ActivityLogView({ isAdmin }) {
  const [staff, setStaff] = useState('all');
  const [action, setAction] = useState('all');
  const [query, setQuery] = useState('');
  const [more, setMore] = useState(NO_MORE);

  const search = useDebouncedValue(query.trim());
  const filters = { target: staff, action, search: search || undefined };
  const filterKey = `${staff}|${action}|${search}`;

  const firstPage = useApiQuery(`activity:${filterKey}`, () => fetchActivityPage(filters, null));
  // The team list is admin only; staff pick from the members seen in the log.
  const team = useApiQuery(`team:${isAdmin}`, () => (isAdmin ? listTeam({ limit: 100 }) : Promise.resolve(null)));

  // Pages loaded for an earlier filter don't belong to this one.
  const extra = more.key === filterKey ? more : NO_MORE;

  const rawRows = useMemo(() => {
    const seen = new Set();
    // Offset pages can repeat a row when new activity lands in between; keep the first.
    return [...(firstPage.data?.rows || []), ...extra.rows].filter((row) => !seen.has(row._id) && seen.add(row._id));
  }, [firstPage.data, extra.rows]);

  const rows = useMemo(() => rawRows.map((row) => mapActivity(row)), [rawRows]);

  const loadedMore = extra.next !== null;
  const hasMore = loadedMore ? extra.hasMore : firstPage.data?.hasMore;

  const loadMore = async () => {
    const next = loadedMore ? extra.next : firstPage.data?.next;
    setMore({ ...extra, key: filterKey, loading: true, error: null });
    try {
      const res = await fetchActivityPage(filters, next);
      setMore((m) => (m.key === filterKey
        ? { key: filterKey, rows: [...m.rows, ...res.rows], next: res.next, hasMore: res.hasMore, loading: false, error: null }
        : m));
    } catch (error) {
      setMore((m) => (m.key === filterKey ? { ...m, loading: false, error } : m));
    }
  };

  const retry = () => {
    setMore(NO_MORE);
    firstPage.reload();
  };

  const [seenMembers, setSeenMembers] = useState([]);
  const seenNow = teamActorsOf(rawRows);
  if (seenNow.some((m) => !seenMembers.some((s) => s.value === m.value))) {
    // Kept across filters, so the selected member stays in the list when their rows are filtered out.
    setSeenMembers((list) => [...list, ...seenNow.filter((m) => !list.some((s) => s.value === m.value))]);
  }

  const staffOptions = useMemo(() => {
    const members = team.data?.data
      ? team.data.data.map((m) => ({ value: m._id, label: m.fullName || m.email }))
      : seenMembers;
    return [{ value: 'all', label: 'All staff' }, ...[...members].sort((a, b) => a.label.localeCompare(b.label))];
  }, [team.data, seenMembers]);

  const filtered = staff !== 'all' || action !== 'all' || Boolean(search);

  return (
    <div className="flex flex-col gap-[20px] items-start w-full" data-node-id="87:3094">
      <PageHeader title="Activity Log" subtitle="Chronological audit trail of all staff actions" />

      <div className="flex flex-col gap-[10px] items-start w-full" data-node-id="87:3099">
        <div className="flex flex-wrap gap-[10px] items-center justify-between w-full">
          <div className="flex flex-wrap gap-[10px] items-center">
            <Dropdown value={staff} options={staffOptions} onChange={setStaff} />
            <Dropdown value={action} options={ACTION_OPTIONS} onChange={setAction} />
          </div>
          <SearchField value={query} onChange={setQuery} placeholder="Search activity..." />
        </div>

        <div className="bg-white flex flex-col gap-[20px] items-start p-[16px] rounded-[20px] w-full" data-node-id="87:3111" aria-busy={firstPage.loading}>
          {!firstPage.error && rows.map((item) => <ActivityRow key={item.id} item={item} />)}

          {(firstPage.error || rows.length === 0) && (
            <ListState
              className="py-[40px] w-full"
              loading={firstPage.loading}
              error={firstPage.error}
              onRetry={retry}
              empty={filtered ? 'No activity matches your filters.' : 'No activity yet.'}
            />
          )}

          {!firstPage.error && hasMore && (
            <div className="flex flex-col gap-[8px] items-center w-full">
              {extra.error && <p role="alert" className="font-medium text-[14px] text-[#ea0101]">{extra.error.message}</p>}
              <button
                type="button"
                onClick={loadMore}
                disabled={extra.loading}
                className="bg-white border border-[#e8e8e8] border-solid px-[20px] py-[8px] rounded-[100px] font-medium text-[14px] text-[#111] cursor-pointer hover:bg-[#fafafa] disabled:opacity-60 disabled:cursor-default"
              >
                {extra.loading ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

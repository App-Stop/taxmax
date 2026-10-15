import { useMemo, useState } from 'react';
import { Dropdown, SearchField, PageHeader } from './ui';
import { ActivityRow } from './DashboardView';
import { ACTIVITY_STYLES } from './adminData';

const ACTION_OPTIONS = [{ value: 'all', label: 'All actions' }, ...Object.entries(ACTIVITY_STYLES).map(([value, s]) => ({ value, label: s.label }))];

// Activity Log (Node 87:3046)
export default function ActivityLogView({ activity }) {
  const [staff, setStaff] = useState('all');
  const [kind, setKind] = useState('all');
  const [query, setQuery] = useState('');

  const staffOptions = useMemo(
    () => [{ value: 'all', label: 'All staff' }, ...[...new Set(activity.map((a) => a.actor))].sort().map((name) => ({ value: name, label: name }))],
    [activity],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activity.filter((a) => {
      if (staff !== 'all' && a.actor !== staff) return false;
      if (kind !== 'all' && a.kind !== kind) return false;
      return !q || `${a.actor} ${a.action} ${a.target}`.toLowerCase().includes(q);
    });
  }, [activity, staff, kind, query]);

  return (
    <div className="flex flex-col gap-[20px] items-start w-full" data-node-id="87:3094">
      <PageHeader title="Activity Log" subtitle="Chronological audit trail of all staff actions" />

      <div className="flex flex-col gap-[10px] items-start w-full" data-node-id="87:3099">
        <div className="flex flex-wrap gap-[10px] items-center justify-between w-full">
          <div className="flex flex-wrap gap-[10px] items-center">
            <Dropdown value={staff} options={staffOptions} onChange={setStaff} />
            <Dropdown value={kind} options={ACTION_OPTIONS} onChange={setKind} />
          </div>
          <SearchField value={query} onChange={setQuery} placeholder="Search activity..." />
        </div>

        <div className="bg-white flex flex-col gap-[20px] items-start p-[16px] rounded-[20px] w-full" data-node-id="87:3111">
          {rows.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
          {rows.length === 0 && <p className="py-[40px] w-full text-center text-[14px] text-[#6a6a6a]">No activity matches your filters.</p>}
        </div>
      </div>
    </div>
  );
}

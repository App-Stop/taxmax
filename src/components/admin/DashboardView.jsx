import { useMemo, useState } from 'react';
import { Icon, Dropdown, ListState } from './ui';
import { ACTIVITY_STYLES, formatDate } from './adminData';
import { mapActivity } from './adminApiMappers';
import { getTeamDashboard } from '../../services/dashboard';
import useApiQuery from '../../hooks/useApiQuery';

const A = '/figma/admin';

const RANGE_OPTIONS = [7, 14, 21].map((days) => ({ value: days, label: `Last ${days} days` }));
const GRID_LINES = [6, 64, 122, 179, 238];
const GRID_ASSETS = ['grid-line-1', 'grid-line-2', 'grid-line-3', 'grid-line-2', 'grid-line-3'];

// Donut slices: totalDocumentsVolume key, label, legend colour.
const SLICES = [
  ['submitted', 'Submitted', '#0094C5'],
  ['accepted', 'Accepted', '#1D9834'],
  ['uploaded', 'Pending Review', '#E86907'],
  ['actionNeeded', 'Action needed', '#EA0101'],
  ['filed', 'Filed', '#903BFF'],
];

// Volume days are UTC calendar days ('YYYY-MM-DD').
const dayLabel = (date, days) => {
  const d = new Date(`${date}T00:00:00Z`);
  return days === 7 ? d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }) : String(d.getUTCDate());
};

// Smallest multiple of 4 that fits the tallest bar, so the 5 axis ticks are whole numbers.
const axisMax = (values) => Math.max(4, Math.ceil(Math.max(0, ...values) / 4) * 4);

function StatCard({ icon, iconBg, value, label, danger, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white flex flex-[1_0_0] flex-col gap-[20px] items-start min-w-[150px] p-[20px] rounded-[20px] text-left cursor-pointer hover:shadow-[0px_0px_30px_rgba(0,101,131,0.08)] transition-shadow"
    >
      <span className={`${iconBg} flex items-center p-[6px] rounded-[10px] shrink-0`}>
        <Icon src={icon} />
      </span>
      <span className={`flex flex-col gap-[6px] items-start leading-[normal] whitespace-nowrap ${danger ? 'text-[#ea0101]' : ''}`}>
        <span className={`font-bold text-[36px] ${danger ? '' : 'text-[#1e1e1e]'}`}>{value ?? '—'}</span>
        <span className={`font-semibold text-[12px] ${danger ? '' : 'text-[#444]'}`}>{label}</span>
      </span>
    </button>
  );
}

function CardHeader({ title, children }) {
  return (
    <div className="flex h-[32px] items-center justify-between shrink-0 w-full">
      <p className="font-bold leading-[normal] text-[16px] text-[#111] whitespace-nowrap">{title}</p>
      {children}
    </div>
  );
}

// Bar chart card (Node 87:1691): documents first marked Submitted, per day. The last bar is today.
function VolumeChart({ volume, days, onDaysChange }) {
  const points = volume?.data || [];
  const max = axisMax(points.map((p) => p.count));
  const ticks = [max, (max * 3) / 4, max / 2, max / 4, 0];

  return (
    <div className="bg-white flex flex-[1_0_0] flex-col gap-[20px] items-start min-w-0 min-h-[337px] p-[16px] rounded-[20px] self-stretch" data-node-id="87:1691">
      <CardHeader title="Submission volume">
        <Dropdown variant="soft" value={days} options={RANGE_OPTIONS} onChange={onDaysChange} menuAlign="right" />
      </CardHeader>
      <div className="flex flex-[1_0_0] items-start min-h-[250px] relative w-full">
        {GRID_LINES.map((top, i) => (
          <div key={top} className="absolute h-0 left-[45px] right-0" style={{ top }}>
            <div className="absolute inset-[-0.5px_0]">
              <img alt="" className="block max-w-none size-full" src={`${A}/${GRID_ASSETS[i]}.svg`} />
            </div>
          </div>
        ))}
        <div className="flex flex-col font-['Geist',sans-serif] font-semibold h-full items-start justify-between leading-[normal] pb-[16px] relative shrink-0 text-[10px] text-[#6a6a6a] text-center w-[36px]">
          {ticks.map((n) => (
            <p key={n} className="w-full">{n}</p>
          ))}
        </div>
        <div className="flex flex-[1_0_0] flex-col gap-[10px] h-full items-start min-w-px relative">
          <div className="flex flex-[1_0_0] items-end justify-between min-h-px w-full">
            {points.map((point, i) => {
              const isToday = i === points.length - 1;
              const pct = (point.count / max) * 100;
              return (
                <div key={point.date} className="relative flex flex-[1_0_0] flex-col h-full items-center justify-end min-w-px">
                  {isToday && (
                    <span className="absolute bg-[rgba(0,148,197,0.1)] flex items-center justify-center px-[6px] py-[4px] rounded-[20px]" style={{ bottom: `calc(${pct}% + 8px)` }}>
                      <span className="font-medium leading-[normal] text-[10px] text-[#0094c5] text-center whitespace-nowrap">{point.count} Today</span>
                    </span>
                  )}
                  {point.count === 0 ? (
                    <span className="bg-[#e8e8e8] rounded-[20px] shrink-0 size-[14px] max-w-[70%]" title={`${formatDate(point.date)}: no submissions`} />
                  ) : (
                    <span
                      className="bg-[#0094c5] rounded-[20px] shrink-0 w-[14px] max-w-[70%] transition-[height] duration-300"
                      style={{ height: `${pct}%` }}
                      title={`${formatDate(point.date)}: ${point.count} submission${point.count === 1 ? '' : 's'}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex font-semibold items-center justify-between leading-[normal] shrink-0 text-[10px] text-center w-full">
            {points.map((point) => (
              <p key={point.date} className={`flex-[1_0_0] min-w-px ${point.count ? 'text-[#111]' : 'text-[#c2c2c2]'}`}>{dayLabel(point.date, days)}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const RADIUS = 90;
const STROKE = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Donut card (Node 87:1737): every document, by current status.
function StatusDonut({ totals }) {
  const total = totals?.total ?? 0;
  const lengths = SLICES.map(([key]) => (total ? ((totals?.[key] ?? 0) / total) * CIRCUMFERENCE : 0));
  const arcs = SLICES.map(([key, label, color], i) => ({
    key,
    label,
    color,
    value: totals?.[key] ?? 0,
    length: lengths[i],
    // Each slice starts where the ones before it end.
    offset: lengths.slice(0, i).reduce((sum, n) => sum + n, 0),
  }));

  return (
    <div className="bg-white flex flex-[1_0_0] flex-col gap-[20px] items-start min-w-0 p-[16px] rounded-[20px]" data-node-id="87:1737">
      <CardHeader title="Documents by status" />
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between p-[8px] shrink-0 w-full">
        <div className="h-[237px] relative shrink-0 w-[281px] max-w-full flex items-center justify-center">
          <svg viewBox="0 0 220 220" className="size-[220px] -rotate-90" role="img" aria-label={`${total} documents by status`}>
            <circle cx="110" cy="110" r={RADIUS} fill="none" stroke="#f0f0f0" strokeWidth={STROKE} />
            {arcs.filter((a) => a.length > 0).map((a) => (
              <circle
                key={a.key}
                cx="110"
                cy="110"
                r={RADIUS}
                fill="none"
                stroke={a.color}
                strokeWidth={STROKE}
                strokeDasharray={`${a.length} ${CIRCUMFERENCE - a.length}`}
                strokeDashoffset={-a.offset}
              >
                <title>{`${a.label}: ${a.value}`}</title>
              </circle>
            ))}
          </svg>
          <div className="absolute flex flex-col items-center leading-[normal] text-[#111] text-center">
            <p className="font-bold text-[24px]">{totals ? total : '—'}</p>
            <p className="font-semibold text-[14px]">Total</p>
          </div>
        </div>
        <div className="flex flex-[1_0_0] flex-col items-start justify-center min-w-px self-stretch overflow-clip">
          {arcs.map((a) => (
            <div key={a.key} className="flex gap-[4px] items-center overflow-clip p-[4px] shrink-0 w-full">
              <span className="flex items-center justify-center shrink-0 size-[16px]">
                <span className="rounded-full size-[8px]" style={{ background: a.color }} />
              </span>
              <p className="flex-[1_0_0] font-['Inter',sans-serif] font-normal leading-[normal] text-[12px] text-[rgba(0,0,0,0.7)] whitespace-nowrap">{a.label}</p>
              <p className="font-['Inter',sans-serif] font-semibold leading-[normal] text-[12px] text-[#111]">{totals ? a.value : ''}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ActivityRow({ item }) {
  const style = ACTIVITY_STYLES[item.kind] || ACTIVITY_STYLES.status;
  return (
    <div className="flex gap-[10px] items-center w-full">
      <span className={`${style.bg} flex items-center justify-center rounded-[200px] shrink-0 size-[32px]`}>
        <Icon src={style.icon} size={20} />
      </span>
      <p className="flex flex-[1_0_0] flex-wrap lg:flex-nowrap gap-x-[6px] items-center leading-[normal] min-w-px text-[14px] lg:whitespace-nowrap">
        <span className="font-medium text-[#111]">{item.actor}</span>
        <span className="font-normal text-[#444]">{item.action}</span>
        <span className="font-medium text-[#111]">{item.target}</span>
      </p>
      <p className="font-normal leading-[normal] shrink-0 text-[12px] text-[#6a6a6a] whitespace-nowrap">{item.time}</p>
    </div>
  );
}

// Dashboard (Node 87:1625).
export default function DashboardView({ onOpenQueue, onViewAllActivity }) {
  const [days, setDays] = useState(7);
  const { data, loading, error, reload } = useApiQuery(`team-dashboard:${days}`, () => getTeamDashboard({ days }));

  const activity = useMemo(() => (data?.recentActivity || []).map((row) => mapActivity(row)), [data]);

  return (
    <div className="flex flex-col gap-[20px] items-start w-full" data-node-id="87:1661">
      <div className="flex flex-col gap-[10px] items-start justify-center [word-break:break-word]">
        <h1 className="font-bold leading-[36px] text-[28px] sm:text-[32px] text-[#111] tracking-[-0.32px]">Dashboard</h1>
        <p className="font-normal leading-[normal] text-[16px] text-[#444]">Tax season overview and real-time metrics</p>
      </div>

      {error && !data ? (
        <div className="bg-white rounded-[20px] w-full">
          <ListState className="py-[40px] w-full" error={error} onRetry={reload} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:flex gap-[20px] lg:h-[162px] items-center w-full" data-node-id="87:1665" aria-busy={loading}>
            <StatCard icon={`${A}/stat-users-four.svg`} iconBg="bg-[rgba(0,148,197,0.1)]" value={data?.totalSubmissions} label="Total submissions" onClick={() => onOpenQueue('submitted')} />
            <StatCard icon={`${A}/stat-note-pencil.svg`} iconBg="bg-[#fbebde]" value={data?.totalUploaded} label="Pending review" onClick={() => onOpenQueue('all')} />
            <StatCard icon={`${A}/stat-user-check.svg`} iconBg="bg-[#e5f7dc]" value={data?.totalFiledAndAccepted} label="Filed & accepted" onClick={() => onOpenQueue('accepted')} />
            <StatCard icon={`${A}/stat-warning.svg`} iconBg="bg-[#ffecec]" value={data?.totalActionNeeded} label="Action required" danger onClick={() => onOpenQueue('action-needed')} />
          </div>

          <div className="flex flex-col lg:flex-row gap-[20px] items-stretch lg:items-start w-full" data-node-id="87:1690">
            <VolumeChart volume={data?.submissionVolume} days={days} onDaysChange={setDays} />
            <StatusDonut totals={data?.totalDocumentsVolume} />
          </div>

          <div className="bg-white flex flex-col gap-[20px] items-start p-[16px] rounded-[20px] shrink-0 w-full" data-node-id="87:1782">
            <CardHeader title="Recent Activity">
              <button
                type="button"
                onClick={onViewAllActivity}
                className="flex h-[32px] items-center justify-center px-[12px] py-[8px] rounded-[100px] shrink-0 cursor-pointer hover:bg-[rgba(0,148,197,0.1)] transition-colors"
              >
                <span className="font-bold leading-[16px] text-[14px] text-[#0094c5] whitespace-nowrap">View all</span>
              </button>
            </CardHeader>
            {activity.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
            {activity.length === 0 && <ListState className="py-[20px] w-full" loading={loading} empty="No activity yet." />}
          </div>
        </>
      )}
    </div>
  );
}

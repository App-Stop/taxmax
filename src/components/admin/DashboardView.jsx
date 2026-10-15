import { useState } from 'react';
import { Icon, Dropdown } from './ui';
import { ACTIVITY_STYLES, VOLUME_RANGES, WEEK_DAYS } from './adminData';

const A = '/figma/admin';

const RANGE_OPTIONS = Object.keys(VOLUME_RANGES).map((r) => ({ value: r, label: r }));
const PX_PER_SUBMISSION = 5.8; // 40 submissions span the chart's 232px plot height
const GRID_LINES = [6, 64, 122, 179, 238];
const GRID_ASSETS = ['grid-line-1', 'grid-line-2', 'grid-line-3', 'grid-line-2', 'grid-line-3'];

const LEGEND = [
  ['Submitted', 'legend-submitted'],
  ['Accepted', 'legend-accepted'],
  ['Pending Review', 'legend-pending'],
  ['Action needed', 'legend-action'],
  ['Filed', 'legend-filed'],
];

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
        <span className={`font-bold text-[36px] ${danger ? '' : 'text-[#1e1e1e]'}`}>{value}</span>
        <span className={`font-semibold text-[12px] ${danger ? '' : 'text-[#444]'}`}>{label}</span>
      </span>
    </button>
  );
}

function CardHeader({ title, range, onRangeChange }) {
  return (
    <div className="flex items-center justify-between shrink-0 w-full">
      <p className="font-bold leading-[normal] text-[16px] text-[#111] whitespace-nowrap">{title}</p>
      <Dropdown variant="soft" value={range} options={RANGE_OPTIONS} onChange={onRangeChange} menuAlign="right" />
    </div>
  );
}

// Bar chart card (Node 87:1691)
function VolumeChart() {
  const [range, setRange] = useState(RANGE_OPTIONS[0].value);
  const { values, todayIndex } = VOLUME_RANGES[range];

  return (
    <div className="bg-white flex flex-[1_0_0] flex-col gap-[20px] items-start min-w-0 min-h-[337px] p-[16px] rounded-[20px] self-stretch" data-node-id="87:1691">
      <CardHeader title="Submission volume" range={range} onRangeChange={setRange} />
      <div className="flex flex-[1_0_0] items-start min-h-px relative w-full">
        {GRID_LINES.map((top, i) => (
          <div key={top} className="absolute h-0 left-[45px] right-0" style={{ top }}>
            <div className="absolute inset-[-0.5px_0]">
              <img alt="" className="block max-w-none size-full" src={`${A}/${GRID_ASSETS[i]}.svg`} />
            </div>
          </div>
        ))}
        <div className="flex flex-col font-['Geist',sans-serif] font-semibold h-full items-start justify-between leading-[normal] pb-[16px] relative shrink-0 text-[10px] text-[#6a6a6a] text-center w-[36px]">
          {[40, 30, 20, 10, 0].map((n) => (
            <p key={n} className="w-full">{n}</p>
          ))}
        </div>
        <div className="flex flex-[1_0_0] flex-col gap-[10px] h-full items-start min-w-px relative">
          <div className="flex flex-[1_0_0] items-end justify-between min-h-px w-full">
            {values.map((value, i) => (
              <div key={WEEK_DAYS[i]} className={`flex flex-[1_0_0] flex-col h-full items-center justify-end min-w-px ${i === todayIndex ? 'gap-[10px]' : 'overflow-clip'}`}>
                {i === todayIndex && (
                  <span className="bg-[rgba(0,148,197,0.1)] flex items-center justify-center px-[6px] py-[4px] rounded-[20px] shrink-0">
                    <span className="font-medium leading-[normal] text-[10px] text-[#0094c5] text-center whitespace-nowrap">{value} Today</span>
                  </span>
                )}
                {value == null ? (
                  <span className="bg-[#e8e8e8] rounded-[20px] shrink-0 size-[14px]" />
                ) : (
                  <span
                    className="bg-[#0094c5] rounded-[20px] shrink-0 w-[14px] transition-[height] duration-300"
                    style={{ height: value * PX_PER_SUBMISSION }}
                    title={`${value} submissions`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex font-semibold items-center justify-between leading-[normal] shrink-0 text-[10px] text-center w-full">
            {WEEK_DAYS.map((day, i) => (
              <p key={day} className={`flex-[1_0_0] min-w-px ${values[i] == null ? 'text-[#c2c2c2]' : 'text-[#111]'}`}>{day}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Donut card (Node 87:1737)
function StatusDonut() {
  const [range, setRange] = useState(RANGE_OPTIONS[0].value);

  return (
    <div className="bg-white flex flex-[1_0_0] flex-col gap-[20px] items-start min-w-0 p-[16px] rounded-[20px]" data-node-id="87:1737">
      <CardHeader title="Submission volume" range={range} onRangeChange={setRange} />
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between p-[8px] shrink-0 w-full">
        <div className="h-[237px] relative shrink-0 w-[281px] max-w-full">
          <div className="absolute inset-[2.53%_8.9%_0_8.9%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={`${A}/pie-layer.svg`} />
          </div>
          <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col items-center leading-[normal] left-1/2 text-[#111] text-center top-[calc(50%+3.5px)]">
            <p className="font-bold text-[24px]">{VOLUME_RANGES[range].total}</p>
            <p className="font-semibold text-[14px]">Total</p>
          </div>
        </div>
        <div className="flex flex-[1_0_0] flex-col items-start justify-center min-w-px self-stretch overflow-clip">
          {LEGEND.map(([label, asset]) => (
            <div key={label} className="flex gap-[4px] items-center overflow-clip p-[4px] shrink-0">
              <span className="relative shrink-0 size-[16px]">
                <img alt="" className="absolute block left-[4px] top-[4px] max-w-none" src={`${A}/${asset}.svg`} width="8" height="8" />
              </span>
              <p className="font-['Inter',sans-serif] font-normal leading-[normal] text-[12px] text-[rgba(0,0,0,0.7)] whitespace-nowrap">{label}</p>
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

// Dashboard (Node 87:1625)
export default function DashboardView({ documents, activity, onOpenQueue, onViewAllActivity }) {
  const count = (...statuses) => documents.filter((d) => statuses.includes(d.status)).length;

  return (
    <div className="flex flex-col gap-[20px] items-start w-full" data-node-id="87:1661">
      <div className="flex flex-col gap-[10px] items-start justify-center [word-break:break-word]">
        <h1 className="font-bold leading-[36px] text-[28px] sm:text-[32px] text-[#111] tracking-[-0.32px]">Dashboard</h1>
        <p className="font-normal leading-[normal] text-[16px] text-[#444]">Tax season overview and real-time metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:flex gap-[20px] lg:h-[162px] items-center w-full" data-node-id="87:1665">
        <StatCard icon={`${A}/stat-users-four.svg`} iconBg="bg-[rgba(0,148,197,0.1)]" value={documents.length} label="Total submissions" onClick={() => onOpenQueue('all')} />
        <StatCard icon={`${A}/stat-note-pencil.svg`} iconBg="bg-[#fbebde]" value={count('in_review')} label="Pending review" onClick={() => onOpenQueue('in_review')} />
        <StatCard icon={`${A}/stat-user-check.svg`} iconBg="bg-[#e5f7dc]" value={count('accepted', 'filed')} label="Filed & accepted" onClick={() => onOpenQueue('accepted')} />
        <StatCard icon={`${A}/stat-warning.svg`} iconBg="bg-[#ffecec]" value={count('action_needed')} label="Action required" danger onClick={() => onOpenQueue('action_needed')} />
      </div>

      <div className="flex flex-col lg:flex-row gap-[20px] items-stretch lg:items-start w-full" data-node-id="87:1690">
        <VolumeChart />
        <StatusDonut />
      </div>

      <div className="bg-white flex flex-col gap-[20px] items-start p-[16px] rounded-[20px] shrink-0 w-full" data-node-id="87:1782">
        <div className="flex h-[32px] items-center justify-between w-full">
          <p className="font-bold leading-[normal] text-[16px] text-[#111] whitespace-nowrap">Recent Activity</p>
          <button
            type="button"
            onClick={onViewAllActivity}
            className="flex h-[32px] items-center justify-center px-[12px] py-[8px] rounded-[100px] shrink-0 cursor-pointer hover:bg-[rgba(0,148,197,0.1)] transition-colors"
          >
            <span className="font-bold leading-[16px] text-[14px] text-[#0094c5] whitespace-nowrap">View all</span>
          </button>
        </div>
        {activity.slice(0, 4).map((item) => (
          <ActivityRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

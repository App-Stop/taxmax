import { Icon, Avatar, StatusBadge, PillButton, PageHeader, primaryButton } from './ui';
import { CAMPAIGN_HOST, copyCampaignLink, REFERRAL_STATS, formatDate, statusById, toCsv, downloadFile } from './adminData';

const A = '/figma/admin';

const tableHeader = 'bg-[#f5f5f5] border-[#e8e8e8] border-b border-solid flex h-[40px] items-center font-semibold leading-[normal] text-[12px] text-[#6a6a6a] tracking-[0.24px] uppercase whitespace-nowrap';
const cellText = 'font-medium leading-[normal] text-[14px] text-[#111]';
const CAMPAIGN_COLUMNS = 'grid-cols-[minmax(200px,1fr)_minmax(180px,1fr)_80px_130px_140px_60px_60px]';
const REFERRAL_COLUMNS = 'grid-cols-[260px_240px_minmax(150px,1fr)_minmax(150px,1fr)_160px]';

const number = (n) => n.toLocaleString('en-US');

function StatTile({ value, label }) {
  return (
    <div className="border border-[#e8e8e8] border-solid flex flex-[1_0_0] flex-col items-start min-w-[150px] p-[20px] rounded-[10px]">
      <div className="flex flex-col gap-[6px] items-start leading-[normal] whitespace-nowrap">
        <p className="font-bold text-[24px] text-[#1e1e1e]">{value}</p>
        <p className="font-semibold text-[12px] text-[#444]">{label}</p>
      </div>
    </div>
  );
}

// Campaigns (Node 87:3566)
export default function CampaignsView({ campaigns, referrals, clientsById, onCreate, onView, onEdit, onNotify }) {
  const copy = async (slug) => onNotify((await copyCampaignLink(slug)) ? 'Link copied to clipboard' : 'Could not copy the link');

  const exportReferrals = () =>
    downloadFile(
      'referrals.csv',
      toCsv([
        ['Referred client', 'Email', 'Referred by', 'Source', 'Date', 'Status'],
        ...referrals.map((r) => {
          const c = clientsById[r.clientId];
          return [c.name, c.email, r.referredBy, r.source, formatDate(r.date), statusById(r.status).label];
        }),
      ]),
    );

  return (
    <div className="flex flex-col gap-[20px] items-start w-full" data-node-id="87:3617">
      <PageHeader
        title="Campaigns"
        subtitle="Generate QR codes, shareable links, and track referrals"
        action={
          <button type="button" onClick={onCreate} className={primaryButton}>
            <Icon src={`${A}/plus-white.svg`} size={20} />
            Create new
          </button>
        }
      />

      <div className="bg-white flex flex-col gap-[10px] items-center overflow-clip pt-[16px] rounded-[20px] w-full" data-node-id="87:3625">
        <div className="flex h-[32px] items-center px-[16px] w-full">
          <p className="font-bold leading-[normal] text-[16px] text-[#111] whitespace-nowrap">Active campaigns</p>
        </div>
        <div className="overflow-x-auto w-full">
          <div className="min-w-[860px]" role="table" aria-label="Active campaigns">
            <div role="row" className={`grid ${CAMPAIGN_COLUMNS}`}>
              <div role="columnheader" className={`${tableHeader} pl-[14px] pr-[10px]`}>title</div>
              <div role="columnheader" className={`${tableHeader} px-[10px]`}>URL</div>
              <div role="columnheader" className={`${tableHeader} pl-[14px] pr-[10px]`}>Scans</div>
              <div role="columnheader" className={`${tableHeader} pl-[14px] pr-[10px]`}>Conversion</div>
              <div role="columnheader" className={`${tableHeader} pl-[14px] pr-[10px]`}>created</div>
              <div role="columnheader" className={tableHeader} />
              <div role="columnheader" className={tableHeader} />
            </div>
            {campaigns.map((c) => (
              <div
                key={c.id}
                role="row"
                tabIndex={0}
                onClick={() => onView(c.id)}
                onKeyDown={(e) => e.key === 'Enter' && onView(c.id)}
                className={`grid ${CAMPAIGN_COLUMNS} h-[72px] border-[#e8e8e8] border-b border-solid cursor-pointer transition-colors hover:bg-[#fafafa] focus-visible:outline-none focus-visible:bg-[rgba(0,148,197,0.05)]`}
              >
                <div role="cell" className={`flex items-center min-w-0 px-[16px] ${cellText}`}><span className="truncate">{c.title}</span></div>
                <div role="cell" className={`flex items-center min-w-0 px-[10px] ${cellText}`}><span className="truncate">{CAMPAIGN_HOST}{c.slug}</span></div>
                <div role="cell" className={`flex items-center px-[16px] ${cellText}`}>{number(c.scans)}</div>
                <div role="cell" className={`flex items-center px-[16px] ${cellText}`}>{number(c.conversions)}</div>
                <div role="cell" className={`flex items-center px-[16px] whitespace-nowrap ${cellText}`}>{formatDate(c.createdAt)}</div>
                <div role="cell" className="flex items-center justify-center px-[10px]">
                  <button
                    type="button"
                    aria-label={`Copy link for ${c.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      copy(c.slug);
                    }}
                    className="flex items-center justify-center rounded-[100px] size-[36px] cursor-pointer hover:bg-[#f5f5f5]"
                  >
                    <Icon src={`${A}/copy-simple.svg`} />
                  </button>
                </div>
                <div role="cell" className="flex items-center justify-center px-[10px]">
                  <button
                    type="button"
                    aria-label={`Edit ${c.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(c.id);
                    }}
                    className="flex items-center justify-center rounded-[100px] size-[36px] cursor-pointer hover:bg-[#f5f5f5]"
                  >
                    <Icon src={`${A}/pencil-simple.svg`} />
                  </button>
                </div>
              </div>
            ))}
            {campaigns.length === 0 && <div className="flex h-[160px] items-center justify-center text-[14px] text-[#6a6a6a]">No campaigns yet.</div>}
          </div>
        </div>
      </div>

      <div className="bg-white flex flex-col gap-[10px] items-center overflow-clip pt-[16px] rounded-[20px] w-full" data-node-id="87:3718">
        <div className="flex h-[32px] items-center justify-between px-[16px] w-full">
          <p className="font-bold leading-[normal] text-[16px] text-[#111] whitespace-nowrap">Referral Tracking</p>
          <PillButton tone="soft" compact icon={`${A}/download-simple.svg`} onClick={exportReferrals}>Export</PillButton>
        </div>
        <div className="grid grid-cols-2 lg:flex gap-[10px] items-center px-[16px] w-full">
          <StatTile value={REFERRAL_STATS.total} label="Total referrals" />
          <StatTile value={REFERRAL_STATS.converted} label="Converted Clients" />
          <StatTile value={REFERRAL_STATS.rate} label="Conversion rate" />
          <StatTile value={REFERRAL_STATS.rewards} label="Referral rewards paid" />
        </div>
        <div className="overflow-x-auto w-full">
          <div className="min-w-[960px]" role="table" aria-label="Referrals">
            <div role="row" className={`grid ${REFERRAL_COLUMNS}`}>
              <div role="columnheader" className={`${tableHeader} px-[10px]`}>referred client</div>
              <div role="columnheader" className={`${tableHeader} px-[10px]`}>Referred by</div>
              <div role="columnheader" className={`${tableHeader} px-[10px]`}>source</div>
              <div role="columnheader" className={`${tableHeader} pl-[14px] pr-[10px]`}>Date</div>
              <div role="columnheader" className={`${tableHeader} pl-[14px] pr-[10px]`}>Status</div>
            </div>
            {referrals.map((r) => {
              const client = clientsById[r.clientId];
              return (
                <div key={r.id} role="row" className={`grid ${REFERRAL_COLUMNS} h-[72px] border-[#e8e8e8] border-b border-solid`}>
                  <div role="cell" className="flex gap-[6px] items-center min-w-0 px-[14px]">
                    <Avatar name={client.name} />
                    <div className="flex flex-col gap-[2px] items-start justify-center leading-[normal] min-w-0 whitespace-nowrap">
                      <p className="font-medium max-w-full overflow-hidden text-[14px] text-[#111] text-ellipsis">{client.name}</p>
                      <p className="font-normal max-w-full overflow-hidden text-[12px] text-[#6a6a6a] text-ellipsis">{client.email}</p>
                    </div>
                  </div>
                  <div role="cell" className={`flex items-center px-[10px] whitespace-nowrap ${cellText}`}>{r.referredBy}</div>
                  <div role="cell" className={`flex items-center px-[10px] whitespace-nowrap ${cellText}`}>{r.source}</div>
                  <div role="cell" className={`flex items-center px-[16px] whitespace-nowrap ${cellText}`}>{formatDate(r.date)}</div>
                  <div role="cell" className="flex items-center px-[16px]"><StatusBadge status={r.status} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

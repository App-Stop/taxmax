import { useMemo, useState } from 'react';
import { Icon, StatusBadge, Dropdown } from './ui';
import { initialsOf, formatDate, thumbFor, clientActivity } from './adminData';

const A = '/figma/admin';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'status', label: 'Status' },
];

function InfoItem({ label, value }) {
  return (
    <div className="flex flex-[1_0_0] flex-col gap-[6px] items-start justify-center leading-[normal] min-w-px">
      <p className="font-normal text-[12px] text-[#6a6a6a] whitespace-nowrap">{label}</p>
      <p className="font-medium text-[14px] text-[#111] whitespace-nowrap">{value}</p>
    </div>
  );
}

const sectionLabel = 'font-semibold leading-[normal] text-[12px] text-[#6a6a6a] tracking-[0.48px] uppercase w-full';

// Client detail (Node 87:2736)
export default function ClientDetailView({ client, documents, onBack, onOpenDocument, onMessageClient, onNotesChange }) {
  const [sort, setSort] = useState('oldest');

  const docs = useMemo(() => {
    const list = documents.filter((d) => d.clientId === client.id);
    if (sort === 'status') return list.sort((a, b) => a.status.localeCompare(b.status));
    const dir = sort === 'newest' ? -1 : 1;
    return list.sort((a, b) => dir * a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  }, [documents, client.id, sort]);

  return (
    <div className="flex flex-col gap-[20px] items-start w-full lg:h-[calc(var(--vh)-40px)]" data-node-id="87:2772">
      <div className="bg-white flex flex-wrap gap-[16px] items-center p-[16px] rounded-[20px] shrink-0 w-full" data-node-id="87:2773">
        <button type="button" onClick={onBack} aria-label="Back" className="flex items-center p-[6px] rounded-[100px] shrink-0 cursor-pointer hover:bg-[#f5f5f5]">
          <Icon src={`${A}/arrow-left.svg`} />
        </button>
        <div className="flex flex-[1_0_0] gap-[10px] items-center min-w-[220px]">
          <span className="bg-[rgba(0,148,197,0.1)] flex items-center justify-center rounded-[250px] shrink-0 size-[50px]">
            <span className="font-medium leading-[22.5px] text-[20px] text-[#0094c5] whitespace-nowrap">{initialsOf(client.name)}</span>
          </span>
          <div className="flex flex-col gap-[2px] items-start justify-center leading-[normal] min-w-0 whitespace-nowrap">
            <h1 className="font-bold max-w-full overflow-hidden text-[20px] text-[#111] text-ellipsis">{client.name}</h1>
            <p className="font-medium max-w-full overflow-hidden text-[14px] text-[#6a6a6a] text-ellipsis">{client.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onMessageClient(client.id)}
          className="bg-[#0094c5] flex gap-[8px] items-center justify-center px-[24px] py-[12px] rounded-[100px] shrink-0 cursor-pointer hover:bg-[#0082ad] transition-colors"
        >
          <Icon src={`${A}/chat-white.svg`} size={20} />
          <span className="font-semibold leading-[normal] text-[16px] text-white text-center whitespace-nowrap">Message client</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row flex-[1_0_0] gap-[20px] items-stretch min-h-px w-full" data-node-id="87:2786">
        <div className="bg-white flex flex-[1_0_0] items-start min-w-px overflow-y-auto p-[24px] rounded-[20px]" data-node-id="87:2787">
          <div className="border-[#e8e8e8] border-b border-solid flex flex-[1_0_0] flex-col gap-[14px] items-start min-w-px">
            <div className="flex items-center justify-between w-full">
              <p className="font-bold leading-[normal] text-[16px] text-[#111] whitespace-nowrap">Submissions ({docs.length})</p>
              <Dropdown variant="compact" value={sort} options={SORT_OPTIONS} onChange={setSort} label="Sort" menuAlign="right" />
            </div>
            <div className="flex flex-col gap-[10px] items-start w-full">
              {docs.map((doc) => {
                const thumb = thumbFor(doc.type);
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => onOpenDocument(doc.id)}
                    className="border border-[#e8e8e8] border-solid flex gap-[16px] items-center p-[16px] relative rounded-[10px] w-full text-left cursor-pointer hover:bg-[#fafafa] transition-colors"
                  >
                    <span className="relative shrink-0 size-[40px]">
                      <span className="absolute inset-0 overflow-hidden pointer-events-none">
                        <img alt="" className="absolute max-w-none" src={thumb.src} style={thumb.style} />
                      </span>
                    </span>
                    <span className="flex flex-[1_0_0] flex-col gap-[6px] items-start justify-center leading-[normal] min-w-px whitespace-nowrap">
                      <span className="font-semibold text-[14px] text-[#111]">{doc.title}</span>
                      <span className="font-normal text-[12px] text-[#6a6a6a]">{doc.submissionId} · {formatDate(doc.date)}</span>
                    </span>
                    <StatusBadge status={doc.status} />
                    {doc.pages > 1 && (
                      <span className="absolute bg-[#f5f5f5] flex items-center justify-center left-[46px] rounded-[20px] size-[20px] top-[7px]">
                        <span className="font-semibold leading-[normal] text-[12px] text-[#111] text-center">{doc.pages}</span>
                      </span>
                    )}
                  </button>
                );
              })}
              {docs.length === 0 && <p className="py-[20px] text-[14px] text-[#6a6a6a]">No submissions yet.</p>}
            </div>
          </div>
        </div>

        <div className="bg-white flex flex-col gap-[40px] items-start overflow-y-auto p-[24px] rounded-[20px] shrink-0 lg:w-[465px]" data-node-id="87:2825">
          <div className="flex flex-col gap-[16px] items-start rounded-[10px] w-full">
            <div className="flex items-center justify-between w-full">
              <InfoItem label="Phone" value={client.phone} />
              <InfoItem label="SSN" value={client.ssn} />
            </div>
            <div className="flex items-start justify-between w-full">
              <InfoItem label="Filing Status" value={client.filingStatus} />
              <InfoItem label="Direct Deposit" value={client.directDeposit} />
            </div>
            <div className="flex items-start justify-between w-full">
              <InfoItem label="Tax Year" value={client.taxYear} />
              <InfoItem label="Account created" value={formatDate(client.createdAt)} />
            </div>
          </div>

          <div className="flex flex-col gap-[10px] items-start w-full">
            <label htmlFor="internal-notes" className={sectionLabel}>internal notes</label>
            <textarea
              id="internal-notes"
              value={client.notes}
              onChange={(e) => onNotesChange(client.id, e.target.value)}
              placeholder="Add a note for your team..."
              className="bg-white border border-[#dcdcdc] border-solid h-[120px] p-[10px] rounded-[10px] w-full resize-none outline-none focus:border-[#0094c5] font-medium leading-[normal] text-[16px] text-[#111] placeholder:text-[#848484]"
            />
          </div>

          <div className="flex flex-col gap-[10px] items-start w-full">
            <p className={sectionLabel}>Recent Activity</p>
            {clientActivity(client).map((item) => (
              <div key={item.id} className="flex gap-[10px] items-center w-full">
                <span className="bg-[#e5f7dc] flex items-center justify-center rounded-[200px] shrink-0 size-[32px]">
                  <Icon src={`${A}/activity-check.svg`} size={20} />
                </span>
                <div className="flex flex-[1_0_0] flex-col gap-[4px] items-start leading-[normal] min-w-px">
                  <p className="font-medium text-[14px] text-[#111]">{item.text}</p>
                  <p className="font-normal text-[12px] text-[#6a6a6a] whitespace-nowrap">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

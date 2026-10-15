import { useState, useRef } from 'react';
import { Icon, Dropdown, PillButton } from './ui';
import { STATUSES, DOCUMENT_PAGE_IMAGE, extractedFieldsFor, toCsv, downloadFile } from './adminData';

const A = '/figma/admin';
const ZOOM_STEPS = [50, 75, 100, 125, 150, 200];
const STATUS_OPTIONS = STATUSES.map(({ id, label }) => ({ value: id, label }));
const dmSans = { fontVariationSettings: '"opsz" 14' };

function ViewerButton({ icon, label, onClick, children, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`bg-[rgba(255,255,255,0.1)] flex gap-[8px] h-[38px] items-center justify-center rounded-[100px] shrink-0 cursor-pointer enabled:hover:bg-[rgba(255,255,255,0.2)] disabled:opacity-40 disabled:cursor-default transition-colors ${children ? 'px-[14px]' : 'w-[38px]'}`}
    >
      <Icon src={icon} size={18} />
      {children && (
        <span className="font-['DM_Sans',sans-serif] font-medium leading-[normal] text-[12px] text-white whitespace-nowrap" style={dmSans}>
          {children}
        </span>
      )}
    </button>
  );
}

function PageThumb({ dimmed }) {
  return (
    <span className={`block relative rounded-[6px] shrink-0 size-[36px] ${dimmed ? 'opacity-80' : ''}`}>
      <span aria-hidden className="absolute inset-0 pointer-events-none rounded-[6px]">
        <span className="absolute inset-0 overflow-hidden rounded-[6px]">
          <img alt="" className="absolute h-full left-[0.04%] max-w-none top-0 w-[99.92%]" src={`${A}/thumb-base.png`} />
        </span>
        <img alt="" className="absolute max-w-none object-cover rounded-[6px] size-full" src={`${A}/thumb-overlay.png`} />
      </span>
    </span>
  );
}

// Original document viewer (Node 87:2309). Pages are placeholders until uploads are served.
function DocumentViewer({ pageCount }) {
  const [zoom, setZoom] = useState(100);
  const [pageIndex, setPageIndex] = useState(0);
  const viewerRef = useRef(null);
  const zoomIndex = ZOOM_STEPS.indexOf(zoom);
  const pages = Math.max(pageCount, 1);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else viewerRef.current?.requestFullscreen?.();
  };

  return (
    <div ref={viewerRef} className="bg-[#5f6971] flex flex-[1_0_0] flex-col min-h-[560px] lg:min-h-0 min-w-px relative" data-node-id="87:2309">
      <div className="absolute inset-0 overflow-auto [scrollbar-width:thin]">
        <div className="flex min-h-full min-w-full items-center justify-center py-[78px] px-[20px] w-max mx-auto">
          <img
            alt={`Document page ${pageIndex + 1}`}
            className="block max-w-none object-cover shadow-[0px_4px_20px_rgba(0,0,0,0.25)] transition-[width,height] duration-200"
            src={DOCUMENT_PAGE_IMAGE}
            style={{ width: (442 * zoom) / 100, height: (561 * zoom) / 100 }}
          />
        </div>
      </div>

      <div className="backdrop-blur-[10px] bg-[rgba(0,0,0,0.3)] flex h-[58px] items-center justify-between px-[16px] py-[10px] relative shrink-0 w-full z-10">
        <p className="font-['DM_Sans',sans-serif] font-semibold leading-[normal] text-[16px] text-white whitespace-nowrap" style={dmSans}>
          Original Document
        </p>
        <div className="flex gap-[10px] items-center shrink-0">
          <ViewerButton icon={`${A}/zoom-out.svg`} label="Zoom out" disabled={zoomIndex <= 0} onClick={() => setZoom(ZOOM_STEPS[zoomIndex - 1])} />
          <p className="font-['DM_Sans',sans-serif] font-medium leading-[normal] text-[12px] text-white whitespace-nowrap w-[34px] text-center" style={dmSans}>{zoom}%</p>
          <ViewerButton icon={`${A}/zoom-in.svg`} label="Zoom in" disabled={zoomIndex >= ZOOM_STEPS.length - 1} onClick={() => setZoom(ZOOM_STEPS[zoomIndex + 1])} />
          <ViewerButton icon={`${A}/arrows-out.svg`} label="Fullscreen" onClick={toggleFullscreen}>Fullscreen</ViewerButton>
        </div>
      </div>

      <div className="flex-1" />

      <div className="backdrop-blur-[10px] bg-[rgba(0,0,0,0.3)] flex h-[58px] items-center justify-between px-[16px] py-[10px] relative shrink-0 w-full z-10">
        <div className="flex gap-[10px] items-center relative shrink-0">
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} type="button" onClick={() => setPageIndex(i)} aria-label={`Page ${i + 1}`} aria-current={i === pageIndex} className="relative block cursor-pointer">
              <PageThumb dimmed={i !== pageIndex} />
              {i === pageIndex && <span className="absolute border border-white border-solid left-[-4px] rounded-[10px] size-[44px] top-[-4px]" />}
            </button>
          ))}
        </div>
        <div className="flex gap-[10px] items-center shrink-0">
          <ViewerButton icon={`${A}/arrow-left-white.svg`} label="Previous page" disabled={pageIndex === 0} onClick={() => setPageIndex(pageIndex - 1)} />
          <p className="font-['DM_Sans',sans-serif] font-medium leading-[normal] text-[12px] text-white whitespace-nowrap" style={dmSans}>
            {pageIndex + 1} of {pages}
          </p>
          <ViewerButton icon={`${A}/arrow-right-white.svg`} label="Next page" disabled={pageIndex >= pages - 1} onClick={() => setPageIndex(pageIndex + 1)} />
        </div>
      </div>
    </div>
  );
}

function ConfirmButton({ confirmed, onToggle, label }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={confirmed}
      aria-label={confirmed ? `Unconfirm ${label}` : `Confirm ${label}`}
      className={`flex items-center justify-center rounded-[100px] shrink-0 size-[39px] cursor-pointer transition-colors ${confirmed ? 'bg-[#1d9834] hover:bg-[#188a2e]' : 'border border-[#b6b6b6] border-solid hover:bg-[#f5f5f5]'}`}
    >
      <Icon src={confirmed ? `${A}/check-white.svg` : `${A}/check-gray.svg`} size={18} />
    </button>
  );
}

const fieldBox = 'bg-white border border-[#dcdcdc] border-solid flex flex-[1_0_0] items-center min-w-px p-[10px] rounded-[10px] font-medium leading-[normal] text-[14px] text-[#111]';

// Document review with OCR fields (Node 87:2258). Mount with key={doc.id}.
export default function DocumentReviewView({ doc, client, onBack, onStatusChange, onRequestReupload, onMessageClient, onFieldsConfirmed }) {
  const [groups, setGroups] = useState(() => extractedFieldsFor(doc));
  const [status, setStatus] = useState(doc.status);


  const updateField = (groupIndex, key, patch) =>
    setGroups((list) =>
      list.map((g, gi) => (gi === groupIndex ? { ...g, fields: g.fields.map((f) => (f.key === key ? { ...f, ...patch } : f)) } : g)),
    );

  const confirmAll = () => {
    setGroups((list) => list.map((g) => ({ ...g, fields: g.fields.map((f) => ({ ...f, confirmed: true })) })));
    onFieldsConfirmed(doc);
  };

  const allConfirmed = groups.every((g) => g.fields.every((f) => f.confirmed));
  const title = `${doc.title} (${client.name})`;

  const exportFields = () =>
    downloadFile(
      `${doc.submissionId}-${doc.type}.csv`,
      toCsv([['Group', 'Field', 'Value', 'Confirmed'], ...groups.flatMap((g) => g.fields.map((f) => [g.group, f.label, f.value, f.confirmed ? 'Yes' : 'No']))]),
    );

  return (
    <div className="flex flex-col gap-[20px] items-start w-full lg:h-[calc(var(--vh)-40px)]" data-node-id="87:2294">
      <div className="bg-white flex flex-wrap gap-[16px] items-center p-[16px] rounded-[20px] shrink-0 w-full" data-node-id="87:2295">
        <button type="button" onClick={onBack} aria-label="Back" className="flex items-center p-[6px] rounded-[100px] shrink-0 cursor-pointer hover:bg-[#f5f5f5]">
          <Icon src={`${A}/arrow-left.svg`} />
        </button>
        <div className="flex flex-[1_0_0] flex-col gap-[4px] items-start justify-center leading-[normal] min-w-[200px]">
          <h1 className="font-bold text-[20px] text-[#111]">{title}</h1>
          <p className="font-medium text-[14px] text-[#6a6a6a]">{doc.submissionId}</p>
        </div>
        <div className="flex gap-[10px] items-center shrink-0">
          <PillButton tone="soft" icon={`${A}/printer.svg`} onClick={() => window.print()}>Print</PillButton>
          <PillButton tone="soft" icon={`${A}/download-simple.svg`} onClick={exportFields}>Export</PillButton>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-[1_0_0] items-stretch min-h-px overflow-clip rounded-[20px] w-full" data-node-id="87:2308">
        <DocumentViewer key={doc.id} pageCount={doc.pages} />

        <div className="bg-white flex flex-[1_0_0] flex-col items-center min-h-px min-w-px pb-[32px] relative" data-node-id="87:2333">
          <div className="flex flex-col items-start shrink-0 w-full">
            <div className="bg-white border-[#dcdcdc] border-b border-solid flex items-center justify-between gap-[10px] px-[16px] py-[10px] w-full">
              <div className="flex gap-[10px] items-center shrink-0">
                <p className="font-['DM_Sans',sans-serif] font-semibold leading-[normal] text-[16px] text-[#111] whitespace-nowrap" style={dmSans}>Extracted Fields</p>
                <span className="bg-[rgba(0,148,197,0.1)] flex items-center justify-center px-[8px] py-[4px] rounded-[20px] shrink-0">
                  <span className="font-semibold leading-[normal] text-[12px] text-[#0094c5] text-center tracking-[0.12px] whitespace-nowrap">OCR Extracted</span>
                </span>
              </div>
              <button
                type="button"
                onClick={confirmAll}
                disabled={allConfirmed}
                className="bg-[#1d9834] flex gap-[8px] items-center justify-center px-[14px] py-[8px] rounded-[100px] shrink-0 cursor-pointer enabled:hover:bg-[#188a2e] disabled:opacity-60 disabled:cursor-default transition-colors"
              >
                <Icon src={`${A}/checks.svg`} size={22} />
                <span className="font-['DM_Sans',sans-serif] font-semibold leading-[normal] text-[14px] text-white whitespace-nowrap" style={dmSans}>
                  {allConfirmed ? 'All confirmed' : 'Confirm all'}
                </span>
              </button>
            </div>
            <div className="bg-[#848484] flex font-semibold gap-[10px] items-start leading-[normal] px-[16px] py-[4px] text-[12px] text-white tracking-[0.48px] uppercase w-full">
              <p className="w-[202px]">Field</p>
              <p className="w-[201px]">value</p>
            </div>
          </div>

          <div className="flex flex-col gap-[30px] items-start py-[10px] w-full lg:flex-1 lg:min-h-0 lg:overflow-y-auto [scrollbar-width:thin]" data-node-id="87:2346">
            {groups.map((group, gi) => (
              <div key={group.group} className="flex flex-col gap-[6px] items-start px-[16px] w-full">
                <p className="font-semibold leading-[normal] text-[12px] text-[#6a6a6a] tracking-[0.48px] uppercase w-full">{group.group}</p>
                {group.fields.map((field) => (
                  <div key={field.key} className="flex gap-[10px] items-start w-full">
                    <div className={fieldBox}>
                      <span className="truncate">{field.label}</span>
                    </div>
                    <input
                      value={field.value}
                      onChange={(e) => updateField(gi, field.key, { value: e.target.value, confirmed: false })}
                      aria-label={field.label}
                      className={`${fieldBox} outline-none focus:border-[#0094c5]`}
                    />
                    <ConfirmButton confirmed={field.confirmed} label={field.label} onToggle={() => updateField(gi, field.key, { confirmed: !field.confirmed })} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white flex flex-wrap gap-[10px] items-center justify-between p-[16px] rounded-[20px] shrink-0 w-full" data-node-id="87:2432">
        <div className="flex flex-wrap gap-[10px] items-center">
          <button
            type="button"
            onClick={() => onMessageClient(client.id)}
            className="bg-white border border-[#e8e8e8] border-solid flex gap-[8px] items-center justify-center px-[14px] py-[10px] rounded-[30px] shrink-0 cursor-pointer hover:bg-[#fafafa]"
          >
            <Icon src={`${A}/chat.svg`} size={20} />
            <span className="font-medium leading-[24px] text-[16px] text-[#111] text-center whitespace-nowrap">Message client</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setStatus('action_needed');
              onRequestReupload(doc);
            }}
            className="bg-[#ffecec] flex gap-[8px] items-center justify-center px-[16px] py-[12px] rounded-[100px] shrink-0 cursor-pointer hover:bg-[#ffdede]"
          >
            <Icon src={`${A}/arrow-ccw-red.svg`} size={20} />
            <span className="font-medium leading-[normal] text-[14px] text-[#ea0101] whitespace-nowrap">Request re-upload</span>
          </button>
        </div>
        <div className="flex gap-[10px] items-center">
          <Dropdown variant="outlineLarge" value={status} options={STATUS_OPTIONS} onChange={setStatus} menuAlign="right" />
          <button
            type="button"
            onClick={() => onStatusChange(doc, status)}
            className="bg-[#0094c5] flex items-center justify-center px-[24px] py-[12px] rounded-[100px] shrink-0 cursor-pointer hover:bg-[#0082ad] transition-colors"
          >
            <span className="font-bold leading-[normal] text-[16px] text-white whitespace-nowrap">Update Status</span>
          </button>
        </div>
      </div>
    </div>
  );
}

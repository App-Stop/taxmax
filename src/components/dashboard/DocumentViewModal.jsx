import { useState, useEffect, useRef } from 'react';
import DocumentThumb, { DocumentStatus } from './DocumentThumb';
import { formatDate, formatTime } from './dashboardData';

const imgFiles = "/figma/dashboard/files-16-view.svg";
const imgCaretDown = "/figma/dashboard/caret-down.svg";
const imgCheck = "/figma/dashboard/check.svg";
const imgZoomOut = "/figma/dashboard/zoom-out.svg";
const imgZoomIn = "/figma/dashboard/zoom-in.svg";
const imgArrowsOut = "/figma/dashboard/arrows-out.svg";
const imgX = "/figma/dashboard/x.svg";
const imgInfo = "/figma/dashboard/info-20.svg";

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

// View Document Modal (Node 71:2525) with the Document Options dropdown (Node 71:2447)
export default function DocumentViewModal({ documents, docId, onSelectDocument, onPagesChange, onRetake, onClose }) {
  const doc = documents.find((d) => d.id === docId);
  const [zoom, setZoom] = useState(1);
  const [pageIndex, setPageIndex] = useState(0);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const previewRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !document.fullscreenElement) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  if (!doc) return null;

  const { pages } = doc;
  const page = pages[Math.min(pageIndex, pages.length - 1)];
  const statusIcon = doc.status === 'submitted' ? imgFiles : undefined;

  const selectDocument = (id) => {
    onSelectDocument(id);
    setOptionsOpen(false);
    setPageIndex(0);
    setZoom(1);
  };

  const removePage = (index) => {
    onPagesChange(doc.id, pages.filter((_, i) => i !== index));
    setPageIndex((current) => Math.max(0, current > index || current === pages.length - 1 ? current - 1 : current));
  };

  const dropPage = (index) => {
    if (dragIndex === null || dragIndex === index) return;
    const next = [...pages];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    onPagesChange(doc.id, next);
    setPageIndex(index);
    setDragIndex(null);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else previewRef.current?.requestFullscreen?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-[16px] animate-auth-fade-in" onClick={onClose}>
      <div
        className="backdrop-blur-[10px] bg-[rgba(255,255,255,0.8)] border border-solid border-white flex flex-col gap-[20px] items-center p-[16px] rounded-[20px] shadow-[0px_0px_120px_0px_rgba(0,0,0,0.25)] w-[500px] max-w-full max-h-[calc(var(--vh)-32px)]"
        role="dialog"
        aria-modal="true"
        aria-label={doc.name}
        onClick={(e) => e.stopPropagation()}
        data-node-id="71:2525"
      >
        {/* Document switcher (Node 71:2526) */}
        <div className="relative shrink-0 w-full z-10">
          <button
            type="button"
            onClick={() => setOptionsOpen(!optionsOpen)}
            aria-haspopup="listbox"
            aria-expanded={optionsOpen}
            className="bg-[#f5f5f5] cursor-pointer flex gap-[16px] h-[72px] items-center p-[16px] rounded-[20px] w-full"
            data-node-id="71:2526"
          >
            <DocumentThumb doc={doc} className="size-[40px]" />
            <div className="flex flex-[1_0_0] flex-col gap-[4px] items-start justify-center min-w-px">
              <p className="font-semibold leading-[normal] text-[14px] text-[#111] text-left w-full">{doc.name}</p>
              <DocumentStatus status={doc.status} icon={statusIcon} />
            </div>
            <div className={`relative shrink-0 size-[16px] transition-transform ${optionsOpen ? 'rotate-180' : ''}`}>
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCaretDown} />
            </div>
          </button>

          {optionsOpen && (
            <div className="absolute left-0 top-[calc(100%+8px)] bg-white flex flex-col items-start overflow-clip p-[4px] rounded-[24px] shadow-[0px_0px_40px_0px_rgba(0,0,0,0.16)] w-full max-h-[300px] overflow-y-auto" role="listbox" data-node-id="71:2447">
              {documents.map((option) => {
                const selected = option.id === doc.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => selectDocument(option.id)}
                    className={`flex gap-[8px] items-center p-[14px] rounded-[20px] shrink-0 w-full cursor-pointer transition-colors ${selected ? 'bg-[rgba(0,148,197,0.1)]' : 'hover:bg-[#f5f5f5]'}`}
                  >
                    <DocumentThumb doc={option} className="size-[30px]" />
                    <p className="flex-[1_0_0] font-medium leading-[20px] min-w-px text-[14px] text-[#111] text-left">{option.name}</p>
                    {selected && (
                      <div className="relative shrink-0 size-[16px]">
                        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-[10px] items-start justify-center min-h-0 shrink w-full" data-node-id="71:2534">
          {/* Preview (Node 71:2535) */}
          <div ref={previewRef} className="bg-[#f5f5f5] flex h-[370px] min-h-[200px] shrink items-center justify-center overflow-hidden p-[18px] relative rounded-[14px] w-full" data-node-id="71:2535">
            <div className="aspect-[274/334] h-full relative shrink-0 transition-transform" style={{ transform: `scale(${zoom})` }} data-node-id="71:2536">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt={`${doc.name} page ${pageIndex + 1}`} className="absolute h-full left-[0.04%] max-w-none top-0 w-[99.92%]" src={page.preview} />
              </div>
            </div>
            <div className="-translate-x-1/2 absolute bottom-[10px] flex gap-[10px] items-center left-[calc(50%+0.5px)]" data-node-id="71:2537">
              <div className="backdrop-blur-[15px] bg-[rgba(0,0,0,0.2)] flex gap-[8px] h-[38px] items-center justify-center px-[14px] py-[8px] rounded-[100px] shrink-0">
                <button type="button" onClick={() => setZoom(Math.max(ZOOM_MIN, zoom - ZOOM_STEP))} disabled={zoom <= ZOOM_MIN} aria-label="Zoom out" className="relative shrink-0 size-[18px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgZoomOut} />
                </button>
                <p className="font-['DM_Sans',sans-serif] font-medium leading-[normal] text-[12px] text-white text-center whitespace-nowrap min-w-[31px]" style={{ fontVariationSettings: '"opsz" 14' }}>
                  {Math.round(zoom * 100)}%
                </p>
                <button type="button" onClick={() => setZoom(Math.min(ZOOM_MAX, zoom + ZOOM_STEP))} disabled={zoom >= ZOOM_MAX} aria-label="Zoom in" className="relative shrink-0 size-[18px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgZoomIn} />
                </button>
              </div>
              <button type="button" onClick={toggleFullscreen} className="backdrop-blur-[15px] bg-[rgba(0,0,0,0.2)] cursor-pointer flex gap-[8px] h-[38px] items-center justify-center px-[14px] py-[8px] rounded-[100px] shrink-0">
                <span className="relative shrink-0 size-[18px]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowsOut} />
                </span>
                <span className="font-['DM_Sans',sans-serif] font-medium leading-[normal] text-[12px] text-white whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
                  Fullscreen
                </span>
              </button>
            </div>
          </div>

          {/* Pages (Node 71:2545) */}
          <div className="flex flex-col gap-[4px] items-start shrink-0 w-full" data-node-id="71:2545">
            <div className="flex flex-wrap gap-[10px] items-start" data-node-id="71:2546">
              {pages.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => dropPage(index)}
                  onDragEnd={() => setDragIndex(null)}
                  className={`relative flex flex-col gap-[2.4px] items-center pt-[8.11px] w-[60px] cursor-grab transition-opacity ${dragIndex === index ? 'opacity-40' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => setPageIndex(index)}
                    aria-label={`Show page ${index + 1}`}
                    className={`relative rounded-[14px] size-[60px] cursor-pointer ${index === pageIndex ? 'shadow-[0_0_0_2px_#0094c5]' : ''}`}
                  >
                    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[14px]">
                      <img alt="" className="absolute h-full left-[0.04%] max-w-none top-0 w-[99.92%]" src={item.preview} />
                    </div>
                  </button>
                  {pages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePage(index)}
                      aria-label={`Remove page ${index + 1}`}
                      className="absolute top-0 right-[-9px] bg-[#fafafa] border-[0.5px] border-[#e8e8e8] border-solid cursor-pointer flex items-center p-[2px] rounded-[41px]"
                    >
                      <span className="relative shrink-0 size-[14px]">
                        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgX} />
                      </span>
                    </button>
                  )}
                  <p className="font-normal leading-[normal] text-[12px] text-[#848484] text-center whitespace-nowrap">{index + 1}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-[8px] items-center rounded-[20px] shrink-0 w-full" data-node-id="71:2559">
              <div className="relative shrink-0 size-[20px]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgInfo} />
              </div>
              <p className="flex-[1_0_0] font-normal leading-[normal] min-w-px text-[12px] text-[#444]">Re-arrange pages by dragging the images</p>
            </div>
          </div>

          {/* Submission details (Node 71:2562) */}
          <div className="bg-[#f5f5f5] flex flex-col items-start overflow-clip rounded-[20px] shrink-0 w-full" data-node-id="71:2562">
            <div className="flex items-center justify-between p-[16px] shrink-0 w-full">
              <p className="font-normal leading-[normal] text-[14px] text-[#444] whitespace-nowrap">Submission date</p>
              <p className="font-semibold leading-[normal] text-[14px] text-[#111] whitespace-nowrap">{formatDate(doc.submittedAt)}</p>
            </div>
            <div className="flex items-center justify-between p-[16px] shrink-0 w-full">
              <p className="font-normal leading-[normal] text-[14px] text-[#444] whitespace-nowrap">Submission time</p>
              <p className="font-semibold leading-[normal] text-[14px] text-[#111] whitespace-nowrap">{formatTime(doc.submittedAt)}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-[20px] items-start shrink-0 w-full" data-node-id="71:2571">
          <button type="button" onClick={onClose} className="bg-[#f5f5f5] hover:bg-[#e8e8e8] transition-colors cursor-pointer flex flex-[1_0_0] h-[56px] items-center justify-center min-w-px p-[12px] rounded-[100px] font-bold leading-[normal] text-[16px] text-[#111] whitespace-nowrap">
            Close
          </button>
          <button type="button" onClick={onRetake} className="bg-[rgba(0,148,197,0.1)] hover:bg-[rgba(0,148,197,0.16)] transition-colors cursor-pointer flex flex-[1_0_0] h-[56px] items-center justify-center min-w-px p-[12px] rounded-[100px] font-bold leading-[normal] text-[16px] text-[#0094c5] whitespace-nowrap">
            Retake
          </button>
        </div>
      </div>
    </div>
  );
}

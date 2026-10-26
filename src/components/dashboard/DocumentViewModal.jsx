import { useState, useEffect, useRef } from 'react';
import DocumentThumb, { DocumentStatus } from './DocumentThumb';
import DocumentFields from './DocumentFields';
import { formatDate, formatTime, toDashboardDocument } from './dashboardData';
import {
  CUSTOMER_EDITABLE_STATUSES,
  IMAGE_TYPES,
  MAX_PAGES,
  imageProblem,
  getDocument,
  updatePages,
  addPages,
  deleteDocument,
} from '../../services/documents';

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
const OCR_POLL_MS = 2500;
const OCR_POLL_LIMIT_MS = 2 * 60 * 1000;

const LOCKED_HINT = {
  'in-review': 'Your preparer is reviewing this document, so it can’t be changed right now.',
  accepted: 'This document has been verified and can no longer be changed.',
  submitted: 'This document has been submitted for filing and can no longer be changed.',
  completed: 'This document is complete and can no longer be changed.',
  filed: 'This document has been filed and can no longer be changed.',
};

const isReading = (doc) => doc?.ocrStatus === 'pending' || doc?.ocrStatus === 'processing';

// The team's message for the current status, with what the customer should do about it.
function StatusNotice({ document }) {
  const { status, statusNote } = document;
  if (status === 're-upload') {
    return (
      <Notice tone="alert" title="Your preparer needs new photos">
        {statusNote}
        <br />
        Add the new photos below. Once they’re added, the document goes back to your preparer.
      </Notice>
    );
  }
  if (status === 'action-needed') {
    return (
      <Notice tone="alert" title="Some details need your attention">
        {statusNote || 'Your preparer flagged details that need correcting. They’re highlighted below.'}
      </Notice>
    );
  }
  if (statusNote) return <Notice title="Note from your preparer">{statusNote}</Notice>;
  return null;
}

function Notice({ tone, title, children }) {
  const alert = tone === 'alert';
  return (
    <div className={`flex flex-col gap-[4px] p-[14px] rounded-[16px] shrink-0 w-full ${alert ? 'bg-[#fff1f0] border border-[#fecdca]' : 'bg-[rgba(0,148,197,0.08)]'}`} role={alert ? 'alert' : undefined}>
      <p className={`font-semibold text-[14px] ${alert ? 'text-[#b42318]' : 'text-[#111]'}`}>{title}</p>
      <p className="font-normal text-[13px] text-[#444] leading-[18px] [word-break:break-word]">{children}</p>
    </div>
  );
}

// View Document Modal (Node 71:2525) with the Document Options dropdown (Node 71:2447).
// `documents` are the dashboard's list rows; the open document is loaded in full here.
export default function DocumentViewModal({ documents, docId, onSelectDocument, onChanged, onDeleted, onClose }) {
  const listDoc = documents.find((d) => d.id === docId);
  const [detail, setDetail] = useState(null); // full API document
  const [loadError, setLoadError] = useState('');
  const [reloadNonce, setReloadNonce] = useState(0);
  const [ocrSlow, setOcrSlow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pageIndex, setPageIndex] = useState(0);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);

  // Loads the document, then keeps polling while OCR is reading it (for a few minutes at most).
  useEffect(() => {
    let active = true;
    let timer;
    const startedAt = Date.now();
    const load = async () => {
      try {
        const doc = await getDocument(docId);
        if (!active) return;
        setDetail(doc);
        setLoadError('');
        const reading = isReading(doc);
        const timedOut = reading && Date.now() - startedAt > OCR_POLL_LIMIT_MS;
        setOcrSlow(timedOut);
        if (reading && !timedOut) timer = setTimeout(load, OCR_POLL_MS);
      } catch (err) {
        if (active) setLoadError(err.message);
      }
    };
    load();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [docId, reloadNonce]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !document.fullscreenElement) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // A stale document from the previous selection is never shown.
  const current = detail?._id === docId ? detail : null;
  const doc = current ? toDashboardDocument(current) : listDoc;
  if (!doc) return null;

  const pages = current?.pages || [];
  const page = pages[Math.min(pageIndex, pages.length - 1)];
  const editable = Boolean(current) && CUSTOMER_EDITABLE_STATUSES.includes(current.status);
  const statusIcon = doc.status === 'uploaded' ? imgFiles : undefined;

  // Runs a change; every change returns the updated document. Returns true on success.
  const mutate = async (action) => {
    setBusy(true);
    setActionError('');
    try {
      const updated = await action(docId);
      setDetail(updated);
      onChanged();
      if (isReading(updated)) setReloadNonce((n) => n + 1);
      return true;
    } catch (err) {
      setActionError(err.message);
      // 409: the status changed since the document was loaded; 404: it is gone.
      if (err.status === 409 || err.status === 404) {
        setReloadNonce((n) => n + 1);
        onChanged();
      }
      return false;
    } finally {
      setBusy(false);
    }
  };

  const savePages = (next) => mutate((id) => updatePages(id, next.map((p) => p.key)));

  const selectDocument = (id) => {
    onSelectDocument(id);
    setOptionsOpen(false);
    setPageIndex(0);
    setZoom(1);
    setActionError('');
    setConfirmDelete(false);
  };

  const removePage = async (index) => {
    if (await savePages(pages.filter((_, i) => i !== index))) {
      setPageIndex((cur) => Math.max(0, cur > index || cur === pages.length - 1 ? cur - 1 : cur));
    }
  };

  const dropPage = async (index) => {
    if (dragIndex === null || dragIndex === index) return;
    const next = [...pages];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setDragIndex(null);
    if (await savePages(next)) setPageIndex(index);
  };

  const handleAddFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    const problem = files.map(imageProblem).find(Boolean);
    if (problem) {
      setActionError(problem);
      return;
    }
    if (pages.length + files.length > MAX_PAGES) {
      setActionError(`A document can have at most ${MAX_PAGES} pages.`);
      return;
    }
    if (await mutate(() => addPages(current, files))) setPageIndex(pages.length);
  };

  const handleDelete = async () => {
    setBusy(true);
    setActionError('');
    try {
      await deleteDocument(docId);
      onDeleted();
    } catch (err) {
      setActionError(err.message);
      setConfirmDelete(false);
      if (err.status === 409) setReloadNonce((n) => n + 1);
    } finally {
      setBusy(false);
    }
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
                const selected = option.id === docId;
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

        <div className="flex flex-col gap-[10px] items-start min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin] w-full" data-node-id="71:2534">
          {current && <StatusNotice document={current} />}

          {/* Preview (Node 71:2535) */}
          <div ref={previewRef} className="bg-[#f5f5f5] flex h-[340px] shrink-0 items-center justify-center overflow-hidden p-[18px] relative rounded-[14px] w-full" data-node-id="71:2535">
            {page ? (
              <div className="h-full w-full relative transition-transform" style={{ transform: `scale(${zoom})` }} data-node-id="71:2536">
                <img alt={`${doc.name} page ${pageIndex + 1}`} className="absolute inset-0 size-full object-contain" src={page.url} />
              </div>
            ) : (
              <p className="font-medium text-[14px] text-[#848484] text-center">
                {loadError || 'Loading document…'}
              </p>
            )}
            {loadError && !current && (
              <button type="button" onClick={() => setReloadNonce((n) => n + 1)} className="absolute bottom-[16px] font-semibold text-[14px] text-[#0094c5] cursor-pointer hover:underline">
                Try again
              </button>
            )}
            {page && (
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
            )}
          </div>

          {/* Pages (Node 71:2545) */}
          {pages.length > 0 && (
            <div className="flex flex-col gap-[4px] items-start shrink-0 w-full" data-node-id="71:2545">
              <div className="flex flex-wrap gap-[10px] items-start" data-node-id="71:2546">
                {pages.map((item, index) => (
                  <div
                    key={item.key}
                    draggable={editable && !busy}
                    onDragStart={() => setDragIndex(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => dropPage(index)}
                    onDragEnd={() => setDragIndex(null)}
                    className={`relative flex flex-col gap-[2.4px] items-center pt-[8.11px] w-[60px] transition-opacity ${editable ? 'cursor-grab' : ''} ${dragIndex === index ? 'opacity-40' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => setPageIndex(index)}
                      aria-label={`Show page ${index + 1}`}
                      className={`relative rounded-[14px] size-[60px] cursor-pointer ${index === pageIndex ? 'shadow-[0_0_0_2px_#0094c5]' : ''}`}
                    >
                      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[14px]">
                        <img alt="" className="absolute inset-0 size-full object-cover" src={item.url} />
                      </div>
                    </button>
                    {editable && pages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePage(index)}
                        disabled={busy}
                        aria-label={`Remove page ${index + 1}`}
                        className="absolute top-0 right-[-9px] bg-[#fafafa] border-[0.5px] border-[#e8e8e8] border-solid cursor-pointer flex items-center p-[2px] rounded-[41px] disabled:opacity-40 disabled:cursor-not-allowed"
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
                <p className="flex-[1_0_0] font-normal leading-[normal] min-w-px text-[12px] text-[#444]">
                  {editable ? 'Re-arrange pages by dragging the images' : LOCKED_HINT[current?.status] || ''}
                </p>
              </div>
            </div>
          )}

          {actionError && (
            <p className="font-medium text-[12px] text-red-600 w-full" role="alert">
              {actionError}
            </p>
          )}

          {current && <DocumentFields document={current} editable={editable} busy={busy} slow={ocrSlow} onMutate={mutate} />}

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

          {editable && (
            <div className="flex gap-[12px] items-center justify-center shrink-0 w-full py-[4px]">
              {confirmDelete ? (
                <>
                  <p className="font-medium text-[13px] text-[#444]">Delete this document and its photos?</p>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="font-semibold text-[13px] text-[#6a6a6a] cursor-pointer hover:underline">
                    Cancel
                  </button>
                  <button type="button" onClick={handleDelete} disabled={busy} className="font-semibold text-[13px] text-[#ea0101] cursor-pointer hover:underline disabled:opacity-40">
                    Delete
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)} disabled={busy} className="font-semibold text-[13px] text-[#ea0101] cursor-pointer hover:underline disabled:opacity-40">
                  Delete document
                </button>
              )}
            </div>
          )}
        </div>

        <input type="file" ref={fileInputRef} onChange={handleAddFiles} multiple accept={IMAGE_TYPES.join(',')} className="hidden" />

        <div className="flex gap-[20px] items-start shrink-0 w-full" data-node-id="71:2571">
          <button type="button" onClick={onClose} className="bg-[#f5f5f5] hover:bg-[#e8e8e8] transition-colors cursor-pointer flex flex-[1_0_0] h-[56px] items-center justify-center min-w-px p-[12px] rounded-[100px] font-bold leading-[normal] text-[16px] text-[#111] whitespace-nowrap">
            Close
          </button>
          {editable && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy || pages.length >= MAX_PAGES}
              className="bg-[rgba(0,148,197,0.1)] hover:bg-[rgba(0,148,197,0.16)] transition-colors cursor-pointer flex flex-[1_0_0] h-[56px] items-center justify-center min-w-px p-[12px] rounded-[100px] font-bold leading-[normal] text-[16px] text-[#0094c5] whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {busy ? 'Saving…' : current.status === 're-upload' ? 'Add new photos' : 'Add pages'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

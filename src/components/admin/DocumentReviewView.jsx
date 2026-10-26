import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Icon, Dropdown, PillButton, ListState, Modal, ModalHeader, TextField, primaryButton, secondaryButton } from './ui';
import { statusById, toCsv, downloadFile } from './adminData';
import { groupDocumentFields, mapClient } from './adminApiMappers';
import {
  getDocument,
  reviewDocument,
  updateDocumentStatus,
  addDocumentField,
  updateDocumentField,
  deleteDocumentField,
  retryDocumentOcr,
} from '../../services/team';

const A = '/figma/admin';
const ZOOM_STEPS = [50, 75, 100, 125, 150, 200];
const OCR_POLL_INTERVAL_MS = 2500;
const OCR_MAX_POLL_MS = 120000;
const dmSans = { fontVariationSettings: '"opsz" 14' };

const ALLOWED_TRANSITIONS = {
  uploaded: ['in-review'],
  'in-review': ['re-upload', 'action-needed', 'accepted'],
  're-upload': ['in-review'],
  'action-needed': ['in-review'],
  accepted: ['submitted', 'in-review', 'action-needed'],
  submitted: ['completed', 'filed', 'action-needed'],
  completed: [],
  filed: ['action-needed'],
};

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

function PageThumb({ url, pageNumber, active }) {
  return (
    <span
      className={`relative flex items-center justify-center rounded-[6px] shrink-0 size-[36px] overflow-hidden border transition-all ${
        active ? 'border-white ring-2 ring-white/60 shadow-md' : 'border-white/30 opacity-70 hover:opacity-100'
      }`}
    >
      {url ? (
        <img alt={`Thumb ${pageNumber}`} className="object-cover size-full" src={url} />
      ) : (
        <span className="font-semibold text-[11px] text-white bg-black/40 size-full flex items-center justify-center">
          P{pageNumber}
        </span>
      )}
    </span>
  );
}

function DocumentViewer({ pages = [] }) {
  const [zoom, setZoom] = useState(100);
  const [pageIndex, setPageIndex] = useState(0);
  const [failedUrl, setFailedUrl] = useState(null);
  const viewerRef = useRef(null);
  const zoomIndex = ZOOM_STEPS.indexOf(zoom);
  const totalPages = Math.max(pages.length, 1);
  const currentPage = pages[pageIndex];
  const imageError = Boolean(currentPage?.url && failedUrl === currentPage.url);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else viewerRef.current?.requestFullscreen?.();
  };

  return (
    <div ref={viewerRef} className="bg-[#5f6971] flex flex-[1_0_0] flex-col min-h-[560px] lg:min-h-0 min-w-px relative overflow-hidden" data-node-id="87:2309">
      {/* Scrollable Document Canvas */}
      <div className="absolute inset-0 overflow-auto [scrollbar-width:thin]">
        <div className="flex min-h-full min-w-full items-center justify-center py-[78px] px-[20px] w-max mx-auto">
          {currentPage?.url && !imageError ? (
            <img
              alt={`Document page ${pageIndex + 1}`}
              className="block max-w-none object-contain shadow-[0px_4px_24px_rgba(0,0,0,0.35)] rounded-[4px] transition-[width,height] duration-200"
              src={currentPage.url}
              onError={() => setFailedUrl(currentPage?.url)}
              style={{ width: (460 * zoom) / 100, height: 'auto', maxHeight: (720 * zoom) / 100 }}
            />
          ) : (
            <div className="bg-[#3e464c] border border-white/20 flex flex-col gap-[12px] items-center justify-center p-[40px] rounded-[12px] text-center text-white max-w-[420px]">
              <Icon src={`${A}/info.svg`} size={32} />
              <p className="font-medium text-[15px]">
                {imageError ? 'Unable to load page image. The link may have expired.' : 'No preview available for this page.'}
              </p>
              {imageError && (
                <button
                  type="button"
                  onClick={() => setFailedUrl(null)}
                  className="bg-white/10 hover:bg-white/20 px-[16px] py-[8px] rounded-[100px] text-[13px] font-medium text-white transition-colors cursor-pointer"
                >
                  Reload Image
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Top Bar with Zoom & Fullscreen Controls */}
      <div className="backdrop-blur-[10px] bg-[rgba(0,0,0,0.4)] flex h-[58px] items-center justify-between px-[16px] py-[10px] relative shrink-0 w-full z-10 border-b border-white/10">
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

      {/* Bottom Bar with Page Navigation */}
      <div className="backdrop-blur-[10px] bg-[rgba(0,0,0,0.4)] flex h-[58px] items-center justify-between px-[16px] py-[10px] relative shrink-0 w-full z-10 border-t border-white/10">
        <div className="flex gap-[10px] items-center relative shrink-0 overflow-x-auto max-w-[60%] [scrollbar-width:none]">
          {pages.map((p, i) => (
            <button key={p.key || i} type="button" onClick={() => setPageIndex(i)} aria-label={`Page ${i + 1}`} className="cursor-pointer">
              <PageThumb url={p.url} pageNumber={i + 1} active={i === pageIndex} />
            </button>
          ))}
        </div>
        <div className="flex gap-[10px] items-center shrink-0">
          <ViewerButton icon={`${A}/arrow-left-white.svg`} label="Previous page" disabled={pageIndex === 0} onClick={() => setPageIndex(pageIndex - 1)} />
          <p className="font-['DM_Sans',sans-serif] font-medium leading-[normal] text-[12px] text-white whitespace-nowrap" style={dmSans}>
            {pageIndex + 1} of {totalPages}
          </p>
          <ViewerButton icon={`${A}/arrow-right-white.svg`} label="Next page" disabled={pageIndex >= totalPages - 1} onClick={() => setPageIndex(pageIndex + 1)} />
        </div>
      </div>
    </div>
  );
}

// Modal for flagging a field with customer explanation note
function FlagModal({ field, onClose, onConfirm }) {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!note.trim()) {
      setError('Please provide feedback explaining what needs attention.');
      return;
    }
    onConfirm(note.trim());
  };

  return (
    <Modal width={480} onClose={onClose} labelledBy="flag-modal-title">
      <form onSubmit={submit} className="flex flex-col gap-[16px] w-full p-[20px]">
        <ModalHeader id="flag-modal-title" title={`Flag Detail: ${field.name}`} subtitle="Tell the client what needs correction." />
        <TextField
          id="flag-note"
          label="Explanation for Client"
          placeholder="e.g. Number is blurred on the scan, please re-verify"
          value={note}
          onChange={(val) => {
            setNote(val);
            if (error) setError('');
          }}
          required
        />
        {error && <p className="text-[13px] text-[#ea0101] font-medium">{error}</p>}
        <div className="flex gap-[10px] justify-end mt-[10px]">
          <button type="button" onClick={onClose} className={secondaryButton}>Cancel</button>
          <button type="submit" className={`${primaryButton} bg-[#ea0101] hover:bg-[#c90000]`}>Flag Detail</button>
        </div>
      </form>
    </Modal>
  );
}

// Modal for requesting a re-upload of document images
function ReuploadModal({ onClose, onConfirm }) {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!note.trim()) {
      setError('Please tell the client why new photos or scans are needed.');
      return;
    }
    onConfirm(note.trim());
  };

  return (
    <Modal width={520} onClose={onClose} labelledBy="reupload-modal-title">
      <form onSubmit={submit} className="flex flex-col gap-[16px] w-full p-[20px]">
        <ModalHeader id="reupload-modal-title" title="Request Document Re-Upload" subtitle="Explain why new document scans are required." />
        <TextField
          id="reupload-note"
          label="Message to Client"
          placeholder="e.g. Page 2 is cropped and cannot be read. Please upload a clear photo of the full page."
          value={note}
          onChange={(val) => {
            setNote(val);
            if (error) setError('');
          }}
          required
        />
        {error && <p className="text-[13px] text-[#ea0101] font-medium">{error}</p>}
        <div className="flex gap-[10px] justify-end mt-[10px]">
          <button type="button" onClick={onClose} className={secondaryButton}>Cancel</button>
          <button type="submit" className={`${primaryButton} bg-[#ea0101] hover:bg-[#c90000]`}>Request Re-Upload</button>
        </div>
      </form>
    </Modal>
  );
}

// Modal for adding a new field manually
function AddFieldModal({ onClose, onConfirm }) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Field name is required.');
      return;
    }
    onConfirm({ name: name.trim(), value: value.trim() });
  };

  return (
    <Modal width={480} onClose={onClose} labelledBy="add-field-title">
      <form onSubmit={submit} className="flex flex-col gap-[16px] w-full p-[20px]">
        <ModalHeader id="add-field-title" title="Add Missing Tax Detail" subtitle="Manually add a box or detail from the document." />
        <TextField
          id="field-name"
          label="Field Name"
          placeholder="e.g. State wages, tips, etc."
          value={name}
          onChange={(val) => {
            setName(val);
            if (error) setError('');
          }}
          required
        />
        <TextField
          id="field-value"
          label="Value"
          placeholder="e.g. 15420.00"
          value={value}
          onChange={setValue}
        />
        {error && <p className="text-[13px] text-[#ea0101] font-medium">{error}</p>}
        <div className="flex gap-[10px] justify-end mt-[10px]">
          <button type="button" onClick={onClose} className={secondaryButton}>Cancel</button>
          <button type="submit" className={primaryButton}>Add Field</button>
        </div>
      </form>
    </Modal>
  );
}

const fieldBox = 'bg-white border border-[#dcdcdc] border-solid flex flex-[1_0_0] items-center min-w-px p-[10px] rounded-[10px] font-medium leading-[normal] text-[14px] text-[#111]';

export default function DocumentReviewView({
  doc,
  client: clientProp,
  onBack,
  onStatusChange,
  onMessageClient,
  isAdmin = false,
  currentUserId = null,
  onNotify,
}) {
  const docId = doc?.id || doc?._id;
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [flaggingField, setFlaggingField] = useState(null);
  const [showReuploadModal, setShowReuploadModal] = useState(false);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);

  const [reloadNonce, setReloadNonce] = useState(0);

  // Some lists (the submission queue) don't carry the customer's id; the loaded document does.
  const customer = detail?.customer;
  const client = useMemo(
    () => (customer && typeof customer === 'object' ? mapClient(customer) : clientProp),
    [customer, clientProp],
  );

  // Load document details
  useEffect(() => {
    let active = true;
    if (!docId) return;

    getDocument(docId)
      .then((data) => {
        if (!active) return;
        setDetail(data);
        setLoadError('');
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(err.message || 'Failed to load document details.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [docId, reloadNonce]);

  const fetchDoc = useCallback(() => {
    setLoading(true);
    setReloadNonce((n) => n + 1);
  }, []);

  // OCR background polling
  const isOcrReading = detail?.ocrStatus === 'pending' || detail?.ocrStatus === 'processing';
  useEffect(() => {
    if (!isOcrReading || !docId) return;
    const startedAt = Date.now();
    const interval = setInterval(async () => {
      if (Date.now() - startedAt > OCR_MAX_POLL_MS) {
        clearInterval(interval);
        return;
      }
      try {
        const fresh = await getDocument(docId);
        setDetail(fresh);
        if (fresh.ocrStatus !== 'pending' && fresh.ocrStatus !== 'processing') {
          clearInterval(interval);
          onNotify?.(`OCR processing complete. ${fresh.fields?.length || 0} fields extracted.`);
        }
      } catch {
        // Soft fail on polling error
      }
    }, OCR_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isOcrReading, docId, onNotify]);

  // RBAC permissions check
  const assignedList = detail?.assignedTo || doc?.assigneeIds || [];
  const isAssigned = assignedList.some((m) => {
    const id = typeof m === 'object' ? m?._id : m;
    return String(id) === String(currentUserId);
  });
  const canEdit = isAdmin || isAssigned;
  const isEditableStatus = detail?.status === 'in-review';

  // Group fields
  const fieldGroups = useMemo(() => groupDocumentFields(detail?.fields || []), [detail?.fields]);
  const allFields = detail?.fields || [];
  const allConfirmed = allFields.length > 0 && allFields.every((f) => f.state === 'confirmed');
  const hasFlagged = allFields.some((f) => f.state === 'flagged');

  const executeAction = async (actionFn, successMsg) => {
    setBusy(true);
    setActionError('');
    try {
      const updated = await actionFn();
      setDetail(updated);
      onStatusChange?.(updated, updated.status);
      if (successMsg) onNotify?.(successMsg);
      return updated;
    } catch (err) {
      setActionError(err.message || 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  // Field Review Handlers
  const handleConfirmField = (field) => {
    if (!canEdit || !isEditableStatus || busy) return;
    executeAction(
      () => reviewDocument(docId, { fields: [{ fieldId: field._id, action: 'confirm' }] }),
      `Confirmed detail: ${field.name}`,
    );
  };

  const handleFlagField = (note) => {
    if (!flaggingField || busy) return;
    const fieldId = flaggingField._id;
    setFlaggingField(null);
    executeAction(
      () => reviewDocument(docId, { fields: [{ fieldId, action: 'flag', note }] }),
      `Flagged detail for client: ${flaggingField.name}`,
    );
  };

  const handleConfirmAll = () => {
    if (!canEdit || !isEditableStatus || busy) return;
    executeAction(
      () => reviewDocument(docId, { confirmAll: true }),
      'All remaining unconfirmed fields confirmed.',
    );
  };

  const handleSaveEdit = (field) => {
    if (!editValue.trim() || busy) return;
    const value = editValue.trim();
    setEditingFieldId(null);
    executeAction(
      () => updateDocumentField(docId, field._id, { value }),
      `Updated ${field.name}`,
    );
  };

  const handleDeleteField = (field) => {
    if (!canEdit || !isEditableStatus || busy) return;
    executeAction(
      () => deleteDocumentField(docId, field._id),
      `Removed ${field.name}`,
    );
  };

  const handleAddField = ({ name, value }) => {
    setShowAddFieldModal(false);
    executeAction(
      () => addDocumentField(docId, { name, value }),
      `Added detail: ${name}`,
    );
  };

  const handleRetryOcr = () => {
    if (busy) return;
    executeAction(
      () => retryDocumentOcr(docId),
      'OCR restarted for this document.',
    );
  };

  // Status Handlers
  const handleStartReview = () => {
    executeAction(
      () => updateDocumentStatus(docId, { status: 'in-review' }),
      'Document review started.',
    );
  };

  const handleAcceptDocument = () => {
    if (!allConfirmed) {
      setActionError('Every field must be confirmed before accepting this document.');
      return;
    }
    executeAction(
      () => updateDocumentStatus(docId, { status: 'accepted' }),
      'Document accepted successfully.',
    );
  };

  const handleRequestAction = () => {
    if (!hasFlagged) {
      setActionError('Flag at least one detail before requesting action from client.');
      return;
    }
    executeAction(
      () => updateDocumentStatus(docId, { status: 'action-needed' }),
      'Action requested from client.',
    );
  };

  const handleConfirmReupload = (note) => {
    setShowReuploadModal(false);
    executeAction(
      () => updateDocumentStatus(docId, { status: 're-upload', note }),
      'Re-upload requested from client.',
    );
  };

  const handleStatusDropdownSelect = (newStatus) => {
    if (newStatus === detail?.status) return;
    if (newStatus === 're-upload') {
      setShowReuploadModal(true);
      return;
    }
    // Only a document still in review needs a flagged detail; later ones are sent back as they are.
    if (newStatus === 'action-needed' && detail?.status === 'in-review' && !hasFlagged) {
      setActionError('Flag at least one detail before setting status to Action Needed.');
      return;
    }
    if (newStatus === 'accepted' && !allConfirmed) {
      setActionError('Every detail must be confirmed before accepting.');
      return;
    }
    executeAction(
      () => updateDocumentStatus(docId, { status: newStatus }),
      `Status changed to ${statusById(newStatus).label}.`,
    );
  };

  const exportCsv = () => {
    if (!detail) return;
    downloadFile(
      `${doc.submissionId || 'doc'}-${detail.formType}.csv`,
      toCsv([
        ['Page', 'Detail', 'Value', 'Source', 'State', 'Notes'],
        ...allFields.map((f) => [
          f.page || 'Manual',
          f.name,
          f.value,
          f.source,
          f.state,
          f.note || '',
        ]),
      ]),
    );
  };

  const title = `${doc.title || detail?.formLabel || 'Document'} (${client?.name || 'Client'})`;
  const currentStatusObj = statusById(detail?.status || doc?.status);

  // Status dropdown options based on allowed transitions
  const allowedNext = ALLOWED_TRANSITIONS[detail?.status] || [];
  const statusOptions = [
    { value: detail?.status, label: currentStatusObj.label },
    ...allowedNext.map((s) => ({ value: s, label: statusById(s).label })),
  ];

  if (loading && !detail) {
    return (
      <div className="bg-white rounded-[20px] p-[40px] flex items-center justify-center w-full min-h-[400px]">
        <ListState loading={true} empty="" />
      </div>
    );
  }

  if (loadError && !detail) {
    return (
      <div className="bg-white rounded-[20px] p-[40px] flex flex-col gap-[16px] items-center justify-center w-full min-h-[400px]">
        <ListState error={{ message: loadError }} onRetry={fetchDoc} empty="" />
        <button type="button" onClick={onBack} className={secondaryButton}>Back to Queue</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[16px] items-start w-full lg:h-[calc(var(--vh)-40px)]" data-node-id="87:2294">
      {/* Top Header Card */}
      <div className="bg-white flex flex-wrap gap-[16px] items-center p-[16px] rounded-[20px] shrink-0 w-full" data-node-id="87:2295">
        <button type="button" onClick={onBack} aria-label="Back" className="flex items-center p-[6px] rounded-[100px] shrink-0 cursor-pointer hover:bg-[#f5f5f5]">
          <Icon src={`${A}/arrow-left.svg`} />
        </button>
        <div className="flex flex-[1_0_0] flex-col gap-[4px] items-start justify-center leading-[normal] min-w-[200px]">
          <div className="flex items-center gap-[10px]">
            <h1 className="font-bold text-[20px] text-[#111]">{title}</h1>
            <span className={`${currentStatusObj.bg} inline-flex items-center px-[8px] py-[3px] rounded-[100px] text-[12px] font-semibold ${currentStatusObj.text}`}>
              {currentStatusObj.label}
            </span>
          </div>
          <p className="font-medium text-[13px] text-[#6a6a6a]">
            {detail?.pages?.length || 0} page{(detail?.pages?.length || 0) === 1 ? '' : 's'} · {allFields.length} extracted detail{allFields.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex gap-[10px] items-center shrink-0">
          <PillButton tone="soft" icon={`${A}/printer.svg`} onClick={() => window.print()}>Print</PillButton>
          <PillButton tone="soft" icon={`${A}/download-simple.svg`} onClick={exportCsv}>Export</PillButton>
        </div>
      </div>

      {/* Permissions Guard Banner */}
      {!canEdit && (
        <div className="bg-[#fff7e6] border border-[#ffd591] flex items-center justify-between px-[16px] py-[10px] rounded-[14px] w-full shrink-0">
          <div className="flex items-center gap-[10px]">
            <Icon src={`${A}/info.svg`} size={20} />
            <p className="text-[13px] font-medium text-[#d46b08]">
              <strong>View Only Mode:</strong> You are not assigned to this client. Only assigned preparers and administrators can make changes or review details.
            </p>
          </div>
        </div>
      )}

      {/* Action Error Banner */}
      {actionError && (
        <div className="bg-[#ffecec] border border-[#fecdca] flex items-center justify-between px-[16px] py-[10px] rounded-[14px] w-full shrink-0 animate-auth-fade-in" role="alert">
          <div className="flex items-center gap-[10px]">
            <Icon src={`${A}/arrow-ccw-red.svg`} size={20} />
            <p className="text-[14px] font-medium text-[#ea0101]">{actionError}</p>
          </div>
          <div className="flex items-center gap-[8px]">
            {actionError.includes('changed') && (
              <button
                type="button"
                onClick={fetchDoc}
                className="bg-[#ea0101] text-white text-[12px] font-semibold px-[12px] py-[4px] rounded-[100px] cursor-pointer hover:bg-[#c90000]"
              >
                Reload Document
              </button>
            )}
            <button type="button" onClick={() => setActionError('')} aria-label="Dismiss error" className="text-[#ea0101] font-bold px-[6px] cursor-pointer">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Split Screen Body */}
      <div className="flex flex-col lg:flex-row flex-[1_0_0] items-stretch min-h-px overflow-clip rounded-[20px] w-full" data-node-id="87:2308">
        {/* Left Side: Document Viewer */}
        <DocumentViewer pages={detail?.pages || []} />

        {/* Right Side: Extracted Fields Panel */}
        <div className="bg-white flex flex-[1_0_0] flex-col items-center min-h-px min-w-px pb-[16px] relative" data-node-id="87:2333">
          {/* Panel Top Header */}
          <div className="flex flex-col items-start shrink-0 w-full">
            <div className="bg-white border-[#dcdcdc] border-b border-solid flex flex-wrap items-center justify-between gap-[10px] px-[16px] py-[10px] w-full">
              <div className="flex gap-[10px] items-center shrink-0">
                <p className="font-['DM_Sans',sans-serif] font-semibold leading-[normal] text-[16px] text-[#111] whitespace-nowrap" style={dmSans}>
                  Extracted Details
                </p>

                {/* OCR Status Badge */}
                {isOcrReading ? (
                  <span className="bg-[#e6f4ff] border border-[#91caff] flex items-center gap-[6px] px-[8px] py-[4px] rounded-[20px] shrink-0 animate-pulse">
                    <span className="size-[8px] bg-[#1677ff] rounded-full" />
                    <span className="font-semibold text-[11px] text-[#0958d9]">OCR Reading…</span>
                  </span>
                ) : detail?.ocrStatus === 'done' ? (
                  <span className="bg-[rgba(0,148,197,0.1)] flex items-center justify-center px-[8px] py-[4px] rounded-[20px] shrink-0">
                    <span className="font-semibold leading-[normal] text-[12px] text-[#0094c5] text-center tracking-[0.12px] whitespace-nowrap">OCR Done</span>
                  </span>
                ) : detail?.ocrStatus === 'failed' ? (
                  <span className="bg-[#fff1f0] border border-[#ffa39e] flex items-center justify-center px-[8px] py-[4px] rounded-[20px] shrink-0">
                    <span className="font-semibold text-[11px] text-[#cf1322]">OCR Failed</span>
                  </span>
                ) : null}

                {/* Rerun OCR Button */}
                {canEdit && isEditableStatus && !isOcrReading && (
                  <button
                    type="button"
                    onClick={handleRetryOcr}
                    disabled={busy}
                    title="Run OCR extraction again"
                    className="flex items-center gap-[4px] px-[8px] py-[4px] rounded-[100px] border border-[#e8e8e8] text-[11px] font-medium text-[#6a6a6a] hover:bg-[#f5f5f5] cursor-pointer"
                  >
                    <Icon src={`${A}/arrow-clockwise.svg`} size={12} />
                    Rerun OCR
                  </button>
                )}
              </div>

              {/* Action Buttons: Add Field & Confirm All */}
              <div className="flex items-center gap-[8px]">
                {canEdit && isEditableStatus && (
                  <button
                    type="button"
                    onClick={() => setShowAddFieldModal(true)}
                    disabled={busy}
                    className="border border-[#dcdcdc] hover:bg-[#f5f5f5] flex items-center gap-[6px] px-[12px] py-[6px] rounded-[100px] text-[13px] font-semibold text-[#111] cursor-pointer transition-colors"
                  >
                    + Add Detail
                  </button>
                )}
                {canEdit && isEditableStatus && (
                  <button
                    type="button"
                    onClick={handleConfirmAll}
                    disabled={allConfirmed || busy}
                    className="bg-[#1d9834] flex gap-[6px] items-center justify-center px-[12px] py-[6px] rounded-[100px] shrink-0 cursor-pointer enabled:hover:bg-[#188a2e] disabled:opacity-60 disabled:cursor-default transition-colors"
                  >
                    <Icon src={`${A}/checks.svg`} size={18} />
                    <span className="font-['DM_Sans',sans-serif] font-semibold leading-[normal] text-[13px] text-white whitespace-nowrap" style={dmSans}>
                      {allConfirmed ? 'All confirmed' : 'Confirm all'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Column Header */}
            <div className="bg-[#848484] flex font-semibold gap-[10px] items-start leading-[normal] px-[16px] py-[4px] text-[12px] text-white tracking-[0.48px] uppercase w-full">
              <p className="w-[190px]">Detail Name</p>
              <p className="flex-1">Extracted Value</p>
              <p className="w-[110px] text-right">Verification</p>
            </div>
          </div>

          {/* Fields Scrollable List */}
          <div className="flex flex-col gap-[20px] items-start py-[10px] w-full lg:flex-1 lg:min-h-0 lg:overflow-y-auto [scrollbar-width:thin]" data-node-id="87:2346">
            {fieldGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center size-full py-[40px] text-center text-[#6a6a6a]">
                <p className="text-[14px]">No details have been read from this document yet.</p>
                {canEdit && isEditableStatus && (
                  <button
                    type="button"
                    onClick={() => setShowAddFieldModal(true)}
                    className="mt-[12px] text-[#0094c5] font-semibold text-[13px] hover:underline cursor-pointer"
                  >
                    + Add the first tax detail manually
                  </button>
                )}
              </div>
            ) : (
              fieldGroups.map((group) => (
                <div key={group.group} className="flex flex-col gap-[6px] items-start px-[16px] w-full">
                  <p className="font-semibold leading-[normal] text-[12px] text-[#6a6a6a] tracking-[0.48px] uppercase w-full">
                    {group.group}
                  </p>
                  {group.fields.map((field) => {
                    const isEditing = editingFieldId === field._id;
                    const isConfirmed = field.state === 'confirmed';
                    const isFlagged = field.state === 'flagged';

                    return (
                      <div
                        key={field._id}
                        className={`flex flex-col gap-[4px] w-full p-[8px] rounded-[12px] border transition-colors ${
                          isFlagged ? 'bg-[#fff1f0] border-[#ffa39e]' : 'bg-white border-[#e8e8e8] hover:border-[#dcdcdc]'
                        }`}
                      >
                        <div className="flex gap-[8px] items-center w-full">
                          {/* Field Label & Metadata */}
                          <div className={`${fieldBox} w-[190px] shrink-0 flex-col !items-start gap-[2px]`}>
                            <span className="truncate font-medium text-[13px] text-[#111]">{field.name}</span>
                            <div className="flex items-center gap-[6px]">
                              {field.confidence != null && (
                                <span className="text-[10px] font-semibold px-[4px] py-[1px] rounded bg-[#f0f0f0] text-[#6a6a6a]">
                                  {Math.round(field.confidence * 100)}%
                                </span>
                              )}
                              <span className="text-[10px] uppercase tracking-wider text-[#848484]">
                                {field.source}
                              </span>
                            </div>
                          </div>

                          {/* Field Value: Read or Inline Edit Form */}
                          {isEditing ? (
                            <div className="flex flex-[1_0_0] items-center gap-[6px] min-w-px">
                              <input
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className={`${fieldBox} outline-none border-[#0094c5]`}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit(field);
                                  if (e.key === 'Escape') setEditingFieldId(null);
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(field)}
                                disabled={busy}
                                className="bg-[#0094c5] text-white text-[12px] font-bold px-[10px] py-[8px] rounded-[8px] cursor-pointer hover:bg-[#0082ad]"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingFieldId(null)}
                                className="text-[#6a6a6a] text-[12px] px-[6px] cursor-pointer hover:text-[#111]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className={`${fieldBox} flex-[1_0_0] justify-between group`}>
                              <span className="truncate font-semibold text-[14px]">{field.value || '—'}</span>
                              {canEdit && isEditableStatus && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingFieldId(field._id);
                                    setEditValue(field.value || '');
                                  }}
                                  title="Edit detail"
                                  className="opacity-0 group-hover:opacity-100 text-[#0094c5] text-[12px] font-semibold hover:underline cursor-pointer transition-opacity"
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          )}

                          {/* Verification & Action Buttons */}
                          <div className="flex items-center justify-end gap-[6px] w-[110px] shrink-0">
                            {/* Flag Action Button */}
                            {canEdit && isEditableStatus && (
                              <button
                                type="button"
                                onClick={() => setFlaggingField(field)}
                                title={isFlagged ? `Flagged: ${field.note}` : 'Flag detail for client correction'}
                                className={`flex items-center justify-center rounded-[100px] size-[34px] cursor-pointer transition-colors ${
                                  isFlagged ? 'bg-[#ea0101] text-white' : 'border border-[#dcdcdc] hover:bg-[#ffecec] text-[#ea0101]'
                                }`}
                              >
                                ⚑
                              </button>
                            )}

                            {/* Confirm Action Button */}
                            {canEdit && isEditableStatus ? (
                              <button
                                type="button"
                                onClick={() => handleConfirmField(field)}
                                aria-pressed={isConfirmed}
                                aria-label={isConfirmed ? `Confirmed ${field.name}` : `Confirm ${field.name}`}
                                className={`flex items-center justify-center rounded-[100px] size-[34px] cursor-pointer transition-colors ${
                                  isConfirmed ? 'bg-[#1d9834] hover:bg-[#188a2e]' : 'border border-[#b6b6b6] border-solid hover:bg-[#f5f5f5]'
                                }`}
                              >
                                <Icon src={isConfirmed ? `${A}/check-white.svg` : `${A}/check-gray.svg`} size={16} />
                              </button>
                            ) : (
                              <span className={`text-[12px] font-semibold ${isConfirmed ? 'text-[#1d9834]' : isFlagged ? 'text-[#ea0101]' : 'text-[#848484]'}`}>
                                {isConfirmed ? '✓ OK' : isFlagged ? 'Flagged' : 'Pending'}
                              </span>
                            )}

                            {/* Delete Action Button */}
                            {canEdit && isEditableStatus && (
                              <button
                                type="button"
                                onClick={() => handleDeleteField(field)}
                                title="Remove spurious detail"
                                className="text-[#848484] hover:text-[#ea0101] size-[24px] flex items-center justify-center cursor-pointer text-[14px]"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Flag Note Display */}
                        {isFlagged && field.note && (
                          <div className="bg-white/80 px-[10px] py-[4px] rounded-[6px] flex items-center gap-[6px] text-[12px] text-[#b42318] border border-[#fecdca]">
                            <strong>Notice to Client:</strong>
                            <span>{field.note}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Footer Bar */}
      <div className="bg-white flex flex-wrap gap-[10px] items-center justify-between p-[16px] rounded-[20px] shrink-0 w-full" data-node-id="87:2432">
        <div className="flex flex-wrap gap-[10px] items-center">
          {client && (
            <button
              type="button"
              onClick={() => onMessageClient?.(client.id || client._id)}
              className="bg-white border border-[#e8e8e8] border-solid flex gap-[8px] items-center justify-center px-[14px] py-[10px] rounded-[30px] shrink-0 cursor-pointer hover:bg-[#fafafa]"
            >
              <Icon src={`${A}/chat.svg`} size={20} />
              <span className="font-medium leading-[24px] text-[16px] text-[#111] text-center whitespace-nowrap">Message client</span>
            </button>
          )}

          {canEdit && detail?.status === 'uploaded' && (
            <button
              type="button"
              onClick={handleStartReview}
              disabled={busy}
              className={`${primaryButton} bg-[#0094c5] hover:bg-[#0082ad]`}
            >
              Start Review
            </button>
          )}

          {canEdit && detail?.status === 'in-review' && (
            <>
              <button
                type="button"
                onClick={() => setShowReuploadModal(true)}
                disabled={busy}
                className="bg-[#ffecec] flex gap-[8px] items-center justify-center px-[16px] py-[10px] rounded-[100px] shrink-0 cursor-pointer hover:bg-[#ffdede]"
              >
                <Icon src={`${A}/arrow-ccw-red.svg`} size={18} />
                <span className="font-medium text-[14px] text-[#ea0101] whitespace-nowrap">Request Re-Upload</span>
              </button>

              <button
                type="button"
                onClick={handleRequestAction}
                disabled={!hasFlagged || busy}
                title={!hasFlagged ? 'Flag at least one detail first' : undefined}
                className="bg-[#fff1e6] flex gap-[8px] items-center justify-center px-[16px] py-[10px] rounded-[100px] shrink-0 cursor-pointer enabled:hover:bg-[#ffe2cc] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="font-medium text-[14px] text-[#e86907] whitespace-nowrap">Request Client Action</span>
              </button>

              <button
                type="button"
                onClick={handleAcceptDocument}
                disabled={!allConfirmed || isOcrReading || busy}
                title={!allConfirmed ? 'All details must be confirmed first' : undefined}
                className="bg-[#e5f7dc] flex gap-[8px] items-center justify-center px-[16px] py-[10px] rounded-[100px] shrink-0 cursor-pointer enabled:hover:bg-[#d0f0c0] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="font-bold text-[14px] text-[#39ab00] whitespace-nowrap">✓ Accept Document</span>
              </button>
            </>
          )}

          {canEdit && detail?.status === 'accepted' && (
            <button
              type="button"
              onClick={() => handleStatusDropdownSelect('submitted')}
              disabled={busy}
              className="bg-[rgba(0,148,197,0.1)] text-[#0094c5] font-bold px-[18px] py-[10px] rounded-[100px] hover:bg-[rgba(0,148,197,0.18)] cursor-pointer"
            >
              Mark Submitted
            </button>
          )}

          {canEdit && detail?.status === 'submitted' && (
            <button
              type="button"
              onClick={() => handleStatusDropdownSelect('filed')}
              disabled={busy}
              className="bg-[#ffeefa] text-[#ff1fad] font-bold px-[18px] py-[10px] rounded-[100px] hover:bg-[#ffd6f3] cursor-pointer"
            >
              Mark Filed
            </button>
          )}
        </div>

        {/* Status Dropdown Selector */}
        {canEdit && (
          <div className="flex gap-[10px] items-center">
            <Dropdown
              variant="outlineLarge"
              value={detail?.status}
              options={statusOptions}
              onChange={handleStatusDropdownSelect}
              menuAlign="right"
              placement="top"
            />
          </div>
        )}
      </div>

      {/* Flag Modal */}
      {flaggingField && (
        <FlagModal
          field={flaggingField}
          onClose={() => setFlaggingField(null)}
          onConfirm={handleFlagField}
        />
      )}

      {/* Re-upload Modal */}
      {showReuploadModal && (
        <ReuploadModal
          onClose={() => setShowReuploadModal(false)}
          onConfirm={handleConfirmReupload}
        />
      )}

      {/* Add Field Modal */}
      {showAddFieldModal && (
        <AddFieldModal
          onClose={() => setShowAddFieldModal(false)}
          onConfirm={handleAddField}
        />
      )}
    </div>
  );
}

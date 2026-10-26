import { useState } from 'react';
import { addField, updateField, removeField, retryOcr } from '../../services/documents';

const imgX = "/figma/dashboard/x.svg";

const inputClass =
  'w-full h-[40px] px-[12px] bg-white border border-[#dcdcdc] rounded-[12px] font-medium text-[14px] text-[#111] focus:outline-none focus:border-[#0094c5]';
const smallButton = 'font-semibold text-[13px] cursor-pointer hover:underline disabled:opacity-40 disabled:cursor-not-allowed';

function FieldState({ field }) {
  if (field.state === 'confirmed') {
    return <span className="font-semibold text-[11px] text-[#0094c5] whitespace-nowrap">✓ Verified</span>;
  }
  if (field.state === 'flagged') {
    return <span className="font-semibold text-[11px] text-[#d92d20] whitespace-nowrap">Needs correction</span>;
  }
  return <span className="font-medium text-[11px] text-[#848484] whitespace-nowrap">Pending review</span>;
}

function FieldRow({ field, editable, busy, onMutate }) {
  const [draft, setDraft] = useState(null); // the value being edited, or null

  const save = async (e) => {
    e.preventDefault();
    if (await onMutate((docId) => updateField(docId, field._id, { value: draft }))) setDraft(null);
  };

  return (
    <div className={`flex flex-col gap-[6px] p-[12px] rounded-[14px] w-full ${field.state === 'flagged' ? 'bg-[#fff1f0] border border-[#fecdca]' : 'bg-white'}`}>
      <div className="flex gap-[8px] items-start justify-between w-full">
        <p className="font-normal text-[12px] text-[#6a6a6a] leading-[16px] min-w-0 [word-break:break-word]">{field.name}</p>
        <div className="flex gap-[8px] items-center shrink-0">
          <FieldState field={field} />
          {editable && draft === null && (
            <button type="button" onClick={() => onMutate((docId) => removeField(docId, field._id))} disabled={busy} aria-label={`Remove ${field.name}`} className="relative shrink-0 size-[14px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgX} />
            </button>
          )}
        </div>
      </div>

      {draft === null ? (
        <div className="flex gap-[8px] items-center justify-between w-full">
          <p className="font-semibold text-[14px] text-[#111] min-w-0 [word-break:break-word]">{field.value || '—'}</p>
          {editable && (
            <button type="button" onClick={() => setDraft(field.value)} disabled={busy} className={`${smallButton} text-[#0094c5] shrink-0`}>
              Edit
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={save} className="flex gap-[8px] items-center w-full">
          <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={2000} aria-label={field.name} className={inputClass} />
          <button type="submit" disabled={busy} className={`${smallButton} text-[#0094c5]`}>Save</button>
          <button type="button" onClick={() => setDraft(null)} className={`${smallButton} text-[#6a6a6a]`}>Cancel</button>
        </form>
      )}

      {field.state === 'flagged' && field.note && (
        <p className="font-medium text-[12px] text-[#b42318] leading-[16px]">Your preparer: {field.note}</p>
      )}
    </div>
  );
}

function AddFieldForm({ busy, onMutate, onDone }) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (await onMutate((docId) => addField(docId, { name: name.trim(), value: value.trim() }))) onDone();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-[8px] bg-white p-[12px] rounded-[14px] w-full">
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="Detail, e.g. State wages" aria-label="Detail name" className={inputClass} />
      <input value={value} onChange={(e) => setValue(e.target.value)} maxLength={2000} placeholder="Value" aria-label="Detail value" className={inputClass} />
      <div className="flex gap-[12px] justify-end">
        <button type="button" onClick={onDone} className={`${smallButton} text-[#6a6a6a]`}>Cancel</button>
        <button type="submit" disabled={busy || !name.trim()} className={`${smallButton} text-[#0094c5]`}>Add detail</button>
      </div>
    </form>
  );
}

// "Details we read" for one document (GET /documents/:id): OCR progress, the fields with their
// review state, and (in an editable status) editing, adding, removing and re-reading them.
// `onMutate(action)` runs `action(docId)` and returns true when it succeeded.
// `slow`: reading has run longer than the viewer waits for; polling has stopped.
export default function DocumentFields({ document, editable, busy, slow, onMutate }) {
  const [adding, setAdding] = useState(false);
  const [confirmRetry, setConfirmRetry] = useState(false);
  const { fields, fieldCounts, ocrStatus } = document;
  const reading = ocrStatus === 'pending' || ocrStatus === 'processing';
  const canRetry = editable && (ocrStatus === 'done' || ocrStatus === 'failed');
  const hasOcrFields = fields.some((field) => field.source === 'ocr' || field.page !== null);

  const retry = async () => {
    setConfirmRetry(false);
    await onMutate((docId) => retryOcr(docId));
  };

  return (
    <div className="bg-[#f5f5f5] flex flex-col gap-[10px] p-[16px] rounded-[20px] shrink-0 w-full">
      <div className="flex gap-[8px] items-center justify-between w-full">
        <p className="font-semibold text-[14px] text-[#111]">Details we read</p>
        {fieldCounts.total > 0 && (
          <p className="font-medium text-[12px] text-[#6a6a6a]">
            {fieldCounts.confirmed} of {fieldCounts.total} verified
          </p>
        )}
      </div>

      {document.status === 'action-needed' && fieldCounts.flagged > 0 && (
        <p className="font-medium text-[12px] text-[#b42318] leading-[16px]">
          Correct or remove the highlighted details. Once they are all fixed, the document goes back to your preparer automatically.
        </p>
      )}

      {reading && !slow && (
        <div className="flex gap-[8px] items-center py-[8px]" role="status">
          <span className="size-[14px] rounded-full border-2 border-[#0094c5] border-t-transparent animate-spin" />
          <p className="font-medium text-[13px] text-[#444]">Reading your document…</p>
        </div>
      )}

      {reading && slow && (
        <p className="font-medium text-[13px] text-[#444]" role="status">
          Reading this document is taking longer than usual. Check back in a little while.
        </p>
      )}

      {ocrStatus === 'failed' && (
        <p className="font-medium text-[13px] text-[#444]">
          We couldn't read this document.{editable ? ' Try again, or add the details by hand.' : ''}
        </p>
      )}

      {ocrStatus === 'done' && fields.length === 0 && (
        <p className="font-medium text-[13px] text-[#444]">We didn't find any details on this document.</p>
      )}

      {fields.map((field) => (
        <FieldRow key={field._id} field={field} editable={editable} busy={busy} onMutate={onMutate} />
      ))}

      {editable && adding && <AddFieldForm busy={busy} onMutate={onMutate} onDone={() => setAdding(false)} />}

      {confirmRetry && (
        <div className="flex flex-col gap-[8px] bg-white p-[12px] rounded-[14px]">
          <p className="font-medium text-[13px] text-[#444]">
            Reading again replaces the details we read, including any changes you made to them. Details you added yourself are kept.
          </p>
          <div className="flex gap-[12px] justify-end">
            <button type="button" onClick={() => setConfirmRetry(false)} className={`${smallButton} text-[#6a6a6a]`}>Cancel</button>
            <button type="button" onClick={retry} disabled={busy} className={`${smallButton} text-[#0094c5]`}>Read again</button>
          </div>
        </div>
      )}

      {editable && !reading && !adding && !confirmRetry && (
        <div className="flex gap-[16px] items-center">
          <button type="button" onClick={() => setAdding(true)} disabled={busy} className={`${smallButton} text-[#0094c5]`}>
            + Add a detail
          </button>
          {canRetry && (
            <button
              type="button"
              onClick={() => (hasOcrFields ? setConfirmRetry(true) : retry())}
              disabled={busy}
              className={`${smallButton} text-[#0094c5]`}
            >
              {ocrStatus === 'failed' ? 'Try again' : 'Read again'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

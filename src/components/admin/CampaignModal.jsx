import { useState, useRef } from 'react';
import { Icon, Modal, ModalHeader, FieldLabel, TextField, PillButton, fieldBoxClass, primaryButton, secondaryButton } from './ui';
import { slugify, randomSlug, campaignUrl, copyCampaignLink } from './adminData';

const A = '/figma/admin';
const QR_IMAGE = `${A}/qr-preview.svg`;

const longDate = (iso) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

// The QR artwork is a placeholder from the design until codes are generated per link.
function downloadQrPng(name) {
  const img = new Image();
  img.onload = () => {
    const size = 784;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    canvas.getContext('2d').drawImage(img, 0, 0, size, size);
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${slugify(name)}-qr.png`;
    link.click();
  };
  img.src = QR_IMAGE;
}

function printQr(title) {
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  doc.open();
  doc.write(`<html><head><title>${title.replace(/</g, '&lt;')}</title></head><body style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif"><h2>${title.replace(/</g, '&lt;')}</h2><img src="${window.location.origin}${QR_IMAGE}" width="360" height="360"></body></html>`);
  doc.close();
  frame.contentWindow.onafterprint = () => frame.remove();
  setTimeout(() => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
  }, 300);
}

function LinkRow({ slug, onRegenerate, onCopy }) {
  return (
    <div className="flex flex-col gap-[10px] items-start px-[16px] w-full">
      <p className="font-normal leading-[normal] text-[14px] text-[#111] w-full">Campaign link</p>
      <div className="flex flex-wrap sm:flex-nowrap gap-[10px] items-center w-full">
        <div className={`${fieldBoxClass} flex-[1_0_0] min-w-[220px] justify-start`}>
          <Icon src={`${A}/link-simple.svg`} size={20} />
          <span className="flex-[1_0_0] min-w-px truncate">{campaignUrl(slug)}</span>
          {onRegenerate && (
            <button type="button" onClick={onRegenerate} aria-label="Generate a new link" className="shrink-0 cursor-pointer opacity-90 hover:opacity-100">
              <Icon src={`${A}/arrow-clockwise.svg`} size={20} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="bg-[#0094c5] flex gap-[8px] items-center justify-center overflow-clip px-[16px] py-[10px] rounded-[100px] shrink-0 cursor-pointer hover:bg-[#0082ad] transition-colors"
        >
          <Icon src={`${A}/copy-link-white.svg`} size={20} />
          <span className="font-bold leading-[normal] text-[14px] text-white whitespace-nowrap">Copy Link</span>
        </button>
      </div>
    </div>
  );
}

function QrBlock({ title }) {
  return (
    <div className="flex flex-col sm:flex-row gap-[24px] items-start sm:items-center overflow-clip px-[16px] w-full">
      <span className="relative block shrink-0 size-[196px]">
        <img alt={`QR code for ${title}`} className="absolute block inset-0 max-w-none size-full" src={QR_IMAGE} />
      </span>
      <div className="flex flex-[1_0_0] flex-col gap-[12px] items-start min-w-px">
        <p className="font-semibold leading-[normal] text-[16px] text-[#111]">Campaign QR code</p>
        <p className="font-normal leading-[22px] text-[14px] text-[#444]">Scan to open the campaign link, or download the QR code to share in print.</p>
        <div className="flex flex-wrap gap-[10px] items-center">
          <PillButton tone="soft" icon={`${A}/download-simple.svg`} onClick={() => downloadQrPng(title)}>Download PNG</PillButton>
          <PillButton tone="soft" icon={`${A}/printer.svg`} onClick={() => printQr(title)}>Print</PillButton>
        </div>
      </div>
    </div>
  );
}

function DateField({ id, label, value, onChange }) {
  const inputRef = useRef(null);
  const open = () => {
    try {
      inputRef.current?.showPicker();
    } catch {
      inputRef.current?.focus();
    }
  };
  return (
    <div className="flex flex-col gap-[10px] items-start w-full">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative w-full">
        <button type="button" onClick={open} className={`${fieldBoxClass} cursor-pointer text-left`}>
          <span className={`flex-[1_0_0] min-w-px ${value ? '' : 'font-normal text-[#848484]'}`}>{value ? longDate(value) : 'Select a date'}</span>
          <Icon src={`${A}/calendar-dots.svg`} size={20} />
        </button>
        <input
          ref={inputRef}
          id={id}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          tabIndex={-1}
          aria-hidden
          className="absolute inset-0 opacity-0 pointer-events-none"
        />
      </div>
    </div>
  );
}

// Create (87:3961), edit (87:4002) and view (87:4043) share one dialog.
export default function CampaignModal({ mode: initialMode, campaign, onClose, onSave, onNotify }) {
  const [mode, setMode] = useState(initialMode);
  const [title, setTitle] = useState(campaign?.title || '');
  const [expiresAt, setExpiresAt] = useState(campaign?.expiresAt || '');
  const [slug, setSlug] = useState(campaign?.slug || '');
  const [slugTouched, setSlugTouched] = useState(Boolean(campaign));
  const currentSlug = slugTouched ? slug : slugify(title || 'new-campaign');

  const copy = async () => onNotify((await copyCampaignLink(currentSlug)) ? 'Link copied to clipboard' : 'Could not copy the link');
  const regenerate = () => {
    setSlug(randomSlug(title || 'campaign'));
    setSlugTouched(true);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim() || !expiresAt) return;
    onSave({ ...campaign, title: title.trim(), expiresAt, slug: currentSlug });
  };

  if (mode === 'view') {
    return (
      <Modal width={580} onClose={onClose} labelledBy="campaign-title">
        <ModalHeader id="campaign-title" title={campaign.title} subtitle={`Valid till: ${longDate(campaign.expiresAt)}`} />
        <LinkRow slug={campaign.slug} onCopy={copy} />
        <QrBlock title={campaign.title} />
        <div className="flex gap-[10px] items-center justify-end p-[16px] w-full">
          <button type="button" onClick={() => setMode('edit')} className={secondaryButton}>Edit</button>
          <button type="button" onClick={onClose} className={primaryButton}>Done</button>
        </div>
      </Modal>
    );
  }

  const isEdit = mode === 'edit';
  return (
    <Modal width={580} onClose={onClose} labelledBy="campaign-form-title">
      <form onSubmit={submit} className="flex flex-col gap-[20px] items-start w-full">
        <ModalHeader id="campaign-form-title" title={isEdit ? 'Edit Campaign' : 'Create Campaign'} />
        <div className="flex flex-col gap-[20px] items-start px-[16px] w-full">
          <TextField id="campaign-name" label="Title" value={title} onChange={setTitle} placeholder="e.g. Fall Seminar 2026" required />
          <DateField id="campaign-expiry" label="Expiration date" value={expiresAt} onChange={setExpiresAt} />
        </div>
        <LinkRow slug={currentSlug} onRegenerate={regenerate} onCopy={copy} />
        <QrBlock title={title || 'Campaign'} />
        <div className="flex gap-[10px] items-center justify-end p-[16px] w-full">
          <button type="button" onClick={onClose} className={secondaryButton}>Cancel</button>
          <button type="submit" disabled={!title.trim() || !expiresAt} className={primaryButton}>
            {isEdit ? 'Save Changes' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

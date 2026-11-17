import { useState, useRef, useEffect } from 'react';
import { Icon, Modal, ModalHeader, FieldLabel, TextField, PillButton, fieldBoxClass, primaryButton, secondaryButton } from './ui';
import { slugify, randomSlug } from './adminData';
import { campaignUrl, copyCampaignLink, campaignQrDataUrl } from '../../services/campaigns';

const A = '/figma/admin';

const longDate = (iso) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

function downloadQrPng(name, image) {
  const link = document.createElement('a');
  link.href = image;
  link.download = `${slugify(name)}-qr.png`;
  link.click();
}

function printQr(title, image, url) {
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  doc.open();
  doc.write('<!doctype html><html><head><title></title></head><body style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif"></body></html>');
  doc.close();
  doc.title = title;
  const heading = doc.createElement('h2');
  heading.textContent = title;
  const img = doc.createElement('img');
  img.width = 360;
  img.height = 360;
  img.alt = `QR code for ${title}`;
  const caption = doc.createElement('p');
  caption.textContent = url;
  doc.body.append(heading, img, caption);
  frame.contentWindow.onafterprint = () => frame.remove();
  img.onload = () => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
  };
  img.onerror = () => frame.remove();
  img.src = image;
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

function QrBlock({ title, slug }) {
  const url = campaignUrl(slug);
  const [qr, setQr] = useState(null);
  useEffect(() => {
    let active = true;
    campaignQrDataUrl(url).then(
      (image) => { if (active) setQr({ url, image }); },
      () => { if (active) setQr({ url, error: 'The QR code could not be generated. Reopen this campaign to try again.' }); },
    );
    return () => { active = false; };
  }, [url]);
  const image = qr?.url === url ? qr.image : null;
  const error = qr?.url === url ? qr.error : null;
  return (
    <div className="flex flex-col sm:flex-row gap-[24px] items-start sm:items-center overflow-clip px-[16px] w-full">
      <span className="relative block shrink-0 size-[196px]">
        {image ? <img alt={`QR code for ${title}`} className="absolute block inset-0 max-w-none size-full" src={image} />
          : <span role={error ? 'alert' : 'status'} className="flex size-full items-center p-[12px] text-[13px] text-[#444]">{error || 'Generating QR code…'}</span>}
      </span>
      <div className="flex flex-[1_0_0] flex-col gap-[12px] items-start min-w-px">
        <p className="font-semibold leading-[normal] text-[16px] text-[#111]">Campaign QR code</p>
        <p className="font-normal leading-[22px] text-[14px] text-[#444]">Scan to open the campaign link, or download the QR code to share in print.</p>
        <div className="flex flex-wrap gap-[10px] items-center">
          <PillButton tone="soft" icon={`${A}/download-simple.svg`} disabled={!image} onClick={() => downloadQrPng(title, image)}>Download PNG</PillButton>
          <PillButton tone="soft" icon={`${A}/printer.svg`} disabled={!image} onClick={() => printQr(title, image, url)}>Print</PillButton>
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
        <QrBlock title={campaign.title} slug={campaign.slug} />
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
        <QrBlock title={title || 'Campaign'} slug={currentSlug} />
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

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import DocumentPreviewModal from './DocumentPreviewModal';

const imgLogo = "/figma/b888a9396e41ae8b3746258887ab3eadbe9402d1.svg";
const imgArrowRight = "/figma/0836a6f58bee20c26ca9f18c84ce1cb5e104a898.svg";
const imgQrCode = "/figma/ade0003ecd704f4f58f8be66d8f520692faa8db1.svg";
const imgAllDonePhone = "/figma/upload/all-done-phone-mockup.png";
const imgCameraBox = "/figma/upload/camera-box.png";
const imgDocPageThumb = "/figma/upload/doc-page-thumb.png";

const MIN_MODAL_SCALE = 0.7;

const FORM_OPTIONS = [
  {
    id: 'w2',
    name: 'W-2 Form',
    desc: 'Wage and tax statement',
    thumb: '/figma/upload/w2-thumbnail.png',
  },
  {
    id: '1099-nec',
    name: '1099-NEC',
    desc: 'Nonemployee compensation',
    thumb: '/figma/upload/1099-nec-thumbnail.png',
  },
  {
    id: '1099-int',
    name: '1099-INT',
    desc: 'Interest income',
    thumb: '/figma/upload/1099-int-thumbnail.png',
  },
  {
    id: '1099-t',
    name: '1099-T',
    desc: 'Tuition statement',
    thumb: '/figma/upload/1099-t-thumbnail.png',
  },
  {
    id: 'other',
    name: 'Or other similar documents',
    desc: 'Anything else your accountant needs',
    thumb: '/figma/upload/other-doc-thumbnail.png',
  },
];

export default function DocumentUploadFlow({ isOpen, onClose, onCompleteToDashboard }) {
  // Step 1: Choose Form Type (67:407)
  // Step 2: Upload Documents (67:496 / 67:530)
  // Step 3: Uploaded Documents / Identified (67:605)
  // Step 4: Last Few Details (67:648)
  // Step 5: All Done (67:775)
  const [step, setStep] = useState(1);
  const [selectedFormId, setSelectedFormId] = useState('w2');

  // Uploaded pages state for Step 2
  const [pages, setPages] = useState([
    { id: 'p1', preview: imgDocPageThumb, name: 'Page 1' },
    { id: 'p2', preview: imgDocPageThumb, name: 'Page 2' },
    { id: 'p3', preview: imgDocPageThumb, name: 'Page 3' },
  ]);

  // Identified documents for Step 3
  const [identifiedDocs, setIdentifiedDocs] = useState([
    {
      id: 'doc-1',
      type: 'w2',
      name: 'W-2 Form',
      pageCount: 2,
      thumb: '/figma/upload/w2-thumbnail.png',
    },
    {
      id: 'doc-2',
      type: '1099-nec',
      name: '1099-NEC',
      pageCount: 1,
      thumb: '/figma/upload/1099-nec-thumbnail.png',
    },
  ]);

  // Personal details state for Step 4
  const [formData, setFormData] = useState({
    fullName: 'John Doe',
    phone: '(612) 213 231421',
    email: 'johndoe@gmail.com',
    address: 'Park Avenue, 234, Str, Texas, US',
    ssn: '123-45-6789',
    dob: '1999-02-14',
    status: 'Single',
    dependents: 'No',
  });

  const [showSsn, setShowSsn] = useState(false);
  const [activePreviewDoc, setActivePreviewDoc] = useState(null);
  const [draggedPageIndex, setDraggedPageIndex] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const fileInputRef = useRef(null);
  const scaleRef = useRef(null);

  // Sync with existing stored user if available
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('taxmax_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setFormData((prev) => ({
          ...prev,
          fullName: parsed.fullName || prev.fullName,
          phone: parsed.phone || prev.phone,
          email: parsed.email || prev.email,
          address: parsed.address || prev.address,
          status: parsed.status || prev.status,
          dependents: parsed.dependents || prev.dependents,
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Scale the modal down so the whole card fits inside the viewport height
  useLayoutEffect(() => {
    if (!isOpen) return;

    const fitToViewport = () => {
      const el = scaleRef.current;
      if (!el) return;
      el.style.zoom = 1;
      const overlayStyle = getComputedStyle(el.parentElement);
      const padding = parseFloat(overlayStyle.paddingTop) + parseFloat(overlayStyle.paddingBottom);
      // Below lg the back button floats above the card, so keep room for it
      const backButtonSpace = window.innerWidth < 1024 ? 128 : 0;
      const available = window.innerHeight - padding - backButtonSpace;
      el.style.zoom = Math.max(MIN_MODAL_SCALE, Math.min(1, available / el.offsetHeight));
    };

    fitToViewport();
    window.addEventListener('resize', fitToViewport);
    return () => window.removeEventListener('resize', fitToViewport);
  }, [isOpen, step, pages.length, identifiedDocs.length]);

  if (!isOpen) return null;

  const currentForm = FORM_OPTIONS.find((f) => f.id === selectedFormId) || FORM_OPTIONS[0];

  const handleBack = () => {
    if (step === 1) {
      onClose();
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const handleFilesAdded = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPages = files.map((file, i) => ({
      id: `p-${Date.now()}-${i}`,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    setPages((prev) => [...prev, ...newPages]);
  };

  const handleRemovePage = (indexToRemove, e) => {
    e.stopPropagation();
    setPages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleDragStart = (idx) => {
    setDraggedPageIndex(idx);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropPage = (targetIdx) => {
    if (draggedPageIndex === null || draggedPageIndex === targetIdx) return;
    const updated = [...pages];
    const [moved] = updated.splice(draggedPageIndex, 1);
    updated.splice(targetIdx, 0, moved);
    setPages(updated);
    setDraggedPageIndex(null);
  };

  const handleDetailsSubmit = (e) => {
    e.preventDefault();

    // Create or update account in localStorage
    const userAccount = {
      ...formData,
      accountCreatedDate: new Date().toISOString(),
      filingId: 'TM-' + Math.floor(100000 + Math.random() * 900000),
      documents: identifiedDocs,
      estimatedRefund: {
        total: '$5,213.23',
        federal: '$2,340',
        state: '$2,726',
      },
      filingStatus: 'In Review',
    };

    try {
      localStorage.setItem('taxmax_user', JSON.stringify(userAccount));
      localStorage.setItem('taxmax_is_authenticated', 'true');
    } catch (err) {
      console.error(err);
    }

    // Move to All Done screen
    setStep(5);
  };

  const handleLoginClick = () => {
    try {
      localStorage.setItem('taxmax_is_authenticated', 'true');
    } catch (e) {
      console.error(e);
    }
    if (onCompleteToDashboard) {
      onCompleteToDashboard(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-[6px] flex items-center justify-center p-3 sm:p-6 lg:p-8 animate-in fade-in duration-200">
      {/* Background canvas wrapper matching Figma Desktop 1920 layout and responsive scaling */}
      <div ref={scaleRef} className="relative w-full max-w-[500px] my-auto">

        {/* Floating Back Button - matches Figma -translate-y-1/2 left-[388px] relative to card */}
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className="absolute -top-14 sm:-top-16 left-0 lg:-left-20 lg:top-1/2 lg:-translate-y-1/2 z-10 size-11 sm:size-12 lg:size-[52px] bg-white rounded-full drop-shadow-[0px_4px_15px_rgba(0,0,0,0.12)] border border-gray-200/60 flex items-center justify-center text-[#111] hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:-translate-x-0.5 transition-transform"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Main Figma Card */}
        <div className="w-full bg-white rounded-[20px] drop-shadow-[0px_10px_50px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-300">
          
          {/* ==================== STEP 1: CHOOSE FORM TYPE (Node 67:407) ==================== */}
          {step === 1 && (
            <div className="p-6 sm:p-8 lg:px-[40px] lg:pt-[30px] lg:pb-[40px] flex flex-col gap-5 sm:gap-[20px]" data-node-id="67:408">
              {/* Header: Logo & 3-Step Indicator Dots */}
              <div className="flex items-center justify-between w-full" data-node-id="67:410">
                <div className="h-[38px] w-[159px] shrink-0" data-node-id="67:411">
                  <img src={imgLogo} alt="TAXMAX" className="h-full w-auto object-contain" />
                </div>
                {/* 3 Dots: Dot 1 active, Dot 2 & 3 inactive */}
                <div className="flex gap-[10px] items-center justify-center shrink-0" data-node-id="67:420">
                  <div className="bg-[#111] rounded-[10px] size-[12px]" data-node-id="67:421" />
                  <div className="bg-[#111] opacity-20 rounded-[10px] size-[8px]" data-node-id="67:422" />
                  <div className="bg-[#111] opacity-20 rounded-[10px] size-[8px]" data-node-id="67:423" />
                </div>
              </div>

              {/* Title & Description */}
              <div className="flex flex-col gap-[10px] items-start justify-center w-full" data-node-id="67:424">
                <h2 className="font-extrabold text-[26px] sm:text-[30px] lg:text-[32px] text-[#111] tracking-[-0.32px] leading-[32px] sm:leading-[36px]" data-node-id="67:425">
                  Send your documents.<br />
                  We'll take it from here.
                </h2>
                <p className="font-normal text-[14px] sm:text-[16px] text-[#444] leading-normal" data-node-id="67:426">
                  Start scanning your tax, wages, interests or other similar documents, we automatically detect, fill out the details and remind you when it arrives
                </p>
              </div>

              {/* Form Types List */}
              <div className="flex flex-col gap-[10px] items-start w-full" data-node-id="67:427">
                <p className="font-bold text-[15px] sm:text-[16px] text-[#111] tracking-[-0.16px]" data-node-id="67:428">
                  Choose a form type
                </p>

                {FORM_OPTIONS.map((form) => {
                  const isSelected = selectedFormId === form.id;
                  return (
                    <div
                      key={form.id}
                      onClick={() => setSelectedFormId(form.id)}
                      className={`w-full flex gap-3 sm:gap-[16px] items-center p-3 sm:p-[16px] rounded-[20px] cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#f5f5f5] ring-2 ring-[#0094c5] shadow-xs'
                          : 'bg-[#f5f5f5] hover:bg-[#ededed]'
                      }`}
                      data-node-id={`form-${form.id}`}
                    >
                      {/* Icon */}
                      <div className="size-[40px] shrink-0 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-gray-100">
                        <img src={form.thumb} alt={form.name} className="size-full object-contain" />
                      </div>

                      {/* Labels */}
                      <div className="flex flex-col gap-[4px] items-start justify-center flex-1 min-w-0">
                        <span className="font-semibold text-[14px] text-[#111] leading-normal truncate">
                          {form.name}
                        </span>
                        <span className="font-normal text-[12px] text-[#444] leading-normal truncate">
                          {form.desc}
                        </span>
                      </div>

                      {/* Selected check circle */}
                      {isSelected ? (
                        <div className="bg-[#0094c5] flex items-center justify-center rounded-full shrink-0 size-[30px] p-[6px] shadow-sm animate-in zoom-in-75 duration-150">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </div>
                      ) : (
                        <div className="size-[30px] shrink-0 rounded-full border border-gray-300 opacity-40 hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Start Secure Upload CTA Button */}
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full h-[52px] sm:h-[56px] bg-[#0094c5] hover:bg-[#0082ad] text-white font-bold text-[16px] rounded-[100px] flex items-center justify-center gap-[8px] p-[12px] shadow-md hover:shadow-cyan-500/25 transition-all cursor-pointer mt-1"
                data-node-id="67:456"
              >
                <span>Start secure upload</span>
                <div className="size-[24px] shrink-0">
                  <img src={imgArrowRight} alt="" className="size-full" />
                </div>
              </button>
            </div>
          )}

          {/* ==================== STEP 2: UPLOAD DOCUMENTS (Nodes 67:496 & 67:530) ==================== */}
          {step === 2 && (
            <div className="p-6 sm:p-8 lg:p-[40px] flex flex-col gap-5 sm:gap-[20px] items-center" data-node-id="67:497">
              {/* Header */}
              <div className="flex flex-col gap-[20px] items-start w-full">
                <div className="flex items-center justify-between w-full" data-node-id="67:499">
                  <div className="h-[38px] w-[159px] shrink-0">
                    <img src={imgLogo} alt="TAXMAX" className="h-full w-auto object-contain" />
                  </div>
                  {/* 3 Dots: Dot 1 filled, Dot 2 active ring, Dot 3 inactive */}
                  <div className="flex gap-[10px] items-center justify-center shrink-0">
                    <div className="bg-[#111] rounded-[10px] size-[8px]" />
                    <div className="border-2 border-[#111] bg-transparent rounded-[10px] size-[12px]" />
                    <div className="bg-[#111] opacity-20 rounded-[10px] size-[8px]" />
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="flex flex-col gap-[10px] items-start justify-center w-full">
                  <h2 className="font-extrabold text-[26px] sm:text-[30px] lg:text-[32px] text-[#111] tracking-[-0.32px] leading-[32px] sm:leading-[36px]">
                    Upload documents
                  </h2>
                  <p className="font-normal text-[14px] sm:text-[16px] text-[#444] leading-normal">
                    Allow camera access to take picture of your documents, or simple upload through your photo gallery
                  </p>
                </div>

                {/* Selected Form Pill */}
                <div className="w-full bg-[#f5f5f5] flex gap-3 sm:gap-[16px] items-center p-3 sm:p-[16px] rounded-[20px]">
                  <div className="size-[40px] shrink-0 rounded-lg overflow-hidden bg-white border border-gray-100 flex items-center justify-center">
                    <img src={currentForm.thumb} alt={currentForm.name} className="size-full object-contain" />
                  </div>
                  <div className="flex flex-col gap-[4px] items-start justify-center flex-1 min-w-0">
                    <span className="font-semibold text-[14px] text-[#111] leading-normal truncate">{currentForm.name}</span>
                    <span className="font-normal text-[12px] text-[#444] leading-normal truncate">{currentForm.desc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="font-bold text-[14px] text-[#0094c5] hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Hidden File Input (supports camera or file browsing) */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFilesAdded}
                multiple
                accept="image/*,application/pdf"
                className="hidden"
              />

              {/* Camera / Drop Zone Box */}
              <div className="flex flex-col gap-[10px] items-start justify-center w-full">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                  }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                    const files = Array.from(e.dataTransfer.files || []);
                    if (files.length > 0) {
                      const newPages = files.map((file, i) => ({
                        id: `p-${Date.now()}-${i}`,
                        preview: URL.createObjectURL(file),
                        name: file.name,
                      }));
                      setPages((prev) => [...prev, ...newPages]);
                    }
                  }}
                  className={`w-full h-[220px] sm:h-[260px] rounded-[20px] p-[16px] flex flex-col gap-[16px] items-center justify-center cursor-pointer transition-all border-2 border-dashed ${
                    isDraggingOver
                      ? 'bg-[#0094c5]/5 border-[#0094c5]'
                      : 'bg-[#f5f5f5] hover:bg-[#eaeaea] border-transparent'
                  }`}
                  data-node-id="67:522"
                >
                  <div className="size-[60px] rounded-[10px] shrink-0 overflow-hidden shadow-xs">
                    <img src={imgCameraBox} alt="Camera" className="size-full object-contain" />
                  </div>
                  <p className="font-normal text-[14px] text-[#444] text-center leading-normal">
                    {pages.length > 0 ? "Tap to open your camera, or upload" : "Tap to open your camera"}
                  </p>
                </div>

                {/* Page Thumbnails Row (as shown in Node 67:530) */}
                {pages.length > 0 && (
                  <div className="w-full flex flex-col gap-[10px] pt-1">
                    <div className="flex flex-wrap gap-4 sm:gap-[18px] items-center pt-2">
                      {pages.map((p, idx) => (
                        <div
                          key={p.id}
                          draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDropPage(idx)}
                          className="relative flex flex-col items-center group cursor-grab active:cursor-grabbing"
                        >
                          {/* Close X Button */}
                          <button
                            type="button"
                            onClick={(e) => handleRemovePage(idx, e)}
                            className="absolute -top-2 -right-2 z-10 size-[20px] rounded-full bg-[#fafafa] border border-[#e8e8e8] shadow-xs flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-white cursor-pointer transition-colors"
                            aria-label={`Remove page ${idx + 1}`}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>

                          {/* Thumbnail image */}
                          <div className="size-[60px] rounded-[14px] overflow-hidden border border-gray-200/80 bg-white shadow-xs group-hover:scale-105 transition-transform">
                            <img src={p.preview} alt={`Page ${idx + 1}`} className="size-full object-cover" />
                          </div>

                          {/* Page index number */}
                          <span className="text-[12px] text-[#848484] font-normal mt-1">
                            {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Hint: Re-arrange pages by dragging */}
                    <div className="flex gap-[8px] items-center pt-1" data-node-id="67:573">
                      <div className="size-[18px] shrink-0 text-[#848484]">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="16" x2="12" y2="12" />
                          <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                      </div>
                      <p className="font-medium text-[12px] text-[#848484] tracking-[0.24px]">
                        Re-arrange pages by dragging the images
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Continue CTA Button */}
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full h-[52px] sm:h-[56px] bg-[#0094c5] hover:bg-[#0082ad] text-white font-bold text-[16px] rounded-[100px] flex items-center justify-center gap-[8px] p-[12px] shadow-md hover:shadow-cyan-500/25 transition-all cursor-pointer mt-1"
                data-node-id="67:576"
              >
                <span>Continue</span>
                <div className="size-[24px] shrink-0">
                  <img src={imgArrowRight} alt="" className="size-full" />
                </div>
              </button>
            </div>
          )}

          {/* ==================== STEP 3: UPLOADED DOCUMENTS / IDENTIFIED (Node 67:605) ==================== */}
          {step === 3 && (
            <div className="p-6 sm:p-8 lg:p-[40px] flex flex-col gap-6 sm:gap-[32px] items-center" data-node-id="67:606">
              {/* Header */}
              <div className="flex flex-col gap-[20px] items-start w-full">
                <div className="flex items-center justify-between w-full" data-node-id="67:608">
                  <div className="h-[38px] w-[159px] shrink-0">
                    <img src={imgLogo} alt="TAXMAX" className="h-full w-auto object-contain" />
                  </div>
                  {/* 3 Dots: Dot 1 regular, Dot 2 active filled (step completed), Dot 3 inactive */}
                  <div className="flex gap-[10px] items-center justify-center shrink-0">
                    <div className="bg-[#111] rounded-[10px] size-[8px]" />
                    <div className="bg-[#111] rounded-[10px] size-[12px]" />
                    <div className="bg-[#111] opacity-20 rounded-[10px] size-[8px]" />
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="flex flex-col gap-[10px] items-start justify-center w-full">
                  <h2 className="font-extrabold text-[26px] sm:text-[30px] lg:text-[32px] text-[#111] tracking-[-0.32px] leading-[32px] sm:leading-[36px]">
                    Upload documents
                  </h2>
                  <p className="font-normal text-[14px] sm:text-[16px] text-[#444] leading-normal">
                    We identified the following documents that you uploaded.
                  </p>
                </div>
              </div>

              {/* Identified Documents List */}
              <div className="flex flex-col gap-[12px] items-start w-full" data-node-id="67:625">
                {identifiedDocs.map((doc, docIdx) => (
                  <div
                    key={doc.id}
                    className="w-full bg-[#f5f5f5] flex gap-3 sm:gap-[16px] items-center p-3 sm:p-[16px] rounded-[20px] relative"
                  >
                    {/* Thumbnail with page count badge */}
                    <div className="relative size-[40px] shrink-0">
                      <div className="size-[40px] rounded-lg overflow-hidden bg-white border border-gray-100 flex items-center justify-center">
                        <img src={doc.thumb} alt={doc.name} className="size-full object-contain" />
                      </div>
                      {doc.pageCount > 1 && (
                        <div className="absolute -top-1.5 -right-1.5 bg-white shadow-xs rounded-full size-[22px] flex items-center justify-center text-[12px] font-semibold text-[#111] border border-gray-200">
                          {doc.pageCount}
                        </div>
                      )}
                    </div>

                    {/* Select/Dropdown box for form type */}
                    <div className="relative flex-1 min-w-0">
                      <select
                        value={doc.type}
                        onChange={(e) => {
                          const newType = e.target.value;
                          const matched = FORM_OPTIONS.find((f) => f.id === newType);
                          setIdentifiedDocs((prev) =>
                            prev.map((d, i) =>
                              i === docIdx
                                ? { ...d, type: newType, name: matched ? matched.name : d.name, thumb: matched ? matched.thumb : d.thumb }
                                : d
                            )
                          );
                        }}
                        className="w-full h-[40px] px-[12px] py-[8px] bg-white border border-[#cfcfcf] rounded-[10px] font-semibold text-[15px] sm:text-[16px] text-[#111] appearance-none cursor-pointer focus:outline-none focus:border-[#0094c5] pr-8"
                      >
                        {FORM_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 7L10 13L4 7" />
                        </svg>
                      </div>
                    </div>

                    {/* View Button */}
                    <button
                      type="button"
                      onClick={() => setActivePreviewDoc(doc)}
                      className="font-bold text-[14px] text-[#0094c5] hover:underline cursor-pointer px-1"
                    >
                      View
                    </button>
                  </div>
                ))}

                {/* Upload another document button */}
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full h-[52px] bg-[#0094c5]/10 hover:bg-[#0094c5]/15 text-[#0094c5] font-semibold text-[15px] sm:text-[16px] rounded-[100px] flex items-center justify-center gap-[8px] p-[12px] transition-colors cursor-pointer mt-1"
                  data-node-id="67:640"
                >
                  <span>Upload another document</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                </button>
              </div>

              {/* Continue CTA Button */}
              <button
                type="button"
                onClick={() => setStep(4)}
                className="w-full h-[52px] sm:h-[56px] bg-[#0094c5] hover:bg-[#0082ad] text-white font-bold text-[16px] rounded-[100px] flex items-center justify-center gap-[8px] p-[12px] shadow-md hover:shadow-cyan-500/25 transition-all cursor-pointer"
                data-node-id="67:643"
              >
                <span>Continue</span>
                <div className="size-[24px] shrink-0">
                  <img src={imgArrowRight} alt="" className="size-full" />
                </div>
              </button>
            </div>
          )}

          {/* ==================== STEP 4: LAST FEW DETAILS (Node 67:648) ==================== */}
          {step === 4 && (
            <form onSubmit={handleDetailsSubmit} className="p-6 sm:p-8 lg:p-[40px] flex flex-col gap-5 sm:gap-[20px] items-center" data-node-id="67:649">
              {/* Header */}
              <div className="flex flex-col gap-[20px] items-start w-full">
                <div className="flex items-center justify-between w-full" data-node-id="67:651">
                  <div className="h-[38px] w-[159px] shrink-0">
                    <img src={imgLogo} alt="TAXMAX" className="h-full w-auto object-contain" />
                  </div>
                  {/* 3 Dots: Dot 1 & 2 regular, Dot 3 active (12px) */}
                  <div className="flex gap-[10px] items-center justify-center shrink-0">
                    <div className="bg-[#111] rounded-[10px] size-[8px]" />
                    <div className="bg-[#111] rounded-[10px] size-[8px]" />
                    <div className="bg-[#111] rounded-[10px] size-[12px]" />
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="flex flex-col gap-[10px] items-start justify-center w-full">
                  <h2 className="font-extrabold text-[26px] sm:text-[30px] lg:text-[32px] text-[#111] tracking-[-0.32px] leading-[32px] sm:leading-[36px]">
                    A few last details
                  </h2>
                  <p className="font-normal text-[14px] sm:text-[16px] text-[#444] leading-normal">
                    This lets your accountant match the document to your file.
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col gap-[14px] sm:gap-[16px] items-start w-full max-h-[48vh] overflow-y-auto pr-1" data-node-id="67:668">
                {/* Full name */}
                <div className="flex flex-col gap-[8px] items-start w-full">
                  <label className="font-normal text-[15px] sm:text-[16px] text-[#111]">Full name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full h-[50px] sm:h-[54px] px-[16px] bg-white border border-[#dcdcdc] rounded-[20px] font-medium text-[15px] sm:text-[16px] text-[#111] focus:outline-none focus:border-[#0094c5]"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-[8px] items-start w-full">
                  <label className="font-normal text-[15px] sm:text-[16px] text-[#111]">Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-[50px] sm:h-[54px] px-[16px] bg-white border border-[#dcdcdc] rounded-[20px] font-medium text-[15px] sm:text-[16px] text-[#111] focus:outline-none focus:border-[#0094c5]"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-[8px] items-start w-full">
                  <label className="font-normal text-[15px] sm:text-[16px] text-[#111]">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-[50px] sm:h-[54px] px-[16px] bg-white border border-[#dcdcdc] rounded-[20px] font-medium text-[15px] sm:text-[16px] text-[#111] focus:outline-none focus:border-[#0094c5]"
                  />
                </div>

                {/* Address */}
                <div className="flex flex-col gap-[8px] items-start w-full">
                  <label className="font-normal text-[15px] sm:text-[16px] text-[#111]">Address</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full h-[50px] sm:h-[54px] px-[16px] bg-white border border-[#dcdcdc] rounded-[20px] font-medium text-[15px] sm:text-[16px] text-[#111] focus:outline-none focus:border-[#0094c5]"
                  />
                </div>

                {/* Social security number with Eye toggle */}
                <div className="flex flex-col gap-[8px] items-start w-full">
                  <label className="font-normal text-[15px] sm:text-[16px] text-[#111]">Social security number</label>
                  <div className="w-full h-[50px] sm:h-[54px] px-[16px] bg-white border border-[#dcdcdc] rounded-[20px] flex items-center justify-between focus-within:border-[#0094c5]">
                    <input
                      type={showSsn ? "text" : "password"}
                      required
                      value={formData.ssn}
                      onChange={(e) => setFormData({ ...formData, ssn: e.target.value })}
                      placeholder="XXX-XX-XXXX"
                      className="w-full bg-transparent font-medium text-[15px] sm:text-[16px] text-[#111] focus:outline-none tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSsn(!showSsn)}
                      className="size-[24px] text-gray-500 hover:text-black transition-colors cursor-pointer shrink-0 ml-2"
                      aria-label={showSsn ? "Hide SSN" : "Show SSN"}
                    >
                      {showSsn ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Date of birth with Calendar icon */}
                <div className="flex flex-col gap-[8px] items-start w-full">
                  <label className="font-normal text-[15px] sm:text-[16px] text-[#111]">Date of birth</label>
                  <div className="w-full h-[50px] sm:h-[54px] px-[16px] bg-white border border-[#dcdcdc] rounded-[20px] flex items-center justify-between focus-within:border-[#0094c5]">
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full bg-transparent font-medium text-[15px] sm:text-[16px] text-[#111] focus:outline-none"
                    />
                    <div className="size-[20px] text-gray-500 pointer-events-none shrink-0 ml-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Status dropdown */}
                <div className="flex flex-col gap-[8px] items-start w-full">
                  <label className="font-normal text-[15px] sm:text-[16px] text-[#111]">Status</label>
                  <div className="relative w-full">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full h-[50px] sm:h-[54px] px-[16px] bg-white border border-[#dcdcdc] rounded-[20px] font-medium text-[15px] sm:text-[16px] text-[#111] appearance-none focus:outline-none focus:border-[#0094c5] pr-10 cursor-pointer"
                    >
                      <option value="Single">Single</option>
                      <option value="Married Filing Jointly">Married Filing Jointly</option>
                      <option value="Married Filing Separately">Married Filing Separately</option>
                      <option value="Head of Household">Head of Household</option>
                      <option value="Qualifying Surviving Spouse">Qualifying Surviving Spouse</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 7L10 13L4 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Dependents dropdown */}
                <div className="flex flex-col gap-[8px] items-start w-full">
                  <label className="font-normal text-[15px] sm:text-[16px] text-[#111]">Dependents</label>
                  <div className="relative w-full">
                    <select
                      value={formData.dependents}
                      onChange={(e) => setFormData({ ...formData, dependents: e.target.value })}
                      className="w-full h-[50px] sm:h-[54px] px-[16px] bg-white border border-[#dcdcdc] rounded-[20px] font-medium text-[15px] sm:text-[16px] text-[#111] appearance-none focus:outline-none focus:border-[#0094c5] pr-10 cursor-pointer"
                    >
                      <option value="No">No</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4+">4 or more</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 7L10 13L4 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Continue CTA Button */}
              <button
                type="submit"
                className="w-full h-[52px] sm:h-[56px] bg-[#0094c5] hover:bg-[#0082ad] text-white font-bold text-[16px] rounded-[100px] flex items-center justify-center gap-[8px] p-[12px] shadow-md hover:shadow-cyan-500/25 transition-all cursor-pointer mt-1"
                data-node-id="67:705"
              >
                <span>Continue</span>
                <div className="size-[24px] shrink-0">
                  <img src={imgArrowRight} alt="" className="size-full" />
                </div>
              </button>
            </form>
          )}

          {/* ==================== STEP 5: ALL DONE (Node 67:775) ==================== */}
          {step === 5 && (
            <div className="flex flex-col items-center relative overflow-hidden" data-node-id="67:776">
              
              {/* Top Arched Blue Graphic with Mobile Phone Refund Mockup */}
              <div className="relative w-full aspect-[2000/1112] overflow-hidden bg-[#0094c5] rounded-b-[50%_40%]">
                {/* Phone mockup export covers the full header frame, so the phone is already centered inside it */}
                <img
                  src={imgAllDonePhone}
                  alt="TaxMax App Tracking"
                  className="absolute inset-0 size-full"
                />
              </div>

              {/* Bottom Body */}
              <div className="p-6 sm:p-8 lg:p-[40px] pt-2 sm:pt-4 flex flex-col gap-6 sm:gap-[30px] items-start w-full">
                {/* Title & Subtitle */}
                <div className="flex flex-col gap-[10px] items-start w-full" data-node-id="67:778">
                  <h2 className="font-extrabold text-[28px] sm:text-[32px] text-[#111] tracking-[-0.32px] leading-[36px]" data-node-id="67:779">
                    All done
                  </h2>
                  <p className="font-normal text-[15px] sm:text-[16px] text-[#444] leading-normal" data-node-id="67:780">
                    Your documents are with TaxMax and your account is ready, login to start tracking &amp; get useful insights
                  </p>
                </div>

                {/* Login to TaxMax CTA Button */}
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="w-full h-[52px] sm:h-[56px] bg-[#0094c5] hover:bg-[#0082ad] text-white font-bold text-[16px] rounded-[100px] flex items-center justify-center gap-[8px] p-[12px] shadow-lg hover:shadow-cyan-500/25 transition-all cursor-pointer"
                  data-node-id="67:781"
                >
                  <span>Login to TaxMax</span>
                  <div className="size-[24px] shrink-0">
                    <img src={imgArrowRight} alt="" className="size-full" />
                  </div>
                </button>

                {/* Mobile App Promotion Footer */}
                <div className="flex flex-col gap-[16px] items-start w-full pt-1" data-node-id="67:789">
                  <p className="font-normal text-[14px] sm:text-[16px] text-[#444] leading-normal" data-node-id="67:790">
                    Or get the app to track your filing on the go!
                  </p>

                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 w-full" data-node-id="67:791">
                    {/* Store buttons */}
                    <div className="flex flex-col gap-3 shrink-0" data-node-id="67:792">
                      {/* App Store button */}
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="bg-white border border-black rounded-[10px] w-[130px] h-[48px] px-2.5 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-xs"
                      >
                        <div className="size-[22px] shrink-0">
                          <img src="/figma/7146400d00d6801605b2cdea6b0f7c246facf3d7.svg" alt="Apple" className="size-full" />
                        </div>
                        <div className="flex flex-col items-start leading-none text-black">
                          <span className="text-[9px] font-medium text-gray-700">Download on the</span>
                          <span className="text-[17px] font-semibold tracking-tight">App Store</span>
                        </div>
                      </a>

                      {/* Google Play button */}
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="bg-white border border-black rounded-[10px] w-[130px] h-[48px] px-2.5 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-xs"
                      >
                        <div className="size-[20px] shrink-0">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M3.6 1.8L13.8 12 3.6 22.2c-.4-.4-.6-1-.6-1.7V3.5c0-.7.2-1.3.6-1.7z" fill="#00C1A6"/>
                            <path d="M17.2 8.6L13.8 12l3.4 3.4 3.9-2.2c1.1-.6 1.1-1.7 0-2.3l-3.9-2.3z" fill="#FFC900"/>
                            <path d="M3.6 22.2L13.8 12 17.2 15.4 5.8 21.9c-.8.5-1.7.5-2.2.3z" fill="#FF3A44"/>
                            <path d="M3.6 1.8C4.1 1.5 5 1.5 5.8 2l11.4 6.5L13.8 12 3.6 1.8z" fill="#00A1FF"/>
                          </svg>
                        </div>
                        <div className="flex flex-col items-start leading-none text-black">
                          <span className="text-[8px] font-bold tracking-wider uppercase text-gray-700">GET IT ON</span>
                          <span className="text-[15px] font-semibold tracking-tight">Google Play</span>
                        </div>
                      </a>
                    </div>

                    {/* QR Code */}
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="font-normal text-[13px] sm:text-[14px] text-[#444] text-center w-[74px] leading-tight">
                        Or scan to download
                      </p>
                      <div className="size-[96px] sm:size-[110px] p-1.5 bg-white rounded-xl border border-gray-200 shadow-xs">
                        <img src={imgQrCode} alt="Download QR Code" className="size-full object-contain" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document View Preview Modal */}
      <DocumentPreviewModal
        isOpen={Boolean(activePreviewDoc)}
        onClose={() => setActivePreviewDoc(null)}
        document={activePreviewDoc}
      />
    </div>
  );
}

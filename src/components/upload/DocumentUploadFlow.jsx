import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import DocumentPreviewModal from './DocumentPreviewModal';
import OtpVerificationCard from '../auth/OtpVerificationCard';
import { getAccountType, getStoredToken, isValidEmail } from '../../services/auth';
import {
  FORM_TYPES,
  MAX_PAGES,
  IMAGE_TYPES,
  imageProblem,
  getFormTypes,
  uploadDocuments,
  deleteDocument,
} from '../../services/documents';
import {
  ensureOnboardingToken,
  clearOnboarding,
  onboardingAuth,
  isExpiredSignup,
  EXPIRED_SIGNUP_MESSAGE,
  submitDetails,
  resendSignupCode,
  verifySignup,
} from '../../services/onboarding';

const imgLogo = "/figma/b888a9396e41ae8b3746258887ab3eadbe9402d1.svg";
const imgArrowRight = "/figma/0836a6f58bee20c26ca9f18c84ce1cb5e104a898.svg";
const imgQrCode = "/figma/ade0003ecd704f4f58f8be66d8f520692faa8db1.svg";
const imgAllDonePhone = "/figma/upload/all-done-phone-mockup.png";
const imgCameraBox = "/figma/upload/camera-box.png";

const MIN_MODAL_SCALE = 0.7;

// Choose form -> upload its pages -> review the forms -> (sign-up only) details -> email code -> done.
const STEP = { CHOOSE: 1, UPLOAD: 2, REVIEW: 3, DETAILS: 4, VERIFY: 5, DONE: 6 };

const FORM_THUMBS = {
  w2: '/figma/upload/w2-thumbnail.png',
  '1099_nec': '/figma/upload/1099-nec-thumbnail.png',
  '1099_int': '/figma/upload/1099-int-thumbnail.png',
  '1099_t': '/figma/upload/1099-t-thumbnail.png',
};
const thumbFor = (formType) => FORM_THUMBS[formType] || '/figma/upload/other-doc-thumbnail.png';

const EMPTY_DETAILS = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  ssn: '',
  dob: '',
  maritalStatus: 'single',
  hasDependents: 'No',
};

// API field name (from a 422's `body.<name>` path) -> details form field.
const DETAIL_FIELDS = { phoneNumber: 'phone' };

const inputClass =
  'w-full h-[50px] sm:h-[54px] px-[16px] bg-white border rounded-[20px] font-medium text-[15px] sm:text-[16px] text-[#111] focus:outline-none focus:border-[#0094c5]';
const ctaClass =
  'w-full h-[52px] sm:h-[56px] bg-[#0094c5] hover:bg-[#0082ad] text-white font-bold text-[16px] rounded-[100px] flex items-center justify-center gap-[8px] p-[12px] shadow-md hover:shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#0094c5]';

let nextId = 0;
const localId = (prefix) => `${prefix}-${Date.now()}-${(nextId += 1)}`;

function ErrorText({ children, className = '' }) {
  if (!children) return null;
  return (
    <p className={`font-normal text-[12px] text-red-600 leading-normal ${className}`} role="alert">
      {children}
    </p>
  );
}

function Field({ label, optional, error, children }) {
  return (
    <div className="flex flex-col gap-[8px] items-start w-full">
      <label className="font-normal text-[15px] sm:text-[16px] text-[#111]">
        {label}
        {optional && <span className="text-[#888]"> (optional)</span>}
      </label>
      {children}
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

function SelectChevron() {
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 7L10 13L4 7" />
      </svg>
    </div>
  );
}

function CtaArrow() {
  return (
    <div className="size-[24px] shrink-0">
      <img src={imgArrowRight} alt="" className="size-full" />
    </div>
  );
}

// Signed-in customers add forms to their account; everyone else signs up with their first forms.
export default function DocumentUploadFlow({ isOpen, onClose, onSignedUp, onDocumentsAdded, onLogin }) {
  const [isCustomer] = useState(() => getAccountType(getStoredToken()) === 'customer');
  const [step, setStep] = useState(STEP.CHOOSE);
  const [formTypes, setFormTypes] = useState(FORM_TYPES);
  const [selectedType, setSelectedType] = useState('w2');

  // Pages of the form being uploaded: { id, file, preview }.
  const [pages, setPages] = useState([]);
  // Forms ready to send: { id, formType, files, serverId?, pageCount, thumbnailUrl? }.
  // `serverId` is set once the form has been created on the server.
  const [docs, setDocs] = useState([]);

  const [details, setDetails] = useState(EMPTY_DETAILS);
  const [fieldErrors, setFieldErrors] = useState({});
  const [accountExists, setAccountExists] = useState(false);
  const [session, setSession] = useState(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showSsn, setShowSsn] = useState(false);
  const [activePreviewDoc, setActivePreviewDoc] = useState(null);
  const [draggedPageIndex, setDraggedPageIndex] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const fileInputRef = useRef(null);
  const scaleRef = useRef(null);
  const previewUrlsRef = useRef([]);

  // The server's form list; the bundled copy stays if it can't be loaded.
  useEffect(() => {
    let active = true;
    getFormTypes().then((types) => active && types?.length && setFormTypes(types), () => {});
    return () => {
      active = false;
    };
  }, []);

  // Every sign-up starts empty: an unfinished one from an earlier visit is dropped, so its
  // forms are neither shown nor sent with this one.
  useEffect(() => {
    if (!isCustomer) clearOnboarding();
  }, [isCustomer]);

  // Release the in-memory image previews when the flow closes.
  useEffect(() => () => previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url)), []);

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
  }, [isOpen, step, pages.length, docs.length, error]);

  if (!isOpen) return null;

  const labelFor = (formType) => formTypes.find((f) => f.key === formType)?.label || 'Document';
  const currentForm = formTypes.find((f) => f.key === selectedType) || formTypes[0];
  const signupAuth = async () => (isCustomer ? undefined : onboardingAuth(await ensureOnboardingToken()));

  const goTo = (next) => {
    setError('');
    setStep(next);
  };

  // Finishing sign-up signs the customer in, so leaving the last screen opens their dashboard.
  const close = () => (session ? onSignedUp(session) : onClose());

  const handleBack = () => {
    if (busy) return;
    if (step === STEP.CHOOSE) {
      if (docs.length) goTo(STEP.REVIEW);
      else close();
    } else if (step === STEP.UPLOAD) {
      goTo(STEP.CHOOSE);
    } else if (step === STEP.REVIEW) {
      // Going back reopens the last form for editing, unless it has already been sent.
      const last = docs[docs.length - 1];
      if (last && !last.serverId) {
        setDocs(docs.slice(0, -1));
        setPages(last.files);
        setSelectedType(last.formType);
        goTo(STEP.UPLOAD);
      } else {
        goTo(STEP.CHOOSE);
      }
    } else if (step === STEP.DETAILS) {
      goTo(STEP.REVIEW);
    } else if (step === STEP.VERIFY) {
      goTo(STEP.DETAILS);
    } else {
      close();
    }
  };

  const addFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const problems = files.map(imageProblem).filter(Boolean);
    const accepted = files.filter((file) => !imageProblem(file)).slice(0, MAX_PAGES - pages.length);
    const dropped = files.length - problems.length - accepted.length;
    setError(problems[0] || (dropped > 0 ? `A document can have at most ${MAX_PAGES} pages.` : ''));
    const added = accepted.map((file) => {
      const preview = URL.createObjectURL(file);
      previewUrlsRef.current.push(preview);
      return { id: localId('page'), file, preview };
    });
    setPages((prev) => [...prev, ...added]);
  };

  const handleRemovePage = (indexToRemove, e) => {
    e.stopPropagation();
    setPages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleDropPage = (targetIdx) => {
    if (draggedPageIndex === null || draggedPageIndex === targetIdx) return;
    const updated = [...pages];
    const [moved] = updated.splice(draggedPageIndex, 1);
    updated.splice(targetIdx, 0, moved);
    setPages(updated);
    setDraggedPageIndex(null);
  };

  const finishForm = () => {
    if (!pages.length) return;
    setDocs((prev) => [...prev, { id: localId('doc'), formType: selectedType, files: pages, pageCount: pages.length }]);
    setPages([]);
    goTo(STEP.REVIEW);
  };

  const changeFormType = (docId, formType) => {
    setDocs((prev) => prev.map((d) => (d.id === docId ? { ...d, formType } : d)));
  };

  // The sign-up draft (and the forms sent with it) is gone; forms still in memory can be sent again.
  const restartSignup = () => {
    setDocs((prev) => prev.filter((d) => d.files).map((d) => ({ ...d, serverId: undefined })));
    setError(EXPIRED_SIGNUP_MESSAGE);
    setStep(STEP.REVIEW);
  };

  const removeDoc = async (doc) => {
    if (!doc.serverId) {
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
      return;
    }
    setBusy(true);
    setError('');
    try {
      await deleteDocument(doc.serverId, await signupAuth());
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      if (!isCustomer && isExpiredSignup(err)) restartSignup();
      else setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Sends every form not sent yet: upload URLs, the images to storage, then the documents.
  const submitDocuments = async () => {
    const pending = docs.filter((d) => !d.serverId);
    setBusy(true);
    setError('');
    try {
      if (pending.length) {
        const created = await uploadDocuments(
          pending.map((d) => ({ formType: d.formType, files: d.files.map((p) => p.file) })),
          await signupAuth(),
        );
        const sentIds = new Map(pending.map((d, i) => [d.id, created[i]._id]));
        setDocs((prev) => prev.map((d) => (sentIds.has(d.id) ? { ...d, serverId: sentIds.get(d.id) } : d)));
      }
      if (isCustomer) {
        onDocumentsAdded?.();
        setStep(STEP.DONE);
      } else {
        setStep(STEP.DETAILS);
      }
    } catch (err) {
      if (!isCustomer && isExpiredSignup(err)) restartSignup();
      else setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const updateDetail = (name, value) => {
    setDetails((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(details.email)) {
      setFieldErrors({ email: 'Please enter a valid email address' });
      return;
    }
    setBusy(true);
    setError('');
    setAccountExists(false);
    try {
      await submitDetails(details);
      setStep(STEP.VERIFY);
    } catch (err) {
      if (err.status === 401) {
        restartSignup();
      } else if (err.status === 422 && err.fieldErrors.length) {
        setFieldErrors(
          Object.fromEntries(
            err.fieldErrors.map(({ path, message }) => {
              const name = path.replace(/^body\./, '');
              return [DETAIL_FIELDS[name] || name, message];
            }),
          ),
        );
      } else {
        setAccountExists(err.status === 409);
        setError(err.message);
      }
    } finally {
      setBusy(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-[6px] flex items-center justify-center p-3 sm:p-6 lg:p-8 animate-in fade-in duration-200">
      {/* Background canvas wrapper matching Figma Desktop 1920 layout and responsive scaling */}
      <div ref={scaleRef} className="relative w-full max-w-[500px] my-auto">

        {/* Floating Back Button - matches Figma -translate-y-1/2 left-[388px] relative to card */}
        <button
          type="button"
          onClick={handleBack}
          disabled={busy}
          aria-label="Go back"
          className="absolute -top-14 sm:-top-16 left-0 lg:-left-20 lg:top-1/2 lg:-translate-y-1/2 z-10 size-11 sm:size-12 lg:size-[52px] bg-white rounded-full drop-shadow-[0px_4px_15px_rgba(0,0,0,0.12)] border border-gray-200/60 flex items-center justify-center text-[#111] hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all cursor-pointer group disabled:opacity-60 disabled:cursor-not-allowed"
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
          {step === STEP.CHOOSE && (
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

                {formTypes.map((form) => {
                  const isSelected = selectedType === form.key;
                  return (
                    <button
                      type="button"
                      key={form.key}
                      onClick={() => setSelectedType(form.key)}
                      aria-pressed={isSelected}
                      className={`w-full flex gap-3 sm:gap-[16px] items-center p-3 sm:p-[16px] rounded-[20px] cursor-pointer transition-all text-left ${
                        isSelected
                          ? 'bg-[#f5f5f5] ring-2 ring-[#0094c5] shadow-xs'
                          : 'bg-[#f5f5f5] hover:bg-[#ededed]'
                      }`}
                      data-node-id={`form-${form.key}`}
                    >
                      {/* Icon */}
                      <div className="size-[40px] shrink-0 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-gray-100">
                        <img src={thumbFor(form.key)} alt="" className="size-full object-contain" />
                      </div>

                      {/* Labels */}
                      <div className="flex flex-col gap-[4px] items-start justify-center flex-1 min-w-0">
                        <span className="font-semibold text-[14px] text-[#111] leading-normal truncate w-full">
                          {form.label}
                        </span>
                        {form.description && (
                          <span className="font-normal text-[12px] text-[#444] leading-normal truncate w-full">
                            {form.description}
                          </span>
                        )}
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
                    </button>
                  );
                })}
              </div>

              {/* Start Secure Upload CTA Button */}
              <button type="button" onClick={() => goTo(STEP.UPLOAD)} className={`${ctaClass} mt-1`} data-node-id="67:456">
                <span>Start secure upload</span>
                <CtaArrow />
              </button>
            </div>
          )}

          {/* ==================== STEP 2: UPLOAD DOCUMENTS (Nodes 67:496 & 67:530) ==================== */}
          {step === STEP.UPLOAD && (
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
                    <img src={thumbFor(currentForm.key)} alt="" className="size-full object-contain" />
                  </div>
                  <div className="flex flex-col gap-[4px] items-start justify-center flex-1 min-w-0">
                    <span className="font-semibold text-[14px] text-[#111] leading-normal truncate w-full">{currentForm.label}</span>
                    {currentForm.description && (
                      <span className="font-normal text-[12px] text-[#444] leading-normal truncate w-full">{currentForm.description}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => goTo(STEP.CHOOSE)}
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
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = '';
                }}
                multiple
                accept={IMAGE_TYPES.join(',')}
                className="hidden"
              />

              {/* Camera / Drop Zone Box */}
              <div className="flex flex-col gap-[10px] items-start justify-center w-full">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={pages.length >= MAX_PAGES}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                  }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                    addFiles(e.dataTransfer.files);
                  }}
                  className={`w-full h-[220px] sm:h-[260px] rounded-[20px] p-[16px] flex flex-col gap-[16px] items-center justify-center cursor-pointer transition-all border-2 border-dashed disabled:cursor-not-allowed disabled:opacity-60 ${
                    isDraggingOver
                      ? 'bg-[#0094c5]/5 border-[#0094c5]'
                      : 'bg-[#f5f5f5] hover:bg-[#eaeaea] border-transparent'
                  }`}
                  data-node-id="67:522"
                >
                  <div className="size-[60px] rounded-[10px] shrink-0 overflow-hidden shadow-xs">
                    <img src={imgCameraBox} alt="" className="size-full object-contain" />
                  </div>
                  <span className="font-normal text-[14px] text-[#444] text-center leading-normal">
                    {pages.length >= MAX_PAGES
                      ? `You've added the maximum of ${MAX_PAGES} pages`
                      : pages.length > 0
                        ? 'Tap to open your camera, or upload'
                        : 'Tap to open your camera'}
                  </span>
                  <span className="font-normal text-[12px] text-[#848484] text-center leading-normal">
                    JPG, PNG or WebP · up to 10 MB each
                  </span>
                </button>

                <ErrorText>{error}</ErrorText>

                {/* Page Thumbnails Row (as shown in Node 67:530) */}
                {pages.length > 0 && (
                  <div className="w-full flex flex-col gap-[10px] pt-1">
                    <div className="flex flex-wrap gap-4 sm:gap-[18px] items-center pt-2">
                      {pages.map((p, idx) => (
                        <div
                          key={p.id}
                          draggable
                          onDragStart={() => setDraggedPageIndex(idx)}
                          onDragOver={(e) => e.preventDefault()}
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
              <button type="button" onClick={finishForm} disabled={!pages.length} className={`${ctaClass} mt-1`} data-node-id="67:576">
                <span>Continue</span>
                <CtaArrow />
              </button>
            </div>
          )}

          {/* ==================== STEP 3: UPLOADED DOCUMENTS (Node 67:605) ==================== */}
          {step === STEP.REVIEW && (
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
                    {docs.length
                      ? 'Check each document is the right form type before sending.'
                      : 'Add the documents you want to send to your accountant.'}
                  </p>
                </div>
              </div>

              {/* Documents List */}
              <div className="flex flex-col gap-[12px] items-start w-full" data-node-id="67:625">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="w-full bg-[#f5f5f5] flex gap-3 sm:gap-[16px] items-center p-3 sm:p-[16px] rounded-[20px] relative"
                  >
                    {/* Thumbnail with page count badge */}
                    <div className="relative size-[40px] shrink-0">
                      <div className="size-[40px] rounded-lg overflow-hidden bg-white border border-gray-100 flex items-center justify-center">
                        <img src={thumbFor(doc.formType)} alt="" className="size-full object-contain" />
                      </div>
                      {doc.pageCount > 1 && (
                        <div className="absolute -top-1.5 -right-1.5 bg-white shadow-xs rounded-full size-[22px] flex items-center justify-center text-[12px] font-semibold text-[#111] border border-gray-200">
                          {doc.pageCount}
                        </div>
                      )}
                    </div>

                    {/* Form type: changeable until the document is sent */}
                    <div className="relative flex-1 min-w-0">
                      {doc.serverId ? (
                        <div className="flex flex-col gap-[2px]">
                          <span className="font-semibold text-[15px] sm:text-[16px] text-[#111] truncate">{labelFor(doc.formType)}</span>
                          <span className="font-medium text-[12px] text-[#0094c5]">Sent securely</span>
                        </div>
                      ) : (
                        <>
                          <select
                            value={doc.formType}
                            onChange={(e) => changeFormType(doc.id, e.target.value)}
                            disabled={busy}
                            aria-label="Form type"
                            className="w-full h-[40px] px-[12px] py-[8px] bg-white border border-[#cfcfcf] rounded-[10px] font-semibold text-[15px] sm:text-[16px] text-[#111] appearance-none cursor-pointer focus:outline-none focus:border-[#0094c5] pr-8"
                          >
                            {formTypes.map((opt) => (
                              <option key={opt.key} value={opt.key}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 7L10 13L4 7" />
                            </svg>
                          </div>
                        </>
                      )}
                    </div>

                    {/* View Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setActivePreviewDoc({
                          name: labelFor(doc.formType),
                          thumb: thumbFor(doc.formType),
                          pageCount: doc.pageCount,
                          pages: doc.files ? doc.files : [{ preview: doc.thumbnailUrl }],
                        })
                      }
                      className="font-bold text-[14px] text-[#0094c5] hover:underline cursor-pointer px-1"
                    >
                      View
                    </button>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeDoc(doc)}
                      disabled={busy}
                      aria-label={`Remove ${labelFor(doc.formType)}`}
                      className="size-[24px] shrink-0 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Upload another document button */}
                <button
                  type="button"
                  onClick={() => goTo(STEP.CHOOSE)}
                  disabled={busy}
                  className="w-full h-[52px] bg-[#0094c5]/10 hover:bg-[#0094c5]/15 text-[#0094c5] font-semibold text-[15px] sm:text-[16px] rounded-[100px] flex items-center justify-center gap-[8px] p-[12px] transition-colors cursor-pointer mt-1 disabled:opacity-40 disabled:cursor-not-allowed"
                  data-node-id="67:640"
                >
                  <span>{docs.length ? 'Upload another document' : 'Upload a document'}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-[10px] w-full">
                <ErrorText className="text-center">{error}</ErrorText>
                {/* Continue CTA Button */}
                <button type="button" onClick={submitDocuments} disabled={busy || !docs.length} className={ctaClass} data-node-id="67:643">
                  <span>{busy ? 'Uploading securely…' : isCustomer ? 'Send documents' : 'Continue'}</span>
                  {!busy && <CtaArrow />}
                </button>
              </div>
            </div>
          )}

          {/* ==================== STEP 4: LAST FEW DETAILS (Node 67:648) ==================== */}
          {step === STEP.DETAILS && (
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
                <Field label="Full name" error={fieldErrors.fullName}>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Jane Doe"
                    value={details.fullName}
                    onChange={(e) => updateDetail('fullName', e.target.value)}
                    className={`${inputClass} ${fieldErrors.fullName ? 'border-red-500' : 'border-[#dcdcdc]'}`}
                  />
                </Field>

                <Field label="Phone" optional error={fieldErrors.phone}>
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="(555) 123-4567"
                    value={details.phone}
                    onChange={(e) => updateDetail('phone', e.target.value)}
                    className={`${inputClass} ${fieldErrors.phone ? 'border-red-500' : 'border-[#dcdcdc]'}`}
                  />
                </Field>

                <Field label="Email" error={fieldErrors.email}>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="jane@example.com"
                    value={details.email}
                    onChange={(e) => updateDetail('email', e.target.value)}
                    className={`${inputClass} ${fieldErrors.email ? 'border-red-500' : 'border-[#dcdcdc]'}`}
                  />
                </Field>

                <Field label="Address" error={fieldErrors.address}>
                  <input
                    type="text"
                    required
                    autoComplete="street-address"
                    placeholder="123 Main St, Apt 4B, Springfield, IL 62701"
                    value={details.address}
                    onChange={(e) => updateDetail('address', e.target.value)}
                    className={`${inputClass} ${fieldErrors.address ? 'border-red-500' : 'border-[#dcdcdc]'}`}
                  />
                </Field>

                {/* Social security number with Eye toggle */}
                <Field label="Social security number" error={fieldErrors.ssn}>
                  <div className={`w-full h-[50px] sm:h-[54px] px-[16px] bg-white border rounded-[20px] flex items-center justify-between focus-within:border-[#0094c5] ${fieldErrors.ssn ? 'border-red-500' : 'border-[#dcdcdc]'}`}>
                    <input
                      type={showSsn ? "text" : "password"}
                      required
                      autoComplete="off"
                      inputMode="numeric"
                      value={details.ssn}
                      onChange={(e) => updateDetail('ssn', e.target.value)}
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
                </Field>

                <Field label="Date of birth" error={fieldErrors.dob}>
                  <input
                    type="date"
                    required
                    autoComplete="bday"
                    min="1900-01-01"
                    max={today}
                    value={details.dob}
                    onChange={(e) => updateDetail('dob', e.target.value)}
                    className={`${inputClass} ${fieldErrors.dob ? 'border-red-500' : 'border-[#dcdcdc]'}`}
                  />
                </Field>

                <Field label="Status" error={fieldErrors.maritalStatus}>
                  <div className="relative w-full">
                    <select
                      value={details.maritalStatus}
                      onChange={(e) => updateDetail('maritalStatus', e.target.value)}
                      className={`${inputClass} border-[#dcdcdc] appearance-none pr-10 cursor-pointer`}
                    >
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                    </select>
                    <SelectChevron />
                  </div>
                </Field>

                <Field label="Dependents" error={fieldErrors.hasDependents}>
                  <div className="relative w-full">
                    <select
                      value={details.hasDependents}
                      onChange={(e) => updateDetail('hasDependents', e.target.value)}
                      className={`${inputClass} border-[#dcdcdc] appearance-none pr-10 cursor-pointer`}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                    <SelectChevron />
                  </div>
                </Field>
              </div>

              <div className="flex flex-col gap-[10px] w-full items-center">
                <ErrorText className="text-center">{error}</ErrorText>
                {accountExists && (
                  <button type="button" onClick={onLogin} className="font-bold text-[14px] text-[#0094c5] hover:underline cursor-pointer">
                    Log in instead
                  </button>
                )}
                {/* Continue CTA Button */}
                <button type="submit" disabled={busy} className={`${ctaClass} mt-1`} data-node-id="67:705">
                  <span>{busy ? 'Sending your code…' : 'Continue'}</span>
                  {!busy && <CtaArrow />}
                </button>
              </div>
            </form>
          )}

          {/* ==================== STEP 5: VERIFY EMAIL (sign-up only) ==================== */}
          {step === STEP.VERIFY && (
            <OtpVerificationCard
              email={details.email.trim()}
              verify={verifySignup}
              resend={resendSignupCode}
              changeLabel="Change your details"
              onChangeEmail={() => goTo(STEP.DETAILS)}
              onVerified={(signedIn) => {
                setSession(signedIn);
                setStep(STEP.DONE);
              }}
            />
          )}

          {/* ==================== STEP 6: ALL DONE (Node 67:775) ==================== */}
          {step === STEP.DONE && (
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
                    {isCustomer
                      ? 'Your documents are with TaxMax. Track their progress from your dashboard.'
                      : 'Your documents are with TaxMax and your account is ready. Head to your dashboard to start tracking & get useful insights.'}
                  </p>
                </div>

                {/* Dashboard CTA Button */}
                <button type="button" onClick={close} className={ctaClass} data-node-id="67:781">
                  <span>{isCustomer ? 'Back to dashboard' : 'Go to your dashboard'}</span>
                  <CtaArrow />
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

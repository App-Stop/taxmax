// Mock dashboard content. There is no backend yet: documents come from the stored
// user when present, everything else is seeded from the Figma designs.

const DOC_PAGE = '/figma/dashboard/doc-page.png';
const DEFAULT_SUBMITTED_AT = '2026-10-08T13:30:00';
const FALLBACK_CROP = 'inset-0 size-full object-contain';

export const PREPARER = {
  name: 'David kim',
  role: 'Assigned Specialist',
  avatar: '/figma/dashboard/preparer-avatar.png',
  avatarLarge: '/figma/dashboard/preparer-avatar-48.png',
  photo: '/figma/dashboard/preparer-photo-40.png',
};

// Thumbnail art and its Figma crop, per document type.
const DOC_TYPES = {
  w2: {
    thumb: '/figma/dashboard/doc-w2.png',
    crop: 'h-[124.02%] left-[-12.5%] top-[-10.45%] w-[125%]',
  },
  '1099-int': {
    thumb: '/figma/dashboard/doc-1099-int.png',
    crop: 'h-[122.5%] left-[-11.73%] top-[-10%] w-[123.46%]',
  },
  '1099-nec': {
    thumb: '/figma/dashboard/doc-1099-nec.png',
    crop: 'h-[120%] left-[-10.47%] top-[-8.75%] w-[120.94%]',
  },
};

export const DOC_STATUS = {
  filed: { label: 'Filed', icon: '/figma/dashboard/check.svg', color: 'text-[#0094c5]' },
  reviewing: { label: 'Preparer reviewing', icon: '/figma/dashboard/loader-16.svg', color: 'text-[#e86907]' },
  submitted: { label: 'Documents submitted', icon: '/figma/dashboard/files-16.svg', color: 'text-[#848484]' },
};

// Statuses written by earlier versions of the stored user.
const STATUS_ALIASES = {
  filed: 'filed',
  reviewing: 'reviewing',
  submitted: 'submitted',
  Verified: 'filed',
  'Under Review': 'reviewing',
};

const DEFAULT_DOCUMENTS = [
  { id: 'doc-1099-int', type: '1099-int', name: '1099-INT', status: 'filed', pageCount: 1 },
  { id: 'doc-1099-nec', type: '1099-nec', name: '1099-NEC', status: 'reviewing', pageCount: 1 },
  { id: 'doc-w2', type: 'w2', name: 'W-2 Form', status: 'submitted', pageCount: 3 },
];

const inferType = (name = '') => {
  const key = name.toLowerCase();
  if (key.includes('w-2') || key.includes('w2')) return 'w2';
  if (key.includes('1099-int')) return '1099-int';
  if (key.includes('1099-nec')) return '1099-nec';
  return 'other';
};

export function normalizeDocuments(user) {
  const source = user?.documents?.length ? user.documents : DEFAULT_DOCUMENTS;
  return source.map((doc, index) => {
    const id = doc.id || `doc-${index}`;
    const type = doc.type || inferType(doc.name);
    const art = DOC_TYPES[type];
    const pageCount = doc.pages?.length || doc.pageCount || 1;
    return {
      id,
      type,
      name: doc.name,
      status: STATUS_ALIASES[doc.status] || 'submitted',
      thumb: art?.thumb || doc.thumb,
      crop: art?.crop || FALLBACK_CROP,
      pages: Array.from({ length: pageCount }, (_, n) => ({
        id: `${id}-page-${n + 1}`,
        preview: doc.pages?.[n]?.preview || DOC_PAGE,
      })),
      submittedAt: doc.submittedAt || user?.accountCreatedDate || DEFAULT_SUBMITTED_AT,
    };
  });
}

export const firstNameOf = (user) => user?.fullName?.trim().split(/\s+/)[0] || 'there';

export const initialsOf = (user) =>
  (user?.fullName || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

export const formatTime = (date) =>
  new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

export const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getMonth() + 1} / ${d.getDate()} / ${d.getFullYear()}`;
};

const REFUND_REPLY =
  "Based on current IRS processing, your estimated refund of $2,840 should arrive within 3-5 business days after filing. I'll keep you updated!";

export const buildMessages = (firstName) => [
  { id: 'm1', from: 'preparer', text: `Hi ${firstName}! I've received your W-2 and 1099-NEC. I'll begin preparing your return today.`, time: '9:30 AM' },
  { id: 'm2', from: 'me', text: 'Great, thank you! When can I expect the refund?', time: '9:30 AM', receipt: 'Read' },
  { id: 'm3', from: 'preparer', text: REFUND_REPLY, time: '9:30 AM' },
  { id: 'm4', from: 'me', text: 'Great, thank you! When can I expect the refund?', time: '9:30 AM', receipt: 'Read' },
  { id: 'm5', from: 'preparer', text: REFUND_REPLY, time: '9:30 AM' },
  { id: 'm6', from: 'me', text: 'Perfect, appreciate the fast response.', time: '9:30 AM', receipt: 'Delivered' },
  { id: 'm7', from: 'preparer', text: REFUND_REPLY, time: '9:30 AM' },
];

export const buildNotifications = (firstName) => [
  {
    id: 'n1',
    kind: 'message',
    group: 'Today',
    avatar: PREPARER.photo,
    title: `New message from ${PREPARER.name}`,
    body: `Hi ${firstName}! I've received your W-2 and 1099-NEC. I'll begin preparing your return today.`,
    time: '9:30 AM',
    unread: true,
  },
  {
    id: 'n2',
    kind: 'document',
    group: 'Today',
    icon: '/figma/dashboard/loader-22.svg',
    title: '1099-NEC · Preparer reviewing',
    body: `${PREPARER.name} is reviewing your submitted 1099-NEC.`,
    time: '9:20 AM',
    unread: true,
  },
  {
    id: 'n3',
    kind: 'document',
    group: 'Today',
    icon: '/figma/dashboard/documents-submitted.svg',
    title: 'W-2 Form · Documents submitted',
    body: 'Your W-2 pages have been submitted securely to your preparer.',
    time: '9:15 AM',
    unread: false,
  },
  {
    id: 'n4',
    kind: 'document',
    group: 'Earlier',
    icon: '/figma/dashboard/filed.svg',
    title: '1099-INT · Filed',
    body: 'Your 1099-INT status has been updated to Filed.',
    time: 'Yesterday',
    unread: false,
  },
];

// Dashboard content: shapes the API's documents, activity and notifications for the screens.

const FALLBACK_CROP = 'inset-0 size-full object-contain';

// Thumbnail art and its Figma crop, per API form type. Other types use the upload-flow icons.
const DOC_TYPES = {
  w2: {
    thumb: '/figma/dashboard/doc-w2.png',
    crop: 'h-[124.02%] left-[-12.5%] top-[-10.45%] w-[125%]',
  },
  '1099_int': {
    thumb: '/figma/dashboard/doc-1099-int.png',
    crop: 'h-[122.5%] left-[-11.73%] top-[-10%] w-[123.46%]',
  },
  '1099_nec': {
    thumb: '/figma/dashboard/doc-1099-nec.png',
    crop: 'h-[120%] left-[-10.47%] top-[-8.75%] w-[120.94%]',
  },
  '1099_t': { thumb: '/figma/upload/1099-t-thumbnail.png', crop: FALLBACK_CROP },
};
const OTHER_TYPE = { thumb: '/figma/upload/other-doc-thumbnail.png', crop: FALLBACK_CROP };

// Keyed by the API's document status. `icon: null` draws the attention (warning) icon.
export const DOC_STATUS = {
  uploaded: { label: 'Documents submitted', icon: '/figma/dashboard/files-16.svg', color: 'text-[#848484]' },
  'in-review': { label: 'Preparer reviewing', icon: '/figma/dashboard/loader-16.svg', color: 'text-[#e86907]' },
  're-upload': { label: 'New photos needed', icon: null, color: 'text-[#d92d20]' },
  'action-needed': { label: 'Action needed', icon: null, color: 'text-[#d92d20]' },
  accepted: { label: 'Verified', icon: '/figma/dashboard/check.svg', color: 'text-[#0094c5]' },
  submitted: { label: 'Submitted for filing', icon: '/figma/dashboard/check.svg', color: 'text-[#0094c5]' },
  completed: { label: 'Completed', icon: '/figma/dashboard/check.svg', color: 'text-[#0094c5]' },
  filed: { label: 'Filed', icon: '/figma/dashboard/check.svg', color: 'text-[#0094c5]' },
};

// { name, role } of the assigned team member, or null while nobody is assigned. The
// dashboard's own list wins over the one stored with the profile at sign-in.
export const preparerFor = (user, assignedPreparers) => {
  const member = assignedPreparers?.find((m) => m?.fullName);
  if (member) return { name: member.fullName, role: member.roleName };
  return user?.preparer || null;
};

const FORM_NAMES = {
  w2: 'W-2 Form',
  '1099_nec': '1099-NEC',
  '1099_int': '1099-INT',
  '1099_t': '1099-T',
  w4: 'W-4 Form',
  w3: 'W-3 Form',
  1098: '1098',
  other: 'Document',
};

const UPDATE_ICONS = {
  created: '/figma/dashboard/documents-submitted.svg',
  reviewing: '/figma/dashboard/loader-22.svg',
  done: '/figma/dashboard/filed.svg',
};

const sameDay = (a, b) => a.toDateString() === b.toDateString();

// "9:30 AM" today, "Yesterday", otherwise the date.
const updateTime = (iso) => {
  const date = new Date(iso);
  const now = new Date();
  if (sameDay(date, now)) return formatTime(date);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(date, yesterday)) return 'Yesterday';
  return formatDate(date);
};

// An activity row from GET /dashboard/customer (`recentUpdates`) as a "Recent updates" card.
export function toRecentUpdate(row) {
  const form = FORM_NAMES[row.meta?.formType] || 'Document';
  const by = row.actor?.type === 'customer' ? 'You' : row.actor?.name || 'Your preparer';
  let title = form;
  let body = `${by} updated your ${form}.`;
  let icon = UPDATE_ICONS.reviewing;

  switch (row.action) {
    case 'document.created':
      title = `${form} · Documents submitted`;
      body = `Your ${form} pages have been submitted securely to your preparer.`;
      icon = UPDATE_ICONS.created;
      break;
    case 'document.pages_updated':
      title = `${form} · Photos updated`;
      body = `${by} updated the photos of your ${form}.`;
      break;
    case 'document.status_changed': {
      const status = DOC_STATUS[row.meta?.to];
      title = `${form} · ${status?.label || 'Status updated'}`;
      body = `Your ${form} status has been updated to ${status?.label || row.meta?.to}.`;
      if (['accepted', 'submitted', 'completed', 'filed'].includes(row.meta?.to)) icon = UPDATE_ICONS.done;
      break;
    }
    case 'document.ocr_completed':
      title = `${form} · Details read`;
      body = `The details on your ${form} have been read and are ready for review.`;
      break;
    case 'field.flagged':
      title = `${form} · Detail flagged`;
      body = `${by} flagged ${row.meta?.fieldName ? `“${row.meta.fieldName}”` : 'a detail'} on your ${form}.`;
      break;
    default:
      break;
  }

  return { id: row._id, kind: 'document', icon, title, body, time: updateTime(row.createdAt), unread: false };
}

// An API document (list row or full document) in the shape the dashboard renders.
export function toDashboardDocument(doc) {
  const art = DOC_TYPES[doc.formType] || OTHER_TYPE;
  return {
    id: doc._id,
    formType: doc.formType,
    name: doc.formLabel || 'Document',
    status: DOC_STATUS[doc.status] ? doc.status : 'uploaded',
    statusNote: doc.statusNote,
    ocrStatus: doc.ocrStatus,
    pageCount: doc.pageCount,
    fieldCounts: doc.fieldCounts,
    thumb: art.thumb,
    crop: art.crop,
    submittedAt: doc.submittedAt,
  };
}


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

const NOTIFICATION_ICONS = {
  activity: '/figma/dashboard/loader-22.svg',
  profile: '/figma/dashboard/documents-submitted.svg',
};
const DEFAULT_NOTIFICATION_ICON = '/figma/dashboard/filed.svg';

// An API notification (GET /notifications/me) in the shape the panel renders.
export function toNotification(row) {
  const created = new Date(row.createdAt);
  const isToday = created.toDateString() === new Date().toDateString();
  return {
    id: row._id,
    kind: row.category,
    group: isToday ? 'Today' : 'Earlier',
    icon: NOTIFICATION_ICONS[row.category] || DEFAULT_NOTIFICATION_ICON,
    title: row.title,
    body: row.body,
    time: isToday ? formatTime(created) : formatDate(created),
    unread: !row.isRead,
  };
}

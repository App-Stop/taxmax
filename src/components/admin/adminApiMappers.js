// Turns API payloads into the shapes the admin views render. Fields the API
// doesn't have yet come back as null and the views show "—" for them.

const FORM_LABELS = {
  w2: 'W-2 Form',
  '1099_nec': '1099-NEC',
  '1099_int': '1099-INT',
  '1099_t': '1099-T',
  w4: 'W-4 Form',
  w3: 'W-3 Form',
  1098: '1098',
  other: 'Other document',
};

// Short names for the queue's "Document Type" column and the thumbnail art.
const FORM_SHORT = {
  w2: 'W-2',
  '1099_nec': '1099-NEC',
  '1099_int': '1099-INT',
  '1099_t': '1099-T',
  w4: 'W-4',
  w3: 'W-3',
  1098: '1098',
  other: 'Other',
};

const formLabel = (formType) => FORM_LABELS[formType] || formType || 'document';

const pad = (n) => String(n).padStart(2, '0');

// ISO timestamp -> local calendar day 'YYYY-MM-DD' (what formatDate() takes).
export const localDay = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const localTime = (iso) => (iso ? new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '');

export const relativeTime = (iso) => {
  if (!iso) return '';
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// E.164 US numbers read as +1 (555) 123-4567; anything else is shown as stored.
const formatPhone = (e164) => {
  const us = e164?.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  return us ? `+1 (${us[1]}) ${us[2]}-${us[3]}` : e164 || null;
};

const capitalize = (value) => (value ? value[0].toUpperCase() + value.slice(1) : null);

// API user (userTransformer), or the { _id, fullName, email, phoneNumber } a document carries.
export function mapClient(user) {
  if (!user) return null;
  return {
    id: user._id,
    name: user.fullName || user.email || 'Unnamed client',
    email: user.email || '',
    phone: formatPhone(user.phoneNumber),
    ssn: user.ssnLast4 ? `***-**-${user.ssnLast4}` : null,
    address: user.address ?? null,
    dob: user.dob ?? null,
    // The customer app shows marital status as "Filing Status" too.
    filingStatus: capitalize(user.maritalStatus),
    hasDependents: user.hasDependents ?? null,
    assignedTo: user.assignedTo || [],
    isActive: user.isActive ?? true,
    createdAt: localDay(user.createdAt),
    // Not in the API yet.
    status: null,
    taxYear: null,
    directDeposit: null,
    submissionCount: null,
    notes: '',
  };
}

// API document summary (documentSummaryTransformer) or full document (documentTransformer).
// `client` is used when the document's customer isn't populated (a single customer's list).
export function mapDocument(doc, client = null) {
  const customer = doc.customer && typeof doc.customer === 'object' ? mapClient(doc.customer) : client;
  return {
    id: doc._id,
    _id: doc._id,
    clientId: customer?.id ?? doc.customer,
    client: customer,
    formType: doc.formType,
    type: FORM_SHORT[doc.formType] || doc.formType,
    title: doc.formLabel || formLabel(doc.formType),
    // TX-00000, assigned the first time the document is submitted.
    submissionId: doc.submissionId ?? null,
    date: localDay(doc.submittedAt || doc.createdAt),
    time: localTime(doc.submittedAt || doc.createdAt),
    status: doc.status,
    statusNote: doc.statusNote ?? null,
    ocrStatus: doc.ocrStatus,
    assigneeIds: doc.assignedTo || [],
    pages: Array.isArray(doc.pages) ? doc.pages.length : (doc.pageCount ?? 0),
    pagesList: Array.isArray(doc.pages) ? doc.pages : [],
    fieldsList: Array.isArray(doc.fields) ? doc.fields : [],
    thumbnailUrl: doc.thumbnailUrl ?? (Array.isArray(doc.pages) && doc.pages[0]?.url) ?? null,
    fieldCounts: doc.fieldCounts ?? null,
    updatedAt: doc.updatedAt ?? null,
  };
}

// GET /dashboard/team/submission-queue row. Rows don't carry the customer's id, so
// `clientId` is null until resolved from the document (see SubmissionQueueView).
export function mapQueueRow(row) {
  const assignees = row.assignedTo || [];
  return {
    ...mapDocument({
      _id: row._id,
      formType: row.documentType,
      formLabel: row.documentTypeLabel,
      submissionId: row.submissionId,
      status: row.status,
      submittedAt: row.dateSubmitted,
    }),
    clientId: null,
    client: { id: null, name: row.customerName || row.email || 'Unnamed client', email: row.email || '' },
    assigneeIds: assignees.map((member) => member._id),
    assigneeNames: Object.fromEntries(assignees.map((member) => [member._id, member.fullName || member.email])),
  };
}

const maskSsn = (last4) => (last4 ? `***-**-${last4}` : null);

// GET /dashboard/team/client-directory row.
export function mapDirectoryClient(row) {
  return {
    id: row._id,
    name: row.clientName || row.email || 'Unnamed client',
    email: row.email || '',
    phone: formatPhone(row.phoneNumber),
    ssn: maskSsn(row.ssnLast4),
    submissionCount: row.totalDocumentsSubmitted ?? 0,
    taxYear: row.taxYear ?? null,
    status: row.status, // 'active' | 'non-active'
    isActive: row.status !== 'non-active',
    createdAt: localDay(row.accountCreatedDate),
  };
}

// GET /dashboard/team/client-directory/:id -> { client, documents, activity }.
export function mapClientDetail(data, clientId) {
  const { details = {} } = data;
  const client = {
    id: clientId,
    name: data.clientName || data.email || 'Unnamed client',
    email: data.email || '',
    phone: formatPhone(details.phoneNumber),
    ssn: maskSsn(details.ssnLast4),
    filingStatus: capitalize(details.filingStatus),
    taxYear: details.taxYear ?? null,
    createdAt: localDay(details.accountCreatedAt),
    submissionCount: data.totalSubmissionCount ?? 0,
    directDeposit: null,
  };
  const documents = (data.submissions || []).map((submission) =>
    mapDocument({ ...submission, formLabel: submission.formName }, client),
  );
  const activity = (data.recentActivity || []).map((row) => mapActivity(row, client.name));
  return { client, documents, activity };
}

// Groups fields by their source page for clean display in DocumentReviewView
export function groupDocumentFields(fields = []) {
  const groups = new Map();
  fields.forEach((field) => {
    const pageLabel = field.page ? `Page ${field.page}` : 'Additional / Manual Details';
    if (!groups.has(pageLabel)) {
      groups.set(pageLabel, []);
    }
    groups.get(pageLabel).push(field);
  });
  return Array.from(groups.entries()).map(([group, list]) => ({
    group,
    fields: list,
  }));
}

const STATUS_LABELS = {
  uploaded: 'Uploaded',
  'in-review': 'In review',
  're-upload': 'Re-upload',
  'action-needed': 'Action needed',
  accepted: 'Accepted',
  submitted: 'Submitted',
  completed: 'Completed',
  filed: 'Filed',
};

const quoted = (name) => (name ? `“${name}”` : 'a field');

// action code + meta -> { kind, action, target } for the activity rows.
// `kind` picks the icon and the "action" filter (ACTIVITY_STYLES keys).
function describe(action, meta = {}) {
  const form = formLabel(meta.formType);
  switch (action) {
    case 'document.created':
      return { kind: 'filed', action: 'uploaded', target: form };
    case 'document.pages_updated':
      return { kind: 'filed', action: 'updated the images of', target: form };
    case 'document.deleted':
      return { kind: 'filed', action: 'deleted', target: form };
    case 'document.status_changed':
      return {
        kind: meta.to === 're-upload' ? 'reupload' : 'status',
        action: meta.to === 're-upload' ? 'requested a re-upload of' : `changed status to ${STATUS_LABELS[meta.to] || meta.to} for`,
        target: form,
      };
    case 'document.ocr_completed':
      return { kind: 'verified', action: 'read the fields of', target: form };
    case 'document.ocr_failed':
      return { kind: 'reupload', action: 'could not read', target: form };
    case 'document.ocr_retried':
      return { kind: 'verified', action: 're-ran OCR on', target: form };
    case 'field.added':
      return { kind: 'filed', action: `added ${quoted(meta.fieldName)} to`, target: form };
    case 'field.updated':
      return { kind: 'filed', action: `edited ${quoted(meta.fieldName)} on`, target: form };
    case 'field.removed':
      return { kind: 'filed', action: `removed ${quoted(meta.fieldName)} from`, target: form };
    case 'field.confirmed':
      return { kind: 'verified', action: `confirmed ${quoted(meta.fieldName)} on`, target: form };
    case 'field.flagged':
      return { kind: 'reupload', action: `flagged ${quoted(meta.fieldName)} on`, target: form };
    case 'profile.created':
      return { kind: 'login', action: 'created an account', target: '' };
    case 'profile.updated':
      return { kind: 'filed', action: 'updated their profile', target: '' };
    case 'account.status_changed':
      return { kind: 'status', action: meta.isActive ? 'activated the account of' : 'deactivated the account of', target: '' };
    case 'customer.viewed':
      return { kind: 'login', action: 'viewed the profile of', target: '' };
    case 'document.viewed':
      return { kind: 'login', action: 'viewed', target: form };
    case 'ssn.viewed':
      return { kind: 'login', action: 'revealed the SSN of', target: '' };
    case 'customer.assignees_changed':
      return { kind: 'status', action: 'changed the team assigned to', target: '' };
    default:
      return { kind: 'status', action: action || 'did something to', target: '' };
  }
}

// API activity row -> { id, kind, actor, action, target, time } (the ActivityRow shape).
// `customerName` names the customer for a single customer's log, where rows carry only its id.
export function mapActivity(row, customerName = null) {
  const { kind, action, target } = describe(row.action, row.meta);
  const actorIsCustomer = row.actor?.type === 'customer';
  const customer = row.customer && typeof row.customer === 'object' ? row.customer.fullName : customerName;

  return {
    id: row._id,
    kind,
    actor: row.actor?.name || (row.actor?.type === 'system' ? 'System' : 'Unknown'),
    actorType: row.actor?.type ?? null,
    action,
    // Team and system rows say whose record it was; a customer's own rows don't need to.
    target: actorIsCustomer || !customer ? target : [target, customer].filter(Boolean).join(' · '),
    time: relativeTime(row.createdAt),
    createdAt: row.createdAt,
  };
}

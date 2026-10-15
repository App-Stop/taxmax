// Dummy data for the admin portal until the backend (submissions, OCR, messaging) is wired up.

const A = '/figma/admin';

export const ADMIN_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: `${A}/nav-dashboard.svg`, activeIcon: `${A}/nav-dashboard-active.svg` },
  { id: 'queue', label: 'Submission queue', icon: `${A}/nav-queue.svg`, activeIcon: `${A}/nav-queue-active.svg` },
  { id: 'clients', label: 'Clients directory', icon: `${A}/nav-clients.svg`, activeIcon: `${A}/nav-clients-active.svg` },
  { id: 'messages', label: 'Messages', icon: `${A}/nav-messages.svg`, activeIcon: `${A}/nav-messages-active.svg` },
  { id: 'campaigns', label: 'Campaigns', icon: `${A}/nav-campaigns.svg`, activeIcon: `${A}/nav-campaigns-active.svg` },
  { id: 'activity', label: 'Activity log', icon: `${A}/nav-activity.svg`, activeIcon: `${A}/nav-activity-active.svg` },
  { id: 'settings', label: 'Settings', icon: `${A}/nav-settings.svg`, activeIcon: `${A}/nav-settings-active.svg` },
];

export const PAGE_SIZE = 9;

export const STATUSES = [
  { id: 'in_review', label: 'In review', bg: 'bg-[#fff1e6]', text: 'text-[#e86907]' },
  { id: 'action_needed', label: 'Action needed', bg: 'bg-[#ffecec]', text: 'text-[#ea0101]' },
  { id: 'accepted', label: 'Accepted', bg: 'bg-[#e5f7dc]', text: 'text-[#39ab00]' },
  { id: 'verified', label: 'Verified', bg: 'bg-[rgba(0,148,197,0.1)]', text: 'text-[#0094c5]' },
  { id: 'filed', label: 'Filed', bg: 'bg-[#ffeefa]', text: 'text-[#ff1fad]' },
];

export const statusById = (id) => STATUSES.find((s) => s.id === id) || STATUSES[0];

// The dataset's "today"; date-range filters are measured from here.
export const REFERENCE_DATE = '2026-09-10';

export const ADMIN_PROFILE = { name: 'David Lee', role: 'Admin', photo: `${A}/admin-avatar.png` };

export const initialsOf = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const formatDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const STAFF = [
  { id: 's1', name: 'JJ Thompson', photo: `${A}/assignee-jj.png` },
  { id: 's2', name: 'Mike Rivera' },
  { id: 's3', name: 'Tom Bradley' },
  { id: 's4', name: 'David Wilson' },
  { id: 's5', name: 'Chris Nguyen' },
  { id: 's6', name: 'Jake Morris' },
  { id: 's7', name: 'Lisa Patel' },
  { id: 's8', name: 'Ben Harper' },
  { id: 's9', name: 'Amy Cruz' },
];

export const staffById = (id) => STAFF.find((s) => s.id === id);

const CLIENT_SEED = [
  ['c1', 'JJ Thompson', 'alex.morgan@email.com', '+1 (555) 392-8190', '8492', '2025', '2026-08-12', 'in_review'],
  ['c2', 'Charles Darwin', 'charles.darwin@email.com', '+1 (555) 392-8197', '7788', '2024', '2026-08-19', 'action_needed'],
  ['c3', 'Ada Lovelace', 'ada.lovelace@email.com', '+1 (555) 392-8196', '5566', '2025', '2026-08-14', 'accepted'],
  ['c4', 'Stephen Hawking', 'stephen.hawking@email.com', '+1 (555) 392-8193', '3344', '2026', '2026-08-16', 'verified'],
  ['c5', 'Hypatia', 'hypatia@email.com', '+1 (555) 392-8192', '9101', '2024', '2026-08-13', 'filed'],
  ['c6', 'Nikola Tesla', 'nikola.tesla@email.com', '+1 (555) 392-8194', '1234', '2023', '2026-08-12', 'filed'],
  ['c7', 'Galileo Galilei', 'galileo.g@email.com', '+1 (555) 392-8195', '1122', '2024', '2026-08-18', 'verified'],
  ['c8', 'Marie Curie', 'marie.curie@email.com', '+1 (555) 392-8191', '5678', '2021', '2026-08-17', 'in_review'],
  ['c9', 'Richard Feynman', 'richard.feynman@email.com', '+1 (555) 392-8189', '4410', '2025', '2026-08-15', 'in_review'],
  ['c10', 'Niels Bohr', 'niels.bohr@email.com', '+1 (555) 392-8188', '2290', '2025', '2026-08-20', 'accepted'],
  ['c11', 'Sally Ride', 'sally.ride@email.com', '+1 (555) 392-8187', '6631', '2024', '2026-08-21', 'verified'],
  ['c12', 'Rosalind Franklin', 'rosalind.franklin@email.com', '+1 (555) 392-8186', '7702', '2025', '2026-08-22', 'filed'],
  ['c13', 'Alan Turing', 'alan.turing@email.com', '+1 (555) 392-8185', '1945', '2025', '2026-08-24', 'accepted'],
  ['c14', 'Grace Hopper', 'grace.hopper@email.com', '+1 (555) 392-8184', '3106', '2026', '2026-08-25', 'in_review'],
  ['c15', 'Katherine Johnson', 'katherine.johnson@email.com', '+1 (555) 392-8183', '8818', '2025', '2026-08-27', 'verified'],
  ['c16', 'Carl Sagan', 'carl.sagan@email.com', '+1 (555) 392-8182', '5150', '2024', '2026-08-28', 'filed'],
];

const FILING_STATUSES = ['Married Filing Jointly', 'Single', 'Head of Household', 'Married Filing Separately'];
const BANKS = ['Wells Fargo (...2290)', 'Chase (...4417)', 'Bank of America (...0912)', 'Citi (...7735)'];

export const INITIAL_CLIENTS = CLIENT_SEED.map(([id, name, email, phone, ssnLast4, taxYear, createdAt, status], i) => ({
  id,
  name,
  email,
  phone,
  ssn: `***-**-${ssnLast4}`,
  taxYear,
  createdAt,
  status,
  filingStatus: FILING_STATUSES[i % FILING_STATUSES.length],
  directDeposit: BANKS[i % BANKS.length],
  notes: i === 0 ? 'Filing is in progress, cross check IRS again' : '',
}));

// JJ Thompson's detail page values from the design.
Object.assign(INITIAL_CLIENTS[0], { phone: '+1 (555) 318-9044', ssn: '***-**-3371', createdAt: '2026-08-28' });

export const clientActivity = (client) => {
  const first = client.name;
  return [
    `${first} uploaded documents for the ${client.taxYear} tax return.`,
    `${first} reviewed deductions for the ${client.taxYear} tax return.`,
    `${first} submitted the ${client.taxYear} tax return for filing.`,
    `${first} checked the status of the ${client.taxYear} tax refund.`,
  ].map((text, i) => ({ id: `${client.id}-a${i}`, text, time: '10m ago' }));
};

// Each queue row is one uploaded document, grouped under a submission (tax return) id.
const DOC_SEED = [
  ['d1', 'TX-94821', 'c1', 'W-2', 'Form W-2', '2026-08-12', 'in_review', 's1', 2],
  ['d2', 'TX-94830', 'c2', '1040', null, '2026-08-13', 'action_needed', 's2', 1],
  ['d3', 'TX-94831', 'c3', 'Schedule E', null, '2026-08-13', 'accepted', 's3', 1],
  ['d4', 'TX-94826', 'c4', 'W-4', null, '2026-08-14', 'verified', 's4', 1],
  ['d5', 'TX-94829', 'c5', 'Schedule C', null, '2026-08-14', 'filed', 's5', 1],
  ['d6', 'TX-94824', 'c6', '1099', null, '2026-08-15', 'filed', 's6', 1],
  ['d7', 'TX-94828', 'c7', 'Form 941', 'Form 941', '2026-08-15', 'verified', 's7', 1],
  ['d8', 'TX-94822', 'c8', 'W-3', null, '2026-08-17', 'in_review', 's8', 1],
  ['d9', 'TX-94821', 'c1', 'K-1', 'Schedule K-1', '2026-08-18', 'in_review', 's9', 1],
  ['d10', 'TX-94821', 'c1', '1099-NEC', 'Form 1099-NEC', '2026-09-02', 'action_needed', 's1', 1],
  ['d11', 'TX-94821', 'c1', '1099-INT', '1099-INT', '2026-09-02', 'accepted', 's1', 1],
  ['d12', 'TX-94821', 'c1', '1098-T', '1098-T', '2026-09-02', 'accepted', 's1', 1],
];

const EXTRA_TYPES = ['W-2', '1099-NEC', '1099-INT', '1098-T', '1040', 'Schedule C', 'W-2', '1099', 'Schedule E', 'K-1'];
const EXTRA_STATUSES = ['accepted', 'filed', 'verified', 'accepted', 'filed', 'verified', 'filed', 'accepted', 'verified', 'in_review'];
const TIMES = ['9:15 AM', '10:40 AM', '11:05 AM', '1:00 PM', '2:30 PM', '3:45 PM', '4:20 PM'];

const docTitle = (type) => (/^(\d|W-)/.test(type) ? `Form ${type}` : type);

const shiftDate = (iso, days) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const INITIAL_DOCUMENTS = [
  ...DOC_SEED.map(([id, submissionId, clientId, type, title, date, status, assigneeId, pages]) => ({
    id, submissionId, clientId, type, title: title || docTitle(type), date, time: '1:00 PM', status, assigneeId, pages,
  })),
  ...Array.from({ length: 35 }, (_, i) => {
    const type = EXTRA_TYPES[i % EXTRA_TYPES.length];
    return {
      id: `d${13 + i}`,
      submissionId: `TX-${94840 + i}`,
      clientId: INITIAL_CLIENTS[1 + (i % 15)].id,
      type,
      title: docTitle(type),
      date: shiftDate('2026-08-19', Math.floor((i * 22) / 35)),
      time: TIMES[i % TIMES.length],
      status: EXTRA_STATUSES[i % EXTRA_STATUSES.length],
      assigneeId: STAFF[(i + 1) % STAFF.length].id,
      pages: 1,
    };
  }),
];

// Thumbnails in the client detail list, with the crops used in the design.
const DOC_THUMBS = {
  'W-2': { src: `${A}/doc-thumb-w2.png`, style: { height: '124.02%', left: '-12.5%', top: '-10.45%', width: '125%' } },
  '1099-NEC': { src: `${A}/doc-thumb-1099-nec.png`, style: { height: '120%', left: '-10.47%', top: '-8.75%', width: '120.94%' } },
  '1099-INT': { src: `${A}/doc-thumb-1099-int.png`, style: { height: '122.5%', left: '-11.73%', top: '-10%', width: '123.46%' } },
  '1098-T': { src: `${A}/doc-thumb-1098-t.png`, style: { height: '121.27%', left: '-11.11%', top: '-7.69%', width: '122.22%' } },
};

export const thumbFor = (type) => DOC_THUMBS[type] || DOC_THUMBS['W-2'];

// Placeholder page image for the document viewer until real uploads are served.
export const DOCUMENT_PAGE_IMAGE = `${A}/w2-document.png`;

// OCR output placeholder; the backend will return these groups per document.
const W2_FIELDS = [
  {
    group: 'Income',
    fields: [
      ['wages', 'Wages (Box 1)', '64,500.00', true],
      ['federal_withheld', 'Federal Withheld (Box 2)', '7,820.00', true],
      ['ss_wages', 'SS Wages (Box 3)', '64,500.00', false],
      ['ss_tax', 'SS Tax (Box 4)', '3,999.00', false],
    ],
  },
  {
    group: 'Employer',
    fields: [
      ['employer_name', 'Employer Name (Box c)', 'Acme Tech Corp', false],
      ['employer_ein', 'Employer EIN (Box b)', '95-1234567', false],
    ],
  },
  {
    group: 'State',
    fields: [
      ['state', 'State (Box 15)', 'CA', true],
      ['state_wages', 'State Wages (Box 16)', '64,500.00', true],
      ['state_tax', 'State Tax (Box 17)', '2,180.00', true],
    ],
  },
  {
    group: 'Local',
    fields: [
      ['local_wages', 'Local Wages (Box 18)', '64,500.00', true],
      ['locality', 'Locality Name (Box 20)', 'Los Angeles', true],
    ],
  },
];

const GENERIC_FIELDS = [
  {
    group: 'Payer',
    fields: [
      ['payer_name', 'Payer Name', 'Acme Tech Corp', false],
      ['payer_tin', 'Payer TIN', '95-1234567', false],
    ],
  },
  {
    group: 'Amounts',
    fields: [
      ['amount_1', 'Box 1 Amount', '12,400.00', false],
      ['federal_withheld', 'Federal Withheld (Box 4)', '0.00', false],
    ],
  },
  {
    group: 'Recipient',
    fields: [
      ['recipient_tin', 'Recipient TIN', '***-**-3371', false],
      ['state', 'State', 'CA', false],
    ],
  },
];

export const extractedFieldsFor = (doc) =>
  (doc.type.startsWith('W-') ? W2_FIELDS : GENERIC_FIELDS).map(({ group, fields }) => ({
    group,
    fields: fields.map(([key, label, value, confirmed]) => ({ key, label, value, confirmed })),
  }));

// Activity log seed (Node 87:3111). New entries are prepended at runtime.
export const INITIAL_ACTIVITY = [
  ['verified', 'David K.', 'Verified OCR fields of', 'Alex Morgan (TX-94821)', '10m ago'],
  ['status', 'Jessica R.', 'Updated status to Accepted for', 'Samuel Lee (FL-11223)', '25m ago'],
  ['message', 'Michael B.', 'Sent message to', 'Emily Johnson (CA-67890)', '20m ago'],
  ['reupload', 'Robert J.', 'Requested re-upload from', 'Elena Rostova (TX-88314) — W-2 image blurry', '30m ago'],
  ['filed', 'David K.', 'Filed return for', 'Alex Morgan (TX-94821)', '10m ago'],
  ['login', 'Sarah L.', 'Logged in to', 'Staff Portal', '15m ago'],
  ['verified', 'Emily J.', 'Completed review of', 'Ryan Smith (NY-12345)', '5m ago'],
  ['verified', 'Daniel T.', 'Commented on document from', 'Sophia Patel (IL-54321)', '12m ago'],
  ['message', 'Ava C.', 'Approved request for', 'Liam Brown (WA-67891)', '22m ago'],
  ['reupload', 'Joshua P.', 'Initiated contact with', 'Mia Williams (TX-24680)', '18m ago'],
  ['filed', 'Olivia H.', 'Updated profile for', 'Noah Davis (NV-13579)', '8m ago'],
  ['login', 'Sophia G.', 'Shared feedback on', 'Isabella Chen (CA-24680)', '17m ago'],
  ['verified', 'James A.', 'Requested additional info from', 'Ethan Martinez (FL-78901)', '14m ago'],
  ['message', 'Charlotte D.', 'send message to', 'Aiden Thompson (IL-32109)', '9m ago'],
].map(([kind, actor, action, target, time], i) => ({ id: `a${i + 1}`, kind, actor, action, target, time }));

export const ACTIVITY_STYLES = {
  verified: { label: 'Reviews', bg: 'bg-[#e5f7dc]', icon: `${A}/activity-check.svg` },
  status: { label: 'Status updates', bg: 'bg-[#e5f7dc]', icon: `${A}/activity-check.svg` },
  message: { label: 'Messages', bg: 'bg-[#fffae5]', icon: `${A}/activity-paper-plane.svg` },
  reupload: { label: 'Re-upload requests', bg: 'bg-[#ffecec]', icon: `${A}/activity-arrow-ccw.svg` },
  filed: { label: 'Filings & records', bg: 'bg-[#eee5ff]', icon: `${A}/activity-files.svg` },
  login: { label: 'Sign-ins', bg: 'bg-[#f4e3e8]', icon: `${A}/activity-sign-in.svg` },
};

// Campaigns (Node 87:3625). Campaign links are served from CAMPAIGN_HOST.
export const CAMPAIGN_HOST = 'taxmax.app/s/';

export const INITIAL_CAMPAIGNS = [
  ['cp1', 'Fall Seminar 2026', 'fall26', 340, 29, '2026-08-12', '2026-10-31'],
  ['cp2', 'Community workshop', 'fall32', 1230, 323, '2026-08-19', '2026-11-15'],
  ['cp3', 'General Intake', 'fall31', 23, 1, '2026-08-14', '2026-12-31'],
  ['cp4', 'Referal program', 'fall30', 983, 450, '2026-08-16', '2027-04-15'],
  ['cp5', 'Repeat customer programme', 'fall28', 2434, 1231, '2026-08-13', '2027-04-15'],
].map(([id, title, slug, scans, conversions, createdAt, expiresAt]) => ({ id, title, slug, scans, conversions, createdAt, expiresAt }));

export const campaignUrl = (slug) => `https://${CAMPAIGN_HOST}${slug}`;

export async function copyCampaignLink(slug) {
  try {
    await navigator.clipboard.writeText(campaignUrl(slug));
    return true;
  } catch {
    return false;
  }
}

export const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24) || 'campaign';

export const randomSlug = (base) => `${slugify(base).slice(0, 18)}-${Math.random().toString(36).slice(2, 6)}`;

// Referral tracking (Node 87:3718)
export const REFERRAL_STATS = { total: 95, converted: 47, rate: '58.4%', rewards: '$2,341' };

export const INITIAL_REFERRALS = [
  ['r1', 'c5', 'Alex Morgan', 'Personal Link', '2026-08-12', 'in_review'],
  ['r2', 'c6', 'Alex Morgan', 'QR Code (Seminar)', '2026-08-19', 'action_needed'],
  ['r3', 'c7', 'David Lee', 'Personal Link', '2026-08-14', 'verified'],
  ['r4', 'c8', 'Elena Ross', 'Personal Link', '2026-08-16', 'in_review'],
  ['r5', 'c1', 'Elena Ross', 'Personal Link', '2026-08-13', 'in_review'],
].map(([id, clientId, referredBy, source, date, status]) => ({ id, clientId, referredBy, source, date, status }));

// Settings (Nodes 87:3224 staff, 87:3464 notifications, 87:3362 security, 87:1880 add staff)
export const STAFF_PERMISSIONS = [
  { id: 'review', label: 'Document Reviewing' },
  { id: 'prepare', label: 'Tax Preparing' },
  { id: 'message', label: 'Message Clients' },
  { id: 'growth', label: 'Growth Tools' },
];

export const STAFF_ROLES = ['Admin', 'Staff'];

export const INITIAL_STAFF_ACCOUNTS = [
  { id: 's1', name: 'JJ Thompson', photo: `${A}/assignee-jj.png`, email: 'jjthompson@gmail.com', role: 'Admin', createdAt: '2026-08-12', access: ['review', 'prepare', 'message', 'growth'] },
  { id: 's6', name: 'Jake Morris', email: 'jake@gmail.com', role: 'Staff', createdAt: '2026-08-19', access: ['review', 'message'] },
  { id: 's8', name: 'Ben Harper', email: 'benh@gmail.com', role: 'Staff', createdAt: '2026-08-14', access: ['review', 'prepare'] },
  { id: 's9', name: 'Amy Cruz', email: 'amy.cruz@yahoo.com', role: 'Admin', createdAt: '2026-08-13', access: ['review', 'prepare', 'message', 'growth'] },
];

export const NOTIFICATION_PREFS = [
  { id: 'new_submission', label: 'New Submission Received', description: 'Get notified when a client uploads new documents', enabled: true },
  { id: 'reupload', label: 'Re-Upload Completed', description: 'Notify when a client re-uploads a requested document', enabled: false },
  { id: 'client_message', label: 'New Client Message', description: 'Receive alerts for incoming chat messages', enabled: true },
  { id: 'irs_acceptance', label: 'IRS Acceptance Notification', description: 'Alert when IRS accepts a filed return', enabled: true },
  { id: 'daily_summary', label: 'Daily Summary Email', description: 'Receive a daily digest of activity at 8:00 AM', enabled: false },
];

export const SESSION_TIMEOUTS = ['15 minutes', '30 minutes', '1 hour', '4 hours'];
export const PASSWORD_POLICIES = ['Standard (8+ chars)', 'Strong (12+ chars, mixed case)', 'Strict (16+ chars, symbols)'];

export const DEFAULT_SECURITY = { twoFactor: true, sessionTimeout: '30 minutes', passwordPolicy: 'Strong (12+ chars, mixed case)', ipAllowlist: true };

export const VOLUME_RANGES = {
  'Last 7 days': { values: [34, 15, 24, 27, null, null, null], todayIndex: 3, total: 89 },
  'Previous 7 days': { values: [22, 30, 18, 26, 31, 12, 8], todayIndex: -1, total: 147 },
};

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const QUICK_REPLIES = [
  { label: 'Return filed', text: 'Good news! Your return has been filed with the IRS. We will let you know as soon as it is accepted.' },
  { label: 'Request re-upload', text: 'Could you please re-upload your document? The image we received is unclear.' },
];

const thread = (clientId, lines) =>
  lines.map(([from, text, time, receipt], i) => ({ id: `${clientId}-m${i}`, from, text, time, receipt }));

export const INITIAL_CONVERSATIONS = [
  {
    clientId: 'c1',
    submissionId: 'TX-94821',
    updatedAt: 'Today, 10:30 AM',
    unread: false,
    messages: thread('c1', [
      ['client', "Hi David! I've uploaded my W-2 and 1099-NEC. Let me know if you need anything else.", '9:30 AM'],
      ['staff', "Great, thank you! I'll begin preparing your return today.", '9:30 AM', 'Read'],
      ['client', 'Thanks David, do you know how i can apply for an extension next year? And when can I expect the refund?', '9:30 AM'],
      ['staff', 'Your estimated refund of $2,840 should arrive within 3-5 business days after filing.', '10:30 AM', 'Delivered'],
    ]),
  },
  {
    clientId: 'c9',
    submissionId: 'TX-94845',
    updatedAt: 'Today, 11:45 AM',
    unread: false,
    messages: thread('c9', [
      ['client', 'Can you help me understand my estimated payments?', '11:30 AM'],
      ['staff', 'I can help you with that! Let’s discuss it later.', '11:45 AM', 'Read'],
    ]),
  },
  {
    clientId: 'c8',
    submissionId: 'TX-94822',
    updatedAt: 'Today, 11:15 AM',
    unread: true,
    messages: thread('c8', [
      ['staff', 'You can update your mailing address with us at any time.', '11:00 AM', 'Read'],
      ['client', 'I believe there’s a form on the website that you can fill out, right?', '11:15 AM'],
    ]),
  },
  {
    clientId: 'c10',
    submissionId: 'TX-94849',
    updatedAt: 'Today, 12:00 PM',
    unread: false,
    messages: thread('c10', [
      ['client', 'Is there an application for the first-time homebuyer credit?', '11:50 AM'],
      ['staff', 'Sure! I can send you the link to the application.', '12:00 PM', 'Read'],
    ]),
  },
  {
    clientId: 'c3',
    submissionId: 'TX-94831',
    updatedAt: 'Today, 10:30 AM',
    unread: false,
    messages: thread('c3', [
      ['client', 'Thanks David, do you know how i can apply for an amended return?', '10:30 AM'],
    ]),
  },
  {
    clientId: 'c11',
    submissionId: 'TX-94850',
    updatedAt: 'Today, 12:30 PM',
    unread: true,
    messages: thread('c11', [
      ['staff', 'Reach out, and I’ll guide you through the process.', '12:20 PM', 'Read'],
      ['client', 'Thanks! I need help claiming my education credits.', '12:30 PM'],
    ]),
  },
];

export const toCsv = (rows) =>
  rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

export const downloadFile = (filename, content, type = 'text/csv') => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

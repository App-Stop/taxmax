// Admin portal constants and helpers, plus dummy data for the screens with no API yet
// (campaigns, referrals, security settings).

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

export const STATUSES = [
  { id: 'in_review', label: 'In review', bg: 'bg-[#fff1e6]', text: 'text-[#e86907]' },
  { id: 'action_needed', label: 'Action needed', bg: 'bg-[#ffecec]', text: 'text-[#ea0101]' },
  { id: 'accepted', label: 'Accepted', bg: 'bg-[#e5f7dc]', text: 'text-[#39ab00]' },
  { id: 'verified', label: 'Verified', bg: 'bg-[rgba(0,148,197,0.1)]', text: 'text-[#0094c5]' },
  { id: 'filed', label: 'Filed', bg: 'bg-[#ffeefa]', text: 'text-[#ff1fad]' },
];

// Document statuses as the API names them (GET /documents). The queue filters by these.
export const DOCUMENT_STATUSES = [
  { id: 'uploaded', label: 'Uploaded', bg: 'bg-[rgba(0,148,197,0.1)]', text: 'text-[#0094c5]' },
  { id: 'in-review', label: 'In review', bg: 'bg-[#fff1e6]', text: 'text-[#e86907]' },
  { id: 're-upload', label: 'Re-upload', bg: 'bg-[#ffecec]', text: 'text-[#ea0101]' },
  { id: 'action-needed', label: 'Action needed', bg: 'bg-[#ffecec]', text: 'text-[#ea0101]' },
  { id: 'accepted', label: 'Accepted', bg: 'bg-[#e5f7dc]', text: 'text-[#39ab00]' },
  { id: 'submitted', label: 'Submitted', bg: 'bg-[#eee5ff]', text: 'text-[#7a3cf5]' },
  { id: 'completed', label: 'Completed', bg: 'bg-[#ffeefa]', text: 'text-[#ff1fad]' },
  { id: 'filed', label: 'Filed', bg: 'bg-[#ffeefa]', text: 'text-[#ff1fad]' },
];

// Client account statuses as the API names them (GET /dashboard/team/client-directory).
export const CLIENT_STATUSES = [
  { id: 'active', label: 'Active', bg: 'bg-[#e5f7dc]', text: 'text-[#39ab00]' },
  { id: 'non-active', label: 'Non-active', bg: 'bg-[#f5f5f5]', text: 'text-[#6a6a6a]' },
];

export const findStatus = (id) =>
  DOCUMENT_STATUSES.find((s) => s.id === id) || CLIENT_STATUSES.find((s) => s.id === id) || STATUSES.find((s) => s.id === id) || null;

export const statusById = (id) => findStatus(id) || STATUSES[0];

// The dataset's "today"; date-range filters are measured from here.
export const REFERENCE_DATE = '2026-09-10';

export const initialsOf = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const formatDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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

// Thumbnails in the client detail list, with the crops used in the design.
const DOC_THUMBS = {
  'W-2': { src: `${A}/doc-thumb-w2.png`, style: { height: '124.02%', left: '-12.5%', top: '-10.45%', width: '125%' } },
  '1099-NEC': { src: `${A}/doc-thumb-1099-nec.png`, style: { height: '120%', left: '-10.47%', top: '-8.75%', width: '120.94%' } },
  '1099-INT': { src: `${A}/doc-thumb-1099-int.png`, style: { height: '122.5%', left: '-11.73%', top: '-10%', width: '123.46%' } },
  '1098-T': { src: `${A}/doc-thumb-1098-t.png`, style: { height: '121.27%', left: '-11.11%', top: '-7.69%', width: '122.22%' } },
};

export const thumbFor = (type) => DOC_THUMBS[type] || DOC_THUMBS['W-2'];

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

export const SESSION_TIMEOUTS = ['15 minutes', '30 minutes', '1 hour', '4 hours'];
export const PASSWORD_POLICIES = ['Standard (8+ chars)', 'Strong (12+ chars, mixed case)', 'Strict (16+ chars, symbols)'];

export const DEFAULT_SECURITY = { twoFactor: true, sessionTimeout: '30 minutes', passwordPolicy: 'Strong (12+ chars, mixed case)', ipAllowlist: true };

export const QUICK_REPLIES = [
  { label: 'Return filed', text: 'Good news! Your return has been filed with the IRS. We will let you know as soon as it is accepted.' },
  { label: 'Request re-upload', text: 'Could you please re-upload your document? The image we received is unclear.' },
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

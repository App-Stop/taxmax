// Dashboard endpoints (/dashboard). The team ones need a team session; /dashboard/customer
// needs the customer session. Lists here page with an opaque cursor, not page numbers.

import { apiRequest } from './api';
import { getStoredToken } from './auth';

const query = (params) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const text = search.toString();
  return text ? `?${text}` : '';
};

const get = (path) => apiRequest(path, { token: getStoredToken() });

// The API rejects searches shorter than 2 characters; shorter ones are left out.
const searchParam = (search) => (search && search.trim().length >= 2 ? search.trim() : undefined);

// { documents, assignedPreparers: [{ _id, fullName, roleName }], newMessageCount, recentUpdates: Activity[] }
export const getCustomerDashboard = async () => (await get('/dashboard/customer')).data;

// days: 7 | 14 | 21 (submission volume window). With `search`, `searchResults` lists matching clients.
// { totalSubmissions, totalUploaded, totalFiledAndAccepted, totalActionNeeded,
//   submissionVolume: { days, data: [{ date, count }] }, totalDocumentsVolume, recentActivity, searchResults }
export const getTeamDashboard = async ({ days, search }) =>
  (await get(`/dashboard/team${query({ days, search: searchParam(search) })}`)).data;

// 10 rows a page. { data: Activity[], pagination: { limit, hasMore, nextCursor } }
export const listTeamRecentActivity = ({ cursor }) => get(`/dashboard/team/recent-activity${query({ cursor })}`);

// status: 'all' | 'in-review' | 'action-needed' | 'accepted' | 'submitted' | 'filed'
// days: 1 (yesterday) | 7 | 14 | 21 | 30 | 60, by submission date. 20 rows a page.
// { data: QueueRow[], pagination: { limit, hasMore, nextCursor } }
export const listSubmissionQueue = ({ status, days, search, cursor }) =>
  get(`/dashboard/team/submission-queue${query({ status, days, search: searchParam(search), cursor })}`);

// status: 'all' | 'active' | 'non-active'. 10 rows a page.
// { data: DirectoryClient[], pagination: { limit, hasMore, nextCursor } }
export const listClientDirectory = ({ status, search, cursor }) =>
  get(`/dashboard/team/client-directory${query({ status, search: searchParam(search), cursor })}`);

// { clientName, email, details, totalSubmissionCount, submissions, recentActivity }
export const getClientDirectoryEntry = async (id) =>
  (await get(`/dashboard/team/client-directory/${encodeURIComponent(id)}`)).data;

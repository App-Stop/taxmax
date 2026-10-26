// Team (admin + staff) endpoints used by the admin portal. All need a team session token.
// The dashboard lists (queue, client directory, client detail) are in dashboard.js.

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
const post = (path, body) => apiRequest(path, { method: 'POST', body, token: getStoredToken() });
const patch = (path, body) => apiRequest(path, { method: 'PATCH', body, token: getStoredToken() });
const del = (path) => apiRequest(path, { method: 'DELETE', token: getStoredToken() });

// Document detail and review endpoints (team / staff)
export const getDocument = async (id) => (await get(`/documents/${encodeURIComponent(id)}`)).data;

// Atomic review pass: confirm/flag fields and/or move document status
export const reviewDocument = async (id, payload) =>
  (await post(`/documents/${encodeURIComponent(id)}/review`, payload)).data;

// Status transition without field changes
export const updateDocumentStatus = async (id, payload) =>
  (await patch(`/documents/${encodeURIComponent(id)}/status`, payload)).data;

// Field manipulation during review
export const addDocumentField = async (id, field) =>
  (await post(`/documents/${encodeURIComponent(id)}/fields`, field)).data;

export const updateDocumentField = async (id, fieldId, changes) =>
  (await patch(`/documents/${encodeURIComponent(id)}/fields/${encodeURIComponent(fieldId)}`, changes)).data;

export const deleteDocumentField = async (id, fieldId) =>
  (await del(`/documents/${encodeURIComponent(id)}/fields/${encodeURIComponent(fieldId)}`)).data;

export const retryDocumentOcr = async (id) =>
  (await post(`/documents/${encodeURIComponent(id)}/ocr/retry`)).data;

// { data: Activity[], pagination: { page, limit, hasMore } }
// `target`: a team member id (their actions only). `action: 'document'`: document status changes by the team.
export const listActivity = ({ page, limit, includeInternal, target, action, search }) =>
  get(`/activity${query({ page, limit, includeInternal, target, action, search })}`);

// Admin only. { data: TeamMember[], pagination }. `search` matches name or email.
export const listTeam = ({ search, isActive, page, limit }) => get(`/team${query({ search, isActive, page, limit })}`);


// Admin only. Replaces the customer's assignees ([] removes everyone); their documents follow.
export const setCustomerAssignees = (id, teamMemberIds) =>
  apiRequest(`/users/${encodeURIComponent(id)}/assignees`, {
    method: 'PUT',
    body: { teamMemberIds },
    token: getStoredToken(),
  });

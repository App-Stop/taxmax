// Global team search (GET /search). Needs a team session.

import { apiRequest } from './api';
import { getStoredToken } from './auth';

// The API rejects searches shorter than this.
export const MIN_SEARCH_LENGTH = 2;

// Clients match by name; documents by submission ID or form type (e.g. "w2", "1099").
// { clients: [{ _id, fullName, email, phoneNumber, isActive }],
//   documents: [{ _id, submissionId, documentType, documentTypeLabel, status, submittedAt, client }] }
export const searchAll = async (search) =>
  (await apiRequest(`/search?search=${encodeURIComponent(search.trim())}`, { token: getStoredToken() })).data;

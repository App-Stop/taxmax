// Chat (/chat). One thread per customer, shared by the customer, their assignees and every
// admin. Customers address their own thread as "me"; the team uses the customer's id.
// New messages, edits, deletions, read receipts and typing arrive live (services/chatSocket.js).

import { apiRequest, ApiError } from './api';
import { getStoredToken } from './auth';

// Limits enforced by the server.
export const ATTACHMENT_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'];
export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
export const MAX_MESSAGE_LENGTH = 4000;
export const EDIT_WINDOW_MS = 15 * 60 * 1000;

const UPLOAD_FAILED = 'An attachment could not be uploaded. Please try again.';

const query = (params) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const text = search.toString();
  return text ? `?${text}` : '';
};

const call = (path, { method, body } = {}) => apiRequest(path, { method, body, token: getStoredToken() });
const thread = (customerId) => `/chat/conversations/${encodeURIComponent(customerId)}`;

// Why a picked file can't be attached, or null when it can.
export function attachmentProblem(file) {
  if (!ATTACHMENT_TYPES.includes(file.type)) return `${file.name} isn't a JPG, PNG, WebP, HEIC or PDF file.`;
  if (file.size > MAX_ATTACHMENT_SIZE) return `${file.name} is larger than 10 MB.`;
  if (file.size === 0) return `${file.name} is empty.`;
  return null;
}

// Team inbox, newest first. { data: Summary[], pagination: { page, limit, hasMore } }
// Summary: { customer: { _id, fullName }, lastMessage, lastMessageAt, unreadCount }
export const listConversations = ({ page, limit, unread }) =>
  call(`/chat/conversations${query({ page, limit, unread: unread ? 'true' : undefined })}`);

// { unreadMessages, unreadConversations }
export const getUnreadCount = async () => (await call('/chat/unread-count')).data;

// The whole chat screen: { customer, participants, customerReadAt, teamReadAt, messages, hasMore }.
// Opening a thread marks it read.
export const openConversation = async (customerId, { limit } = {}) => (await call(`${thread(customerId)}${query({ limit })}`)).data;

// `before`: older history. `after`: catch-up after a reconnect. { data: Message[], pagination: { hasMore } }
export const listMessages = (customerId, { before, after, limit }) =>
  call(`${thread(customerId)}/messages${query({ before, after, limit })}`);

export const markConversationRead = (customerId) => call(`${thread(customerId)}/read`, { method: 'POST' });

// Uploads files straight to storage and returns [{ key, fileName }] for sendMessage.
export async function uploadAttachments(customerId, files) {
  const { data } = await call(`${thread(customerId)}/attachments/upload-urls`, {
    method: 'POST',
    body: { files: files.map((file) => ({ contentType: file.type, size: file.size, fileName: file.name })) },
  });
  await Promise.all(
    data.files.map(async (target, i) => {
      const form = new FormData();
      Object.entries(target.fields).forEach(([name, value]) => form.append(name, value));
      form.append('file', files[i]); // must be the last part
      let response;
      try {
        response = await fetch(target.url, { method: 'POST', body: form });
      } catch {
        throw new ApiError(UPLOAD_FAILED);
      }
      if (!response.ok) throw new ApiError(UPLOAD_FAILED, { status: response.status });
    }),
  );
  return data.files.map((target) => ({ key: target.key, fileName: target.fileName }));
}

// `clientMessageId` makes retries safe: sending the same id twice stores the message once.
export const sendMessage = async (customerId, { clientMessageId, body, attachments }) =>
  (await call(`${thread(customerId)}/messages`, { method: 'POST', body: { clientMessageId, body: body || undefined, attachments } })).data;

// Own messages only, within 15 minutes of sending.
export const editMessage = async (customerId, messageId, body) =>
  (await call(`${thread(customerId)}/messages/${encodeURIComponent(messageId)}`, { method: 'PATCH', body: { body } })).data;

export const deleteMessage = async (customerId, messageId) =>
  (await call(`${thread(customerId)}/messages/${encodeURIComponent(messageId)}`, { method: 'DELETE' })).data;

export const newClientMessageId = () =>
  (crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`).replace(/[^A-Za-z0-9_-]/g, '');

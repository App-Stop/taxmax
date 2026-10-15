// Thin fetch wrapper for the TaxMax API. Every success body is
// { success, message, data?, pagination? }; failures are thrown as ApiError.

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002').replace(/\/+$/, '');
const TIMEOUT_MS = 15000;

const NETWORK_MESSAGE = 'We couldn’t reach the server. Check your connection and try again.';
const TIMEOUT_MESSAGE = 'The server took too long to respond. Please try again.';
const SERVER_MESSAGE = 'Something went wrong on our side. Please try again in a moment.';

export class ApiError extends Error {
  constructor(message, { status = 0, fieldErrors = [] } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    // 422 only: [{ path: 'body.identifier', message }]
    this.fieldErrors = fieldErrors;
  }
}

const messageFor = (status, body) => {
  if (status >= 500) return SERVER_MESSAGE;
  // Validation: the first field message is written for end users; the top-level one is not.
  if (status === 422 && body?.error?.length) return body.error[0].message;
  return body?.message || SERVER_MESSAGE;
};

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    throw new ApiError(err.name === 'AbortError' ? TIMEOUT_MESSAGE : NETWORK_MESSAGE);
  } finally {
    clearTimeout(timer);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // Non-JSON body (proxy error page, empty response); handled below.
  }

  if (!response.ok || payload?.success === false) {
    throw new ApiError(messageFor(response.status, payload), {
      status: response.status,
      fieldErrors: payload?.error || [],
    });
  }

  return payload ?? {};
}

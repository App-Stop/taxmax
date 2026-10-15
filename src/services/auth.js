// Email + OTP auth against the TaxMax API (POST /auth/otp/request, /auth/otp/verify, /auth/logout).
// Customers and team members (admin / staff) share the flow; `accountType` picks which accounts are searched.

import { apiRequest, ApiError } from './api';

const TOKEN_KEY = 'taxmax_token';
const USER_KEY = 'taxmax_user';
const AUTH_KEY = 'taxmax_is_authenticated';

export const ACCOUNT_TYPES = [
  { id: 'customer', label: 'Customer' },
  { id: 'team', label: 'Team' },
];

// Production sends 6 digits; the dev/staging containers use a 4-digit static code.
export const OTP_LENGTH = Number(import.meta.env.VITE_OTP_LENGTH) || 6;

// Matches the server's resend cooldown.
export const RESEND_SECONDS = 30;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email) => EMAIL_PATTERN.test(email.trim());

const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

// 'team' | 'customer' | null, from the token's `type` claim. Expired tokens count as no session.
export function getAccountType(token) {
  const claims = token && decodeToken(token);
  if (!claims || (claims.exp && claims.exp * 1000 <= Date.now())) return null;
  if (claims.type === 'team') return 'team';
  if (claims.type === 'customer') return 'customer';
  return null;
}

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export async function sendCode(email, accountType) {
  await apiRequest('/auth/otp/request', {
    method: 'POST',
    body: { identifier: email.trim(), accountType },
  });
}

export async function verifyCode(email, code, accountType) {
  let data;
  try {
    ({ data } = await apiRequest('/auth/otp/verify', {
      method: 'POST',
      body: { identifier: email.trim(), accountType, code },
    }));
  } catch (err) {
    // 401 covers a wrong, expired or used code (and unknown accounts, deliberately).
    if (err instanceof ApiError && err.status === 401) {
      throw new ApiError('That code is invalid or has expired. Try again, or resend a new code.', { status: 401 });
    }
    throw err;
  }

  const user = accountType === 'team' ? toTeamUser(data.member) : toCustomerUser(data.user, data.documents);

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_KEY, 'true');

  return { token: data.token, user, accountType };
}

// Revokes the session on every device. The local session is cleared whatever the server says.
export async function logout() {
  const token = getStoredToken();
  clearSession();
  if (!token) return;
  try {
    await apiRequest('/auth/logout', { method: 'POST', token });
  } catch {
    // Already signed out locally; an expired or revoked token is fine here.
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(AUTH_KEY);
}

function toTeamUser(member) {
  return {
    id: member._id,
    fullName: member.fullName,
    email: member.email,
    role: member.role, // 'admin' | 'staff': the only thing that grants permissions
    roleName: member.roleName, // display label
    accountType: 'team',
  };
}

// Server document statuses -> the customer dashboard's three states.
const CUSTOMER_DOC_STATUS = {
  uploaded: 'submitted',
  'in-review': 'reviewing',
  're-upload': 'reviewing',
  'action-needed': 'reviewing',
  accepted: 'filed',
  completed: 'filed',
};

const CUSTOMER_DOC_TYPE = { w2: 'w2', '1099_int': '1099-int', '1099_nec': '1099-nec' };

const capitalize = (value) => (value ? value[0].toUpperCase() + value.slice(1) : value);

// Maps the API profile onto the shape the customer dashboard reads.
function toCustomerUser(user, documents = []) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phoneNumber,
    address: user.address,
    ssn: user.ssnLast4 ? `***-**-${user.ssnLast4}` : null,
    status: capitalize(user.maritalStatus),
    dependents: user.hasDependents == null ? null : user.hasDependents ? 'Yes' : 'No',
    accountCreatedDate: user.createdAt,
    assignedTo: user.assignedTo,
    accountType: 'customer',
    documents: documents.map((doc) => ({
      id: doc._id,
      type: CUSTOMER_DOC_TYPE[doc.formType] || 'other',
      name: doc.formLabel,
      pageCount: doc.pageCount,
      thumb: doc.thumbnailUrl,
      status: CUSTOMER_DOC_STATUS[doc.status] || 'submitted',
      submittedAt: doc.submittedAt,
    })),
  };
}

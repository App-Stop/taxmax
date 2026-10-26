// Email + OTP auth against the TaxMax API (POST /auth/otp/request, /auth/otp/verify, /auth/logout),
// plus the customer profile refresh (GET /users/me).
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

// The token's `type` claim ('team' | 'customer' | 'onboarding'), or null when it is unreadable or expired.
export function getTokenType(token) {
  const claims = token && decodeToken(token);
  if (!claims || (claims.exp && claims.exp * 1000 <= Date.now())) return null;
  return claims.type || null;
}

// 'team' | 'customer' | null: the kind of signed-in session the token opens.
export function getAccountType(token) {
  const type = getTokenType(token);
  return type === 'team' || type === 'customer' ? type : null;
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

  const user = accountType === 'team' ? toTeamUser(data.member) : toCustomerProfile(data.user);
  saveSession(data.token, user);
  return { token: data.token, user, accountType };
}

// Signs the customer in with the session that finishing sign-up returns ({ token, user }).
// The previous session (if any) is replaced.
export function startCustomerSession(data) {
  const user = toCustomerProfile(data.user);
  saveSession(data.token, user);
  return { token: data.token, user, accountType: 'customer' };
}

// Re-reads the signed-in customer's profile (GET /users/me) so a restored session
// shows current details.
export async function refreshCustomerProfile() {
  const { data } = await apiRequest('/users/me', { token: getStoredToken() });
  const user = toCustomerProfile(data);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

// Only the profile is stored; documents carry expiring image links and are always fetched.
function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_KEY, 'true');
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

const capitalize = (value) => (value ? value[0].toUpperCase() + value.slice(1) : value);

// The first assignee is the customer's preparer; the API sends name and role label only.
const preparerOf = (assignedTo = []) => {
  const member = assignedTo.find((m) => m?.fullName);
  return member ? { name: member.fullName, role: member.roleName } : null;
};

// Maps the API profile onto the shape the customer dashboard reads.
function toCustomerProfile(user) {
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
    preparer: preparerOf(user.assignedTo),
    accountType: 'customer',
  };
}

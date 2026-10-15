// Email + OTP auth. There is no backend yet, so sendCode / verifyCode are mocked;
// swap their bodies for real API calls and keep the return shapes.

const TOKEN_KEY = 'taxmax_token';
const USER_KEY = 'taxmax_user';
const AUTH_KEY = 'taxmax_is_authenticated';

export const OTP_LENGTH = 4;

const MOCK_CODE = '1234';
const MOCK_ADMIN_PREFIX = 'admin'; // emails starting with "admin" sign in as admin staff
const EMAIL_PATTERN = /^[^s@]+@[^s@]+.[^s@]+$/;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const encodeMockToken = (payload) => `mock.${btoa(JSON.stringify(payload))}.unsigned`;

// Reads the role claim from the JWT payload. Returns 'admin' | 'customer' | null.
export function getRoleFromToken(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { role } = JSON.parse(atob(payload));
    return role === 'admin' ? 'admin' : 'customer';
  } catch {
    return null;
  }
}

export const isValidEmail = (email) => EMAIL_PATTERN.test(email.trim());

export async function sendCode(email) {
  await wait(500);
  if (!isValidEmail(email)) {
    throw new Error('Enter a valid email address.');
  }
}

export async function verifyCode(email, code) {
  await wait(600);
  if (code !== MOCK_CODE) {
    throw new Error('That code is incorrect. Please try again.');
  }

  const role = email.toLowerCase().startsWith(MOCK_ADMIN_PREFIX) ? 'admin' : 'customer';
  const token = encodeMockToken({ sub: email, role });
  const user = role === 'admin' ? buildAdminUser(email) : loadCustomerUser(email);

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_KEY, 'true');

  return { token, user };
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(AUTH_KEY);
}

function buildAdminUser(email) {
  return { fullName: 'Admin Staff', email, role: 'admin' };
}

function loadCustomerUser(email) {
  try {
    const saved = JSON.parse(localStorage.getItem(USER_KEY));
    if (saved && saved.role !== 'admin') return { ...saved, role: 'customer' };
  } catch (e) {
    console.error(e);
  }
  return {
    fullName: 'Alex Morgan',
    email,
    phone: '+1 (555) 392-8190',
    address: 'Park Avenue, 234, Str, Texas, US',
    status: 'Single',
    dependents: 'No',
    filingId: 'TM-9284-A',
    ssn: '***-**-8492',
    role: 'customer',
    estimatedRefund: {
      total: '$5,213.23',
      federal: '$2,340',
      state: '$2,726',
    },
    documents: [
      { id: 'doc-1', type: '1099-int', name: '1099-INT', pageCount: 1, thumb: '/figma/upload/1099-int-thumbnail.png', status: 'filed' },
      { id: 'doc-2', type: '1099-nec', name: '1099-NEC', pageCount: 1, thumb: '/figma/upload/1099-nec-thumbnail.png', status: 'reviewing' },
      { id: 'doc-3', type: 'w2', name: 'W-2 Form', pageCount: 3, thumb: '/figma/upload/w2-thumbnail.png', status: 'submitted' },
    ],
  };
}

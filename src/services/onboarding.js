// Customer sign-up (/onboarding): start -> upload documents -> details -> verify the emailed code.
// The onboarding token is kept until the sign-up is verified, so a customer who leaves can
// resume, and so only one draft account is started per sign-up (the server allows 10 an hour).

import { apiRequest, ApiError } from './api';
import { getTokenType, startCustomerSession } from './auth';

const ONBOARDING_TOKEN_KEY = 'taxmax_onboarding_token';

export const EXPIRED_SIGNUP_MESSAGE = 'Your sign-up session has expired. Please upload your documents again.';
const WRONG_CODE_MESSAGE = 'That code is invalid or has expired. Try again, or resend a new code.';

export const getOnboardingToken = () => {
  const token = localStorage.getItem(ONBOARDING_TOKEN_KEY);
  return getTokenType(token) === 'onboarding' ? token : null;
};

export const clearOnboarding = () => localStorage.removeItem(ONBOARDING_TOKEN_KEY);

// The auth option for document calls made during sign-up. Its 401s mean the sign-up expired,
// not that a signed-in session ended.
export const onboardingAuth = (token) => ({ token, sessionToken: false });

// Returns the stored onboarding token, starting a new sign-up only when there is none.
export async function ensureOnboardingToken() {
  const existing = getOnboardingToken();
  if (existing) return existing;
  const { data } = await apiRequest('/onboarding/start', { method: 'POST' });
  localStorage.setItem(ONBOARDING_TOKEN_KEY, data.onboardingToken);
  return data.onboardingToken;
}

// A 401 on a sign-up call is an expired or deleted draft: drop it so the next attempt starts fresh.
export function isExpiredSignup(err) {
  if (err instanceof ApiError && err.status === 401) {
    clearOnboarding();
    return true;
  }
  return false;
}

const call = (path, body) =>
  apiRequest(path, { method: 'POST', body, ...onboardingAuth(getOnboardingToken()) });

// YYYY-MM-DD (date input) -> MM/DD/YYYY (API).
const toApiDate = (value) => {
  const [year, month, day] = value.split('-');
  return year && month && day ? `${month}/${day}/${year}` : value;
};

// Saves the details and emails a code. Returns { sentTo, expiresInSeconds, resendInSeconds }.
export async function submitDetails(details) {
  try {
    const { data } = await call('/onboarding/details', {
      fullName: details.fullName.trim(),
      email: details.email.trim(),
      phoneNumber: details.phone.trim() || undefined,
      address: details.address.trim(),
      ssn: details.ssn.trim(),
      dob: toApiDate(details.dob),
      maritalStatus: details.maritalStatus,
      hasDependents: details.hasDependents,
    });
    return data;
  } catch (err) {
    if (isExpiredSignup(err)) throw new ApiError(EXPIRED_SIGNUP_MESSAGE, { status: 401 });
    throw err;
  }
}

export async function resendSignupCode() {
  try {
    return (await call('/onboarding/otp/resend')).data;
  } catch (err) {
    if (isExpiredSignup(err)) throw new ApiError(EXPIRED_SIGNUP_MESSAGE, { status: 401 });
    throw err;
  }
}

// Finishes sign-up and signs the customer in. Returns { token, user, accountType }.
export async function verifySignup(code) {
  let data;
  try {
    ({ data } = await call('/onboarding/verify', { code }));
  } catch (err) {
    // Both a wrong code and an expired sign-up are 401s; only the token rejection mentions the token.
    if (err instanceof ApiError && err.status === 401) {
      if (/token/i.test(err.message) && isExpiredSignup(err)) throw new ApiError(EXPIRED_SIGNUP_MESSAGE, { status: 401 });
      throw new ApiError(WRONG_CODE_MESSAGE, { status: 401 });
    }
    throw err;
  }
  clearOnboarding();
  return startCustomerSession(data);
}

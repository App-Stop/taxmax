// Customer document endpoints (/documents). Every call uses the customer session, except
// during sign-up, where the onboarding token is passed as `auth` instead.

import { apiRequest, ApiError } from './api';
import { getStoredToken } from './auth';

// Upload limits enforced by the server and by storage.
export const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_PAGES = 10;

// Statuses in which the customer may change pages, fields, or delete the document.
export const CUSTOMER_EDITABLE_STATUSES = ['uploaded', 're-upload', 'action-needed'];

// Same keys and labels as the server's list (GET /documents/form-types); used until it loads.
export const FORM_TYPES = [
  { key: 'w2', label: 'W-2 Form', description: 'Wage and tax statement' },
  { key: '1099_nec', label: '1099-NEC', description: 'Non employee compensation' },
  { key: '1099_int', label: '1099-INT', description: 'Interest income' },
  { key: '1099_t', label: '1099-T', description: 'Tuition statement' },
  { key: 'w4', label: 'W-4 Form', description: null },
  { key: 'w3', label: 'W-3 Form', description: null },
  { key: '1098', label: '1098', description: null },
  { key: 'other', label: 'Other similar documents', description: 'Anything else your accountant needs' },
];

const UPLOAD_FAILED = 'One of your images could not be uploaded. Please try again.';

const session = () => ({ token: getStoredToken() });

const call = (path, { method, body } = {}, auth = session()) => apiRequest(path, { method, body, ...auth });

const id = (value) => encodeURIComponent(value);

// Why a picked file can't be uploaded, or null when it can.
export function imageProblem(file) {
  if (!IMAGE_TYPES.includes(file.type)) return `${file.name} isn't a JPG, PNG or WebP image.`;
  if (file.size > MAX_FILE_SIZE) return `${file.name} is larger than 10 MB.`;
  if (file.size === 0) return `${file.name} is empty.`;
  return null;
}

export const getFormTypes = async () => (await apiRequest('/documents/form-types')).data;

// Sends one file straight to storage with the signed POST from /documents/upload-urls.
async function sendToStorage(target, file) {
  const form = new FormData();
  Object.entries(target.fields).forEach(([name, value]) => form.append(name, value));
  form.append('file', file); // must be the last part
  let response;
  try {
    response = await fetch(target.url, { method: 'POST', body: form });
  } catch {
    throw new ApiError(UPLOAD_FAILED);
  }
  if (!response.ok) throw new ApiError(UPLOAD_FAILED, { status: response.status });
}

// Uploads the images of several forms ([{ formType, files: File[] }]) and returns each
// form's storage keys, in the same order.
async function uploadImages(forms, auth) {
  const { data } = await call(
    '/documents/upload-urls',
    {
      method: 'POST',
      body: {
        items: forms.map(({ formType, files }) => ({
          formType,
          files: files.map((file) => ({ contentType: file.type, size: file.size })),
        })),
      },
    },
    auth,
  );
  await Promise.all(
    data.items.flatMap((item, i) => item.files.map((target, j) => sendToStorage(target, forms[i].files[j]))),
  );
  return data.items.map((item) => item.files.map((target) => target.key));
}

// Creates one document per form ([{ formType, files: File[] }], files in page order).
// Returns the created documents.
export async function uploadDocuments(forms, auth) {
  const keys = await uploadImages(forms, auth);
  const { data } = await call(
    '/documents',
    { method: 'POST', body: { documents: forms.map(({ formType }, i) => ({ formType, pages: keys[i] })) } },
    auth,
  );
  return data;
}

// One document with its pages (signed image URLs) and fields.
export const getDocument = async (docId) => (await call(`/documents/${id(docId)}`)).data;

// The complete ordered list of page keys: covers reordering, adding and removing.
export const updatePages = async (docId, keys) =>
  (await call(`/documents/${id(docId)}/pages`, { method: 'PUT', body: { pages: keys } })).data;

// Uploads new images for an existing document and returns the document with them appended.
export async function addPages(doc, files) {
  const [keys] = await uploadImages([{ formType: doc.formType, files }]);
  return updatePages(doc._id, [...doc.pages.map((page) => page.key), ...keys]);
}

export const deleteDocument = (docId, auth) => call(`/documents/${id(docId)}`, { method: 'DELETE' }, auth);

export const addField = async (docId, field) =>
  (await call(`/documents/${id(docId)}/fields`, { method: 'POST', body: field })).data;

export const updateField = async (docId, fieldId, changes) =>
  (await call(`/documents/${id(docId)}/fields/${id(fieldId)}`, { method: 'PATCH', body: changes })).data;

export const removeField = async (docId, fieldId) =>
  (await call(`/documents/${id(docId)}/fields/${id(fieldId)}`, { method: 'DELETE' })).data;

export const retryOcr = async (docId) => (await call(`/documents/${id(docId)}/ocr/retry`, { method: 'POST' })).data;

export const reviewDocument = async (docId, payload) =>
  (await call(`/documents/${id(docId)}/review`, { method: 'POST', body: payload })).data;

export const updateDocumentStatus = async (docId, payload) =>
  (await call(`/documents/${id(docId)}/status`, { method: 'PATCH', body: payload })).data;

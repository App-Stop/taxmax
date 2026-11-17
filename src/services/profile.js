import { apiRequest, ApiError } from './api';
import { getStoredToken, updateCustomerProfile } from './auth';

export const PROFILE_PICTURE_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic',
  'image/heif', 'image/avif', 'image/gif', 'image/bmp', 'image/tiff',
];
export const MAX_PROFILE_PICTURE_SIZE = 30 * 1024 * 1024;

export function profilePictureProblem(file) {
  if (!PROFILE_PICTURE_TYPES.includes(file.type)) return 'Choose a JPG, PNG, WebP, HEIC, HEIF, AVIF, GIF, BMP or TIFF image.';
  if (!file.size) return 'That image is empty. Choose another image.';
  if (file.size > MAX_PROFILE_PICTURE_SIZE) return 'Choose an image smaller than 30 MB.';
  return null;
}

export async function uploadProfilePicture(file) {
  const problem = profilePictureProblem(file);
  if (problem) throw new ApiError(problem);
  const { data: target } = await apiRequest('/users/me/profile-picture/upload-url', {
    method: 'POST', token: getStoredToken(), body: { contentType: file.type },
  });
  if (file.size > target.maxFileSize) throw new ApiError('That image exceeds the upload size limit.');
  const form = new FormData();
  Object.entries(target.fields).forEach(([name, value]) => form.append(name, value));
  form.append('file', file);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch(target.url, { method: 'POST', body: form, signal: controller.signal });
    if (!response.ok) throw new Error('Upload failed');
  } catch {
    throw new ApiError('Your photo could not be uploaded. Please try again.');
  } finally {
    clearTimeout(timer);
  }
  return updateCustomerProfile({ profilePictureKey: target.key });
}

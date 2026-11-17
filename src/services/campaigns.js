import QRCode from 'qrcode';

// Use the deployed app's root so the link works on hosts without SPA path rewrites.
// A canonical public URL can be configured when the admin uses a separate host.
export function campaignUrl(slug, baseUrl = import.meta.env?.VITE_PUBLIC_SITE_URL || window.location.origin) {
  const url = new URL(baseUrl);
  url.search = '';
  url.hash = '';
  url.searchParams.set('campaign', slug);
  return url.href;
}

export async function copyCampaignLink(slug) {
  try {
    await navigator.clipboard.writeText(campaignUrl(slug));
    return true;
  } catch {
    return false;
  }
}

export const campaignQrDataUrl = (url) => QRCode.toDataURL(url, {
  width: 784, margin: 4, errorCorrectionLevel: 'M',
  color: { dark: '#000000', light: '#ffffff' },
});

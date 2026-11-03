/**
 * Utility to resolve profile, logo, and uploaded image URLs across dev and production.
 * Automatically normalizes:
 * - Cloudinary CDN URLs (https://res.cloudinary.com/...)
 * - Local blob previews (blob:http://...)
 * - Base64 live camera data URIs (data:image/...)
 * - Legacy local backend URLs (http://localhost:5000/api/v1/uploads/...) -> routed to active API host
 * - Relative backend paths (/api/v1/uploads/...)
 */
export const resolveImageUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const url = rawUrl.trim();
  if (!url) return '';

  // Data URIs and Blob URLs (from live camera or file input)
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // Cloudinary CDN URLs are globally accessible and should be served as-is over HTTPS
  if (url.includes('cloudinary.com') || url.includes('res.cloudinary.com')) {
    return url.replace(/^http:\/\//i, 'https://');
  }

  // Determine current active backend origin
  const envApiUrl = import.meta.env.VITE_API_URL || '';
  let backendOrigin = '';
  if (envApiUrl) {
    try {
      const parsed = new URL(envApiUrl, window.location.href);
      backendOrigin = parsed.origin;
    } catch {
      backendOrigin = envApiUrl.replace(/\/api(\/v1)?\/?$/, '');
    }
  }

  // If running on deployed host (Vercel) and URL has http://localhost:5000, redirect to real backend
  if (url.includes('localhost:5000') || url.includes('127.0.0.1:5000')) {
    if (backendOrigin) {
      return url.replace(/^http:\/\/(localhost|127\.0\.0\.1):5000/i, backendOrigin);
    }
    // If no backend origin specified, convert to relative /api path so reverse proxy can handle it
    return url.replace(/^http:\/\/(localhost|127\.0\.0\.1):5000/i, '');
  }

  // Relative paths like /api/v1/uploads/...
  if (url.startsWith('/api') && backendOrigin) {
    return `${backendOrigin}${url}`;
  }

  return url;
};

export default resolveImageUrl;


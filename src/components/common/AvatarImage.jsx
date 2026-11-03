import React, { useState, useEffect } from 'react';
import { resolveImageUrl } from '../../utils/imageUrl';

/**
 * AvatarImage Component
 * Reliably displays a member or user avatar.
 * Normalizes Cloudinary, relative, and local paths.
 * Automatically catches load errors (404, mixed-content, network fails)
 * and falls back to a clean initial avatar badge.
 */
const AvatarImage = ({
  src,
  alt = 'Avatar',
  fallbackText = 'M',
  className = 'w-9 h-9 rounded-xl object-cover',
  fallbackClassName = 'w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs border border-emerald-200 dark:border-emerald-800'
}) => {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = resolveImageUrl(src);

  // Reset error state if the src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const initial = (fallbackText || 'M').trim().charAt(0).toUpperCase() || 'M';

  if (!resolvedSrc || hasError) {
    return (
      <div className={fallbackClassName} title={alt || fallbackText}>
        <span>{initial}</span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};

export default AvatarImage;


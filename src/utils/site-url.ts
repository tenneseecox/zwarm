/**
 * Get the site URL for the current environment
 * @returns The site URL, falling back to localhost in development
 */
export function getSiteUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use window.location.origin
    return window.location.origin;
  }
  
  // Server-side: use environment variable or fallback
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

/**
 * Get the absolute URL for a path
 * @param path The path to append to the site URL
 * @returns The absolute URL
 */
export function getAbsoluteUrl(path: string): string {
  const siteUrl = getSiteUrl();
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
} 
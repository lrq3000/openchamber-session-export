/** Conservative UX routing only, never an authentication/security boundary. */
export function isLocalDesktop(userAgent: string, ancestorOrigins: readonly string[]): boolean {
  if (!/\bWindows NT\b/.test(userAgent) || !/\bElectron\/[\d.]+\b/.test(userAgent) || ancestorOrigins.length !== 1) return false;
  try {
    const origin = new URL(ancestorOrigins[0]);
    return origin.protocol === 'http:' && ['127.0.0.1', '[::1]', 'localhost'].includes(origin.hostname) && !origin.username && !origin.password;
  } catch { return false; }
}

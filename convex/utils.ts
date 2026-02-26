export function createModeKey(mode: string, duration: number, languageCode: string) {
  return `${mode}:${duration}:${languageCode}`;
}

export function anonymizeEmail(email?: string | null) {
  if (!email) return undefined;
  const [user, domain] = email.split("@");
  if (!user || !domain) return undefined;
  return `${user.slice(0, 2)}***@${domain}`;
}

export function formatRelativeTimestamp(ts: number) {
  const diffMs = Date.now() - ts;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return `${Math.floor(diffDay / 7)}w ago`;
}

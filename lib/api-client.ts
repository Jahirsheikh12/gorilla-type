export async function apiFetch<T>(
  input: string,
  init?: RequestInit,
  fallback?: T
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (fallback !== undefined) return fallback;
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

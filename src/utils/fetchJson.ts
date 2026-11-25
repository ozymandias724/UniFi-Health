export async function fetchJson<T>(
  url: string | URL,
  label: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`${label}: ${response.status}`);
  }

  return (await response.json()) as T;
}
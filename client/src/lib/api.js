const API_BASE = import.meta.env.VITE_API_URL || '';

export async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}/api${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers
      }
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new Error('The server could not be reached. Check that the BlogSphere API is running.');
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Request failed with status ${response.status}.`);
  }
  return payload?.data;
}

export function messageFromError(error) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

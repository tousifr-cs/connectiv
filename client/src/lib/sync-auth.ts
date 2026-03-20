import { api } from "@shared/routes";

export async function syncUserWithBackend(idToken: string): Promise<void> {
  const res = await fetch(api.auth.sync.path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    // same-origin; keeps behavior consistent with the rest of your client
    credentials: "include",
  });

  if (!res.ok) {
    // Try to extract a useful error message from your backend response
    let message = `${res.status} ${res.statusText}`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body?.message) message = body.message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(`syncUserWithBackend failed: ${message}`);
  }
}
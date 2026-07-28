export async function authedFetch(
  url: string,
  opts: RequestInit = {},
): Promise<Response> {
  return fetch(url, {
    ...opts,
    credentials: "include",
    headers: {
      ...opts.headers,
      "Content-Type": "application/json",
    },
  });
}

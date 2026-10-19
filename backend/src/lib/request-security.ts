// Identity headers are set by the auth gatekeeper from a verified token. Values sent by the
// caller must never be trusted, or anyone could claim any user ID or role.
const IDENTITY_HEADERS = new Set(["x-user-id", "x-user-role", "x-service-key"]);

const SENSITIVE_KEY = /password$|token$|secret|^otp$|^code$|authorization|cookie|apikey|privatekey/i;

export function stripIdentityHeaders(request: Request) {
  const headers = request.headers;
  const callerGet = headers.get.bind(headers);
  (headers as any).get = (name: string) => (IDENTITY_HEADERS.has(name.toLowerCase()) ? null : callerGet(name));
}

// Masks credentials before request/response bodies are written to the logs.
export function redactForLog(value: unknown, depth = 0): unknown {
  if (depth > 6 || value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((item) => redactForLog(item, depth + 1));
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      SENSITIVE_KEY.test(key) ? "[REDACTED]" : redactForLog(item, depth + 1),
    ]),
  );
}

// Returns the request path and query for logging, with any ?token= value masked.
export function loggablePath(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    if (url.searchParams.has("token")) url.searchParams.set("token", "[REDACTED]");
    return `${url.pathname}${url.search}`;
  } catch {
    return rawUrl.replace(/([?&]token=)[^&]*/i, "$1[REDACTED]");
  }
}

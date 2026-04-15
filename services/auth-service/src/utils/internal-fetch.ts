import type { Env } from "../config/env.js";

export interface InternalFetchOptions {
  env: Env;
  userId: string;
  url: string;
  body?: unknown;
}

export interface InternalFetchResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

/**
 * Makes an authenticated internal service-to-service POST request.
 * Attaches `x-service-key` and `x-user-id` headers required by
 * the `internalAuthPreHandler` middleware on the target service.
 */
export async function internalPost<T = unknown>(
  opts: InternalFetchOptions,
): Promise<InternalFetchResult<T>> {
  const res = await fetch(opts.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-service-key": opts.env.INTERNAL_SERVICE_KEY,
      "x-user-id": opts.userId,
    },
    body: JSON.stringify(opts.body ?? {}),
  });

  const data = await res.json().catch(() => ({})) as T;
  return { ok: res.ok, status: res.status, data };
}

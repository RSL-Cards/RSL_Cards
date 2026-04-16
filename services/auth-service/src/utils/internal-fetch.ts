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

function makeHeaders(env: Env, userId: string) {
  return {
    "Content-Type": "application/json",
    "x-service-key": env.INTERNAL_SERVICE_KEY,
    "x-user-id": userId,
  };
}

/**
 * Makes an authenticated internal service-to-service POST request.
 * Attaches `x-service-key` and `x-user-id` headers.
 */
export async function internalPost<T = unknown>(
  opts: InternalFetchOptions,
): Promise<InternalFetchResult<T>> {
  const res = await fetch(opts.url, {
    method: "POST",
    headers: makeHeaders(opts.env, opts.userId),
    body: JSON.stringify(opts.body ?? {}),
  });
  const data = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, data };
}

/**
 * Makes an authenticated internal service-to-service GET request.
 */
export async function internalGet<T = unknown>(
  opts: Pick<InternalFetchOptions, "env" | "userId" | "url">,
): Promise<InternalFetchResult<T>> {
  const res = await fetch(opts.url, {
    method: "GET",
    headers: makeHeaders(opts.env, opts.userId),
  });
  const data = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, data };
}

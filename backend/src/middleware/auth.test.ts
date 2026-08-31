import { expect, test, describe } from "bun:test";
import { Elysia } from "elysia";
import { requireAdmin, requireSuperAdmin } from "./auth.js";
import { errorMiddleware } from "../errors/error.middleware.js";

describe("Auth Middleware", () => {
  const app = new Elysia()
    .use(errorMiddleware)
    .use(requireAdmin)
    .get("/admin/test", () => ({ ok: true }))
    .use(requireSuperAdmin)
    .get("/super-admin/test", () => ({ ok: true }));

  test("requireAdmin allows 'admin' role", async () => {
    const res = await app.handle(
      new Request("http://localhost/admin/test", {
        headers: {
          "x-user-id": "user-123",
          "x-user-role": "admin",
        },
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
  });

  test("requireAdmin allows 'super-admin' role", async () => {
    const res = await app.handle(
      new Request("http://localhost/admin/test", {
        headers: {
          "x-user-id": "user-123",
          "x-user-role": "super-admin",
        },
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
  });

  test("requireAdmin denies 'dealer' role", async () => {
    const res = await app.handle(
      new Request("http://localhost/admin/test", {
        headers: {
          "x-user-id": "user-123",
          "x-user-role": "dealer",
        },
      })
    );
    expect(res.status).toBe(403);
  });

  test("requireSuperAdmin allows 'super-admin' role but denies 'admin' role", async () => {
    const resAdmin = await app.handle(
      new Request("http://localhost/super-admin/test", {
        headers: {
          "x-user-id": "user-123",
          "x-user-role": "admin",
        },
      })
    );
    expect(resAdmin.status).toBe(403);

    const resSuperAdmin = await app.handle(
      new Request("http://localhost/super-admin/test", {
        headers: {
          "x-user-id": "user-123",
          "x-user-role": "super-admin",
        },
      })
    );
    expect(resSuperAdmin.status).toBe(200);
    const body = await resSuperAdmin.json();
    expect(body).toEqual({ ok: true });
  });
});

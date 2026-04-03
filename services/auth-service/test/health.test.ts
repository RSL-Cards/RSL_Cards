import { describe, expect, it } from "vitest";

describe("health contract", () => {
  it("documents expected top-level keys for /health when healthy", () => {
    const example = {
      status: "ok",
      service: "auth-service",
      environment: "development",
      version: "1.0.0",
      uptime: 1,
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: "ok", latency_ms: 1, database: "rslcards_dev" },
        redis: { status: "ok", latency_ms: 1, version: "7.0.0" },
      },
    };
    expect(example.status).toBe("ok");
    expect(example.checks.database.status).toBe("ok");
  });
});

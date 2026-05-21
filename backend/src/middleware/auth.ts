import { Elysia } from "elysia";
import { UnauthorizedError, ForbiddenError } from "../errors/index.js";

// Helper to check authentication and resolve identity
function getAuth(request: Request) {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-user-role");

  if (!userId || userId === "guest") {
    throw new UnauthorizedError("Authentication is required");
  }

  return { userId, role };
}

export const requireDealer = new Elysia({ name: "require-dealer" })
  .onBeforeHandle(({ request }) => {
    const { role } = getAuth(request);
    if (role !== "dealer") {
      throw new ForbiddenError("Forbidden: Dealer access required");
    }
  });

export const requireConsumer = new Elysia({ name: "require-consumer" })
  .onBeforeHandle(({ request }) => {
    const { role } = getAuth(request);
    if (role !== "consumer") {
      throw new ForbiddenError("Forbidden: Consumer access required");
    }
  });

export const requireAdmin = new Elysia({ name: "require-admin" })
  .onBeforeHandle(({ request }) => {
    const { role } = getAuth(request);
    if (role !== "admin") {
      throw new ForbiddenError("Forbidden: Admin access required");
    }
  });

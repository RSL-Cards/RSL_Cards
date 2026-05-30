# How to Write Backend routes (Elysia + Drizzle)

The RSL Cards consolidated backend uses a highly structured **Four-Tier Architecture** (Module Routes, Controller, Service, Repository) implemented using modern TypeScript and the high-performance **Elysia Framework** running on Bun.

---

## 🏗️ Architecture Layers

1. **Repository**: Directly interacts with the database (via Drizzle ORM client) and external S3/Redis stores.
2. **Service**: Encapsulates core business rules, coordinates calls to repositories, and processes logic.
3. **Controller**: Handles Elysia request/response context, extracts payloads, sets HTTP statuses, and delegates to services.
4. **Module Routes**: Instantiates Elysia router, applies route prefix (e.g. `/v1/inventory`), and binds controller endpoints.

---

## 🛠️ Step-by-Step Feature Implementation Flow

### Step 1: Write the Repository (`inventory.repository.ts`)
Repositories directly query the PostgreSQL database using Drizzle ORM. Inject database dependencies or import the shared `db` connection cleanly.

```typescript
import { sql } from "drizzle-orm";
import { db } from "../../db/index.js";

export class InventoryRepository {
  async getInventoryItem(id: string, userId: string) {
    const result = await db.execute(sql`
      SELECT * FROM inventory 
      WHERE id = ${id} AND user_id = ${userId}
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      throw new Error("Inventory item not found");
    }

    return result.rows[0];
  }
}
```

---

### Step 2: Write the Service (`inventory.service.ts`)
Services encapsulate the core business rules and validate operations. They receive repositories in their constructors through Dependency Injection.

```typescript
import { InventoryRepository } from "./inventory.repository.js";

export class InventoryService {
  constructor(private readonly repository: InventoryRepository) {}

  async getItem(id: string, userId: string) {
    if (!id) {
      throw new Error("Item ID is required");
    }
    return await this.repository.getInventoryItem(id, userId);
  }
}
```

---

### Step 3: Write the Controller (`inventory.controller.ts`)
Controllers interact directly with Elysia's request context (e.g. `body`, `params`, `headers`, `set`). 

*Tip: Write controller methods as Arrow Functions (`method = async () => {}`) to automatically preserve class context `this` bindings when registered in route files.*

```typescript
import { InventoryService } from "./inventory.service.js";

export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  getItem = async (ctx: { params: { id: string }; headers: Record<string, string>; set: any }) => {
    try {
      const userId = ctx.headers["x-user-id"]; // Resolved by Auth gatekeeper middleware
      const item = await this.service.getItem(ctx.params.id, userId);
      
      return item;
    } catch (err: any) {
      ctx.set.status = err.message.includes("not found") ? 404 : 400;
      return { success: false, error: err.message };
    }
  };
}
```

---

### Step 4: Wire the Module Routes (`index.ts`)
Wire the dependencies, create a prefix router, and bind endpoints using Elysia chain syntax:

```typescript
import { Elysia } from "elysia";
import { InventoryRepository } from "./inventory.repository.js";
import { InventoryService } from "./inventory.service.js";
import { InventoryController } from "./inventory.controller.ts";

const repository = new InventoryRepository();
const service = new InventoryService(repository);
const controller = new InventoryController(service);

export const inventoryModule = new Elysia({ prefix: "/v1/inventory" })
  .get("/:id", controller.getItem);
```

---

### Step 5: Route Aggregation (`backend/src/index.ts`)
Finally, register the domain module on the main Elysia application:

```typescript
import { Elysia } from "elysia";
import { inventoryModule } from "./modules/inventory/index.js";

const app = new Elysia()
  .use(inventoryModule)
  .listen(3000);

console.log("🚀 Backend Monorepo running at localhost:3000");
```

---

## 🧪 Step 6: Write Unit Tests

With Bun's integrated runner, unit testing is extremely fast. Write a `.test.ts` file in your module folder to assert service tier behavior:

```typescript
import { describe, it, expect, vi } from "bun:test";
import { InventoryService } from "./inventory.service.js";

describe("InventoryService", () => {
  it("throws an error if item ID is missing", async () => {
    const mockRepo = { getInventoryItem: vi.fn() } as any;
    const service = new InventoryService(mockRepo);

    expect(service.getItem("", "user-id")).rejects.toThrow("Item ID is required");
    expect(mockRepo.getInventoryItem).not.toHaveBeenCalled();
  });
});
```

Execute tests using Bun natively:
```bash
bun test
```

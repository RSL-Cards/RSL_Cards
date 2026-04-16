# How to Write Microservice Routes

RSL Cards microservices use a strict **Three-Tier Architecture** (Controller, Service, Repository) implemented with TypeScript classes and Fastify Plugins. All endpoints must be documented using Zod for robust validation and automated Swagger UI generation.

## The Architecture at a Glance

1. **Repository**: Handles database (`this.db`) and external data interactions.
2. **Service**: Encapsulates business logic, data transformation, and orchestrates calls to repositories.
3. **Controller**: Handles Fastify `(Request, Reply)`, parses payloads via Zod, and returns HTTP responses.
4. **Routes**: Registers endpoints, extracts `Env`, and injects dependencies.

---

## Step-by-Step Implementation Guide

### Step 1: Define Schemas (`src/types/schemas.ts`)
Always start by defining your request structures using Zod. This provides both runtime validation and structural TypeScript types.

```typescript
import { z } from "zod";

export const CreateListingBody = z.object({
  cardId: z.string().uuid(),
  price: z.number().positive(),
  condition: z.enum(["MINT", "NEAR_MINT", "NM_MT", "EXC", "GOOD", "POOR"])
});
export type CreateListingBody = z.infer<typeof CreateListingBody>;
```

### Step 2: Write the Repository (`src/repositories/example.repository.ts`)
Repositories take `Env` in the constructor. If you need DB access, use a `get db()` getter. 

```typescript
import { getDb } from "../config/db.js";
import type { Env } from "../config/env.js";

export class ExampleRepository {
  constructor(private readonly env: Env) {}

  private get db() {
    return getDb(this.env);
  }

  async insertListing(data: any) {
    // Database queries go here
    return { id: "123", ...data };
  }
}
```
*(Note: If a repository does not yet need DB access, keep the `env` parameter but remove the `db` getter to avoid ESLint unused import checks).*

### Step 3: Write the Service (`src/services/example.service.ts`)
Services take Repositories in their constructor. **Do not** pass `Env` into services unless explicitly requested (e.g., for JWT functions like in `auth-service`).

```typescript
import { ExampleRepository } from "../repositories/example.repository.js";
import type { CreateListingBody } from "../types/schemas.js";

export class ExampleService {
  constructor(
    private readonly repository: ExampleRepository
  ) {}

  async createListing(body: CreateListingBody) {
    // Apply business logic here
    if (body.price < 1) throw new Error("Price too low");
    
    return await this.repository.insertListing(body);
  }
}
```

### Step 4: Write the Controller (`src/controllers/example.controller.ts`)
Controllers handle the raw Fastify request/reply. They take Services in their constructor.

```typescript
import type { FastifyRequest, FastifyReply } from "fastify";
import { ExampleService } from "../services/example.service.js";
import { CreateListingBody } from "../types/schemas.js";

export class ExampleController {
  constructor(private readonly service: ExampleService) {}

  createListing = async (req: FastifyRequest, reply: FastifyReply) => {
    // Zod parsing directly inside the controller
    const body = CreateListingBody.parse(req.body);
    
    // Pass strictly validated data to the service
    const result = await this.service.createListing(body);
    
    return reply.status(201).send(result);
  };
}
```
*(Note: Write methods as arrow functions `createListing = async () => {}` to automatically bind `this` when registered cleanly in route files).*

### Step 5: Wire the Routes with Swagger Validation (`src/routes/example.routes.ts`)
Use Fastify's Plugin system along with the `.withTypeProvider<ZodTypeProvider>()` extension to automatically bridge your Zod schemas into the Swagger UI documentation. 

You must pull `env` from `app.env` before wiring dependencies.

```typescript
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { Env } from "../config/env.js";
import { CreateListingBody } from "../types/schemas.js";
import { ExampleRepository } from "../repositories/example.repository.js";
import { ExampleService } from "../services/example.service.js";
import { ExampleController } from "../controllers/example.controller.js";

export async function exampleRoutes(app: FastifyInstance) {
  // 1. Zod Type Provider wrapper for Swagger
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // 2. Extract Env perfectly (solves TS mismatches)
  const env = (app as any).env as Env;

  // 3. Dependency Injection
  const repository = new ExampleRepository(env);
  const service = new ExampleService(repository);
  const controller = new ExampleController(service);

  // 4. Register Endpoints with Swagger Schemas
  typedApp.post("/listings", {
    schema: {
      tags: ["Listings"],
      description: "Create a new inventory listing",
      body: CreateListingBody,
      response: {
        201: z.object({ id: z.string(), success: z.boolean() })
      },
      security: [{ bearerAuth: [] }]
    }
  }, controller.createListing);
}
```

### Step 6: Registration (`src/routes/index.ts`)
Finally, ensure the route plugin is registered and prefixed inside `index.ts`.

```typescript
import { FastifyInstance } from "fastify";
import type { Env } from "../config/env.js";
import { exampleRoutes } from "./example.routes.js";
import { healthRoutes } from "./health.routes.js";

export async function registerRoutes(app: FastifyInstance, env: Env) {
  (app as any).env = env; // Ensure env is accessible downstream
  
  await app.register(healthRoutes, { prefix: "/health" });
  await app.register(exampleRoutes, { prefix: "/v1/example" });
}
```

## Why this Pattern?
By decoupling Controllers from Services and Repositories:
1. **Zero ESLint Errors**: Injecting only exactly what's used removes dead variable warnings.
2. **Reusability**: Core business logic and database code live separately from HTTP implementations.
3. **Pinnacle Readability**: `app.post("/listings", controller.createListing)` is heavily modernized and clear to navigate.

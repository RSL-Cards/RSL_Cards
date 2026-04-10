# Backend Implementation Flow: Step-by-Step

To maintain a clean and scalable architecture, every new feature in RSL Cards should follow the **Controller-Service-Repository** pattern. This separates your data logic from your business logic and your HTTP logic.

---

## Part 1: Define the Data Contract (Schema)
Define exactly what the request should look like in `src/types/schemas.ts`. This provides automatic validation and Swagger documentation.

```typescript
import { z } from 'zod';

export const UpdateStatusSchema = z.object({
  newStatus: z.enum(['active', 'suspended', 'banned']),
  reason: z.string().optional()
});

export type UpdateStatusBody = z.infer<typeof UpdateStatusSchema>;
```

---

## Part 2: Business Logic (Service Layer)
Implement the core logic in `src/services/main.service.ts`. The service handles processing and coordinates database calls.

```typescript
import type { UpdateStatusBody } from '../types/schemas.js';

export async function processUserStatusUpdate(env: Env, body: UpdateStatusBody) {
  // Logic: Verify permissions, send emails, or calculate values
  // Call repository to save data...
  return { success: true, updatedTo: body.newStatus };
}
```

---

## Part 3: HTTP Handling (Controller Layer)
Handle the HTTP request and response in `src/controllers/main.controller.ts`. The controller's primary job is to extract data and send the result.

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import * as service from '../services/main.service.js';

export async function putUserStatus(req: FastifyRequest, reply: FastifyReply) {
  // Pass the validated body to the service
  const data = await service.processUserStatusUpdate(env, req.body as any); 
  return reply.send(data);
}
```

---

## Part 4: Wiring the Route (Routing Layer)
Connect everything together in `src/routes/index.ts`. This is where you apply security guards and Swagger metadata.

```typescript
app.put('/v1/auth/status', {
  schema: { 
    description: 'Update the user status dynamically',
    tags: ['Admin Settings'],
    body: UpdateStatusSchema,
    security: [{ bearerAuth: [] }]
  },
  preHandler: [
    (req, res) => requireGatewayAccessToken(env, req, res),
    requireAdminRole
  ]
}, controller.putUserStatus);
```

---

## Why we use this flow?
- **Separation of Concerns**: Changing your database (Repository) doesn't break your API rules (Controller).
- **Infinite Scalability**: You can test the Service layer logic without ever spinning up a web server.
- **Single Source of Truth**: The Zod schema updates your validation, your TypeScript types, and your Documentation all at once.
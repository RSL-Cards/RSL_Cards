# How to Write New Routes for Swagger

This guide explains how to add new API endpoints to the RSL Cards microservices so they are automatically documented and validated using Zod and Swagger.

## Step 1: Define Your Schema (Zod)
First, define what the data looks like in `src/types/schemas.ts`.

```typescript
import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  displayName: z.string().min(2),
  bio: z.string().max(160).optional()
});
```

## Step 2: Register the Route
Go to your routes file (e.g., `src/routes/index.ts`) and register the route within the `.withTypeProvider<ZodTypeProvider>()` block.

```typescript
app.patch('/v1/user/profile', {
  schema: {
    // 1. Description
    description: 'Updates the user profile data',
    
    // 2. Tags (Grouping)
    tags: ['User'],
    
    // 3. Request Body
    body: UpdateProfileSchema,
    
    // 4. Response Mapping
    response: {
      200: z.object({
        success: z.boolean(),
        message: z.string()
      })
    },
    
    // 5. Security (Bearer Token)
    security: [{ bearerAuth: [] }]
  },
  
  // 6. Security Guards (Middlewares)
  preHandler: [requireGatewayAccessToken],
  
  // 7. Core Logic (Controller)
  handler: async (req, reply) => {
    // Logic goes here
    return { success: true, message: 'Profile updated' };
  }
});
```

## Key Configuration Fields

### 1. description
Explain what the route does. This text appears at the top of the route section in Swagger.

### 2. tags
Used to group related routes. All routes with the same tag will be grouped together under one dropdown.

### 3. body
The Zod schema for POST/PATCH/PUT requests. Fastify will automatically block any request that doesn't match this shape.

### 4. querystring
The Zod schema for GET URL parameters (e.g., `?id=123`).

### 5. params
The Zod schema for dynamic URL segments (e.g., `/user/:id`).

### 6. response
A map of HTTP status codes to Zod schemas. This documents exactly what the frontend developer should expect to receive.

### 7. security
If set to `[{ bearerAuth: [] }]`, Swagger UI will show a lock icon and allow you to "Authorize" requests with your JWT token.

## Why use this pattern?
1. **Validation**: Invalid requests are blocked before they hit your logic.
2. **Type Safety**: `req.body` will have the correct TypeScript types automatically.
3. **Auto-Swagger**: The documentation updates itself every time you save your code.

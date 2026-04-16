# Database Schema Changes & Migrations

Because the RSL Cards ecosystem operates as a monorepo, the entire PostgreSQL database interacts strictly through Drizzle ORM schemas mapped inside a single shared package (`packages/shared-db`). 

Whenever you need to add a table, change a column, or alter constraints, follow this exact workflow to guarantee it propagates securely across all microservices.

---

## The Workflow

### Step 1: Update the TypeScript Schemas
Navigate strictly to `packages/shared-db/src/schema/`. 
Modify or create new exported tables. Ensure you strictly define your Drizzle data structures.

*(Example: Adding a field to `users.ts`)*
```typescript
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  phoneNumber: text("phone_number"), // <-- You added this
});
```

### Step 2: Generate the SQL Migration
Once your schema is typed out, you must generate the SQL difference. DO NOT handwrite SQL.

Run this natively from the root directory:
```bash
make dev-generate
```
*(This triggers `drizzle-kit generate` securely inside the shared package checking against your `/.env.dev` credentials).*

You will see a brand new `.sql` file immediately populate inside `packages/shared-db/drizzle/`.

### Step 3: Apply (Migrate) to the Local Database
Now, actually push those changes up and apply them structurally into the Postgres containers running locally:
```bash
make dev-migrate
```
*(This natively executes your new SQL script securely against the active `rsldb` Postgres daemon).*

### Step 4 (Optional): Update Seed Data
If you added completely new tables that require blank dummy data, you should immediately update the isolated seeder scripts in `packages/shared-db/src/seed.ts` and orchestrate a wipe:
```bash
make dev-seed
```

---

## 🔬 How to confirm it worked flawlessly?

You shouldn't guess if things worked. Confirm it strictly via three paths:

### Method A: Boot Drizzle Studio (Recommended)
Drizzle includes an elegant visual UI to peer precisely into your current local database state.
Run:
```bash
make dev-studio
```
Then navigate to `https://local.drizzle.studio` and physically verify your newly created columns exist exactly as defined!

### Method B: Turborepo Typechecking
Because you changed the exact underlying database shapes out of `@rsl/shared-db`, Turborepo automatically ripples the new strict TypeScript primitives up to your microservices via dependency tracking. 

Run:
```bash
pnpm type-check
```
If you altered existing strict definitions gracefully but didn't update the `Repositories` relying on them properly in your microservices, the TypeScript watcher will immediately reject and show you exactly what lines you broke.

### Method C: Fastify Fleet Testing
Re-run your `pnpm test` globally. Ensure your testing mocks don't explode from payload mismatch. Run:
```bash
make test
```

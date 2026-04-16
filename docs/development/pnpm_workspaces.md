# PNPM Workspaces & Dependency Management

RSL Cards operates across 18 distinct packages securely using a combination of **pnpm workspaces** and **Turborepo**. Instead of managing 18 distinct `node_modules` folders mapping duplicate packages separately, `pnpm` centrally caches and smartly links them all natively.

---

## 1. How the Monorepo Links Internal Packages

If you look inside the `package.json` of any microservice (e.g., `services/auth-service`), you will find internal references like this:

```json
"dependencies": {
  "@rsl/shared-config": "workspace:*",
  "@rsl/shared-types": "workspace:*"
}
```
The `workspace:*` identifier tells pnpm that this package relies *exclusively* on a module natively bundled inside our `packages/` folder. It essentially dynamically symlinks them. If you update a TypeScript interface inside `packages/shared-types`, `auth-service` will instantly receive the typed update—no compilation loop required!

---

## 2. Installing Packages

Because we operate structurally as a workspace, you must use the `--filter` command when adding dependencies natively so pnpm knows exactly where to put them.

**To add a package to a single microservice:**
```bash
pnpm add lodash --filter @rsl/auth-service
```

**To add a development dependency (like a linter):**
```bash
pnpm add eslint -D --filter @rsl/auth-service
```

**To install a package globally (across all packages):**
*(Use sparingly, typically only for root configurations like Prettier, ESLint plugins, or TypeScript)*
```bash
pnpm add typescript -w -D
```
The `-w` natively binds it permanently to the root-level `package.json`.

---

## 3. The `shamefully-hoist` Rule

If you inspect the `.npmrc` file sitting natively at the root of the repository, you'll see a strict flag:
```
shamefully-hoist=true
```
Normally, `pnpm` structures your `node_modules` in extremely strict nesting layers natively. However, our Docker environments utilize dynamic network mapping bindings natively. 

`shamefully-hoist=true` forces pnpm to artificially flatten all deep dependencies strictly towards the top of `node_modules`. **This exact behavior is mandatory** for our Docker Compose microservice containers to successfully map their ESM module dependencies when booting native fastify daemons. 

---

## 4. Troubleshooting Broken Caches

Occasionally, if you extensively swap between Docker bounds and purely Localhost loops, pnpm's internal symlink map might crash natively.

**To forcefully wipe and flawlessly reinstall the cache:**
```bash
# 1. Remove all underlying local hooks
rm -rf node_modules
pnpm store prune

# 2. Re-install gracefully
pnpm install
```

If it breaks *inside* Docker, you can run `make dev-restart` cleanly to purge the native `rsl_dev_node_modules` Docker volume.

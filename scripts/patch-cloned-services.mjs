import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const specs = [
  {
    dir: "user-service",
    pkg: "@rsl/user-service",
    portEnv: "USER_SERVICE_PORT",
    title: "user-service",
    shutdownLog: "user-service shut down gracefully",
  },
  {
    dir: "inventory-service",
    pkg: "@rsl/inventory-service",
    portEnv: "INVENTORY_SERVICE_PORT",
    title: "inventory-service",
    shutdownLog: "inventory-service shut down gracefully",
  },
  {
    dir: "transaction-service",
    pkg: "@rsl/transaction-service",
    portEnv: "TRANSACTION_SERVICE_PORT",
    title: "transaction-service",
    shutdownLog: "transaction-service shut down gracefully",
  },
  {
    dir: "listing-service",
    pkg: "@rsl/listing-service",
    portEnv: "LISTING_SERVICE_PORT",
    title: "listing-service",
    shutdownLog: "listing-service shut down gracefully",
  },
  {
    dir: "card-db-service",
    pkg: "@rsl/card-db-service",
    portEnv: "CARD_DB_SERVICE_PORT",
    title: "card-db-service",
    shutdownLog: "card-db-service shut down gracefully",
  },
  {
    dir: "ai-narrative-service",
    pkg: "@rsl/ai-narrative-service",
    portEnv: "AI_NARRATIVE_SERVICE_PORT",
    title: "ai-narrative-service",
    shutdownLog: "ai-narrative-service shut down gracefully",
  },
  {
    dir: "notification-service",
    pkg: "@rsl/notification-service",
    portEnv: "NOTIFICATION_SERVICE_PORT",
    title: "notification-service",
    shutdownLog: "notification-service shut down gracefully",
  },
  {
    dir: "analytics-service",
    pkg: "@rsl/analytics-service",
    portEnv: "ANALYTICS_SERVICE_PORT",
    title: "analytics-service",
    shutdownLog: "analytics-service shut down gracefully",
  },
  {
    dir: "admin-service",
    pkg: "@rsl/admin-service",
    portEnv: "ADMIN_SERVICE_PORT",
    title: "admin-service",
    shutdownLog: "admin-service shut down gracefully",
  },
];

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === "dist") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (/\.(ts|json)$/.test(ent.name)) files.push(p);
  }
  return files;
}

for (const s of specs) {
  const svcRoot = path.join(root, "services", s.dir);
  for (const f of walk(svcRoot)) {
    let txt = fs.readFileSync(f, "utf8");
    txt = txt.replaceAll("@rsl/auth-service", s.pkg);
    txt = txt.replaceAll("AUTH_SERVICE_PORT", s.portEnv);
    txt = txt.replaceAll("auth-service", s.title);
    txt = txt.replaceAll("auth-service shut down gracefully", s.shutdownLog);
    fs.writeFileSync(f, txt);
  }
}

console.log("patched", specs.length, "services");

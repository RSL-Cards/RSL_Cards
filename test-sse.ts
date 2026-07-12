import { Redis } from "ioredis";
const redis = new Redis("redis://localhost:6379");
const userId = "c4c44724-b00c-4e97-8701-af55fb7a5f8f";
redis.publish(`user-notifications:${userId}`, JSON.stringify({ type: "batch_status", batchId: "123", status: "failed", title: "Test", message: "Hello from test!" })).then(() => {
  console.log("Published!");
  process.exit(0);
});

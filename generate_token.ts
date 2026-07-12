import { config } from "dotenv";
import path from "node:path";
import { sign } from "jsonwebtoken";

config({ path: path.resolve("infra/docker/.env.dev") });
const token = sign({ userId: "c4c44724-b00c-4e97-8701-af55fb7a5f8f", role: "dealer", type: "access" }, process.env.JWT_SECRET || "default_secret", { expiresIn: "1h" });
console.log(token);

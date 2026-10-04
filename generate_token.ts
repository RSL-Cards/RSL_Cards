import { config } from "dotenv";
import path from "node:path";
import { SignJWT } from "jose";

config({ path: path.resolve("infra/docker/.env.dev") });

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
const token = await new SignJWT({
  userId: "c4c44724-b00c-4e97-8701-af55fb7a5f8f",
  role: "dealer",
  type: "access",
})
  .setProtectedHeader({ alg: "HS256" })
  .setExpirationTime("1h")
  .sign(secret);

console.log(token);

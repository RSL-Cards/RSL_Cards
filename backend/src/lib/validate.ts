import { type TSchema, type Static } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

export class ValidationError extends Error {
  readonly details: Record<string, string[]>;

  constructor(details: Record<string, string[]>) {
    super("Validation failed");
    this.name = "ValidationError";
    this.details = details;
  }
}

export function parseBody<T extends TSchema>(schema: T, body: unknown): Static<T> {
  const withDefaults = Value.Default(schema, structuredClone(body ?? {}));
  const cleaned = Value.Clean(schema, withDefaults);
  if (!Value.Check(schema, cleaned)) {
    const details: Record<string, string[]> = {};
    for (const error of Value.Errors(schema, cleaned)) {
      const key = error.path.replace(/^\//, "").replace(/\//g, ".") || "_root";
      (details[key] ??= []).push(error.message);
    }
    throw new ValidationError(details);
  }
  return cleaned as Static<T>;
}

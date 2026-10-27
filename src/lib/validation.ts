/**
 * Enterprise Input Validation, Rate Limiting & Structured Action Results
 */

export interface ActionResult<T = undefined> {
  ok: boolean;
  data?: T;
  error?: string;
  code?: "UNAUTHORIZED" | "FORBIDDEN" | "VALIDATION_ERROR" | "AI_POLICY_BLOCKED" | "RATE_LIMITED" | "SERVER_ERROR";
}

const rateLimitStore = new Map<string, number[]>();

/**
 * Enforces a per-user sliding-window rate limit on sensitive server actions (e.g. AI generation).
 */
export function enforceRateLimit(
  key: string,
  maxRequests: number = 12,
  windowMs: number = 60_000
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const cutoff = now - windowMs;
  const timestamps = (rateLimitStore.get(key) || []).filter((ts) => ts > cutoff);

  if (timestamps.length >= maxRequests) {
    const oldest = timestamps[0] || now;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  timestamps.push(now);
  rateLimitStore.set(key, timestamps);
  return { allowed: true, retryAfterSeconds: 0 };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function requireUuid(value: unknown, fieldName: string): string {
  const str = typeof value === "string" ? value.trim() : "";
  if (!UUID_REGEX.test(str)) {
    throw new Error(`Invalid or missing ${fieldName}.`);
  }
  return str;
}

export function requireNonEmptyString(
  value: unknown,
  fieldName: string,
  options: { minLength?: number; maxLength?: number } = {}
): string {
  const str = typeof value === "string" ? value.trim() : "";
  const min = options.minLength ?? 1;
  const max = options.maxLength ?? 100_000;

  if (str.length < min) {
    throw new Error(`${fieldName} must be at least ${min} character(s).`);
  }
  if (str.length > max) {
    throw new Error(`${fieldName} exceeds maximum allowed length (${max} characters).`);
  }
  return str;
}

export function isRedirectError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const digest = (err as { digest?: string }).digest;
  return err.message.includes("NEXT_REDIRECT") || Boolean(digest?.startsWith("NEXT_REDIRECT"));
}

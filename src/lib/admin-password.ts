import { timingSafeEqual } from "node:crypto";

/** Node.js Runtimeでのみ使用（api/admin/login/route.ts）。middlewareからは読み込まないこと。 */
export function checkAdminPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(input.padEnd(256, "\0"));
  const b = Buffer.from(expected.padEnd(256, "\0"));
  return timingSafeEqual(a, b) && input.length === expected.length;
}

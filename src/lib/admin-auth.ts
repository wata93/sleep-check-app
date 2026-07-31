import { SignJWT, jwtVerify } from "jose";

/**
 * このファイルは middleware（Edge Runtime）からも読み込まれるため、
 * `node:crypto` 等のNode専用APIをここに追加しないでください。
 * パスワード比較（Node専用）は admin-password.ts に分離しています。
 */

export const ADMIN_SESSION_COOKIE = "sc_admin_session";
const SESSION_DURATION = "12h";

function getSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "ADMIN_SESSION_SECRET が未設定、または短すぎます。.env.local に32文字以上のランダムな文字列を設定してください。"
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecretKey());
}

export async function verifyAdminSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

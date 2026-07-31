import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";

export const config = {
  matcher: ["/admin/dashboard/:path*", "/api/admin/:path*"],
};

export async function middleware(request: NextRequest) {
  // ログイン・ログアウトAPI自体は保護しない
  if (request.nextUrl.pathname === "/api/admin/login" || request.nextUrl.pathname === "/api/admin/logout") {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const authorized = await verifyAdminSessionToken(token);

  if (!authorized) {
    if (request.nextUrl.pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
    }
    const loginUrl = new URL("/admin", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

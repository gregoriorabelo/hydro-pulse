import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";

const PUBLIC_PATHS = new Set(["/login", "/esqueci-senha", "/reset-senha"]);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("hydro_pulse_session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  const isPublicPath = PUBLIC_PATHS.has(request.nextUrl.pathname);
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};

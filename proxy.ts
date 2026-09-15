import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("hydro_pulse_session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login"],
};

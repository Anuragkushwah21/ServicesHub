import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ✅ Get token safely (works in middleware)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/register",
    "/api/auth",
    "/explore",
  ];

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // ❌ Not logged in
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const role = token.role || "user";

  // 🔐 Admin protection
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 🔐 Vendor protection
  if (pathname.startsWith("/vendor") && role !== "vendor") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 🔁 Vendor redirect
  if (pathname.startsWith("/dashboard") && role === "vendor") {
    return NextResponse.redirect(new URL("/vendor", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/vendor/:path*",
    "/admin/:path*",
    "/booking/:path*",
  ],
};
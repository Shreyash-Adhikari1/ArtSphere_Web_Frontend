import { NextRequest, NextResponse } from "next/server";
import { getUserData, getAuthToken } from "./lib/cookie";

const publicPaths = ["/login", "/register", "/forgot-password"];
const adminPaths=["/admin"];

export async function proxy(req: NextRequest) {
  // logics here
  const { pathname } = req.nextUrl;
  const token = await getAuthToken();
  const user = token ? await getUserData() : null;

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  const isAdminPath= adminPaths.some((path)=> pathname.startsWith(path));

  if (user && token) {
    if (isAdminPath && user.role !== "admin") {
        return NextResponse.redirect(new URL('/',req.url));
    }
  }
  if (isPublicPath && user) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next(); // continue/granted
}

export const config = {
  matcher: [
    // list of path to apply rules/proxy
    "/admin/:path*",
    "/login",
    "/register",
  ],
};

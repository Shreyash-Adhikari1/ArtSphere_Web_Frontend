import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/cookie";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

async function proxy(req: Request, path: string[]) {
  const token = await getAuthToken();

  const url = new URL(req.url);
  const tailPath = path.join("/");

  const backendUrl = `${BASE_URL}/api/user/${tailPath}${url.search}`;

  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(backendUrl, {
    method: req.method,
    headers,
    cache: "no-store",
  });

  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") || "application/json",
    },
  });
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

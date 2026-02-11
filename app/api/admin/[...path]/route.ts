import { getAuthToken } from "@/lib/cookie";
import { NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

async function forward(req: Request, params: { path: string[] }) {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json(
      { success: false, message: "No token" },
      { status: 401 },
    );
  }

  const url = new URL(req.url);
  const tail = params.path.join("/"); // e.g. users/id/123
  const backendUrl = `${BASE}/api/admin/${tail}${url.search}`;

  const res = await fetch(backendUrl, {
    method: req.method,
    headers: {
      Authorization: `Bearer ${token}`,
      // Keep content-type if caller sends JSON
      ...(req.headers.get("content-type")
        ? { "Content-Type": req.headers.get("content-type") as string }
        : {}),
    },
    body:
      req.method === "GET" || req.method === "HEAD"
        ? undefined
        : await req.text(),
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
  return forward(req, await ctx.params);
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  return forward(req, await ctx.params);
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");

  if (!path || !path.startsWith("/")) {
    return NextResponse.json(
      { error: "Missing/invalid path" },
      { status: 400 },
    );
  }
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  const res = await fetch(`${BASE}${path}`, {
    // Keeping Authorization doesn't hurt if backend ignores it.
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json(
      {
        error: "Upstream failed",
        status: res.status,
        detail: detail.slice(0, 300),
      },
      { status: res.status },
    );
  }

  const contentType =
    res.headers.get("content-type") || "application/octet-stream";
  const bytes = await res.arrayBuffer();

  return new NextResponse(bytes, {
    status: 200,
    headers: { "Content-Type": contentType },
  });
}

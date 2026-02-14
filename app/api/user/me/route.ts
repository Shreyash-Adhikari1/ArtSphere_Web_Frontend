import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API } from "@/lib/api/endpoints";
import { getAuthToken } from "@/lib/cookie";

export async function GET() {
  const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  const token = await getAuthToken();
  if (!token) {
    return NextResponse.json(
      { success: false, message: "No token" },
      { status: 401 },
    );
  }

  const res = await fetch(`${BASE}${API.USER.ME}`, {
    headers: { Authorization: `Bearer ${token}` },
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

export async function PATCH(req: Request) {
  const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const contentType = req.headers.get("content-type") || "";
  const isMultipart = contentType.includes("multipart/form-data");

  let body: BodyInit | undefined;

  if (isMultipart) {
    // Image + fields
    body = await req.formData();
  } else {
    // JSON-only update (no image)
    body = await req.text();
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  // IMPORTANT: do NOT set content-type for multipart
  if (!isMultipart && contentType) {
    headers["Content-Type"] = contentType;
  }

  const res = await fetch(`${BASE}${API.USER.ME}`, {
    method: "PATCH",
    headers,
    body,
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

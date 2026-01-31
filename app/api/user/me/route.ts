import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API } from "@/lib/api/endpoints";

export async function GET() {
  const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  const token = (await cookies()).get("auth_token")?.value;
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
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "No token" },
      { status: 401 },
    );
  }

  // Receive multipart/form-data from the browser
  const formData = await req.formData();

  // Forward to backend (DO NOT set Content-Type manually)
  const res = await fetch(`${BASE}${API.USER.ME}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
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

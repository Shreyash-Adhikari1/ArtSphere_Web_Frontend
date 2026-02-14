import { NextResponse } from "next/server";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(
      `${BASE_URL}/api/user/request-password-reset`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/json",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Request failed" },
      { status: 500 },
    );
  }
}

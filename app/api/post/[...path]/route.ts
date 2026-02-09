import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

/**
 * This function does the actual proxying.
 * Every HTTP method (GET, POST, PATCH, DELETE)
 * will call this function.
 */
async function proxy(req: Request, path: string[]) {
  /* -------------------- AUTH -------------------- */

  // 1. Read the httpOnly auth cookie
  //    This ONLY works on the server.
  const token = (await cookies()).get("auth_token")?.value;

  // 2. If no token, stop early
  //    Backend expects Bearer token, so calling it without one is pointless.
  if (!token) {
    return NextResponse.json(
      { success: false, message: "No token" },
      { status: 401 },
    );
  }

  /* -------------------- URL -------------------- */

  // 3. Parse the incoming request URL
  //    Example: /api/post/posts?page=2
  const url = new URL(req.url);

  // 4. Reconstruct backend path
  //    ["posts", "my-posts"] → "posts/my-posts"
  const tailPath = path.join("/");

  // 5. Final backend URL
  //    http://localhost:5000/api/post/posts?page=2
  const backendUrl = `${BASE_URL}/api/post/${tailPath}${url.search}`;

  /* -------------------- BODY -------------------- */

  // 6. Decide how to forward the body safely
  const method = req.method;
  const contentType = req.headers.get("content-type") || "";

  const isGetLike = method === "GET" || method === "HEAD";
  const isMultipart = contentType.includes("multipart/form-data");

  let body: BodyInit | undefined = undefined;

  // 7. Only non-GET requests can have a body
  if (!isGetLike) {
    if (isMultipart) {
      // File upload (FormData)
      body = await req.formData();
    } else {
      // JSON or text
      body = await req.text();
    }
  }

  /* -------------------- HEADERS -------------------- */

  // 8. Prepare headers for backend
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  // 9. DO NOT set Content-Type for multipart
  //    Browser/Next will add the boundary automatically
  if (!isMultipart && contentType) {
    headers["Content-Type"] = contentType;
  }

  /* -------------------- FETCH -------------------- */

  // 10. Forward the request to backend
  const response = await fetch(backendUrl, {
    method,
    headers,
    body,
    cache: "no-store",
  });

  /* -------------------- RESPONSE -------------------- */

  // 11. Read backend response as raw text
  //     Prevents JSON parse crashes if backend returns HTML errors
  const responseText = await response.text();

  // 12. Send backend response back to browser unchanged
  return new NextResponse(responseText, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("content-type") || "application/json",
    },
  });
}

/* ============================================================
   HTTP METHOD HANDLERS
   ============================================================ */

/**
 * Next automatically calls these based on HTTP method.
 * ctx.params.path contains the [...path] parts.
 */

export async function GET(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

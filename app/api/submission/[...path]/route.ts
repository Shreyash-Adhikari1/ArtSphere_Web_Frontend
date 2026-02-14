import { getAuthToken } from "@/lib/cookie";
import { NextResponse } from "next/server";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

//   The proxy funbction that calls the actual routes || The proxy that calls the actual http method
async function proxy(req: Request, path: string[]) {
  // read token from Http only cookie
  const token = await getAuthToken();
  //   Token chhaina bhaney nikaaldeu
  if (!token) {
    return NextResponse.json(
      { success: false, message: "No token" },
      { status: 401 },
    );
  }

  // parsing incoming urls
  //Example: api/challenge/delete/?challenge1
  const url = new URL(req.url);

  //   reconstruct the backend path
  const tailpath = path.join("/");

  //   then we construct the final backend request url
  const backendUrl = `${BASE_URL}/api/submit/${tailpath}${url.search}`;

  //   === Now we define how to handle the body

  // first we decide how we forward the body to backend safely
  const method = req.method;
  const contentType = req.headers.get("content-type") || "";

  //   check if the request has a body, if the request has a body we request the form data
  // if the request is GET request or any GET-like request like requesting headers, we dont request anything

  const hasNoRequestBody = method === "GET" || method === "HEAD"; //here hasNoRequestBody == isGetLike
  const isMultipart = contentType.includes("multipart/form-data");

  let body: BodyInit | undefined = undefined;

  //   Now we make it such that only Request with bodies i.e non-GET request can have a body
  if (!hasNoRequestBody) {
    if (isMultipart) {
      // here we handle file upload (FormData)
      body = await req.formData();
    } else {
      // Json or Text
      body = await req.text();
    }
  }

  //   Now we get the token and attach it for backend
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  //   We dont set Content-Type for multipart data as Browser/Next will add it automatically
  if (!isMultipart && contentType) {
    headers["Content-Type"] = contentType;
  }

  //   Now we forward thge request to the backend
  // with the body and headers[token] attached
  const response = await fetch(backendUrl, {
    method,
    headers,
    body,
    cache: "no-store",
  });

  //   now we read the backend response as raw text
  //      it prevents JSON parse crashes if backend returns html errors
  const responseText = await response.text();

  //   now we send the backend response back to the browser unchanged
  return new NextResponse(responseText, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("content-type") || "application/json",
    },
  });
}

// ++++++++++++ HTTP METHOD HANDLERS +++++++++++++++++++++

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

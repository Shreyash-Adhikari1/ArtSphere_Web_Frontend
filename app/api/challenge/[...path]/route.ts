import { getAuthToken } from "@/lib/cookie";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

//   The proxy funbction that calls the actual routes || The proxy that calls the actual http method
async function proxy(req: Request, path: string[]) {
  // read token from Http only cookie
  const token = await getAuthToken();
}

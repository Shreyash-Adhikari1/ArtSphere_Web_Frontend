import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const store = await cookies();
  store.delete("auth_token");
  store.delete("user_data");
  return NextResponse.json({ success: true });
}

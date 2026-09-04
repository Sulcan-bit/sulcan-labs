// app/api/auth/logout/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  // No cookies. No clearing. No session invalidation.
  // Token-based auth means logout is purely client-side.

  return NextResponse.redirect("https://sulcan.com");
}


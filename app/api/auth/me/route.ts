// app/api/auth/me/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  const auth = getAuthFromRequest(req);

  if (!auth) {
    return NextResponse.json(
      { error: "Not authenticated." },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
  });

  return NextResponse.json({ user });
}


// app/api/heavy-oil/inputs/list/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  // ⭐ Token-based authentication (NO COOKIES)
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await prisma.heavyOilInputs.findMany({
    where: { userId: auth.userId },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(records);
}




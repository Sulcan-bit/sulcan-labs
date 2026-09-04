// app/api/heavy-oil/inputs/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // ⭐ Token-based authentication (NO COOKIES)
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const record = await prisma.heavyOilInputs.findUnique({
    where: { id: Number(id) },
  });

  // ⭐ Compare record.userId with auth.userId
  if (!record || record.userId !== auth.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(record);
}




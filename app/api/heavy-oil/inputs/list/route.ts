// app/api/heavy-oil/inputs/list/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";

export async function GET() {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await prisma.heavyOilInputs.findMany({
    where: { userId: user.id },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      created_at: true,
      terminal_operator: true,
      producer_name: true,
      producer_density_kg_m3: true,
      cond1_density_kg_m3: true,
      heavy_oil_stream: true,
    },
  });

  return NextResponse.json(records);
}






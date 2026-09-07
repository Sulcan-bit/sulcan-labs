// app/api/heavy-oil/scenarios/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";

export async function GET() {
  // ⭐ COOKIE-BASED AUTH (RESTORED)
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ scenarios: [] });

  const scenarios = await prisma.scenario.findMany({
  where: {
    userId: user.id,

    scenario_name: { not: null },
    terminal_operator: { not: null },
    terminal_location: { not: null },
    shrinkage_model: { not: null },
  },
  include: {
    inputs: {
      select: {
        producer_name: true,
        producer_density_kg_m3: true,
        cond1_density_kg_m3: true,     // NEW
        heavy_oil_stream: true,        // NEW
      },
    },
    month: true,
    results: true,
  },
  orderBy: { created_at: "desc" },
});


  return NextResponse.json({ scenarios });
}





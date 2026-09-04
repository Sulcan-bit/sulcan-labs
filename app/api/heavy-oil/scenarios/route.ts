// app/api/heavy-oil/scenarios/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  // ⭐ Token-based authentication (NO COOKIES)
  const auth = getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ scenarios: [] });

  const scenarios = await prisma.scenario.findMany({
    where: {
      userId: auth.userId,

      scenario_name: { not: null },
      terminal_operator: { not: null },
      terminal_location: { not: null },
      shrinkage_model: { not: null },

      // inputsId: { not: null },  // optional filter
    },
    include: {
      inputs: true,
      month: true,
      results: true,
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json({ scenarios });
}




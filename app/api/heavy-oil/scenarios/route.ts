// app/api/heavy-oil/scenarios/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";

export async function GET() {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ scenarios: [] });

  const scenarios = await prisma.scenario.findMany({
    where: {
      userId: user.id,

      scenario_name: { not: null },
      terminal_operator: { not: null },
      terminal_location: { not: null },
      shrinkage_model: { not: null },

      // THIS LINE IS THE IMPORTANT ONE:
      // inputsId: { not: null },
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



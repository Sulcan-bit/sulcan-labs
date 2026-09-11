// app/api/profile/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";

export async function GET() {
  try {
    const userSession = await getUserFromSession();
    if (!userSession) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userSession.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        email: user.email,
        phone: user.phone,
        first_name: user.first_name,
        last_name: user.last_name,
        address_line1: user.address_line1,
        address_line2: user.address_line2,
        city: user.city,
        province: user.province,
        postal_code: user.postal_code,
        country: user.country,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Profile error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/* ⭐⭐⭐ ADD THIS DIRECTLY BELOW THE GET HANDLER — NOT INSIDE IT ⭐⭐⭐ */

export async function POST(req: Request) {
  try {
    const userSession = await getUserFromSession();
    if (!userSession) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const body = await req.json();

    const updated = await prisma.user.update({
      where: { id: userSession.id },
      data: {
        first_name: body.first_name ?? null,
        last_name: body.last_name ?? null,
        address_line1: body.address_line1 ?? null,
        address_line2: body.address_line2 ?? null,
        city: body.city ?? null,
        province: body.province ?? null,
        postal_code: body.postal_code ?? null,
        country: body.country ?? null,
      },
    });

    return NextResponse.json({ success: true, user: updated }, { status: 200 });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

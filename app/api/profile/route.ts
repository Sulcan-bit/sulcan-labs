// app/api/profile/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";

export async function GET() {
  try {
    // ⭐ COOKIE-BASED AUTH (RESTORED)
    const userSession = await getUserFromSession();
    if (!userSession) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userSession.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
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
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}


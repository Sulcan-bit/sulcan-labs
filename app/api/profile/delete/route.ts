// app/api/profile/delete/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";

export async function POST() {
  try {
    const userSession = await getUserFromSession();
    if (!userSession) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    // ⭐ Soft-delete logic:
    // - Remove authentication credentials
    // - Keep all profile fields
    // - Keep all scenarios + inputs
    // - Keep email for record retention
    const updated = await prisma.user.update({
      where: { id: userSession.id },
      data: {
        password_hash: null,
        phone: null,
        sms_code: null,
        sms_code_expires: null,
        last_login: null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Your profile has been deleted (account disabled). All data remains securely stored by Sulcan.",
        user: updated,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Profile delete error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

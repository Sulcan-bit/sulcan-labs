// app/api/auth/send-sms/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, phone } = await req.json();

    if (!email || !phone) {
      return NextResponse.json(
        { error: "Email and phone number are required." },
        { status: 400 }
      );
    }

    // ⭐ Normalize phone to E.164 (+1XXXXXXXXXX)
    const digits = phone.replace(/\D/g, ""); // remove non-digits
    const normalizedPhone = `+1${digits}`;

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // 2. Save phone number if user does not have one
    if (!user.phone) {
      await prisma.user.update({
        where: { id: user.id },
        data: { phone: normalizedPhone },
      });
    }

    // 3. Generate 6‑digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Store OTP + expiry (5 minutes)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        sms_code: code,
        sms_code_expires: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // 5. Prepare Telnyx SMS payload
    const payload = {
      from: process.env.TELNYX_FROM_NUMBER, // +18339992783
      to: normalizedPhone,
      text: `Sulcan Labs Login Code: ${code}`,
      messaging_profile_id: process.env.TELNYX_MESSAGING_PROFILE_ID,
    };

    // 6. Send SMS via Telnyx API v2
    const telnyxRes = await fetch("https://api.telnyx.com/v2/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!telnyxRes.ok) {
      console.error(await telnyxRes.text());
      return NextResponse.json(
        { error: "Failed to send SMS." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "SMS code sent successfully." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Send SMS error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

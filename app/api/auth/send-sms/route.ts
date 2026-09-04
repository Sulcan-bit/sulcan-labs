// app/api/auth/send-sms/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, phone } = await req.json();

    // ------------------------------------------------------------
    // REQUIRED FIELDS
    // ------------------------------------------------------------
    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required." },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------
    // NORMALIZE PHONE → E.164 (+1XXXXXXXXXX)
    // ------------------------------------------------------------
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      return NextResponse.json(
        { error: "Phone number must be 10 digits." },
        { status: 400 }
      );
    }

    const normalizedPhone = `+1${digits}`;

    // ------------------------------------------------------------
    // LOOK UP USER BY PHONE (RESTORED WORKING LOGIC)
    // ------------------------------------------------------------
    const user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this phone number." },
        { status: 404 }
      );
    }

    // ------------------------------------------------------------
    // GENERATE OTP
    // ------------------------------------------------------------
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // ------------------------------------------------------------
    // STORE OTP + EXPIRY (5 MINUTES)
    // ------------------------------------------------------------
    await prisma.user.update({
      where: { id: user.id },
      data: {
        sms_code: code,
        sms_code_expires: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // ------------------------------------------------------------
    // SEND SMS TO STORED PHONE
    // ------------------------------------------------------------
    const payload = {
      from: process.env.TELNYX_FROM_NUMBER,
      to: normalizedPhone,
      text: `Sulcan Labs Login Code: ${code}`,
      messaging_profile_id: process.env.TELNYX_MESSAGING_PROFILE_ID,
    };

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

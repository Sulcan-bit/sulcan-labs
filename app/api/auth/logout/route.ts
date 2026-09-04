// app/api/auth/logout/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.redirect("https://sulcan.com");

  response.cookies.set({
    name: "sulcan_session",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0, // expire immediately
  });

  return response;
}

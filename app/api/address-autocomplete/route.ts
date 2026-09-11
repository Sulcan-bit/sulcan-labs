// app/api/address-autocomplete/route.ts

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q || q.length < 3) {
    return NextResponse.json({ suggestions: [] });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    q
  )}&types=address&components=country:ca&key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  const suggestions =
    data?.predictions?.map((p: any) => p.description) ?? [];

  return NextResponse.json({ suggestions });
}

// app/api/google/details/route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("🔵 [DETAILS] Backend route hit");

  const { place_id } = await req.json();
  console.log("🔵 [DETAILS] Received place_id:", place_id);

  const key = process.env.GOOGLE_MAPS_API_KEY;

  const url = `https://places.googleapis.com/v1/places/${place_id}`;

  const googleRes = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key as string,
      "X-Goog-FieldMask":
        "id,displayName,formattedAddress,addressComponents.longText,addressComponents.types",
    },
  });

  const json = await googleRes.json();
  console.log("🔵 [DETAILS] Google JSON:", json);

  return NextResponse.json(json);
}


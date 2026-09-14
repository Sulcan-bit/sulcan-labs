// app/api/google/autocomplete/route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("🔵 [AUTOCOMPLETE] Backend route hit");

  const { input } = await req.json();
  console.log("🔵 [AUTOCOMPLETE] Input received:", input);

  const key = process.env.GOOGLE_MAPS_API_KEY;
  console.log("🔵 [AUTOCOMPLETE] Using key:", key?.substring(0, 10) + "...");

  // Google Places API (New) — valid request body
  const requestBody = {
    input,
    languageCode: "en",
    regionCode: "CA",
    locationBias: {
      circle: {
        center: {
          latitude: 51.0447,
          longitude: -114.0719,
        },
        radius: 50000,
      },
    },
  };

  console.log("🔵 [AUTOCOMPLETE] Sending request body:", requestBody);

  const googleRes = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",

      // REQUIRED for Places API (New)
      "X-Goog-Api-Key": key as string,

      // REQUIRED: valid field mask for Autocomplete (New)
      "X-Goog-FieldMask":
        "suggestions.placePrediction.placeId,suggestions.placePrediction.text",
    },
    body: JSON.stringify(requestBody),
  });

  console.log("🔵 [AUTOCOMPLETE] Google status:", googleRes.status);

  const json = await googleRes.json();
  console.log("🔵 [AUTOCOMPLETE] Google JSON:", json);

  return NextResponse.json(json);
}

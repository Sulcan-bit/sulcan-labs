// app/api/google/autocomplete/route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("🔵 [AUTOCOMPLETE] Backend route hit");

  const { input } = await req.json();
  console.log("🔵 [AUTOCOMPLETE] Input received:", input);

  const key = process.env.GOOGLE_MAPS_API_KEY;
  console.log("🔵 [AUTOCOMPLETE] Using key:", key?.substring(0, 10) + "...");

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
    includedPrimaryTypes: ["address"],   // ⭐ FIXED
  };

  console.log("🔵 [AUTOCOMPLETE] Sending request body:", requestBody);

  const googleRes = await fetch(
    `https://places.googleapis.com/v1/places:autocomplete?key=${key}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-FieldMask":
          "suggestions.placeId,suggestions.formattedSuggestion",
      },
      body: JSON.stringify(requestBody),
    }
  );

  console.log("🔵 [AUTOCOMPLETE] Google status:", googleRes.status);

  const json = await googleRes.json();
  console.log("🔵 [AUTOCOMPLETE] Google JSON:", json);

  return NextResponse.json(json);
}

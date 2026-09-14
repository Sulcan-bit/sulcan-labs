// app/api/google/autocomplete/route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { input } = await req.json();

  const res = await fetch(
    `https://places.googleapis.com/v1/places:autocomplete?key=${process.env.GOOGLE_MAPS_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-FieldMask":
          "suggestions.placeId,suggestions.formattedSuggestion",
      },
      body: JSON.stringify({
        input,
        languageCode: "en",
        regionCode: "CA",
        locationBias: {
          circle: {
            center: { latitude: 51.0447, longitude: -114.0719 },
            radius: 50000,
          },
        },
        includedPrimaryTypes: ["street_address"],
      }),
    }
  );

  const json = await res.json();
  return NextResponse.json(json);
}

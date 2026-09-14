// app/api/google/autocomplete/route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("🔵 [AUTOCOMPLETE] Backend route hit");

  let input = "";
  try {
    const body = await req.json();
    input = body.input;
    console.log("🔵 [AUTOCOMPLETE] Input received:", input);
  } catch (err) {
    console.error("🔴 [AUTOCOMPLETE] Failed to parse JSON body:", err);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Check environment variable
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    console.error("🔴 [AUTOCOMPLETE] GOOGLE_MAPS_API_KEY is missing!");
    return NextResponse.json(
      { error: "Missing GOOGLE_MAPS_API_KEY" },
      { status: 500 }
    );
  }

  console.log("🔵 [AUTOCOMPLETE] Using Google API Key:", key.substring(0, 10) + "...");

  // Build request body
  const requestBody = {
    input,
    languageCode: "en",
    regionCode: "CA",
    locationBias: {
      circle: {
        center: {
          latitude: 51.0447, // Calgary
          longitude: -114.0719,
        },
        radius: 50000,
      },
    },
    includedPrimaryTypes: ["street_address"],
  };

  console.log("🔵 [AUTOCOMPLETE] Sending request body to Google:", requestBody);

  // Make Google API request
  let googleResponse;
  try {
    googleResponse = await fetch(
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
  } catch (err) {
    console.error("🔴 [AUTOCOMPLETE] Google fetch failed:", err);
    return NextResponse.json(
      { error: "Google API request failed", details: String(err) },
      { status: 500 }
    );
  }

  console.log("🔵 [AUTOCOMPLETE] Google API status:", googleResponse.status);

  let json;
  try {
    json = await googleResponse.json();
    console.log("🔵 [AUTOCOMPLETE] Google API response JSON:", json);
  } catch (err) {
    console.error("🔴 [AUTOCOMPLETE] Failed to parse Google JSON:", err);
    return NextResponse.json(
      { error: "Failed to parse Google response", details: String(err) },
      { status: 500 }
    );
  }

  // Return final JSON to frontend
  console.log("🟢 [AUTOCOMPLETE] Returning JSON to frontend:", json);
  return NextResponse.json(json);
}


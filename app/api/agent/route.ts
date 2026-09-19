// app/api/agent/route.ts

import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages;

    // Load system instructions safely
    let instructions = "";
    try {
      instructions = fs.readFileSync(
        path.join(process.cwd(), "app/agents/SULCAN_AGENT.md"),
        "utf8"
      );
    } catch (err) {
      console.error("Agent instructions file missing:", err);
      instructions = "You are Sulcan AI.";
    }

    // ⭐ FOUNDARY ENDPOINT ⭐
    const url = "https://info-1412-resource.services.ai.azure.com/openai/v1/responses";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.AZURE_OPENAI_KEY || ""
      },
      body: JSON.stringify({
        model: "sulcan-gpt41-mini",
        input: [
          { role: "system", content: instructions },
          ...messages
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Foundry Error:", data);
      return Response.json({
        message: {
          role: "assistant",
          content: `Foundry error: ${data.error?.message || "Unknown error"}`
        }
      });
    }

    // Foundry returns: { output: "..." }
    return Response.json({
      message: {
        role: "assistant",
        content: data.output
      }
    });

  } catch (err) {
    console.error("Agent crashed:", err);
    return Response.json({
      message: {
        role: "assistant",
        content: "Agent crashed: " + String(err)
      }
    });
  }
}

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

    // ⭐ UPDATED DEPLOYMENT NAME ⭐
    const url = `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/sulcan-gpt41-mini/chat/completions?api-version=2024-02-01`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.AZURE_OPENAI_KEY || ""
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: instructions },
          ...messages
        ]
      })
    });

    const data = await response.json();

    // If Azure returned an error
    if (!response.ok) {
      console.error("Azure OpenAI Error:", data);
      return Response.json({
        message: {
          role: "assistant",
          content: `Azure error: ${data.error?.message || "Unknown error"}`
        }
      });
    }

    // If choices[] is missing
    if (!data.choices || !data.choices[0]) {
      console.error("Azure returned no choices:", data);
      return Response.json({
        message: {
          role: "assistant",
          content: "Azure returned no choices. Check deployment name and endpoint."
        }
      });
    }

    // Normal success
    return Response.json({
      message: data.choices[0].message
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






// app/api/agent/route.ts

import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const body = await req.json();
  const messages = body.messages;

  const instructions = fs.readFileSync(
    path.join(process.cwd(), "app/agents/SULCAN_AGENT.md"),
    "utf8"
  );

  const response = await fetch(
    `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-02-01`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.AZURE_OPENAI_KEY
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: instructions },
          ...messages
        ]
      })
    }
  );

  const data = await response.json();

  return Response.json({
    message: data.choices[0].message
  });
}



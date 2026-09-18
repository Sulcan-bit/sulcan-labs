// app/agents/sulcan-agent.ts

import { createAgent } from "next/agents";
import fs from "fs";
import path from "path";

// ⭐ You MUST import your models
import { myCondensateModel } from "@/app/lib/models/condensate";
import { myHeavyBlendModel } from "@/app/lib/models/heavyBlend";

export const sulcanAgent = createAgent({
  id: "sulcan-agent",
  name: "Sulcan Labs Heavy Oil & Condensate Agent",
  instructions: fs.readFileSync(
    path.join(process.cwd(), "app/agents/SULCAN_AGENT.md"),
    "utf8"
  ),

  tools: {
    condensateCalc: {
      description: "Calculate condensate EQ, shrinkage, landed cost, etc.",
      parameters: {
        type: "object",
        properties: {
          density: { type: "number" },
          sulphur: { type: "number" },
          c5: { type: "number" }
        },
        required: ["density"]
      },
      execute: async ({ density, sulphur, c5 }) => {
        return await myCondensateModel(density, sulphur, c5);
      }
    },

    heavyOilBlend: {
      description: "Blend heavy streams and compute density, sulphur, shrinkage.",
      parameters: {
        type: "object",
        properties: {
          streams: { type: "array", items: { type: "string" } },
          volumes: { type: "array", items: { type: "number" } }
        },
        required: ["streams", "volumes"]
      },
      execute: async ({ streams, volumes }) => {
        return await myHeavyBlendModel(streams, volumes);
      }
    }
  }
});


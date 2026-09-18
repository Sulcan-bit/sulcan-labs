// app/agents/sulcan-agent.ts

import { createAgent } from "next/agents";
import fs from "fs";
import path from "path";

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
        c5: { type: "number" },
        // etc...
      },
      required: ["density"]
    },
    execute: async ({ density, sulphur }) => {
      return await myCondensateModel(density, sulphur);
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

// app/api/agent/route.ts
import { sulcanAgent } from "@/app/agents/sulcan-agent";
import { agentHandler } from "@vercel/agents";

export const POST = agentHandler({
  agent: sulcanAgent
});


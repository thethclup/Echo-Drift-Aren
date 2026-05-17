import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({
      protocol: "MCP",
      version: "1.0.0",
      name: "Drift Arena MCP Endpoint",
      status: "active",
      description: "Active MCP server for Drift Arena Orchestrator Agent",
      capabilities: ["drift-racing", "arena-battles", "high-speed-optimization"],
      tools: [
        {
          name: "execute-drift",
          description: "Executes a drift maneuver in the arena",
          parameters: {
            type: "object",
            properties: {
              angle: { type: "number" },
              duration: { type: "number" }
            },
            required: ["angle", "duration"]
          }
        },
        {
          name: "fire-echo-wave",
          description: "Fires an echo wave during a drift to attack opponents",
          parameters: {
            type: "object",
            properties: {
              intensity: { type: "number" }
            },
            required: ["intensity"]
          }
        }
      ],
      prompts: [
        {
          name: "start-race",
          description: "Initialize the racing arena for a new session"
        }
      ],
      resources: [
        {
          uri: "drift-record://latest",
          name: "Latest Drift Record",
          description: "Most recent score and drift statistics"
        }
      ],
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const { action, command, params } = body;

      let result: any = {};
      const targetAction = action || command;

      switch (targetAction) {
        case "status":
        case "ping":
          result = { 
            status: "online", 
            agent: "Drift Arena Orchestrator",
            message: "Engine is running - Ready to drift!" 
          };
          break;

        case "execute":
          result = {
            success: true,
            action: command || params,
            executedAt: new Date().toISOString(),
            message: "Drift maneuver executed successfully"
          };
          break;

        case "get_info":
          result = {
            name: "Drift Arena Orchestrator",
            wallet: "0xe157F1F5e12adB38Ba013683E9Ce24efe21e5bA6",
            platform: "Base",
            version: "1.0.0"
          };
          break;

        default:
          result = {
            success: true,
            message: "Command received",
            data: body
          };
      }

      return res.status(200).json({
        status: "success",
        agent: "Drift Arena Orchestrator",
        response: result,
        receivedAt: new Date().toISOString()
      });

    } catch (error) {
      return res.status(400).json({
        status: "error",
        message: "Failed to process MCP command"
      });
    }
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}

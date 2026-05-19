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
      const targetMethod = body.method || body.action || body.command;
      const reqId = body.id || null;
      const isJsonRpc = body.jsonrpc === '2.0' || reqId !== null;

      if (targetMethod === 'initialize') {
        return res.status(200).json({
          jsonrpc: isJsonRpc ? "2.0" : undefined,
          id: reqId,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {}, prompts: {}, resources: {} },
            serverInfo: { name: "Drift Arena Orchestrator", version: "1.0.0" }
          }
        });
      }

      if (targetMethod === 'tools/list') {
        return res.status(200).json({
          jsonrpc: isJsonRpc ? "2.0" : undefined,
          id: reqId,
          result: {
            tools: [
              { name: "get_race_status", description: "Get the current status of the race", inputSchema: { type: "object", properties: {}, required: [] } },
              { name: "start_race", description: "Start a new race", inputSchema: { type: "object", properties: {}, required: [] } },
              { name: "get_leaderboard", description: "Get the current arena leaderboard", inputSchema: { type: "object", properties: {}, required: [] } },
              { name: "optimize_speed", description: "Optimize drifter speed settings", inputSchema: { type: "object", properties: {}, required: [] } },
              { name: "get_track_info", description: "Get information about the current track", inputSchema: { type: "object", properties: {}, required: [] } }
            ]
          }
        });
      }

      if (targetMethod === 'tools/call') {
        const { name } = body.params || {};
        return res.status(200).json({
          jsonrpc: isJsonRpc ? "2.0" : undefined,
          id: reqId,
          result: {
            content: [{ type: "text", text: `Executed ${name} successfully.` }]
          }
        });
      }

      let result: any = {};
      switch (targetMethod) {
        case "status":
        case "ping":
          result = { status: "online", agent: "Drift Arena Orchestrator", message: "Engine is running - Ready to drift!" };
          break;
        case "get_info":
          result = { name: "Drift Arena Orchestrator", wallet: "0xe157F1F5e12adB38Ba013683E9Ce24efe21e5bA6", platform: "Base", version: "1.0.0" };
          break;
        default:
          result = { success: true, message: "Command received", data: body };
      }

      if (isJsonRpc) {
        return res.status(200).json({
          jsonrpc: "2.0",
          id: reqId,
          result
        });
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

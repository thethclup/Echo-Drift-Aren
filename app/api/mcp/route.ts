import { NextResponse } from 'next/server';

const TOOLS = [
  {
    name: "get_race_status",
    description: "Get the current status of the race",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "start_race",
    description: "Start a new race",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "get_leaderboard",
    description: "Get the current arena leaderboard",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "optimize_speed",
    description: "Optimize drifter speed settings",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "get_track_info",
    description: "Get information about the current track",
    inputSchema: { type: "object", properties: {}, required: [] }
  }
];

export async function GET() {
  return NextResponse.json({
    protocol: "MCP",
    version: "1.0.0",
    name: "Drift Arena Orchestrator",
    status: "active",
    description: "Active MCP server for Drift Arena Orchestrator Agent",
    capabilities: ["drift-racing", "arena-battles", "high-speed-optimization"],
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    const targetMethod = body.method || body.action || body.command;
    const reqId = body.id || null;
    const isJsonRpc = body.jsonrpc === '2.0' || reqId !== null;

    const respond = (data: any) => {
       if (isJsonRpc) {
          return NextResponse.json({
             jsonrpc: "2.0",
             id: reqId,
             result: data
          }, { headers });
       }
       return NextResponse.json(data, { headers });
    };

    if (targetMethod === 'initialize') {
      return respond({
        protocolVersion: "2024-11-05",
        capabilities: { tools: {}, prompts: {}, resources: {} },
        serverInfo: { name: "Drift Arena Orchestrator", version: "1.0.0" }
      });
    }

    if (targetMethod === 'tools/list') {
      return respond({ tools: TOOLS });
    }

    if (targetMethod === 'tools/call') {
      const { name, arguments: args } = body.params || {};
      return respond({
        content: [{ type: "text", text: `Executed ${name} successfully.` }]
      });
    }

    if (targetMethod === 'prompts/list') {
      return respond({ prompts: [] });
    }

    if (targetMethod === 'resources/list') {
      return respond({ resources: [] });
    }

    // Default MCP Command Response (Fallback)
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
       return NextResponse.json({
          jsonrpc: "2.0",
          id: reqId,
          result
       }, { headers });
    }

    return NextResponse.json({
      status: "success",
      agent: "Drift Arena Orchestrator",
      response: result,
      receivedAt: new Date().toISOString()
    }, { headers });

  } catch (error) {
    return NextResponse.json({ status: "error", message: "Failed to process MCP command" }, { status: 400 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

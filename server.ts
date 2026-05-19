import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: MCP
  app.get("/api/mcp", (req, res) => {
    res.json({
      protocol: "MCP",
      version: "1.0.0",
      name: "Drift Arena Orchestrator",
      status: "active",
      description: "Active MCP server for Drift Arena Orchestrator Agent",
      capabilities: ["drift-racing", "arena-battles", "high-speed-optimization"],
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/mcp", (req, res) => {
    try {
      const body = req.body;
      const targetAction = body.action || body.command || body.method;

      if (targetAction === 'initialize') {
        return res.json({
          protocolVersion: "2024-11-05",
          capabilities: { tools: {}, prompts: {}, resources: {} },
          serverInfo: { name: "Drift Arena Orchestrator", version: "1.0.0" }
        });
      }

      if (targetAction === 'tools/list') {
        return res.json({
          tools: [
            { name: "get_race_status", description: "Get the current status of the race", inputSchema: { type: "object", properties: {}, required: [] } },
            { name: "start_race", description: "Start a new race", inputSchema: { type: "object", properties: {}, required: [] } },
            { name: "get_leaderboard", description: "Get the current arena leaderboard", inputSchema: { type: "object", properties: {}, required: [] } },
            { name: "optimize_speed", description: "Optimize drifter speed settings", inputSchema: { type: "object", properties: {}, required: [] } },
            { name: "get_track_info", description: "Get information about the current track", inputSchema: { type: "object", properties: {}, required: [] } }
          ]
        });
      }

      if (targetAction === 'tools/call') {
        const { name } = body.params || {};
        return res.json({
          content: [{ type: "text", text: `Executed ${name} successfully.` }]
        });
      }

      if (targetAction === 'prompts/list') {
        return res.json({ prompts: [] });
      }

      if (targetAction === 'resources/list') {
        return res.json({ resources: [] });
      }

      let result: any = {};
      switch (targetAction) {
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

      res.json({
        status: "success",
        agent: "Drift Arena Orchestrator",
        response: result,
        receivedAt: new Date().toISOString()
      });

    } catch (error) {
      res.status(400).json({
        status: "error",
        message: "Failed to process MCP command"
      });
    }
  });

  // API Route: Agent
  app.get("/api/agent", (req, res) => {
    res.json({
      name: "Drift Arena Orchestrator",
      status: "active",
      wallet: "0xe157F1F5e12adB38Ba013683E9Ce24efe21e5bA6",
      platform: "Drift Arena",
      version: "1.0.0"
    });
  });

  // Static Assets from public (prioritized before Vite so well-known works)
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // For Express 4
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

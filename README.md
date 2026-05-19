# Echo Drift Arena

Welcome to **Echo Drift Arena**, a high-octane, futuristic drifting battle arena game built on Base Mainnet. Compete in neon-lit arenas where drifting isn't just for speed — it's a weapon.

## Core Features
- **Mobile-First Gameplay:** Smooth touch-based drifting mechanics designed for performance.
- **Echo Wave Combat:** Send powerful echo waves while drifting to attack opponents.
- **On-chain Integration (Base Mainnet):** 
  - Save your Arena Score to the blockchain utilizing ERC-8021 tracking.
  - Integration with ERC-8004 Trustless Agents.
- **MCP API Support:** Includes Model Context Protocol support for agent execution.

## Trustless Agent Configuration
The in-game agent (`Drift Arena Orchestrator`) supports multi-race orchestration and high-speed optimization.
Our agent leverages the following capabilities:
- `warp-racing`
- `real-time-automation`
- `multi-track-management`
- `speed-optimization`
- `competitive-orchestration`
- `ecosystem-coordination`

You can find the agent card metadata here:
`/.well-known/agent-card.json`

## API Endpoints
- `GET /api/agent` - Returns agent definition and wallet address.
- `GET /api/mcp` - MCP active protocol version and capabilities.
- `POST /api/mcp` - MCP tools execution endpoint.

## MCP Protocol Setup
The platform supports MCP (Model Context Protocol). Available tools:
- `get_race_status`
- `start_race`
- `get_leaderboard`
- `optimize_speed`
- `get_track_info`

## Technical Stack
- App Engine: React, Canvas, Framer Motion
- Setup: Vite / NextJS App Router support format
- Networking/Crypto: Wagmi, Viem
- Styling: Tailwind CSS

## Setup
```bash
npm install
npm run dev
```

Get behind the wheel, dominate the arena, and leave your echo on the blockchain!

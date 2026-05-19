import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: "Drift Arena Orchestrator",
    status: "active",
    wallet: "0xe157F1F5e12adB38Ba013683E9Ce24efe21e5bA6",
    platform: "Drift Arena",
    version: "1.0.0"
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      status: "success",
      received: body,
      agent: "Drift Arena Orchestrator"
    });
  } catch (e) {
    return NextResponse.json({ status: "error", message: "Invalid request payload" }, { status: 400 });
  }
}

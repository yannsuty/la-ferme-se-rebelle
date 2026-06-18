import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    app: "ok",
    database: "unknown",
    timestamp: new Date().toISOString(),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  const healthy = checks.database === "ok";

  return NextResponse.json(checks, { status: healthy ? 200 : 503 });
}

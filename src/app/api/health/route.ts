import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {
    app: "ok",
    database: "unknown",
    timestamp: new Date().toISOString(),
  };

  if (!process.env.DATABASE_URL) {
    checks.database = "missing_env";
    return NextResponse.json(checks, { status: 503 });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  const healthy = checks.database === "ok";
  return NextResponse.json(checks, { status: healthy ? 200 : 503 });
}

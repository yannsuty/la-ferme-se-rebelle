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

    const [userCount, membershipCount, farmCount] = await Promise.all([
      prisma.user.count({ where: { active: true } }),
      prisma.farmMembership.count({ where: { active: true } }),
      prisma.farm.count({ where: { active: true } }),
    ]);

    checks.users = String(userCount);
    checks.memberships = String(membershipCount);
    checks.farms = String(farmCount);

    if (userCount > 0 && membershipCount === 0) {
      checks.auth = "users_without_memberships";
    }
  } catch {
    checks.database = "error";
  }

  const healthy = checks.database === "ok";
  return NextResponse.json(checks, { status: healthy ? 200 : 503 });
}

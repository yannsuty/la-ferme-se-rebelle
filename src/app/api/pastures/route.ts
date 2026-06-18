import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { pastureSchema } from "@/lib/validations";

export async function GET() {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const pastures = await prisma.pasture.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(pastures);
}

export async function POST(request: Request) {
  const authResult = await requireAuth(["OWNER"]);
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const parsed = pastureSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const pasture = await prisma.pasture.create({
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      description: parsed.data.description,
      geometry: parsed.data.geometry,
      color: parsed.data.color ?? "#22c55e",
    },
  });

  return NextResponse.json(pasture, { status: 201 });
}

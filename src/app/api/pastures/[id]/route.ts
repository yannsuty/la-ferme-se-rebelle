import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { pastureSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const authResult = await requireAuth(["OWNER"]);
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const body = await request.json();
  const parsed = pastureSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const pasture = await prisma.pasture.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(pasture);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const authResult = await requireAuth(["OWNER"]);
  if (authResult.error) return authResult.error;

  const { id } = await params;

  await prisma.pasture.update({
    where: { id },
    data: { active: false },
  });

  return NextResponse.json({ success: true });
}

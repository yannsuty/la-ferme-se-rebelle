import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { updateUserSchema } from "@/lib/validations";
import { hashPassword } from "@/lib/password";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const authResult = await requireAuth(["OWNER"]);
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.password) {
    data.passwordHash = await hashPassword(parsed.data.password);
    delete data.password;
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const authResult = await requireAuth(["OWNER"]);
  if (authResult.error) return authResult.error;

  const { id } = await params;

  if (authResult.session!.user.id === id) {
    return NextResponse.json(
      { error: "Impossible de supprimer votre propre compte" },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id },
    data: { active: false },
  });

  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { createUserSchema } from "@/lib/validations";
import { hashPassword } from "@/lib/password";

export async function GET() {
  const authResult = await requireAuth(["OWNER"]);
  if (authResult.error) return authResult.error;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const authResult = await requireAuth(["OWNER"]);
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (existing) {
    return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email.toLowerCase(),
      name: parsed.data.name,
      role: parsed.data.role,
      passwordHash: await hashPassword(parsed.data.password),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}

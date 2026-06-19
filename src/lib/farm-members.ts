import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import type { CreateUserInput } from "@/lib/validations";
import type { Role } from "@/lib/roles";

export type FarmMemberRow = {
  id: string;
  membershipId: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
};

export async function listFarmMembers(farmId: string): Promise<FarmMemberRow[]> {
  const members = await prisma.farmMembership.findMany({
    where: { farmId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return members.map((member) => ({
    id: member.user.id,
    membershipId: member.id,
    email: member.user.email,
    name: member.user.name,
    role: member.role,
    active: member.active,
  }));
}

export async function addFarmMember(
  farmId: string,
  input: CreateUserInput,
): Promise<FarmMemberRow | "already_member"> {
  const email = input.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        where: { farmId },
      },
    },
  });

  if (existingUser?.memberships.length) {
    return "already_member";
  }

  const passwordHash = await hashPassword(input.password);

  const member = await prisma.$transaction(async (tx) => {
    const user =
      existingUser ??
      (await tx.user.create({
        data: {
          email,
          name: input.name,
          passwordHash,
        },
      }));

    const membership = await tx.farmMembership.create({
      data: {
        userId: user.id,
        farmId,
        role: input.role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return membership;
  });

  return {
    id: member.user.id,
    membershipId: member.id,
    email: member.user.email,
    name: member.user.name,
    role: member.role,
    active: member.active,
  };
}

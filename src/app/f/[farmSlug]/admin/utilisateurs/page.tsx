import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UsersManager } from "@/components/admin/users-manager";
import { getFarmAccess } from "@/lib/farm-auth";
import { auth } from "@/lib/auth";
import { canManageUsers } from "@/lib/permissions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ farmSlug: string }>;
};

export default async function AdminUsersPage({ params }: PageProps) {
  const { farmSlug } = await params;
  const session = await auth();
  if (!session?.user) notFound();

  const access = await getFarmAccess(farmSlug, session.user.id);
  if (!access || !canManageUsers(access.membership.role)) notFound();

  const members = await prisma.farmMembership.findMany({
    where: { farmId: access.farm.id },
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

  const users = members.map((member) => ({
    id: member.user.id,
    membershipId: member.id,
    email: member.user.email,
    name: member.user.name,
    role: member.role,
    active: member.active,
  }));

  return (
    <div className="space-y-4">
      <header>
        <p className="text-sm uppercase tracking-wide text-emerald-700/80">
          {access.farm.name}
        </p>
        <h1 className="text-3xl font-bold">Comptes de l'équipe</h1>
        <p className="text-emerald-800/80">
          Gérez les accès à cette ferme. Un même email peut appartenir à
          plusieurs fermes.
        </p>
      </header>
      <UsersManager
        farmSlug={farmSlug}
        initialUsers={users}
        actorRole={access.membership.role}
      />
    </div>
  );
}

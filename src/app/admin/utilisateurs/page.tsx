import { prisma } from "@/lib/prisma";
import { UsersManager } from "@/components/admin/users-manager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-bold">Comptes employés et patrons</h1>
        <p className="text-emerald-800/80">
          Créez et gérez les accès à l&apos;application.
        </p>
      </header>
      <UsersManager initialUsers={users} />
    </div>
  );
}

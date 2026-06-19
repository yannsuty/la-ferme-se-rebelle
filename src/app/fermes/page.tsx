import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { farmPath } from "@/lib/farm-path";
import { roleLabel } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function FarmsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/connexion");
  }

  if (session.farms.length === 1) {
    redirect(farmPath(session.farms[0].slug));
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Vos fermes</h1>
        <p className="text-emerald-800/80">
          Choisissez la ferme à gérer. Vous pouvez appartenir à plusieurs
          exploitations avec des rôles différents.
        </p>
        {session.isSystemAdmin && (
          <p className="mt-2">
            <a
              href="/admin/fermes"
              className="text-sm font-medium text-emerald-700 underline"
              data-testid="admin-link"
            >
              Administration système →
            </a>
          </p>
        )}
      </header>

      <ul className="space-y-3" data-testid="farm-list">
        {session.farms.map((farm) => (
          <li key={farm.id}>
            <Link
              href={farmPath(farm.slug)}
              className="flex items-center justify-between rounded-xl border border-emerald-200 bg-white px-4 py-4 transition hover:border-emerald-400 hover:bg-emerald-50"
              data-testid={`farm-link-${farm.slug}`}
            >
              <div>
                <p className="font-semibold text-emerald-950">{farm.name}</p>
                <p className="text-sm text-emerald-800/70">/{farm.slug}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium uppercase text-emerald-800">
                {roleLabel(farm.role)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

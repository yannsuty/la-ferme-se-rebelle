import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getFarmAccess } from "@/lib/farm-auth";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ farmSlug: string }>;
};

export default async function TachesPage({ params }: PageProps) {
  const { farmSlug } = await params;
  const session = await auth();
  if (!session?.user) notFound();

  const access = await getFarmAccess(farmSlug, session.user.id);
  if (!access) notFound();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-emerald-700/80">
          {access.farm.name}
        </p>
        <h1 className="text-3xl font-bold">Liste de tâches</h1>
        <p className="text-emerald-800/80">
          Suivez les travaux à réaliser sur la ferme.
        </p>
      </header>

      <article
        className="rounded-xl border border-dashed border-emerald-300 bg-white p-6 text-center text-emerald-800/80"
        data-testid="tasks-placeholder"
      >
        <p>Aucune tâche pour le moment.</p>
        <p className="mt-2 text-sm">Cette section sera bientôt disponible.</p>
      </article>
    </div>
  );
}

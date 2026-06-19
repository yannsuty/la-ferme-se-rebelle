import { SystemManager } from "@/components/admin/system-manager";
import { canResetDatabase } from "@/lib/env";

export const dynamic = "force-dynamic";

export default function AdminSystemPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Administration système</h1>
        <p className="text-emerald-800/80">
          Outils de maintenance pour les environnements de test.
        </p>
      </header>
      <SystemManager canReset={canResetDatabase()} />
    </div>
  );
}

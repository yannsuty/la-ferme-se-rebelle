"use client";

import { FormEvent, useState } from "react";

type Props = {
  canReset: boolean;
};

export function SystemManager({ canReset }: Props) {
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!canReset) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-white p-4 text-sm text-emerald-900">
        La réinitialisation de la base est désactivée en production.
      </div>
    );
  }

  async function handleReset(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/database/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Réinitialisation impossible");
        return;
      }

      setSuccess(data.message ?? "Base réinitialisée");
      setConfirmation("");
    } catch {
      setError("Erreur réseau lors de la réinitialisation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-semibold">Attention</p>
        <p className="mt-1">
          Cette action supprime toutes les données (fermes, utilisateurs, pâtures,
          affectations) puis réapplique le seed de démonstration. Réservé aux
          environnements develop et staging.
        </p>
      </div>

      <form
        onSubmit={handleReset}
        className="space-y-3 rounded-xl border border-emerald-200 bg-white p-4"
        data-testid="database-reset-form"
      >
        <h2 className="text-lg font-semibold">Réinitialiser la base</h2>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-emerald-700">{success}</p>}
        <label className="block text-sm">
          Saisissez <strong>REINITIALISER</strong> pour confirmer
          <input
            type="text"
            required
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2"
            data-testid="reset-confirmation-input"
          />
        </label>
        <button
          type="submit"
          disabled={loading || confirmation !== "REINITIALISER"}
          className="rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50"
          data-testid="reset-submit"
        >
          {loading ? "Réinitialisation…" : "Purger et re-seeder"}
        </button>
      </form>
    </div>
  );
}

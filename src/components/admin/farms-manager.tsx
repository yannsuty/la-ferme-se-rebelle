"use client";

import { FormEvent, useState } from "react";

type FarmRow = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  memberCount: number;
  pastureCount: number;
};

type Props = {
  initialFarms: FarmRow[];
};

export function FarmsManager({ initialFarms }: Props) {
  const [farms, setFarms] = useState<FarmRow[]>(initialFarms);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    managerName: "",
    managerEmail: "",
    managerPassword: "",
  });

  async function loadFarms() {
    const response = await fetch("/api/admin/farms");
    if (!response.ok) {
      setError("Impossible de charger les fermes");
      return;
    }
    setFarms(await response.json());
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const payload = {
      name: form.name,
      ...(form.slug ? { slug: form.slug } : {}),
      manager: {
        name: form.managerName,
        email: form.managerEmail,
        password: form.managerPassword,
      },
    };

    const response = await fetch("/api/admin/farms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Erreur à la création");
      return;
    }

    setForm({
      name: "",
      slug: "",
      managerName: "",
      managerEmail: "",
      managerPassword: "",
    });
    await loadFarms();
  }

  async function toggleActive(farm: FarmRow) {
    await fetch(`/api/admin/farms/${farm.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !farm.active }),
    });
    await loadFarms();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="grid gap-3 rounded-xl border border-emerald-200 bg-white p-4 md:grid-cols-2"
        data-testid="create-farm-form"
      >
        <h2 className="md:col-span-2 text-lg font-semibold">Nouvelle ferme</h2>
        {error && <p className="md:col-span-2 text-sm text-red-600">{error}</p>}
        <input
          placeholder="Nom de la ferme"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-lg border border-emerald-200 px-3 py-2"
          data-testid="farm-name-input"
        />
        <input
          placeholder="Slug (optionnel, généré automatiquement)"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="rounded-lg border border-emerald-200 px-3 py-2"
          data-testid="farm-slug-input"
        />
        <p className="md:col-span-2 text-sm font-medium text-emerald-800">
          Compte gérant initial
        </p>
        <input
          placeholder="Nom du gérant"
          required
          value={form.managerName}
          onChange={(e) => setForm({ ...form, managerName: e.target.value })}
          className="rounded-lg border border-emerald-200 px-3 py-2"
          data-testid="farm-manager-name-input"
        />
        <input
          type="email"
          placeholder="Email du gérant"
          required
          value={form.managerEmail}
          onChange={(e) => setForm({ ...form, managerEmail: e.target.value })}
          className="rounded-lg border border-emerald-200 px-3 py-2"
          data-testid="farm-manager-email-input"
        />
        <input
          type="password"
          placeholder="Mot de passe du gérant"
          required
          minLength={8}
          value={form.managerPassword}
          onChange={(e) => setForm({ ...form, managerPassword: e.target.value })}
          className="md:col-span-2 rounded-lg border border-emerald-200 px-3 py-2"
          data-testid="farm-manager-password-input"
        />
        <button
          type="submit"
          className="md:col-span-2 rounded-lg bg-emerald-600 px-4 py-2 text-white"
          data-testid="create-farm-submit"
        >
          Créer la ferme
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-emerald-200 bg-white">
        <table className="min-w-full text-sm" data-testid="farms-table">
          <thead className="bg-emerald-50 text-left">
            <tr>
              <th className="px-4 py-2">Nom</th>
              <th className="px-4 py-2">Slug</th>
              <th className="px-4 py-2">Membres</th>
              <th className="px-4 py-2">Parcelles</th>
              <th className="px-4 py-2">Statut</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {farms.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-4">
                  Aucune ferme
                </td>
              </tr>
            ) : (
              farms.map((farm) => (
                <tr key={farm.id} className="border-t border-emerald-100">
                  <td className="px-4 py-2 font-medium">{farm.name}</td>
                  <td className="px-4 py-2 text-emerald-800/70">/{farm.slug}</td>
                  <td className="px-4 py-2">{farm.memberCount}</td>
                  <td className="px-4 py-2">{farm.pastureCount}</td>
                  <td className="px-4 py-2">{farm.active ? "Active" : "Inactive"}</td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => toggleActive(farm)}
                      className="text-emerald-700 underline"
                    >
                      {farm.active ? "Désactiver" : "Réactiver"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

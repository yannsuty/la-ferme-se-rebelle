"use client";

import { FormEvent, useState } from "react";
import { PastureDrawMap } from "@/components/map/pasture-draw-map";
import type { PastureData } from "@/components/map/pasture-map";
import { formatParcelType } from "@/lib/geo";
import type { PastureInput } from "@/lib/validations";

type GeoPolygon = PastureInput["geometry"];

type Props = {
  initialPastures: PastureData[];
};

type FormState = {
  name: string;
  type: "PASTURE" | "FIELD";
  description: string;
  color: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  type: "PASTURE",
  description: "",
  color: "#22c55e",
};

export function PasturesManager({ initialPastures }: Props) {
  const [pastures, setPastures] = useState<PastureData[]>(initialPastures);
  const [mode, setMode] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [geometry, setGeometry] = useState<GeoPolygon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadPastures() {
    const response = await fetch("/api/pastures");
    if (!response.ok) {
      setError("Impossible de charger les parcelles");
      return;
    }
    setPastures(await response.json());
  }

  function openCreateForm() {
    setMode("form");
    setEditingId(null);
    setForm(EMPTY_FORM);
    setGeometry(null);
    setError(null);
    setMessage(null);
  }

  function openEditForm(pasture: PastureData) {
    setMode("form");
    setEditingId(pasture.id);
    setForm({
      name: pasture.name,
      type: pasture.type,
      description: pasture.description ?? "",
      color: pasture.color,
    });
    setGeometry(pasture.geometry);
    setError(null);
    setMessage(null);
  }

  function cancelForm() {
    setMode("list");
    setEditingId(null);
    setForm(EMPTY_FORM);
    setGeometry(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!geometry) {
      setError("Tracez un polygone sur la carte avant d'enregistrer");
      return;
    }

    setLoading(true);

    const payload = {
      name: form.name,
      type: form.type,
      description: form.description || undefined,
      color: form.color,
      geometry,
    };

    const response = await fetch(
      editingId ? `/api/pastures/${editingId}` : "/api/pastures",
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    setLoading(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Erreur lors de l'enregistrement");
      return;
    }

    await loadPastures();
    setMessage(editingId ? "Parcelle mise à jour" : "Parcelle créée");
    cancelForm();
  }

  async function handleDelete(pasture: PastureData) {
    if (
      !window.confirm(
        `Supprimer la parcelle « ${pasture.name} » ? Cette action est irréversible.`,
      )
    ) {
      return;
    }

    setError(null);
    setMessage(null);
    setLoading(true);

    const response = await fetch(`/api/pastures/${pasture.id}`, {
      method: "DELETE",
    });

    setLoading(false);

    if (!response.ok) {
      setError("Impossible de supprimer la parcelle");
      return;
    }

    await loadPastures();
    setMessage(`Parcelle « ${pasture.name} » supprimée`);
  }

  if (mode === "form") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">
            {editingId ? "Modifier la parcelle" : "Nouvelle parcelle"}
          </h2>
          <button
            type="button"
            onClick={cancelForm}
            className="rounded-lg border border-emerald-200 px-3 py-2 text-sm text-emerald-900 hover:bg-emerald-50"
            data-testid="cancel-pasture-form"
          >
            Annuler
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-xl border border-emerald-200 bg-white p-4 lg:grid-cols-2"
          data-testid="pasture-form"
        >
          <div className="space-y-3">
            <label className="block text-sm">
              Nom
              <input
                required
                minLength={2}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2"
                data-testid="pasture-name-input"
              />
            </label>

            <label className="block text-sm">
              Type
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value as "PASTURE" | "FIELD",
                  })
                }
                className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2"
                data-testid="pasture-type-select"
              >
                <option value="PASTURE">Pâture</option>
                <option value="FIELD">Champ</option>
              </select>
            </label>

            <label className="block text-sm">
              Couleur
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-emerald-200"
                data-testid="pasture-color-input"
              />
            </label>

            <label className="block text-sm">
              Description (optionnel)
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2"
                rows={3}
              />
            </label>

            <p className="text-sm text-emerald-800/80">
              Utilisez l&apos;outil en haut à droite de la carte pour dessiner
              ou modifier le polygone de la parcelle.
            </p>

            {error && (
              <p className="text-sm text-red-600" data-testid="pasture-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              data-testid="save-pasture"
            >
              {loading
                ? "Enregistrement..."
                : editingId
                  ? "Mettre à jour"
                  : "Créer la parcelle"}
            </button>
          </div>

          <PastureDrawMap
            pastures={pastures}
            geometry={geometry}
            drawColor={form.color}
            excludePastureId={editingId}
            onGeometryChange={setGeometry}
          />
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-emerald-800/80">
          Créez et modifiez les parcelles directement sur la carte.
        </p>
        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          data-testid="new-pasture-button"
        >
          Nouvelle parcelle
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600" data-testid="pasture-error">
          {error}
        </p>
      )}
      {message && (
        <p className="text-sm text-emerald-700" data-testid="pasture-message">
          {message}
        </p>
      )}

      <ul className="space-y-2" data-testid="pastures-list">
        {pastures.length === 0 && (
          <li className="rounded-xl border border-dashed border-emerald-200 bg-white px-4 py-6 text-center text-emerald-800/70">
            Aucune parcelle enregistrée. Créez la première sur la carte.
          </li>
        )}
        {pastures.map((pasture) => {
          const pointCount = pasture.geometry.coordinates[0]?.length ?? 0;
          return (
            <li
              key={pasture.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="inline-block h-4 w-4 rounded"
                  style={{ backgroundColor: pasture.color }}
                />
                <div>
                  <p className="font-medium">{pasture.name}</p>
                  <p className="text-sm text-emerald-800/70">
                    {formatParcelType(pasture.type)} — {pointCount} points
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEditForm(pasture)}
                  className="rounded-lg border border-emerald-200 px-3 py-1.5 text-sm text-emerald-900 hover:bg-emerald-50"
                  data-testid={`edit-pasture-${pasture.id}`}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(pasture)}
                  disabled={loading}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
                  data-testid={`delete-pasture-${pasture.id}`}
                >
                  Supprimer
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

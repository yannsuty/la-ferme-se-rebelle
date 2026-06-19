"use client";

import { useState } from "react";
import { PastureMap, type GrazingData, type PastureData } from "./pasture-map";
import { formatSessionLabel, todayIsoDate } from "@/lib/geo";
import { farmApiPath } from "@/lib/farm-path";
import { ActionsIcon, CloseIcon } from "@/components/icons/nav-icons";

type Props = {
  farmSlug: string;
  pastures: PastureData[];
  initialAssignments: GrazingData[];
};

export function GrazingPanel({ farmSlug, pastures, initialAssignments }: Props) {
  const [date, setDate] = useState(todayIsoDate());
  const [session, setSession] = useState<"MORNING" | "EVENING">("MORNING");
  const [selectedPastureId, setSelectedPastureId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  const dayAssignments = assignments.filter((a) => a.date.startsWith(date));

  async function saveAssignment() {
    if (!selectedPastureId) {
      setMessage("Sélectionnez une parcelle sur la carte");
      return;
    }

    setLoading(true);
    setMessage(null);

    const response = await fetch(farmApiPath(farmSlug, "/grazing"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        session,
        pastureId: selectedPastureId,
        notes: notes || undefined,
      }),
    });

    setLoading(false);

    if (!response.ok) {
      setMessage("Erreur lors de l'enregistrement");
      return;
    }

    const saved = await response.json();
    setAssignments((prev) => {
      const filtered = prev.filter(
        (a) => !(a.date.startsWith(date) && a.session === session),
      );
      return [...filtered, saved];
    });
    setMessage(`Sortie définie : ${formatSessionLabel(session)}`);
  }

  return (
    <div className="relative h-full">
      <PastureMap
        pastures={pastures}
        assignments={dayAssignments}
        selectedPastureId={selectedPastureId}
        onSelectPasture={setSelectedPastureId}
        className="h-full"
      />

      <button
        type="button"
        onClick={() => setActionsOpen((open) => !open)}
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-[1000] flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 md:bottom-4"
        data-testid="toggle-actions"
        aria-label={actionsOpen ? "Masquer les actions" : "Afficher les actions"}
        aria-expanded={actionsOpen}
      >
        {actionsOpen ? (
          <CloseIcon className="h-6 w-6" />
        ) : (
          <ActionsIcon className="h-6 w-6" />
        )}
      </button>

      {actionsOpen && (
        <button
          type="button"
          className="fixed inset-0 top-[49px] bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[999] bg-emerald-950/30 md:bottom-0"
          aria-label="Fermer le panneau d'actions"
          onClick={() => setActionsOpen(false)}
          data-testid="actions-backdrop"
        />
      )}

      <section
        className={`fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[1000] max-h-[75dvh] overflow-y-auto rounded-t-2xl border-t border-emerald-200 bg-white p-4 shadow-2xl transition-transform duration-300 ease-out md:bottom-0 ${
          actionsOpen ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
        data-testid="grazing-panel"
        aria-hidden={!actionsOpen}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-emerald-200" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-emerald-950">
              Sortie après traite
            </h2>
            <label className="block text-sm">
              Date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2"
                data-testid="grazing-date"
              />
            </label>
            <div className="flex gap-2">
              {(["MORNING", "EVENING"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSession(value)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm ${
                    session === value
                      ? "bg-emerald-600 text-white"
                      : "border border-emerald-200 text-emerald-900"
                  }`}
                  data-testid={`session-${value.toLowerCase()}`}
                >
                  {formatSessionLabel(value)}
                </button>
              ))}
            </div>
            <label className="block text-sm">
              Notes (optionnel)
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2"
                rows={2}
              />
            </label>
            <button
              type="button"
              onClick={saveAssignment}
              disabled={loading}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              data-testid="save-grazing"
            >
              {loading ? "Enregistrement..." : "Enregistrer la sortie"}
            </button>
            {message && (
              <p className="text-sm text-emerald-700" data-testid="grazing-message">
                {message}
              </p>
            )}
          </div>

          <div>
            <h3 className="mb-2 font-medium text-emerald-950">Affectations du jour</h3>
            <ul className="space-y-2 text-sm" data-testid="assignments-list">
              {dayAssignments.length === 0 && (
                <li className="text-emerald-700/70">Aucune sortie définie</li>
              )}
              {dayAssignments.map((assignment) => (
                <li
                  key={assignment.id}
                  className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2"
                >
                  <strong>{formatSessionLabel(assignment.session)}</strong> →{" "}
                  {assignment.pasture.name}
                  <br />
                  <span className="text-emerald-800/70">
                    Par {assignment.assignedBy.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

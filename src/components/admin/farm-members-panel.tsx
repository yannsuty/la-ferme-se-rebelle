"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Role } from "@/lib/roles";
import { roleLabel } from "@/lib/roles";

type MemberRow = {
  id: string;
  membershipId: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
};

type Props = {
  farmId: string;
  onMembersChanged?: () => void | Promise<void>;
};

const ROLES: Role[] = ["OWNER", "MANAGER", "EMPLOYEE"];

export function FarmMembersPanel({ farmId, onMembersChanged }: Props) {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE" as Role,
  });

  async function loadMembers() {
    setLoading(true);
    const response = await fetch(`/api/admin/farms/${farmId}/members`);
    if (!response.ok) {
      setError("Impossible de charger les membres");
      setLoading(false);
      return;
    }
    setMembers(await response.json());
    setLoading(false);
  }

  useEffect(() => {
    void loadMembers();
  }, [farmId]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const response = await fetch(`/api/admin/farms/${farmId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Erreur à l'ajout");
      return;
    }

    setForm({ name: "", email: "", password: "", role: "EMPLOYEE" });
    await loadMembers();
    await onMembersChanged?.();
  }

  return (
    <div
      className="space-y-4 border-t border-emerald-100 bg-emerald-50/40 px-4 py-4"
      data-testid={`farm-members-panel-${farmId}`}
    >
      <h3 className="font-medium text-emerald-900">Membres de la ferme</h3>
      {loading ? (
        <p className="text-sm text-emerald-800/70">Chargement…</p>
      ) : (
        <>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <form
            onSubmit={handleCreate}
            className="grid gap-2 rounded-lg border border-emerald-200 bg-white p-3 md:grid-cols-2"
            data-testid="add-farm-member-form"
          >
            <p className="md:col-span-2 text-sm font-medium">Ajouter un membre</p>
            <input
              placeholder="Nom"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-emerald-200 px-3 py-2 text-sm"
              data-testid="member-name-input"
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-lg border border-emerald-200 px-3 py-2 text-sm"
              data-testid="member-email-input"
            />
            <input
              type="password"
              placeholder="Mot de passe"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="rounded-lg border border-emerald-200 px-3 py-2 text-sm"
              data-testid="member-password-input"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              className="rounded-lg border border-emerald-200 px-3 py-2 text-sm"
              data-testid="member-role-select"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role)}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="md:col-span-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white"
              data-testid="add-member-submit"
            >
              Ajouter le membre
            </button>
          </form>
          <table className="min-w-full text-sm" data-testid="farm-members-table">
            <thead>
              <tr className="text-left text-emerald-800/70">
                <th className="px-2 py-1">Nom</th>
                <th className="px-2 py-1">Email</th>
                <th className="px-2 py-1">Rôle</th>
                <th className="px-2 py-1">Statut</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-2 py-2">
                    Aucun membre
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.membershipId} className="border-t border-emerald-100">
                    <td className="px-2 py-1">{member.name}</td>
                    <td className="px-2 py-1">{member.email}</td>
                    <td className="px-2 py-1">{roleLabel(member.role)}</td>
                    <td className="px-2 py-1">
                      {member.active ? "Actif" : "Inactif"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

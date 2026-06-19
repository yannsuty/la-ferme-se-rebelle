"use client";

import { FormEvent, useState } from "react";
import { farmApiPath } from "@/lib/farm-path";
import type { Role } from "@/lib/roles";
import { roleLabel } from "@/lib/roles";
import { canAssignRole, canModifyMember } from "@/lib/permissions";

type UserRow = {
  id: string;
  membershipId: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
};

type Props = {
  farmSlug: string;
  initialUsers: UserRow[];
  actorRole: Role;
};

const ASSIGNABLE_ROLES: Role[] = ["OWNER", "MANAGER", "EMPLOYEE"];

export function UsersManager({ farmSlug, initialUsers, actorRole }: Props) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [error, setError] = useState<string | null>(null);
  const assignableRoles = ASSIGNABLE_ROLES.filter((role) =>
    canAssignRole(actorRole, role),
  );
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: (assignableRoles[0] ?? "EMPLOYEE") as Role,
  });

  async function loadUsers() {
    const response = await fetch(farmApiPath(farmSlug, "/users"));
    if (!response.ok) {
      setError("Impossible de charger les utilisateurs");
      return;
    }
    setUsers(await response.json());
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const response = await fetch(farmApiPath(farmSlug, "/users"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Erreur à la création");
      return;
    }

    setForm({
      email: "",
      password: "",
      name: "",
      role: assignableRoles[0] ?? "EMPLOYEE",
    });
    await loadUsers();
  }

  async function toggleActive(user: UserRow) {
    if (!canModifyMember(actorRole, user.role)) {
      setError("Vous ne pouvez pas modifier ce membre");
      return;
    }

    await fetch(farmApiPath(farmSlug, `/users/${user.id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !user.active }),
    });
    await loadUsers();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="grid gap-3 rounded-xl border border-emerald-200 bg-white p-4 md:grid-cols-2"
        data-testid="create-user-form"
      >
        <h2 className="md:col-span-2 text-lg font-semibold">Nouveau membre</h2>
        {error && <p className="md:col-span-2 text-sm text-red-600">{error}</p>}
        <input
          placeholder="Nom"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-lg border border-emerald-200 px-3 py-2"
          data-testid="user-name-input"
        />
        <input
          type="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded-lg border border-emerald-200 px-3 py-2"
          data-testid="user-email-input"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="rounded-lg border border-emerald-200 px-3 py-2"
          data-testid="user-password-input"
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
          className="rounded-lg border border-emerald-200 px-3 py-2"
          data-testid="user-role-select"
        >
          {assignableRoles.map((role) => (
            <option key={role} value={role}>
              {roleLabel(role)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="md:col-span-2 rounded-lg bg-emerald-600 px-4 py-2 text-white"
          data-testid="create-user-submit"
        >
          Ajouter à la ferme
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-emerald-200 bg-white">
        <table className="min-w-full text-sm" data-testid="users-table">
          <thead className="bg-emerald-50 text-left">
            <tr>
              <th className="px-4 py-2">Nom</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Rôle</th>
              <th className="px-4 py-2">Statut</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-4">
                  Aucun membre
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const canModify = canModifyMember(actorRole, user.role);
                return (
                  <tr key={user.membershipId} className="border-t border-emerald-100">
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">{roleLabel(user.role)}</td>
                    <td className="px-4 py-2">
                      {user.active ? "Actif" : "Inactif"}
                    </td>
                    <td className="px-4 py-2">
                      {canModify ? (
                        <button
                          type="button"
                          onClick={() => toggleActive(user)}
                          className="text-emerald-700 underline"
                        >
                          {user.active ? "Retirer" : "Réactiver"}
                        </button>
                      ) : (
                        <span className="text-emerald-800/50">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Identifiants incorrects");
      return;
    }

    const callbackUrl = searchParams.get("callbackUrl") ?? "/fermes";
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-4 rounded-2xl border border-emerald-200 bg-white p-6 shadow-lg"
      data-testid="login-form"
    >
      <div>
        <h1 className="text-2xl font-bold text-emerald-950">Connexion</h1>
        <p className="text-sm text-emerald-800/80">
          Accédez à la gestion de la ferme laitière
        </p>
      </div>

      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700" data-testid="login-error">
          {error}
        </p>
      )}

      <label className="block space-y-1 text-sm">
        <span>Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-emerald-200 px-3 py-2"
          data-testid="login-email"
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span>Mot de passe</span>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-emerald-200 px-3 py-2"
          data-testid="login-password"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        data-testid="login-submit"
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}

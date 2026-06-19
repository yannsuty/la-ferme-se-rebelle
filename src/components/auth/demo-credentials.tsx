import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";

export function DemoCredentials() {
  return (
    <aside
      className="w-full max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
      data-testid="demo-credentials"
    >
      <p className="font-semibold">Comptes de test</p>
      <ul className="mt-2 space-y-2">
        {DEMO_ACCOUNTS.map((account) => (
          <li key={account.email}>
            <span className="font-medium">{account.role}</span>
            {" — "}
            <span data-testid={`demo-email-${account.role.toLowerCase()}`}>
              {account.email}
            </span>
            {" / "}
            <span data-testid={`demo-password-${account.role.toLowerCase()}`}>
              {account.password}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

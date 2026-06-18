import { Suspense } from "react";
import { DemoCredentials } from "@/components/auth/demo-credentials";
import { LoginForm } from "@/components/auth/login-form";
import { shouldShowDemoCredentials } from "@/lib/env";

export default function LoginPage() {
  const showDemoCredentials = shouldShowDemoCredentials();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4">
      <Suspense fallback={<p>Chargement...</p>}>
        <LoginForm />
      </Suspense>
      {showDemoCredentials && <DemoCredentials />}
    </div>
  );
}

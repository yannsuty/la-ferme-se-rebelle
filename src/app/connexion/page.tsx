import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Suspense fallback={<p>Chargement...</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

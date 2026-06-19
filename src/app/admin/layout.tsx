import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminNav } from "@/components/layout/admin-nav";

type LayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: LayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/connexion");
  }

  if (!session.isSystemAdmin) {
    redirect("/fermes");
  }

  return (
    <>
      <AdminNav />
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </>
  );
}

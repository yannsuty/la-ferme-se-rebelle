import { notFound } from "next/navigation";
import { getFarmAccess } from "@/lib/farm-auth";
import { auth } from "@/lib/auth";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ farmSlug: string }>;
};

export default async function FarmLayout({ children, params }: LayoutProps) {
  const { farmSlug } = await params;
  const session = await auth();

  if (!session?.user) {
    notFound();
  }

  const access = await getFarmAccess(farmSlug, session.user.id);

  if (!access) {
    notFound();
  }

  return children;
}

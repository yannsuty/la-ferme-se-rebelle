import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { farmPath } from "@/lib/farm-path";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/connexion");
  }

  if (session.farms.length === 1) {
    redirect(farmPath(session.farms[0].slug));
  }

  redirect("/fermes");
}

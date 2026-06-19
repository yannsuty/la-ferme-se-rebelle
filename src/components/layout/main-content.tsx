"use client";

import { usePathname } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

export function MainContent({ children }: Props) {
  const pathname = usePathname();
  const isMapPage = pathname === "/carte";

  if (isMapPage) {
    return (
      <main
        className="fixed inset-x-0 bottom-0 top-[49px] z-0 overflow-hidden"
        data-testid="main-map"
      >
        {children}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
  );
}

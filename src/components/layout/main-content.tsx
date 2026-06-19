"use client";

import { usePathname } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

export function MainContent({ children }: Props) {
  const pathname = usePathname();
  const isMapPage = /\/carte$/.test(pathname);

  if (isMapPage) {
    return (
      <main
        className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] top-[49px] z-0 overflow-hidden md:bottom-0"
        data-testid="main-map"
      >
        {children}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-6">
      {children}
    </main>
  );
}

"use client";

import dynamic from "next/dynamic";
import type { PastureInput } from "@/lib/validations";

export type PastureData = {
  id: string;
  name: string;
  type: "PASTURE" | "FIELD";
  description: string | null;
  geometry: PastureInput["geometry"];
  color: string;
};

export type GrazingData = {
  id: string;
  date: string;
  session: "MORNING" | "EVENING";
  pastureId: string;
  pasture: PastureData;
  notes: string | null;
  assignedBy: { id: string; name: string };
};

type PastureMapProps = {
  pastures: PastureData[];
  assignments: GrazingData[];
  selectedPastureId?: string | null;
  onSelectPasture?: (pastureId: string) => void;
  interactive?: boolean;
  className?: string;
};

const PastureMapInner = dynamic(
  () => import("./pasture-map-inner").then((mod) => mod.PastureMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-emerald-50 text-emerald-800">
        Chargement de la carte...
      </div>
    ),
  },
);

export function PastureMap(props: PastureMapProps) {
  return <PastureMapInner {...props} />;
}

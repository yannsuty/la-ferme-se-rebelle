"use client";

import dynamic from "next/dynamic";
import type { PastureInput } from "@/lib/validations";
import type { PastureData } from "./pasture-map";

type GeoPolygon = PastureInput["geometry"];

type PastureDrawMapProps = {
  pastures: PastureData[];
  geometry: GeoPolygon | null;
  drawColor: string;
  excludePastureId?: string | null;
  onGeometryChange: (geometry: GeoPolygon | null) => void;
  className?: string;
};

const PastureDrawMapInner = dynamic(
  () =>
    import("./pasture-draw-map-inner").then((mod) => mod.PastureDrawMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800">
        Chargement de la carte...
      </div>
    ),
  },
);

export function PastureDrawMap(props: PastureDrawMapProps) {
  return <PastureDrawMapInner {...props} />;
}

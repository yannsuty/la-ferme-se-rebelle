"use client";

import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from "react-leaflet";
import { useEffect } from "react";
import type { PastureData, GrazingData } from "./pasture-map";
import { geoJsonToLeafletLatLngs, getPolygonCenter } from "@/lib/geo";
import "leaflet/dist/leaflet.css";

type Props = {
  pastures: PastureData[];
  assignments: GrazingData[];
  selectedPastureId?: string | null;
  onSelectPasture?: (pastureId: string) => void;
  interactive?: boolean;
};

function FitBounds({ pastures }: { pastures: PastureData[] }) {
  const map = useMap();

  useEffect(() => {
    if (pastures.length === 0) return;
    const allPoints = pastures.flatMap((p) =>
      geoJsonToLeafletLatLngs(p.geometry),
    );
    if (allPoints.length > 0) {
      map.fitBounds(allPoints, { padding: [24, 24] });
    }
  }, [map, pastures]);

  return null;
}

export function PastureMapInner({
  pastures,
  assignments,
  selectedPastureId,
  onSelectPasture,
  interactive = true,
}: Props) {
  const defaultCenter: [number, number] =
    pastures.length > 0
      ? getPolygonCenter(pastures[0].geometry)
      : [47.0, 2.0];

  const assignmentPastureIds = new Set(assignments.map((a) => a.pastureId));

  return (
    <div data-testid="pasture-map" className="h-[480px] overflow-hidden rounded-xl border border-emerald-200">
      <MapContainer
        center={defaultCenter}
        zoom={15}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds pastures={pastures} />
        {pastures.map((pasture) => {
          const positions = geoJsonToLeafletLatLngs(pasture.geometry);
          const isSelected = selectedPastureId === pasture.id;
          const isAssigned = assignmentPastureIds.has(pasture.id);

          return (
            <Polygon
              key={pasture.id}
              positions={positions}
              pathOptions={{
                color: pasture.color,
                fillColor: pasture.color,
                fillOpacity: isSelected ? 0.55 : isAssigned ? 0.4 : 0.25,
                weight: isSelected ? 4 : 2,
              }}
              eventHandlers={
                interactive && onSelectPasture
                  ? { click: () => onSelectPasture(pasture.id) }
                  : undefined
              }
            >
              <Tooltip sticky>
                <strong>{pasture.name}</strong>
                <br />
                {pasture.type === "PASTURE" ? "Pâture" : "Champ"}
              </Tooltip>
            </Polygon>
          );
        })}
      </MapContainer>
    </div>
  );
}

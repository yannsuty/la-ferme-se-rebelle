"use client";

import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import { useEffect, useMemo } from "react";
import type { PastureData, GrazingData } from "./pasture-map";
import {
  escapeHtml,
  geoJsonToLeafletLatLngs,
  getPolygonCenter,
} from "@/lib/geo";
import "leaflet/dist/leaflet.css";

type Props = {
  pastures: PastureData[];
  assignments: GrazingData[];
  selectedPastureId?: string | null;
  onSelectPasture?: (pastureId: string) => void;
  interactive?: boolean;
  className?: string;
};

function FitBounds({ pastures }: { pastures: PastureData[] }) {
  const map = useMap();

  useEffect(() => {
    if (pastures.length === 0) return;
    const allPoints = pastures.flatMap((p) =>
      geoJsonToLeafletLatLngs(p.geometry),
    );
    if (allPoints.length > 0) {
      map.fitBounds(allPoints, { padding: [32, 32] });
    }
  }, [map, pastures]);

  return null;
}

function ParcelLabel({ position, name }: { position: [number, number]; name: string }) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "parcel-label-icon",
        html: `<span class="parcel-label-text">${escapeHtml(name)}</span>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      }),
    [name],
  );

  return <Marker position={position} icon={icon} interactive={false} />;
}

export function PastureMapInner({
  pastures,
  assignments,
  selectedPastureId,
  onSelectPasture,
  interactive = true,
  className = "h-full",
}: Props) {
  const defaultCenter: [number, number] =
    pastures.length > 0
      ? getPolygonCenter(pastures[0].geometry)
      : [47.0, 2.0];

  const assignmentPastureIds = new Set(assignments.map((a) => a.pastureId));

  return (
    <div data-testid="pasture-map" className={`overflow-hidden ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={15}
        className="h-full w-full"
        scrollWheelZoom
        preferCanvas={false}
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
        {pastures.map((pasture) => (
          <ParcelLabel
            key={`label-${pasture.id}`}
            position={getPolygonCenter(pasture.geometry)}
            name={pasture.name}
          />
        ))}
      </MapContainer>
    </div>
  );
}

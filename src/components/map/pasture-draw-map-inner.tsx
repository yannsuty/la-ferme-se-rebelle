"use client";

import L from "leaflet";
import "leaflet-draw";
import {
  MapContainer,
  Polygon,
  TileLayer,
  useMap,
} from "react-leaflet";
import { useCallback, useEffect, useRef } from "react";
import type { PastureInput } from "@/lib/validations";
import {
  geoJsonToLeafletLatLngs,
  getPolygonCenter,
  leafletLatLngsToGeoJson,
} from "@/lib/geo";
import type { PastureData } from "./pasture-map";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

type GeoPolygon = PastureInput["geometry"];

type Props = {
  pastures: PastureData[];
  geometry: GeoPolygon | null;
  drawColor: string;
  excludePastureId?: string | null;
  onGeometryChange: (geometry: GeoPolygon | null) => void;
  className?: string;
};

function polygonLayerToGeoJson(layer: L.Polygon): GeoPolygon {
  const latLngs = layer.getLatLngs();
  const ring = (
    Array.isArray(latLngs[0]) ? (latLngs as L.LatLng[][])[0] : (latLngs as L.LatLng[])
  ).map((ll) => [ll.lat, ll.lng] as [number, number]);
  return leafletLatLngsToGeoJson(ring);
}

function configureDrawLocale() {
  L.drawLocal.draw.toolbar.buttons.polygon = "Dessiner une parcelle";
  L.drawLocal.draw.toolbar.actions.title = "Annuler le dessin";
  L.drawLocal.draw.toolbar.actions.text = "Annuler";
  L.drawLocal.draw.toolbar.finish.title = "Terminer le dessin";
  L.drawLocal.draw.toolbar.finish.text = "Terminer";
  L.drawLocal.draw.toolbar.undo.title = "Supprimer le dernier point";
  L.drawLocal.draw.toolbar.undo.text = "Supprimer le dernier point";
  L.drawLocal.draw.handlers.polygon.tooltip.start =
    "Cliquez pour commencer la parcelle";
  L.drawLocal.draw.handlers.polygon.tooltip.cont =
    "Cliquez pour ajouter un sommet";
  L.drawLocal.draw.handlers.polygon.tooltip.end =
    "Cliquez sur le premier point pour fermer la parcelle";
  L.drawLocal.edit.toolbar.buttons.edit = "Modifier la forme";
  L.drawLocal.edit.toolbar.buttons.editDisabled = "Aucune forme à modifier";
  L.drawLocal.edit.toolbar.buttons.remove = "Supprimer la forme";
  L.drawLocal.edit.toolbar.buttons.removeDisabled = "Aucune forme à supprimer";
  L.drawLocal.edit.toolbar.actions.save.title = "Enregistrer les modifications";
  L.drawLocal.edit.toolbar.actions.save.text = "Enregistrer";
  L.drawLocal.edit.toolbar.actions.cancel.title =
    "Annuler les modifications";
  L.drawLocal.edit.toolbar.actions.cancel.text = "Annuler";
}

function DrawControl({
  geometry,
  drawColor,
  onGeometryChange,
}: {
  geometry: GeoPolygon | null;
  drawColor: string;
  onGeometryChange: (geometry: GeoPolygon | null) => void;
}) {
  const map = useMap();
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const onGeometryChangeRef = useRef(onGeometryChange);
  onGeometryChangeRef.current = onGeometryChange;

  useEffect(() => {
    configureDrawLocale();

    const drawnItems = new L.FeatureGroup();
    drawnItemsRef.current = drawnItems;
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      position: "topright",
      draw: {
        polygon: {
          allowIntersection: false,
          shapeOptions: {
            color: drawColor,
            fillColor: drawColor,
          },
        },
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
      },
    });
    map.addControl(drawControl);

    function onCreated(event: L.LeafletEvent) {
      drawnItems.clearLayers();
      const layer = (event as L.DrawEvents.Created).layer as L.Polygon;
      drawnItems.addLayer(layer);
      onGeometryChangeRef.current(polygonLayerToGeoJson(layer));
    }

    function onEdited(event: L.LeafletEvent) {
      (event as L.DrawEvents.Edited).layers.eachLayer((layer) => {
        if (layer instanceof L.Polygon) {
          onGeometryChangeRef.current(polygonLayerToGeoJson(layer));
        }
      });
    }

    function onDeleted() {
      onGeometryChangeRef.current(null);
    }

    map.on(L.Draw.Event.CREATED, onCreated);
    map.on(L.Draw.Event.EDITED, onEdited);
    map.on(L.Draw.Event.DELETED, onDeleted);

    return () => {
      map.off(L.Draw.Event.CREATED, onCreated);
      map.off(L.Draw.Event.EDITED, onEdited);
      map.off(L.Draw.Event.DELETED, onDeleted);
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
      drawnItemsRef.current = null;
    };
  }, [map, drawColor]);

  useEffect(() => {
    const drawnItems = drawnItemsRef.current;
    if (!drawnItems) return;

    drawnItems.clearLayers();
    if (!geometry) return;

    const polygon = L.polygon(geoJsonToLeafletLatLngs(geometry), {
      color: drawColor,
      fillColor: drawColor,
      fillOpacity: 0.35,
    });
    drawnItems.addLayer(polygon);
  }, [geometry, drawColor]);

  return null;
}

function FitBounds({
  pastures,
  geometry,
}: {
  pastures: PastureData[];
  geometry: GeoPolygon | null;
}) {
  const map = useMap();

  useEffect(() => {
    const points = pastures.flatMap((pasture) =>
      geoJsonToLeafletLatLngs(pasture.geometry),
    );
    if (geometry) {
      points.push(...geoJsonToLeafletLatLngs(geometry));
    }
    if (points.length > 0) {
      map.fitBounds(points, { padding: [32, 32] });
    }
  }, [map, pastures, geometry]);

  return null;
}

export function PastureDrawMapInner({
  pastures,
  geometry,
  drawColor,
  excludePastureId,
  onGeometryChange,
  className = "h-[420px]",
}: Props) {
  const handleGeometryChange = useCallback(
    (nextGeometry: GeoPolygon | null) => {
      onGeometryChange(nextGeometry);
    },
    [onGeometryChange],
  );

  const backgroundPastures = pastures.filter(
    (pasture) => pasture.id !== excludePastureId,
  );

  const defaultCenter: [number, number] =
    geometry !== null
      ? getPolygonCenter(geometry)
      : backgroundPastures.length > 0
        ? getPolygonCenter(backgroundPastures[0].geometry)
        : [47.0, 2.0];

  return (
    <div data-testid="pasture-draw-map" className={`overflow-hidden rounded-xl border border-emerald-200 ${className}`}>
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
        <FitBounds pastures={backgroundPastures} geometry={geometry} />
        {backgroundPastures.map((pasture) => (
          <Polygon
            key={pasture.id}
            positions={geoJsonToLeafletLatLngs(pasture.geometry)}
            pathOptions={{
              color: pasture.color,
              fillColor: pasture.color,
              fillOpacity: 0.15,
              weight: 1,
            }}
            interactive={false}
          />
        ))}
        <DrawControl
          geometry={geometry}
          drawColor={drawColor}
          onGeometryChange={handleGeometryChange}
        />
      </MapContainer>
    </div>
  );
}

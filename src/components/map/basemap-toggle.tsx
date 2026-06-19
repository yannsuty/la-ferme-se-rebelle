"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { BASEMAP_LABELS, type BasemapStyle } from "@/lib/map-tiles";

type Props = {
  style: BasemapStyle;
  onStyleChange: (style: BasemapStyle) => void;
  position?: L.ControlPosition;
};

const STYLES: BasemapStyle[] = ["plan", "satellite"];

function updateActiveButton(container: HTMLElement, activeStyle: BasemapStyle) {
  container.querySelectorAll<HTMLButtonElement>("[data-basemap]").forEach((button) => {
    const isActive = button.dataset.basemap === activeStyle;
    button.classList.toggle("basemap-toggle-btn--active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

export function BasemapToggle({
  style,
  onStyleChange,
  position = "topleft",
}: Props) {
  const map = useMap();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const styleRef = useRef(style);
  const onStyleChangeRef = useRef(onStyleChange);
  styleRef.current = style;
  onStyleChangeRef.current = onStyleChange;

  useEffect(() => {
    const control = new L.Control({ position });

    control.onAdd = () => {
      const container = L.DomUtil.create("div", "basemap-toggle");
      container.setAttribute("data-testid", "basemap-toggle");
      containerRef.current = container;

      for (const basemapStyle of STYLES) {
        const button = L.DomUtil.create(
          "button",
          "basemap-toggle-btn",
          container,
        ) as HTMLButtonElement;
        button.type = "button";
        button.dataset.basemap = basemapStyle;
        button.textContent = BASEMAP_LABELS[basemapStyle];
        button.title =
          basemapStyle === "satellite"
            ? "Vue satellite"
            : "Vue plan (OpenStreetMap)";

        L.DomEvent.on(button, "click", (event) => {
          L.DomEvent.stopPropagation(event);
          L.DomEvent.preventDefault(event);
          onStyleChangeRef.current(basemapStyle);
        });
      }

      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);
      updateActiveButton(container, styleRef.current);

      return container;
    };

    map.addControl(control);

    return () => {
      map.removeControl(control);
      containerRef.current = null;
    };
  }, [map, position]);

  useEffect(() => {
    if (containerRef.current) {
      updateActiveButton(containerRef.current, style);
    }
  }, [style]);

  return null;
}

export type BasemapStyle = "plan" | "satellite";

export type MapTileConfig = {
  url: string;
  attribution: string;
};

export const MAP_TILES: Record<BasemapStyle, MapTileConfig> = {
  plan: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
  },
};

export const BASEMAP_LABELS: Record<BasemapStyle, string> = {
  plan: "Plan",
  satellite: "Satellite",
};

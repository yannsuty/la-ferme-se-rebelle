"use client";

import { TileLayer } from "react-leaflet";
import { MAP_TILES, type BasemapStyle } from "@/lib/map-tiles";

type Props = {
  style: BasemapStyle;
};

export function BasemapLayer({ style }: Props) {
  const tile = MAP_TILES[style];

  return (
    <TileLayer
      key={style}
      attribution={tile.attribution}
      url={tile.url}
    />
  );
}
